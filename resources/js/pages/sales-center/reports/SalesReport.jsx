import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  AssessmentRounded as ReportIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, getWeekStartDate, getWeekEndDate } from "../../../helpers";

const SalesReport = () => {
  const addToast = useToast();

  // Set up date parameters for daily filtering (default to today)
  const [dateParams, setDateParams] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const { data, loading, error } = useFetch(
    "api/reports/sales-center/sales",
    dateParams,
    true,
    {
      summary: {
        total_sales: 0,
        total_revenue: 0,
        total_transactions: 0,
      },
      details: [],
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Sales Report - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title="Sales Report">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Sales Report"
      breadcrumbs={[
        { title: "Home" },
        { title: "Sales Center" },
        { title: "Reports" },
        { title: "Sales Report" },
      ]}
    >
      <CardHeader
        title="Sales Report"
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        sx={{
          p: 0,
          mb: 2,
        }}
      />
      {!loading && data ? (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sales Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {numberFormat(data.summary?.total_sales || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Total Sales</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {numberFormat(data.summary?.total_revenue || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Total Revenue</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {numberFormat(data.summary?.total_transactions || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Total Transactions</Typography>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="textSecondary" align="center">
                Detailed sales report will be displayed here
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      )}
    </Page>
  );
};

export default SalesReport;


