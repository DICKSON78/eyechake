import React, { useEffect, useRef, useState } from "react";
import {
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
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";

import { usePatch, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const EditPaymentMode = ({ item, modal, fetchPaymentModes }) => {

  const addToast = useToast();

  const formRef = useRef();
  const nameRef = useRef();
  const descriptionRef = useRef();
  const paymentTypeRef = useRef();

  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    payment_type: item.payment_type,
    status: item.status,
  });

  const { data, loading, error, handlePatch } = usePatch(`api/payment-modes/${item.id}`, formData);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchPaymentModes();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePatch();
    }
  };

  return (
    <React.Fragment>
      {loading ? <LinearProgress /> : null}
      <CardContent sx={{ maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
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
                label="Name"
                fullWidth
                required
                defaultValue={formData.name}
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
                ref={descriptionRef}
                label="Description"
                fullWidth
                defaultValue={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <Select
                ref={paymentTypeRef}
                label="Payment Type"
                fullWidth
                required
                options={["Cash", "Credit"]}
                value={formData.payment_type || null}
                onChange={(value) => setFormData({ ...formData, payment_type: value })}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            />
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
          size="large"
          onClick={() => modal.close()}
        >
          Cancel
        </Button>
        <Button
          disabled={loading}
          variant="text"
          size="large"
          onClick={handleSubmit}
        >
          Save
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default EditPaymentMode;
