import React, { useEffect, useState } from "react";
import { Card, CardContent, Grid } from "@mui/material";

import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";

import { formatDateForDb, getNonNull, getDateRangeTitle, numberFormat } from "../../../helpers";
import useFetch from "../../../hooks/useFetch";

const ItemQuantityDispensed = () => {

  const { data: paymentModes } = useFetch("api/payment-modes", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  const [params, setParams] = useState({
    consultation_type: "Pharmacy,Glass",
    payment_mode_id: undefined,
    q: undefined,
    start_date: new Date(),
    end_date: undefined,
  });

  useEffect(() => {
    document.title = `Quantity Dispensed Report - ${window.APP_NAME}`;
  }, []);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Inventory Management" },
        { title: "Reports" },
        { title: "Quantity Dispensed Report" },
      ]}
    >
      <Report
        title="Quantity Dispensed Report"
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/reports/inventory-management/item-quantity-dispensed"
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
                  spacing={2}
                >
                  <Grid
                    item
                    md
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
                    md
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
                    md
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
                  <Grid
                    item
                    md
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
                </Grid>
              </CardContent>
            </Card>
          </React.Fragment>
        )}
        columns={[
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
            field: "quantity_dispensed",
            headerName: "Quantity Dispensed",
            valueGetter: (item, index) => numberFormat(item.quantity_dispensed || 0),
          },
          {
            field: "balance",
            headerName: "Balance",
            valueGetter: (item, index) => numberFormat(item.item.balance || 0),
          },
          {
            field: "dispensed_value",
            headerName: "Dispensed Value",
            valueGetter: (item, index) => numberFormat(item.dispensed_value || 0),
          },
        ]}
      />
    </Page>
  );
};

export default ItemQuantityDispensed;
