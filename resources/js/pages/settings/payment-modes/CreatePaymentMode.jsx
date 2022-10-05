import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, CardActions, CardContent, Divider, Grid, LinearProgress } from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";

import { usePost } from "../../../hooks";
import { formatError } from "../../../helpers";

const CreatePaymentMode = ({ modal, fetchPaymentModes }) => {

  const formRef = useRef();
  const nameRef = useRef();
  const descriptionRef = useRef();

  const [formData, setFormData] = useState({
    name: "",
    description: null,
  });
  const { data, loading, error, handlePost } = usePost("api/payment-modes", formData);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost();
    }
  };

  useEffect(() => {
    if (data) {
      window.setTimeout(() => {
        modal.close();
        fetchPaymentModes();
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
    <>
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
              label="Name"
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
              ref={descriptionRef}
              label="Description"
              fullWidth
              onChange={(value) => setFormData({ ...formData, description: value })}
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
    </>
  );
};

export default CreatePaymentMode;
