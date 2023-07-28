import React, { useEffect, useRef, useState } from "react";

import { Box, Button, CardActions, CardContent, Grid, LinearProgress } from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";

import { useFetch, usePatch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getValidationRules } from "../../../helpers";

const validationRules = getValidationRules();

const EditPatient = ({ item, modal, fetchPatients }) => {

  const addToast = useToast();

  const formRef = useRef();
  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const genderRef = useRef();
  const dateOfBirthRef = useRef();
  const regionRef = useRef();
  const districtRef = useRef();
  const wardRef = useRef();
  const addressRef = useRef();
  const nationalIdRef = useRef();
  const phoneRef = useRef();
  const occupationRef = useRef();
  const paymentModeRef = useRef();

  const { data: regions, setData: setRegions } = useFetch("api/regions", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  const [formData, setFormData] = useState({
    first_name: item.first_name,
    middle_name: item.middle_name,
    last_name: item.last_name,
    gender: item.gender,
    date_of_birth: item.date_of_birth ? new Date(item.date_of_birth) : null,
    region_id: item.region_id,
    district_id: item.district_id,
    ward_id: item.ward_id,
    address: item.address,
    national_id: item.national_id,
    phone: item.phone,
    occupation: item.occupation,
    payment_mode_id: item.payment_mode_id,
  });

  const { data: paymentModes } = useFetch("api/payment-modes", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);
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

  const { data, loading, error, handlePatch } = usePatch(`api/patients/${item.id}`, {
    ...formData,
    date_of_birth: formData.date_of_birth ? formatDateForDb(formData.date_of_birth) : null
  });

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePatch();
    }
  };

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchPatients();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (formData.region_id) {
      fetchDistricts();
    }
  }, [formData.region_id]);

  useEffect(() => {
    if (formData.district_id) {
      fetchWards();
    }
  }, [formData.district_id]);

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
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
                defaultValue={formData.first_name}
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
                defaultValue={formData.middle_name}
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
                defaultValue={formData.last_name}
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
                value={formData.gender || null}
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
            {false &&
            <React.Fragment>
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
                  optionsLabel="name"
                  optionsValue="id"
                  value={regions.find((e) => e.id === formData.region_id) || null}
                  onChange={(value) => {
                    setDistricts([]);
                    setWards([]);
                    setFormData({ ...formData, region_id: value, district_id: null, ward_id: null })
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
                  optionsLabel="name"
                  optionsValue="id"
                  value={districts.find((e) => e.id === formData.district_id) || null}
                  onChange={(value) => {
                    setWards([]);
                    setFormData({ ...formData, district_id: value, ward_id: null })
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
                  options={wards}
                  optionsLabel="name"
                  optionsValue="id"
                  value={wards.find((e) => e.id === formData.ward_id) || null}
                  onChange={(value) => setFormData({ ...formData, ward_id: value })}
                />
              </Grid>
            </React.Fragment>}
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
                rules={[validationRules.optionalPhone]}
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
                ref={nationalIdRef}
                label="National ID"
                fullWidth
                defaultValue={formData.national_id}
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
                defaultValue={formData.occupation}
                onChange={(value) => setFormData({ ...formData, occupation: value })}
              />
            </Grid>
            <Grid
              item
              md={4}
              sm={6}
              xs={12}
            >
              <Select
                ref={paymentModeRef}
                label="Payment Mode"
                fullWidth
                required
                options={paymentModes}
                optionsLabel="name"
                optionsValue="id"
                value={paymentModes.find((e) => e.id === formData.payment_mode_id) || null}
                onChange={(value) => setFormData({ ...formData, payment_mode_id: value })}
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <CardActions>
        <Box flexGrow={1}/>
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          sx={{ mr: 1 }}
          onClick={() => modal.close()}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
        >
          Save
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default EditPatient;
