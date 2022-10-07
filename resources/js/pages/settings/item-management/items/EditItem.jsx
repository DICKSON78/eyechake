import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CardActions,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress
} from "@mui/material";
import Form from "../../../../components/Form";
import TextField from "../../../../components/TextField";
import Select from "../../../../components/Select";

import { useFetch, usePatch } from "../../../../hooks";
import { formatError } from "../../../../helpers";

const EditItem = ({ item, modal, fetchItems }) => {

  const formRef = useRef();
  const nameRef = useRef();
  const codeRef = useRef();
  const itemTypeRef = useRef();
  const consultationTypeRef = useRef();
  const unitOfMeasureRef = useRef();
  const lensTypeRef = useRef();

  const { data: itemTypes } = useFetch("api/item-types", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);
  const { data: consultationTypes } = useFetch("api/consultation-types", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);
  const { data: unitsOfMeasure } = useFetch("api/units-of-measure", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);
  const { data: lensTypes } = useFetch("api/lens-types", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  const [itemType, setItemType] = useState(item.item_type);
  const [formData, setFormData] = useState({
    name: item.name,
    code: item.code,
    item_type_id: item.item_type_id,
    consultation_type_id: item.consultation_type_id,
    unit_of_measure_id: item.unit_of_measure_id,
    lens_type_id: item.lens_type_id,
    is_consultation_item: item.is_consultation_item,
    status: item.status,
  });

  const { data, loading, error, handlePatch } = usePatch(`api/items/${item.id}`, formData);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePatch();
    }
  };

  useEffect(() => {
    if (data) {
      window.setTimeout(() => {
        modal.close();
        fetchItems();
      }, 1000);
    }
  }, [data]);

  const handleFeedback = () => {
    if (data || error) {
      return (
        <Alert
          sx={{ mb: 2 }}
          severity={error ? "error" : "success"}
        >
          {error ? formatError(error) : data ? data.message : null}
        </Alert>
      );
    }

    return null;
  };

  return (
    <React.Fragment>
      {loading ? <LinearProgress /> : null}
      <CardContent>
        {handleFeedback()}
        <Form ref={formRef}>
          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <TextField
                ref={nameRef}
                label="Item Name"
                fullWidth
                required
                defaultValue={item.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <TextField
                ref={codeRef}
                label="Item Code"
                fullWidth
                defaultValue={item.code}
                onChange={(value) => setFormData({ ...formData, code: value })}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <Select
                ref={itemTypeRef}
                label="Item Type"
                fullWidth
                required
                options={itemTypes}
                optionsText="name"
                optionsValue="id"
                value={itemTypes.length ? (formData.item_type_id || "") : ""}
                onChange={(value) => {
                  setItemType(itemTypes.find((e) => e.id === value));
                  setFormData({ ...formData, item_type_id: value });
                }}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <Select
                ref={consultationTypeRef}
                label="Consultation Type"
                fullWidth
                required
                options={consultationTypes}
                optionsText="name"
                optionsValue="id"
                value={consultationTypes.length ? (formData.consultation_type_id || "") : ""}
                onChange={(value) => setFormData({ ...formData, consultation_type_id: value })}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <Select
                ref={unitOfMeasureRef}
                label="Unit of Measure"
                fullWidth
                options={unitsOfMeasure}
                optionsText="name"
                optionsValue="id"
                clearable
                value={unitsOfMeasure.length ? (formData.unit_of_measure_id || "") : ""}
                onChange={(value) => setFormData({ ...formData, unit_of_measure_id: value || null })}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              {itemType && itemType.name === "Lens" ?
                <Select
                  ref={lensTypeRef}
                  label="Lens Type"
                  fullWidth
                  required
                  options={lensTypes}
                  optionsText="name"
                  optionsValue="id"
                  value={lensTypes.length ? (formData.lens_type_id || "") : ""}
                  onChange={(value) => setFormData({ ...formData, lens_type_id: value })}
                />
                : null
              }
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={formData.is_consultation_item === "Yes"}
                    onChange={(event) => setFormData({
                      ...formData,
                      is_consultation_item: event.target.checked ? "Yes" : "No"
                    })}
                  />
                )}
                label="Consultation Item"
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <FormControlLabel
                control={(
                  <Checkbox
                    defaultChecked={item.status === "Active"}
                    onChange={(event) => setFormData({
                      ...formData,
                      status: event.target.checked ? "Active" : "Inactive"
                    })}
                  />
                )}
                label="Active"
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <Divider />
      <CardActions>
        <Box flexGrow={1}/>
        <Button
          variant="text"
          onClick={() => modal.close()}
        >
          Cancel
        </Button>
        <Button
          disabled={loading}
          variant="text"
          onClick={handleSubmit}
        >
          Save
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default EditItem;
