import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  LinearProgress
} from "@mui/material";
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@mui/icons-material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";

import { usePatch } from "../../../hooks";
import { formatError } from "../../../helpers";
import { PRIVILEGES } from "../../../constants";

const EditEmployeeAccessDetails = ({ item, modal, fetchEmployees }) => {

  const formRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: item.username,
    password: undefined,
    privileges: item.privileges,
    status: item.status,
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
        fetchEmployees();
        modal.close();
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
      {loading && <LinearProgress />}
      <CardContent sx={{ maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
        {handleFeedback()}
        <Form ref={formRef}>
          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              md={6}
              sm={6}
              xs={12}
            >
              <TextField
                ref={usernameRef}
                label="Username"
                fullWidth
                required
                defaultValue={formData.username}
                onChange={(value) => setFormData({ ...formData, username: value })}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={6}
              xs={12}
            >
              <TextField
                ref={passwordRef}
                label="Password"
                helperText="Leave blank to keep the current one."
                fullWidth
                type={showPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      sx={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </InputAdornment>
                  ),
                }}
                onChange={(value) => setFormData({ ...formData, password: value })}
              />
            </Grid>
          </Grid>

          <Card
            variant="outlined"
            sx={{ mt: 2 }}
          >
            <CardHeader
              title="Access Privileges"
              titleTypographyProps={{ variant: "subtitle1" }}
            />
            <Divider />
            <CardContent>
              {PRIVILEGES.map((e) => (
                <FormControlLabel
                  key={e.value}
                  control={(
                    <Checkbox
                      checked={!!formData.privileges[e.value]}
                      onChange={(event) => setFormData({
                        ...formData,
                        privileges: { ...formData.privileges, [e.value]: event.target.checked }
                      })}
                    />
                  )}
                  label={e.label}
                />
              ))}
            </CardContent>
          </Card>

          <Box p={2}>
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
          </Box>
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

export default EditEmployeeAccessDetails;
