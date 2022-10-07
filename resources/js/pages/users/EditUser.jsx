import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, CardActions, CardContent, Divider, Grid, LinearProgress } from "@mui/material";
import Form from "../../components/Form";
import TextField from "../../components/TextField";
import Select from "../../components/Select";

import { usePatch } from "../../hooks";
import { formatError, getValidationRules } from "../../helpers";

const validationRules = getValidationRules();

const EditUser = ({ item, modal, fetchUsers }) => {

  const formRef = useRef();
  const nameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();
  const roleRef = useRef();

  const [formData, setFormData] = useState({
    name: item.name,
    email: item.email,
    phone: item.phone,
    role: item.role,
  });
  const { data, loading, error, handlePatch } = usePatch(`api/users/${item.id}`, formData);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePatch();
    }
  };

  useEffect(() => {
    if (data) {
      window.setTimeout(() => {
        modal.close();
        fetchUsers();
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
                label="Name"
                fullWidth
                defaultValue={formData.name}
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
                ref={emailRef}
                label="Email"
                fullWidth
                defaultValue={formData.email}
                required
                onChange={(value) => setFormData({ ...formData, email: value })}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <TextField
                ref={phoneRef}
                label="Phone"
                fullWidth
                defaultValue={formData.phone}
                required
                rules={[validationRules.phone]}
                onChange={(value) => setFormData({ ...formData, phone: value })}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <Select
                ref={roleRef}
                label="Role"
                fullWidth
                required
                options={["Admin", "Customer"]}
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: value })}
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

export default EditUser;
