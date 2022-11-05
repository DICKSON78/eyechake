import React, { useEffect, useRef, useState } from "react";

import { Card, CardContent, Grid } from "@mui/material";
import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import DatePicker from "../../../components/DatePicker";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";

import { useFetch } from "../../../hooks";
import { formatDateForDb, getDateRangeTitle, getNonNull } from "../../../helpers";

const PatientRegistration = () => {

  const districtRef = useRef();

  const { data: paymentModes } = useFetch("api/payment-modes", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  const { data: regions } = useFetch("api/regions", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    id: undefined,
    name: undefined,
    gender: undefined,
    payment_mode_id: undefined,
    region_id: undefined,
    district_id: undefined,
    start_date: undefined,
    end_date: undefined,
  });

  const { data: districts, setData: setDistricts, handleFetch: fetchDistricts } = useFetch("api/districts", {
    status: "Active",
    region_id: params.region_id,
    per_page: 500
  }, false, [], (response) => response.data.data.data);

  useEffect(() => {
    document.title = `Patient Registration Report - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    setParams({ ...params, district_id: undefined });
    setDistricts([]);

    if (params.region_id) {
      fetchDistricts();
    }
  }, [params.region_id]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Reports" },
        { title: "Patient Registration Report" },
      ]}
    >
      <Report
        title="Patient Registration Report"
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/patients"
        params={{
          ...params,
          start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
          end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
        }}
        prependInner={(
          <React.Fragment>
            <Card
              variant="outlined"
              sx={{ mb: 2 }}
            >
              <CardContent>
                <Grid
                  container
                  columnSpacing={2}
                  rowSpacing={1}
                >
                  <Grid
                    item
                    md={3}
                    sm={6}
                    xs={12}
                  >
                    <DatePicker
                      fullWidth
                      label="Start Date"
                      value={params.start_date || null}
                      onChange={(value) => setParams({ ...params, start_date: !isNaN(value) ? value : null })}
                    />
                  </Grid>
                  <Grid
                    item
                    md={3}
                    sm={6}
                    xs={12}
                  >
                    <DatePicker
                      fullWidth
                      label="End Date"
                      value={params.end_date || null}
                      onChange={(value) => setParams({ ...params, end_date: !isNaN(value) ? value : null })}
                    />
                  </Grid>
                  <Grid
                    item
                    md={3}
                    sm={6}
                    xs={12}
                  >
                    <TextField
                      fullWidth
                      label="Patient Name"
                      defaultValue={params.name}
                      onChange={(value) => setParams({ ...params, name: value })}
                    />
                  </Grid>
                  <Grid
                    item
                    md={3}
                    sm={6}
                    xs={12}
                  >
                    <TextField
                      fullWidth
                      label="Patient Number"
                      defaultValue={params.patient_id}
                      onChange={(value) => setParams({ ...params, id: value })}
                    />
                  </Grid>
                  <Grid
                    item
                    md={3}
                    sm={6}
                    xs={12}
                  >
                    <Select
                      label="Gender"
                      fullWidth
                      options={["Male", "Female"]}
                      clearable
                      value={params.gender || ""}
                      onChange={(value) => setParams({ ...params, gender: value })}
                    />
                  </Grid>
                  <Grid
                    item
                    md={3}
                    sm={6}
                    xs={12}
                  >
                    <Select
                      label="Payment Mode"
                      fullWidth
                      options={paymentModes}
                      optionsLabel="name"
                      optionsValue="id"
                      clearable
                      value={paymentModes.length ? (params.payment_mode_id || "") : ""}
                      onChange={(value) => setParams({ ...params, payment_mode_id: value })}
                    />
                  </Grid>
                  <Grid
                    item
                    md={3}
                    sm={6}
                    xs={12}
                  >
                    <Select
                      label="Region"
                      fullWidth
                      options={regions}
                      optionsLabel="name"
                      optionsValue="id"
                      clearable
                      value={params.region_id || ""}
                      onChange={(value) => setParams({ ...params, region_id: value })}
                    />
                  </Grid>
                  <Grid
                    item
                    md={3}
                    sm={6}
                    xs={12}
                  >
                    <Select
                      ref={districtRef}
                      label="District"
                      fullWidth
                      options={districts}
                      optionsLabel="name"
                      optionsValue="id"
                      clearable
                      value={params.district_id || ""}
                      onChange={(value) => setParams({ ...params, district_id: value })}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </React.Fragment>
        )}
        columns={[
          {
            field: "full_name",
            headerName: "Patient Name",
          },
          {
            field: "id",
            headerName: "Patient Number",
          },
          {
            field: "date_of_birth",
            headerName: "Date of Birth",
          },
          {
            field: "gender",
            headerName: "Gender",
          },
          {
            field: "phone",
            headerName: "Phone Number",
          },
          {
            field: "region_id",
            headerName: "Location",
            valueGetter: (item, index) => `${getNonNull(item.district).name}, ${getNonNull(item.region).name}`,
          },
          {
            field: "payment_mode_id",
            headerName: "Payment Mode",
            valueGetter: (item, index) => getNonNull(item.payment_mode).name,
          },
          {
            field: "created_by",
            headerName: "Registered By",
            valueGetter: (item, index) => getNonNull(item.creator).full_name,
          },
          {
            field: "created_at",
            headerName: "Date",
          },
        ]}
      />
    </Page>
  );
};

export default PatientRegistration;
