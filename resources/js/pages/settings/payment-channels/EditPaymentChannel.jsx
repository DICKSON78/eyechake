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
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";

import { usePatch } from "../../../hooks";
import { formatError } from "../../../helpers";

const EditPaymentChannel = ({ item, modal, fetchPaymentChannels }) => {

  const formRef = useRef();
  const nameRef = useRef();
  const descriptionRef = useRef();

  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    payment_type: item.payment_type,
    status: item.status,
  });
  const { data, loading, error, handlePatch } = usePatch(`api/payment-channels/${item.id}`, formData);

  useEffect(() => {
    if (data) {
      window.setTimeout(() => {
        modal.close();
        fetchPaymentChannels();
      }, 1000);
    }
  }, [data]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePatch();
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

export default EditPaymentChannel;
