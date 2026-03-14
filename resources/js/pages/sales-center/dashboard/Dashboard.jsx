import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  PointOfSaleRounded as SalesIcon,
  ReceiptRounded as ReceiptIcon,
  ShoppingCartRounded as CartIcon,
  TrendingUpRounded as TrendingUpIcon,
  AccountBalanceRounded as RevenueIcon,
  DiscountRounded as DiscountIcon,
  AssessmentRounded as ReportsIcon,
  CalendarTodayRounded as CalendarIcon,
} from "@mui/icons-material";
import {
  blue,
  cyan,
  green,
  orange,
  purple,
  teal,
  pink,
  lime,
} from "@mui/material/colors";

import Page from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import ChartWrapper from "../../../components/ChartWrapper";
import PerformanceReportCard from "../../../components/PerformanceReportCard";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, getWeekStartDate, getWeekEndDate } from "../../../helpers";
import { useTheme } from "@mui/material/styles";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();

  // Set up date parameters for daily filtering (default to today)
  const [dateParams, setDateParams] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const { data, loading, error } = useFetch(
    "api/sales-center/dashboard",
    dateParams,
    true,
    {
      summary: {
        total_sales: 0,
        sales_today: 0,
        total_revenue: 0,
        total_transactions: 0,
        average_transaction: 0,
        total_discounts: 0,
        items_sold: 0,
        top_selling_items: [],
      },
      statistics: {
        sales_by_category: [],
        sales_by_day: [],
        sales_trend: [],
        top_customers: [],
        clients_consulted_vs_sales: [],
        prescription_demand: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Sales Center Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title="Sales Center Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Sales Center Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Sales Center" },
        { title: "Sales Center Dashboard" },
      ]}
    >
      <CardHeader
        title="Sales Center Dashboard"
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
        <React.Fragment>
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mb: 4 }}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Sales"
                count={numberFormat(data.summary?.total_sales || 0)}
                icon={<SalesIcon />}
                color={purple[400]}
                onClick={() => navigate('/sales-center/reports')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Today's Sales"
                count={numberFormat(data.summary?.sales_today || 0)}
                icon={<CalendarIcon />}
                color={green[400]}
                onClick={() => navigate('/sales-center/reports')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Revenue"
                count={numberFormat(data.summary?.total_revenue || 0)}
                icon={<RevenueIcon />}
                color={blue[400]}
                onClick={() => navigate('/sales-center/reports')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Transactions"
                count={numberFormat(data.summary?.total_transactions || 0)}
                icon={<ReceiptIcon />}
                color={teal[400]}
                onClick={() => navigate('/sales-center/reports')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Items Sold"
                count={numberFormat(data.summary?.items_sold || 0)}
                icon={<CartIcon />}
                color={orange[400]}
                onClick={() => navigate('/sales-center/reports')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Discounts"
                count={numberFormat(data.summary?.total_discounts || 0)}
                icon={<DiscountIcon />}
                color={pink[400]}
                onClick={() => navigate('/sales-center/reports')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Avg Transaction"
                count={numberFormat(data.summary?.average_transaction || 0)}
                icon={<TrendingUpIcon />}
                color={cyan[400]}
                onClick={() => navigate('/sales-center/reports')}
              />
            </Grid>
          </Grid>

          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            justifyContent="stretch"
            sx={{
              "& .MuiCard-root": {
                minHeight: "100%",
              },
            }}
          >
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/sales-center/reports')}>
                        <SalesIcon sx={{ fontSize: 28.8, color: '#9C27B0', mb: 1 }} />
                        <Typography variant="subtitle2">View Sales</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/sales-center/reports')}>
                        <ReportsIcon sx={{ fontSize: 28.8, color: '#2196F3', mb: 1 }} />
                        <Typography variant="subtitle2">Sales Reports</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/sales-center/reports')}>
                        <TrendingUpIcon sx={{ fontSize: 28.8, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="subtitle2">Sales Trends</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/sales-center/reports')}>
                        <CartIcon sx={{ fontSize: 28.8, color: '#FF9800', mb: 1 }} />
                        <Typography variant="subtitle2">Top Items</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sales Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <SalesIcon sx={{ fontSize: 28.8, color: '#9C27B0', mb: 1 }} />
                        <Typography variant="h6" color="#9C27B0" fontWeight="bold">
                          {numberFormat(data.summary.sales_today || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Today's Sales</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <ReceiptIcon sx={{ fontSize: 28.8, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="h6" color="#4CAF50" fontWeight="bold">
                          {numberFormat(data.summary.total_transactions || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Total Transactions</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <CartIcon sx={{ fontSize: 28.8, color: '#2196F3', mb: 1 }} />
                        <Typography variant="h6" color="#2196F3" fontWeight="bold">
                          {numberFormat(data.summary.items_sold || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Items Sold</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <TrendingUpIcon sx={{ fontSize: 28.8, color: '#FF9800', mb: 1 }} />
                        <Typography variant="h6" color="#FF9800" fontWeight="bold">
                          {numberFormat(data.summary.average_transaction || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Avg Transaction</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mt: 2 }}
          >
            {/* Clients Consulted vs Successful Sales Graph */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Clients Consulted vs Successful Sales" />
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
                        type: 'line',
                      },
                      stroke: {
                        width: [3, 3],
                        curve: "smooth",
                      },
                      colors: [blue[400], green[400]],
                      dataLabels: {
                        enabled: false,
                      },
                      grid: {
                        show: true,
                        borderColor: theme.palette.divider,
                      },
                      xaxis: {
                        categories: (data.statistics?.clients_consulted_vs_sales || []).map((e) => {
                          const date = new Date(e.date);
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }),
                        axisBorder: {
                          show: false,
                          color: theme.palette.divider,
                        },
                        axisTicks: {
                          show: true,
                          color: theme.palette.divider,
                        },
                      },
                      yaxis: {
                        title: {
                          text: "Count",
                        },
                        labels: {
                          formatter: (val) => Math.round(val),
                        },
                      },
                      tooltip: {
                        theme: "dark",
                        shared: true,
                        y: {
                          formatter: (val) => `${Math.round(val)}`,
                        },
                      },
                      legend: {
                        position: "top",
                        markers: {
                          width: 14,
                          height: 8,
                          radius: 4,
                        },
                      },
                    }}
                    series={[
                      {
                        name: "Clients Consulted",
                        data: (data.statistics?.clients_consulted_vs_sales || []).map((e) => e.clients_consulted || 0),
                      },
                      {
                        name: "Successful Sales (Count)",
                        data: (data.statistics?.clients_consulted_vs_sales || []).map((e) => e.successful_sales || 0),
                      },
                    ]}
                    type="line"
                    height={350}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Prescription Demand Graph */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Prescription Demand" />
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
                        type: 'bar',
                      },
                      plotOptions: {
                        bar: {
                          borderRadius: 4,
                          dataLabels: {
                            position: "top",
                          },
                        },
                      },
                      colors: [purple[400]],
                      dataLabels: {
                        enabled: true,
                        formatter: (val) => Math.round(val),
                        offsetY: -20,
                        style: {
                          fontSize: "10px",
                          colors: [theme.palette.text.primary],
                        },
                      },
                      grid: {
                        show: true,
                        borderColor: theme.palette.divider,
                      },
                      xaxis: {
                        categories: (data.statistics?.prescription_demand || []).map((e) => {
                          const date = new Date(e.date);
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }),
                        axisBorder: {
                          show: false,
                          color: theme.palette.divider,
                        },
                        axisTicks: {
                          show: true,
                          color: theme.palette.divider,
                        },
                      },
                      yaxis: {
                        title: {
                          text: "Quantity",
                        },
                        labels: {
                          formatter: (val) => Math.round(val),
                        },
                      },
                      tooltip: {
                        theme: "dark",
                        y: {
                          formatter: (val) => `${Math.round(val)} items`,
                        },
                      },
                    }}
                    series={[
                      {
                        name: "Prescription Quantity",
                        data: (data.statistics?.prescription_demand || []).map((e) => e.quantity || 0),
                      },
                    ]}
                    type="bar"
                    height={350}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <PerformanceReportCard
                department="Sales"
                user={window.user}
                editable={window.user?.privileges?.includes('sales_performance_report')}
                refreshTrigger={dateParams.start_date}
              />
            </Grid>
          </Grid>
        </React.Fragment>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      )}
    </Page>
  );
};

export default Dashboard;

