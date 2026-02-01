import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
} from "@mui/material";
import Page from "../../../components/Page";
import ChartWrapper from "../../../components/ChartWrapper";
import Table from "../../../components/Table";
import Select from "../../../components/Select";
import { useTheme } from "@mui/material/styles";
import { blue, yellow } from "@mui/material/colors";
import { useFetch, useToast } from "../../../hooks";
import {
  formatDateForDb,
  formatError,
  numberFormat,
} from "../../../helpers";

const SalesExpenses = () => {
  const theme = useTheme();
  const addToast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const periodParam = searchParams.get("period") || "yearly";

  const [period, setPeriod] = useState(periodParam);

  const { data, loading, error, handleFetch } = useFetch(
    "api/dashboard",
    {
      sales_expenses_period: period,
    },
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Sales vs Expenses - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const salesExpensesData = data?.statistics?.sales_expenses || [];

  return (
    <Page
      title="Sales vs Expenses"
      breadcrumbs={[
        { title: "Home" },
        { title: "Dashboard" },
        { title: "Sales vs Expenses" },
      ]}
    >
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Sales vs Expenses"
          action={
            <Select
              label="Period"
              options={[
                { label: "Daily", value: "daily" },
                { label: "Monthly", value: "monthly" },
                { label: "Yearly", value: "yearly" },
              ]}
              value={period}
              onChange={(value) => {
                setPeriod(value);
                navigate(`/dashboard/sales-expenses?period=${value}`, { replace: true });
                handleFetch();
              }}
              containerProps={{ minWidth: 120 }}
            />
          }
        />
        <Divider />
        <CardContent>
          <ChartWrapper
            options={{
              chart: {
                fontFamily: theme.typography.fontFamily,
                foreColor: theme.palette.text.primary,
                background: "transparent",
                toolbar: {
                  show: false,
                },
              },
              plotOptions: {
                bar: {
                  borderRadius: 8,
                  borderRadiusApplication: "around",
                  borderRadiusWhenStacked: "all",
                },
              },
              colors: [blue[700], yellow[600]],
              stroke: {
                show: false,
              },
              dataLabels: {
                enabled: false,
                style: {
                  fontSize: 10,
                  fontWeight: 400,
                },
                dropShadow: {
                  enabled: false,
                },
                formatter: (val, opts) => numberFormat(val),
              },
              grid: {
                show: false,
                borderColor: theme.palette.divider,
              },
              xaxis: {
                axisBorder: {
                  show: false,
                  color: theme.palette.divider,
                },
                axisTicks: {
                  show: true,
                  color: theme.palette.divider,
                  height: 6,
                },
              },
              yaxis: {
                axisBorder: {
                  show: false,
                  color: theme.palette.divider,
                },
                axisTicks: {
                  show: true,
                  color: theme.palette.divider,
                  width: 6,
                },
                labels: {
                  formatter: (val, index) => numberFormat(val),
                },
              },
              tooltip: {
                theme: "dark",
                fillSeriesColor: true,
              },
              legend: {
                markers: {
                  width: 14,
                  height: 8,
                  radius: 4,
                },
              },
            }}
            series={[
              {
                name: "Sales",
                data: salesExpensesData.map((e) => ({
                  x: e.period,
                  y: e.sales || 0,
                })),
              },
              {
                name: "Expenses",
                data: salesExpensesData.map((e) => ({
                  x: e.period,
                  y: e.expenses || 0,
                })),
              },
            ]}
            type="bar"
            height="400"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Detailed Data" />
        <Divider />
        <CardContent>
          <Table
            loading={loading}
            columns={[
              {
                field: "period",
                headerName: "Period",
              },
              {
                field: "sales",
                headerName: "Sales",
                valueGetter: (item) => numberFormat(item.sales || 0),
              },
              {
                field: "expenses",
                headerName: "Expenses",
                valueGetter: (item) => numberFormat(item.expenses || 0),
              },
              {
                field: "net_profit",
                headerName: "Net Profit",
                valueGetter: (item) =>
                  numberFormat(Math.max(0, (item.sales || 0) - (item.expenses || 0))),
              },
            ]}
            items={salesExpensesData}
            hidePaginationFooter={salesExpensesData.length <= 25}
          />
        </CardContent>
      </Card>
    </Page>
  );
};

export default SalesExpenses;

