import React, { useEffect, useState } from "react";

import { Card, CardContent, Grid } from "@mui/material";
import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";

import useFetch from "../../../hooks/useFetch";
import { formatDateForDb, getDateRangeTitle, getNonNull, numberFormat } from "../../../helpers";

const BillCollection = () => {

  const { data: paymentChannels } = useFetch("api/payment-channels", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    with_patient: true,
    bill_id: undefined,
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    payment_channel_id: undefined,
    start_date: new Date(),
    end_date: undefined,
    sort_direction: "desc",
  });

  useEffect(() => {
    document.title = `Bill Collection Report - ${window.APP_NAME}`;
  }, []);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: "Reports" },
        { title: "Bill Collection Report" },
      ]}
    >
      <Report
        title="Bill Collection Report"
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/patient-item-bill-payments"
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
                      label="Payment Channel"
                      fullWidth
                      options={paymentChannels}
                      optionsLabel="name"
                      optionsValue="id"
                      clearable
                      value={paymentChannels.length ? (params.payment_channel_id || "") : ""}
                      onChange={(value) => setParams({ ...params, payment_channel_id: value })}
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
                      label="Bill Number"
                      onChange={(value) => setParams({ ...params, bill_id: value })}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </React.Fragment>
        )}
        columns={[
          {
            field: "bill_id",
            headerName: "Bill Number",
          },
          {
            field: "patient_name",
            headerName: "Patient Name",
            valueGetter: (item, index) => item.bill.first_item.payment_cache.check_in.patient.full_name,
          },
          {
            field: "patient_id",
            headerName: "Patient Number",
            valueGetter: (item, index) => item.bill.first_item.payment_cache.check_in.patient_id,
          },
          {
            field: "amount",
            headerName: "Amount",
            valueGetter: (item, index) => numberFormat(item.amount),
          },
          {
            field: "channel",
            headerName: "Payment Channel",
            valueGetter: (item, index) => getNonNull(item.channel).name,
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
      />
    </Page>
  );
};

export default BillCollection;
