import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
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
  Stack
} from "@mui/material";
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";

import { useFetch, usePost } from "../../../hooks";
import { formatDateForDb, formatError } from "../../../helpers";
import { PRIVILEGES } from "../../../constants";

const EmployeeRegistration = () => {

  const navigate = useNavigate();

  const modalRef = useRef();
  const formRef = useRef();
  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const usernameRef = useRef();
  const employeeNumberRef = useRef();
  const genderRef = useRef();
  const dateOfBirthRef = useRef();
  const departmentRef = useRef();
  const jobTitleRef = useRef();
  const nationalIdRef = useRef();
  const phoneRef = useRef();
  const passwordRef = useRef();

  const { data: departments } = useFetch("api/departments", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);
  const { data: jobTitles } = useFetch("api/job-titles", {
    status: "Active",
    per_page: 500,
  }, true, [], (response) => response.data.data.data);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: undefined,
    middle_name: undefined,
    last_name: undefined,
    username: undefined,
    employee_number: undefined,
    gender: undefined,
    date_of_birth: null,
    department_id: undefined,
    job_title_id: undefined,
    national_id: undefined,
    phone: undefined,
    password: undefined,
    privileges: {},
  });

  const { data, loading, error, handlePost } = usePost("api/users", {
    ...formData,
    date_of_birth: formData.date_of_birth ? formatDateForDb(formData.date_of_birth) : null
  });

  useEffect(() => {
    document.title = `Employee Registration - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (data) {
      window.setTimeout(() => {
        navigate("/employee-management/employees");
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
        { title: "Employee Management" },
        { title: "Employee Registration" },
      ]}
    >
      <Card>
        <PageHeader title="Employee Registration"/>
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
                  ref={firstNameRef}
                  label="First Name"
                  fullWidth
                  required
                  onChange={(value) => setFormData({ ...formData, first_name: value })}
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
                  onChange={(value) => setFormData({ ...formData, middle_name: value })}
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
                  onChange={(value) => setFormData({ ...formData, last_name: value })}
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
                  onChange={(value) => setFormData({ ...formData, employee_number: value })}
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
                  value={formData.gender || ""}
                  onChange={(value) => setFormData({ ...formData, gender: value })}
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
                  onChange={(value) => setFormData({ ...formData, date_of_birth: !isNaN(value) ? value : null })}
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
                  value={formData.department_id || ""}
                  onChange={(value) => setFormData({ ...formData, department_id: value })}
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
                  value={formData.job_title_id || ""}
                  onChange={(value) => setFormData({ ...formData, job_title_id: value })}
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
                  ref={nationalIdRef}
                  label="National ID"
                  fullWidth
                  onChange={(value) => setFormData({ ...formData, national_id: value })}
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
                  onChange={(value) => setFormData({ ...formData, username: value })}
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
                    control={(
                      <Checkbox
                        // defaultChecked={formData.privileges[e.value]}
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

export default EmployeeRegistration;
