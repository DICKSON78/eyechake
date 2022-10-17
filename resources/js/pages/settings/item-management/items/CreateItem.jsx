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

import { useFetch, usePost } from "../../../../hooks";
import { formatError } from "../../../../helpers";

const CreateItem = ({ modal, fetchItems }) => {

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

  const [itemType, setItemType] = useState();
  const [formData, setFormData] = useState({
    name: undefined,
    code: undefined,
    item_type_id: undefined,
    consultation_type_id: undefined,
    unit_of_measure_id: undefined,
    lens_type_id: undefined,
    is_consultation_item: "No",
  });

  const { data, loading, error, handlePost } = usePost("api/items", formData);

  useEffect(() => {
    if (data) {
      window.setTimeout(() => {
        modal.close();
        fetchItems();
      }, 1000);
    }
  }, [data]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost();
    }
  };

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
      {loading && <LinearProgress />}
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
                optionsLabel="name"
                optionsValue="id"
                value={formData.item_type_id || ""}
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
                optionsLabel="name"
                optionsValue="id"
                value={formData.consultation_type_id || ""}
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
                optionsLabel="name"
                optionsValue="id"
                clearable
                value={formData.unit_of_measure_id || ""}
                onChange={(value) => setFormData({ ...formData, unit_of_measure_id: value })}
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
                  optionsLabel="name"
                  optionsValue="id"
                  value={formData.lens_type_id || ""}
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

export default CreateItem;
