import React, { useEffect, useState } from "react";

import { Card, CardContent, Grid } from "@mui/material";
import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import { formatDateForDb, getDateRangeTitle, getNonNull, numberFormat } from "../../../helpers";

const PatientBills = ({ status }) => {

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status,
    with_items: true,
    id: undefined,
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    start_date: new Date(),
    end_date: undefined,
  });

  useEffect(() => {
    document.title = `${status} Patient Bills Report - ${window.APP_NAME}`;
    setParams({ ...params, status });
  }, [status]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: "Reports" },
        { title: `${status} Patient Bills Report` },
      ]}
    >
      <Report
        title={`${status} Patient Bills Report`}
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/patient-item-bills"
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
                    <TextField
                      fullWidth
                      label="Bill Number"
                      onChange={(value) => setParams({ ...params, id: value })}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </React.Fragment>
        )}
        columns={[
          {
            field: "id",
            headerName: "Bill Number",
          },
          {
            field: "patient_name",
            headerName: "Patient Name",
            valueGetter: (item, index) => item.first_item.payment_cache.check_in.patient.full_name,
          },
          {
            field: "patient_id",
            headerName: "Patient Number",
            valueGetter: (item, index) => item.first_item.payment_cache.check_in.patient_id,
          },
          {
            field: "amount",
            headerName: "Bill Amount",
            valueGetter: (item, index) => numberFormat(item.amount),
          },
          {
            field: "discount",
            headerName: "Discount",
            valueGetter: (item, index) => numberFormat(item.discount),
          },
          {
            field: "subtotal",
            headerName: "Subtotal",
            valueGetter: (item, index) => numberFormat(item.amount - item.discount),
          },
          {
            field: "amount_paid",
            headerName: "Amount Paid",
            valueGetter: (item, index) => numberFormat(item.amount_paid || 0),
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
        nestedObject="items"
        nestedColumns={[
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
          { value: "TOTAL", span: 4, index: 1 },
          { reducer: (acc, item, index) => acc + item.amount, index: 4 },
          { reducer: (acc, item, index) => acc + item.discount, index: 5 },
          { reducer: (acc, item, index) => acc + (item.amount - item.discount), index: 6 },
          { reducer: (acc, item, index) => acc + (item.amount_paid || 0), index: 7 },
        ]}
      />
    </Page>
  );
};

export default PatientBills;
