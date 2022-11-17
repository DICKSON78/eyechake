import React, { useEffect, useState } from "react";

import { Card, CardContent, Chip, Grid } from "@mui/material";
import Page from "../../components/Page";
import Report from "../../components/reports/Report";
import DatePicker from "../../components/DatePicker";
import Select from "../../components/Select";
import TextField from "../../components/TextField";

import useFetch from "../../hooks/useFetch";
import { formatDateForDb, getDateRangeTitle, getNonNull, numberFormat } from "../../helpers";

const PatientItems = ({ module, title, consultationType, paymentModeType, status }) => {

  const { data: paymentModes } = useFetch("api/payment-modes", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  const [params, setParams] = useState({
    with_patient: true,
    consultation_type: consultationType,
    payment_mode_type: paymentModeType,
    status,
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    payment_mode_id: undefined,
    q: undefined,
    start_date: undefined,
    end_date: undefined,
    sort_direction: "desc",
  });

  useEffect(() => {
    document.title = `${title} - ${window.APP_NAME}`;
  }, [title]);

  useEffect(() => {
    setParams({ ...params, consultation_type: consultationType, payment_mode_type: paymentModeType, status });
  }, [consultationType, paymentModeType, status]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Paid":
        return "info";
      case "Billed":
        return "purple";
      case "Served":
        return "success";
    }

    return "neutral";
  };

  const getStatusLabel = (status) => {
    if (status === "Pending") {
      return "Not Paid";
    }

    if (consultationType === "Pharmacy" || consultationType === "Glass") {
      if (status === "Served") {
        return "Dispensed";
      }
    }

    return status;
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: module },
        { title: "Reports" },
        { title },
      ]}
    >
      <Report
        title={title}
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/patient-payment-cache-items"
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
                      defaultValue={params.patient_name}
                      onChange={(value) => setParams({ ...params, patient_name: value })}
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
                      onChange={(value) => setParams({ ...params, patient_id: value })}
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
                      value={params.patient_gender || ""}
                      onChange={(value) => setParams({ ...params, patient_gender: value })}
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
                    <TextField
                      fullWidth
                      label="Item Name/Code"
                      defaultValue={params.q}
                      onChange={(value) => setParams({ ...params, q: value })}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </React.Fragment>
        )}
        columns={[
          {
            field: "patient_name",
            headerName: "Patient Name",
            valueGetter: (item, index) => item.payment_cache.check_in.patient.full_name,
          },
          {
            field: "patient_id",
            headerName: "Patient Number",
            valueGetter: (item, index) => item.payment_cache.check_in.patient_id,
          },
          {
            field: "name",
            headerName: "Item Name",
            valueGetter: (item, index) => item.item.name,
          },
          {
            field: "code",
            headerName: "Item Code",
            valueGetter: (item, index) => item.item.code,
          },
          {
            field: "unit_of_measure_id",
            headerName: "Unit of Measure",
            valueGetter: (item, index) => getNonNull(item.item.unit_of_measure).name,
            show: consultationType === "Pharmacy" || consultationType === "Glass",
          },
          {
            field: "quantity",
            headerName: "Quantity",
            valueGetter: (item, index) => numberFormat(item.quantity),
          },
          {
            field: "dosage",
            headerName: "Dosage",
            show: consultationType === "Pharmacy",
          },
          {
            field: "comments",
            headerName: "Comments",
            show: consultationType !== "Pharmacy",
          },
          {
            field: "created_by",
            headerName: "Created By",
            valueGetter: (item) => getNonNull(item.creator).full_name
          },
          {
            field: "created_at",
            headerName: "Date",
          },
          {
            field: "status",
            headerName: "Status",
            renderCell: (item, index) => (
              <Chip
                size="small"
                color={getStatusColor(item.status)}
                label={getStatusLabel(item.status)}
              />
            ),
            valueGetter: (item) => getStatusLabel(item.status)
          }
        ]}
      />
    </Page>
  );
};

export default PatientItems;
