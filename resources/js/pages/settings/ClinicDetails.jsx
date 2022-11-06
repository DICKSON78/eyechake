import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, CardContent, Divider, Grid, LinearProgress, Stack } from "@mui/material";
import Page, { Header as PageHeader } from "../../components/Page";
import Modal from "../../components/Modal";
import Form from "../../components/Form";
import TextField from "../../components/TextField";

import { usePost } from "../../hooks";
import { formatError } from "../../helpers";

const ClinicDetails = () => {

  const navigate = useNavigate();

  const modalRef = useRef();
  const formRef = useRef();
  const nameRef = useRef();
  const phoneRef = useRef();
  const emailRef = useRef();
  const addressRef = useRef();

  const [formData, setFormData] = useState({
    name: window.clinic.name,
    phone: window.clinic.phone,
    email: window.clinic.email,
    address: window.clinic.address,
  });

  const { data, loading, error, handlePost } = usePost("api/clinic-details", formData);

  useEffect(() => {
    document.title = `Clinic Details - ${window.APP_NAME}`;
  }, []);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost();
    }
  };

  const handleFeedback = () => {
    if (data || error) {
      return (
        <Alert
          sx={{ mt: 2 }}
          severity={error ? "error" : "success"}
        >
          {error ? formatError(error) : data ? data.message : null}
        </Alert>
      );
    }

    return null;
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Settings" },
        { title: "Clinic Details" },
      ]}
    >
      <Card>
        <PageHeader title="Clinic Details"/>
        <Divider />
        <CardContent>
          <Form ref={formRef}>
            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={nameRef}
                  label="Clinic Name"
                  fullWidth
                  required
                  defaultValue={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={phoneRef}
                  label="Phone Number"
                  fullWidth
                  required
                  defaultValue={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={emailRef}
                  label="Email"
                  fullWidth
                  defaultValue={formData.email}
                  onChange={(value) => setFormData({ ...formData, email: value })}
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={addressRef}
                  label="Address"
                  fullWidth
                  defaultValue={formData.address}
                  onChange={(value) => setFormData({ ...formData, address: value })}
                />
              </Grid>
            </Grid>
          </Form>
          {handleFeedback()}
        </CardContent>
        <Divider />
        {loading && <LinearProgress />}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
          p={2}
        >
          <Button
            disabled={loading}
            variant="contained"
            disableElevation
            onClick={handleSubmit}
          >
            Save
          </Button>
        </Stack>
      </Card>
      <Modal ref={modalRef}/>
    </Page>
  );
};

export default ClinicDetails;
