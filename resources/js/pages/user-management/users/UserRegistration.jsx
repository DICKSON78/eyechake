import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import SelectClinic from "../../../components/SelectClinic";

import { useFetch, usePost, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getPrivileges } from "../../../helpers";

const UserRegistration = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();
  const formRef = useRef();
  const clinicRef = useRef();
  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const usernameRef = useRef();
  const employeeNumberRef = useRef();
  const genderRef = useRef();
  const dateOfBirthRef = useRef();
  const designationRef = useRef();
  const departmentRef = useRef();
  const jobTitleRef = useRef();
  const nationalIdRef = useRef();
  const phoneRef = useRef();
  const passwordRef = useRef();

  const { data: departments } = useFetch(
    "api/departments",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );
  const { data: jobTitles } = useFetch(
    "api/job-titles",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    clinic_id: undefined,
    first_name: undefined,
    middle_name: undefined,
    last_name: undefined,
    username: undefined,
    employee_number: undefined,
    gender: undefined,
    date_of_birth: null,
    designation: undefined,
    department_id: undefined,
    job_title_id: undefined,
    national_id: undefined,
    phone: undefined,
    password: undefined,
    privileges: [],
  });

  const { data, loading, error, handlePost } = usePost("api/users", {
    ...formData,
    date_of_birth: formData.date_of_birth
      ? formatDateForDb(formData.date_of_birth)
      : null,
  });

  useEffect(() => {
    document.title = `User Registration - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });

      window.setTimeout(() => {
        navigate("/user-management/users");
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
      handlePost();
    }
  };

  const getPrivilegesTree = (items) => {
    if (!items) return null;

    return items
      .filter((e) => typeof e.show === "undefined" || e.show)
      .map((e) => {
        const hasChildren = e.children && e.children.length;
        return hasChildren ? (
          <Paper
            key={e.value}
            variant="outlined"
            sx={{
              my: 1.5,
              p: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.03)"
                  : "rgba(0, 0, 0, 0.02)",
              border: (theme) =>
                `1px solid ${
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.12)"
                    : "rgba(0, 0, 0, 0.12)"
                }`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ mb: 1.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.privileges.indexOf(e.value) !== -1}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        privileges: event.target.checked
                          ? [...formData.privileges, e.value]
                          : formData.privileges.filter((f) => f !== e.value),
                      })
                    }
                    sx={{
                      "&.Mui-checked": {
                        color: "primary.main",
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                    }}
                  >
                    {e.label}
                  </Typography>
                }
              />
            </Box>
            <Box
              sx={{
                pl: 4,
                borderLeft: (theme) =>
                  `2px solid ${
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)"
                  }`,
                ml: 1,
              }}
            >
              <Grid container spacing={1.5}>
                {getPrivilegesTree(e.children)}
              </Grid>
            </Box>
          </Paper>
        ) : (
          <Grid item xs={12} sm={6} md={4} key={e.value}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.privileges.indexOf(e.value) !== -1}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      privileges: event.target.checked
                        ? [...formData.privileges, e.value]
                        : formData.privileges.filter((f) => f !== e.value),
                    })
                  }
                  sx={{
                    "&.Mui-checked": {
                      color: "primary.main",
                    },
                  }}
                />
              }
              label={
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  {e.label}
                </Typography>
              }
              sx={{
                width: "100%",
                py: 0.5,
                px: 1,
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.03)",
                },
              }}
            />
          </Grid>
        );
      });
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "User Management" },
        { title: "User Registration" },
      ]}
    >
      <Card>
        <PageHeader title="User Registration" />
        <Divider />
        <CardContent>
          <Form ref={formRef}>
            <Grid
              container
              spacing={2}
            >
              {window.user.role === "Admin" ? (
                <Grid
                  item
                  md={4}
                  sm={6}
                  xs={12}
                >
                  <SelectClinic
                    ref={clinicRef}
                    required
                    onChange={(value) =>
                      setFormData({ ...formData, clinic_id: value?.id })
                    }
                  />
                </Grid>
              ) : null}
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={firstNameRef}
                  label="First Name"
                  fullWidth
                  required
                  onChange={(value) =>
                    setFormData({ ...formData, first_name: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={middleNameRef}
                  label="Middle Name"
                  fullWidth
                  onChange={(value) =>
                    setFormData({ ...formData, middle_name: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={lastNameRef}
                  label="Last Name"
                  fullWidth
                  required
                  onChange={(value) =>
                    setFormData({ ...formData, last_name: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={employeeNumberRef}
                  label="Employee Number"
                  fullWidth
                  onChange={(value) =>
                    setFormData({ ...formData, employee_number: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <Select
                  ref={genderRef}
                  label="Gender"
                  fullWidth
                  required
                  options={["Male", "Female"]}
                  onChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <DatePicker
                  ref={dateOfBirthRef}
                  label="Date of Birth"
                  fullWidth
                  value={formData.date_of_birth}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      date_of_birth: !isNaN(value) ? value : null,
                    })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <Select
                  ref={designationRef}
                  label="Designation"
                  fullWidth
                  options={["Doctor", "Other"]}
                  onChange={(value) =>
                    setFormData({ ...formData, designation: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <Select
                  ref={departmentRef}
                  label="Department"
                  fullWidth
                  required
                  options={departments}
                  optionsLabel="name"
                  optionsValue="id"
                  onChange={(value) =>
                    setFormData({ ...formData, department_id: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <Select
                  ref={jobTitleRef}
                  label="Job Title"
                  fullWidth
                  required
                  options={jobTitles}
                  optionsLabel="name"
                  optionsValue="id"
                  onChange={(value) =>
                    setFormData({ ...formData, job_title_id: value })
                  }
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
                  onChange={(value) =>
                    setFormData({ ...formData, phone: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={nationalIdRef}
                  label="National ID"
                  fullWidth
                  onChange={(value) =>
                    setFormData({ ...formData, national_id: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={usernameRef}
                  label="Username"
                  fullWidth
                  required
                  onChange={(value) =>
                    setFormData({ ...formData, username: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={passwordRef}
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        sx={{ cursor: "pointer" }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <VisibilityIcon />
                        ) : (
                          <VisibilityOffIcon />
                        )}
                      </InputAdornment>
                    ),
                  }}
                  onChange={(value) =>
                    setFormData({ ...formData, password: value })
                  }
                />
              </Grid>
            </Grid>

            <Card
              variant="outlined"
              sx={{
                mt: 3,
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.12)"
                      : "rgba(0, 0, 0, 0.12)"
                  }`,
                borderRadius: 2,
              }}
            >
              <CardHeader
                title={
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                    }}
                  >
                    Access Privileges
                  </Typography>
                }
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(0, 0, 0, 0.02)",
                  borderBottom: (theme) =>
                    `1px solid ${
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.12)"
                        : "rgba(0, 0, 0, 0.12)"
                    }`,
                }}
              />
              <CardContent
                sx={{
                  pt: 3,
                  pb: 3,
                  px: 3,
                }}
              >
                <Box
                  sx={{
                    maxHeight: "500px",
                    overflowY: "auto",
                    pr: 1,
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.05)",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.2)"
                          : "rgba(0, 0, 0, 0.2)",
                      borderRadius: "4px",
                      "&:hover": {
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.3)"
                            : "rgba(0, 0, 0, 0.3)",
                      },
                    },
                  }}
                >
                  {getPrivilegesTree(
                    getPrivileges(window.user?.clinic?.preferences || [])
                  )}
                </Box>
              </CardContent>
            </Card>
          </Form>
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
            onClick={handleSubmit}
          >
            Save
          </Button>
        </Stack>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default UserRegistration;
