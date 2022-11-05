import React, { useEffect, useState } from "react";

import { Card, CardContent, Grid } from "@mui/material";
import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";

import useFetch from "../../../hooks/useFetch";
import { formatDateForDb, getDateRangeTitle, getNonNull, numberFormat } from "../../../helpers";

const CreditCollection = () => {

  const { data: paymentModes } = useFetch("api/payment-modes", {
    status: "Active",
    payment_type: "Credit",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    with_patient: true,
    payment_mode_type: "Credit",
    status: "Paid,Served",
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    payment_mode_id: undefined,
    q: undefined,
    start_date: new Date(),
    end_date: undefined,
    sort_direction: "desc",
  });

  useEffect(() => {
    document.title = `Credit Collection Report - ${window.APP_NAME}`;
  }, []);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: "Reports" },
        { title: "Credit Collection Report" },
      ]}
    >
      <Report
        title="Credit Collection Report"
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
          },
          {
            field: "quantity",
            headerName: "Quantity",
            valueGetter: (item, index) => numberFormat(item.quantity),
          },
          {
            field: "subtotal",
            headerName: "Subtotal",
            valueGetter: (item, index) => numberFormat(item.unit_price * item.quantity),
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
        ]}
        summationFooterColumns={[
          { value: "TOTAL", span: 7, index: 1 },
          { reducer: (acc, item, index) => acc + (item.unit_price * item.quantity), index: 7 },
        ]}
      />
    </Page>
  );
};

export default CreditCollection;
