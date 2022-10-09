import React, { useEffect, useRef, useState } from "react";

import { Alert, Button, Card, CardContent, Divider, Grid, InputAdornment, LinearProgress, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import CreateRegion from "../../settings/subdivisions/CreateRegion";
import CreateDistrict from "../../settings/subdivisions/CreateDistrict";
import CreateWard from "../../settings/subdivisions/CreateWard";

import { useFetch, usePost } from "../../../hooks";
import { formatError } from "../../../helpers";

const EditPatient = () => {

  const modalRef = useRef();
  const formRef = useRef();
  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const genderRef = useRef();
  const dateOfBirthRef = useRef();
  const regionRef = useRef();
  const districtRef = useRef();
  const wardRef = useRef();
  const nationalIdRef = useRef();
  const phoneRef = useRef();
  const occupationRef = useRef();

  const { data: regions, setData: setRegions } = useFetch("api/regions", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  const [region, setRegion] = useState();
  const [district, setDistrict] = useState();

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: null,
    last_name: "",
    gender: null,
    date_of_birth: null,
    region_id: null,
    district_id: null,
    ward_id: null,
    national_id: null,
    phone: null,
    occupation: null,
  });

  const { data: districts, setData: setDistricts, handleFetch: fetchDistricts } = useFetch("api/districts", {
    status: "Active",
    per_page: 500,
    region_id: formData.region_id
  }, false, [], (response) => response.data.data.data);
  const { data: wards, setData: setWards, handleFetch: fetchWards } = useFetch("api/wards", {
    status: "Active",
    per_page: 500,
    district_id: formData.district_id
  }, false, [], (response) => response.data.data.data);

  const { data, loading, error, handlePost } = usePost("api/patients", formData);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost();
    }
  };

  useEffect(() => {
    if (data) {
      window.setTimeout(() => {
        //
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    setFormData({ ...formData, district_id: null });
    setDistricts([]);
    setDistrict(null);

    if (region) {
      fetchDistricts();
    }
  }, [region]);

  useEffect(() => {
    setFormData({ ...formData, ward_id: null });
    setWards([]);

    if (district) {
      fetchWards();
    }
  }, [district]);


  useEffect(() => {
    document.title = `Patient Registration - ${window.APP_NAME}`;
  }, []);

  const openCreateRegionModal = () => {
    let component = (
      <CreateRegion
        modal={modalRef.current}
        onSuccess={(responseData) => {
          setRegions([...regions, responseData]);
          setFormData({ ...formData, region_id: responseData.id });
          setRegion(responseData);
        }}
      />
    );

    modalRef.current.open("Create Region", component);
  };

  const openCreateDistrictModal = () => {
    let component = (
      <CreateDistrict
        modal={modalRef.current}
        region={region}
        onSuccess={(responseData) => {
          setDistricts([...districts, responseData]);
          setFormData({ ...formData, district_id: responseData.id });
          setDistrict(responseData);
        }}
      />
    );

    modalRef.current.open("Create District", component);
  };

  const openCreateWardModal = () => {
    let component = (
      <CreateWard
        modal={modalRef.current}
        district={district}
        onSuccess={(responseData) => {
          setWards([...wards, responseData]);
          setFormData({ ...formData, ward_id: responseData.id });
        }}
      />
    );

    modalRef.current.open("Create Ward", component);
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
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Patient Registration" },
      ]}
    >
      {handleFeedback()}
      <Card>
        <PageHeader
          title="Patient Registration"
          containerProps={{ pb: 2 }}
        />
        <Divider />
        {loading ? <LinearProgress /> : null}
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
                  onChange={(value) => setFormData({ ...formData, date_of_birth: value })}
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <Select
                  ref={regionRef}
                  label="Region"
                  fullWidth
                  required
                  options={regions}
                  optionsText="name"
                  optionsValue="id"
                  value={formData.region_id || ""}
                  endAdornment={
                    <InputAdornment
                      position="end"
                      sx={{ cursor: "pointer", mr: 2 }}
                      onClick={openCreateRegionModal}
                    >
                      <AddIcon fontSize="small"/>
                    </InputAdornment>
                  }
                  onChange={(value) => {
                    setRegion(regions.find((e) => e.id === value));
                    setFormData({ ...formData, region_id: value });
                  }}
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <Select
                  ref={districtRef}
                  label="District"
                  fullWidth
                  required
                  options={districts}
                  optionsText="name"
                  optionsValue="id"
                  value={formData.district_id || ""}
                  endAdornment={
                    region ?
                      <InputAdornment
                        position="end"
                        sx={{ cursor: "pointer", mr: 2 }}
                        onClick={openCreateDistrictModal}
                      >
                        <AddIcon fontSize="small"/>
                      </InputAdornment>
                      : null
                  }
                  onChange={(value) => {
                    setDistrict(districts.find((e) => e.id === value));
                    setFormData({ ...formData, district_id: value });
                  }}
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <Select
                  ref={wardRef}
                  label="Ward"
                  fullWidth
                  required
                  options={wards}
                  optionsText="name"
                  optionsValue="id"
                  value={formData.ward_id || ""}
                  endAdornment={
                    district ?
                      <InputAdornment
                        position="end"
                        sx={{ cursor: "pointer", mr: 2 }}
                        onClick={openCreateWardModal}
                      >
                        <AddIcon fontSize="small"/>
                      </InputAdornment>
                      : null
                  }
                  onChange={(value) => setFormData({ ...formData, ward_id: value })}
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
                  ref={occupationRef}
                  label="Occupation"
                  fullWidth
                  onChange={(value) => setFormData({ ...formData, occupation: value })}
                />
              </Grid>
            </Grid>
          </Form>
        </CardContent>
        <Divider />
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
          p={2}
        >
          <Button
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

export default EditPatient;
