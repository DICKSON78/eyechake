import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, Grid, Typography, Box, Chip, Divider } from "@mui/material";
import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import { formatDateForDb, getDateRangeTitle, numberFormat } from "../../../helpers";

const BalanceSheet = () => {
  const [params, setParams] = useState({
    report_period: "daily",
    start_date: undefined,
    end_date: undefined,
  });

  const [summary, setSummary] = useState({
    total_debit: 0,
    total_credit: 0,
    balance: 0,
  });

  useEffect(() => {
    document.title = `Balance Sheet Report - ${window.APP_NAME}`;
  }, []);

  const getReportPeriodTitle = () => {
    switch (params.report_period) {
      case "daily":
        return "Daily Report";
      case "monthly":
        return "Monthly Report";
      default:
        return "";
    }
  };


  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Financial Management" },
        { title: "Reports" },
        { title: "Balance Sheet Report" },
      ]}
    >
      <CardHeader
        title="Balance Sheet Report"
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        sx={{
          p: 0,
          mb: 3,
        }}
      />

      {/* Filters Section */}
      <Card
        variant="outlined"
        sx={{
          mb: 4,
        }}
      >
        <CardHeader 
          title="Filter Options" 
          titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
        />
        <Divider />
        <CardContent>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Select
                label="Report Period"
                fullWidth
                value={params.report_period}
                onChange={(value) =>
                  setParams({ ...params, report_period: value })
                }
                options={[
                  { label: "Daily", value: "daily" },
                  { label: "Monthly", value: "monthly" },
                ]}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DatePicker
                fullWidth
                label="Start Date"
                value={params.start_date || null}
                onChange={(value) =>
                  setParams({
                    ...params,
                    start_date: !isNaN(value) ? value : null,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DatePicker
                fullWidth
                label="End Date"
                value={params.end_date || null}
                onChange={(value) =>
                  setParams({
                    ...params,
                    end_date: !isNaN(value) ? value : null,
                  })
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <Grid 
          container 
          spacing={{ xs: 2, sm: 2, md: 3 }} 
          sx={{ mb: 4 }}
        >
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card 
              sx={{ 
                bgcolor: "success.light", 
                color: "white",
                height: "100%",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" gutterBottom sx={{ opacity: 0.9 }}>
                  Total Debit (Income)
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {numberFormat(summary.total_debit || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card 
              sx={{ 
                bgcolor: "error.light", 
                color: "white",
                height: "100%",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" gutterBottom sx={{ opacity: 0.9 }}>
                  Total Credit (Expenses)
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {numberFormat(summary.total_credit || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                bgcolor:
                  (summary.balance || 0) >= 0
                    ? "info.light"
                    : "warning.light",
                color: "white",
                height: "100%",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" gutterBottom sx={{ opacity: 0.9 }}>
                  Balance
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {numberFormat(summary.balance || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Report
        title={`Balance Sheet Report - ${getReportPeriodTitle()}`}
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/reports/financial-management/balance-sheet"
        params={{
          ...params,
          start_date: params.start_date
            ? formatDateForDb(params.start_date)
            : undefined,
          end_date: params.end_date
            ? formatDateForDb(params.end_date)
            : undefined,
        }}
        onFetch={(payload) => {
          // Extract summary from the response
          if (payload && payload.summary) {
            setSummary(payload.summary);
          } else if (payload && Array.isArray(payload.data) && payload.data.length > 0) {
            // Extract summary from first item if available
            const firstItem = payload.data[0];
            if (firstItem.grand_total_debit !== undefined) {
              setSummary({
                total_debit: firstItem.grand_total_debit,
                total_credit: firstItem.grand_total_credit,
                balance: firstItem.grand_balance,
              });
            }
          }
          // Transform for Report component: ensure data and total are present
          return {
            data: payload?.data || [],
            total: payload?.total || (payload?.data?.length || 0),
          };
        }}
        columns={[
          {
            field: "period_display",
            headerName: params.report_period === "monthly" ? "Month" : "Date",
            valueGetter: (item) => item.period_display || item.period,
          },
          {
            field: "total_debit",
            headerName: "Total Debit (Income)",
            valueGetter: (item) => numberFormat(item.total_debit || 0),
          },
          {
            field: "total_credit",
            headerName: "Total Credit (Expenses)",
            valueGetter: (item) => numberFormat(item.total_credit || 0),
          },
          {
            field: "balance",
            headerName: "Balance",
            valueGetter: (item) => {
              const balance = item.balance || 0;
              return numberFormat(balance);
            },
            renderCell: (item) => {
              const balance = item.balance || 0;
              return (
                <Chip
                  label={numberFormat(balance)}
                  color={balance >= 0 ? "success" : "error"}
                  size="small"
                />
              );
            },
          },
        ]}
        summationFooterColumns={[
          { value: "TOTAL", span: 1, index: 1 },
          {
            reducer: (acc, item) => acc + (parseFloat(item.total_debit) || 0),
            index: 2,
          },
          {
            reducer: (acc, item) => acc + (parseFloat(item.total_credit) || 0),
            index: 3,
          },
          {
            reducer: (acc, item) => acc + Math.max(0, parseFloat(item.balance) || 0),
            index: 4,
          },
        ]}
      />
    </Page>
  );
};

export default BalanceSheet;
