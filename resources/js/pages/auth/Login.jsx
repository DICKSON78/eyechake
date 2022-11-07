import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert, Box, Button, InputAdornment, LinearProgress, Paper } from "@mui/material";
import { Lock as LockIcon, Person2 as UsernameIcon } from "@mui/icons-material";
import Form from "../../components/Form";
import TextField from "../../components/TextField";

import logo from "../../../images/logo.png";

import { usePost } from "../../hooks";
import { formatError } from "../../helpers";

const LogIn = () => {
  const navigate = useNavigate();

  const formRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();

  const [formData, setFormData] = useState({
    username: undefined,
    password: undefined
  });
  const { data, loading, error, handlePost } = usePost("api/auth/login", formData);

  useEffect(() => {
    document.title = `Login - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (data) {
      window.user = data.data.user;
      window.localStorage.removeItem("api_token");
      window.localStorage.setItem("api_token", data.data.api_token);
      window.setTimeout(() => {
        navigate("/dashboard");
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
      <Paper variant="outlined">
        {loading &&
        <LinearProgress
          sx={{
            borderTopLeftRadius: (theme) => theme.shape.borderRadius,
            borderTopRightRadius: (theme) => theme.shape.borderRadius
          }}
        />}
        <Box p={2}>
          <Box
            component="img"
            display="block"
            width={80}
            mb={2}
            mx="auto"
            alt="Logo"
            src={logo}
          />

          {handleFeedback()}

          <Form
            ref={formRef}
            onSubmit={handleSubmit}
          >
            <TextField
              ref={usernameRef}
              placeholder="Username"
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <UsernameIcon />
                  </InputAdornment>
                ),
              }}
              containerProps={{ sx: { mb: 2 } }}
              onChange={(value) => setFormData({ ...formData, username: value })}
            />
            <TextField
              ref={passwordRef}
              placeholder="Password"
              type="password"
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
              }}
              containerProps={{ sx: { mb: 2 } }}
              onChange={(value) => setFormData({ ...formData, password: value })}
            />
            <Button
              disabled={loading}
              fullWidth
              disableElevation
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              onClick={handleSubmit}
            >
              Login
            </Button>
          </Form>
        </Box>
      </Paper>
    </React.Fragment>
  );
};

export default LogIn;
