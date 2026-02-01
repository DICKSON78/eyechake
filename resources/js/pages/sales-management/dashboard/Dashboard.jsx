import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  PointOfSaleRounded as SalesIcon,
  ShoppingCartRounded as CartIcon,
  TrendingUpRounded as TrendingUpIcon,
  DiscountRounded as DiscountIcon,
  AssessmentRounded as ReportsIcon,
} from "@mui/icons-material";
import {
  blue,
  cyan,
  green,
  orange,
  purple,
  teal,
  pink,
} from "@mui/material/colors";

import Page from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import ChartWrapper from "../../../components/ChartWrapper";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, getWeekStartDate, getWeekEndDate, formatDateForDb } from "../../../helpers";
import { useTheme } from "@mui/material/styles";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();

  // Default to today's data for the dashboard cards and charts
  const today = new Date();
  const todayStr = formatDateForDb(today);
  const [dateParams, setDateParams] = useState({
    start_date: todayStr,
    end_date: todayStr,
  });

  const { data, loading, error } = useFetch(
    "api/sales-management/dashboard",
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
    document.title = `Sales Management Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title="Sales Management Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Sales Management Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Sales Management" },
        { title: "Sales Management Dashboard" },
      ]}
    >
      <CardHeader
        title="Sales Management Dashboard"
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
                title="Avg Transaction"
                count={numberFormat(Number(data.summary?.average_transaction ?? 0).toFixed(2))}
                icon={<TrendingUpIcon />}
                color={cyan[400]}
                onClick={() => navigate('/sales-management/reports')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Discounts"
                count={numberFormat(data.summary?.total_discounts || 0)}
                icon={<DiscountIcon />}
                color={pink[400]}
                onClick={() => navigate('/sales-management/reports')}
              />
            </Grid>
          </Grid>

          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{
              mb: 2,
            }}
          >
            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                  },
                  transition: 'box-shadow 0.3s ease-in-out',
                }}
              >
                <CardHeader
                  title="Quick Actions"
                  titleTypographyProps={{
                    variant: 'h6',
                    fontWeight: 600,
                  }}
                  sx={{
                    pb: 1,
                  }}
                />
                <Divider />
                <CardContent
                  sx={{
                    flexGrow: 1,
                    pt: 2,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 6 }}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          backgroundColor: 'background.paper',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            borderColor: '#9C27B0',
                            transform: 'translateY(-2px)',
                            boxShadow: 2,
                          },
                        }}
                        onClick={() => navigate('/sales-management/reports')}
                      >
                        <SalesIcon sx={{ fontSize: 32, color: '#9C27B0', mb: 1 }} />
                        <Typography variant="subtitle2" fontWeight={500}>
                          View Sales
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6 }}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          backgroundColor: 'background.paper',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            borderColor: '#2196F3',
                            transform: 'translateY(-2px)',
                            boxShadow: 2,
                          },
                        }}
                        onClick={() => navigate('/sales-management/reports')}
                      >
                        <ReportsIcon sx={{ fontSize: 32, color: '#2196F3', mb: 1 }} />
                        <Typography variant="subtitle2" fontWeight={500}>
                          Sales Reports
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6 }}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          backgroundColor: 'background.paper',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            borderColor: '#4CAF50',
                            transform: 'translateY(-2px)',
                            boxShadow: 2,
                          },
                        }}
                        onClick={() => navigate('/sales-management/reports')}
                      >
                        <TrendingUpIcon sx={{ fontSize: 32, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="subtitle2" fontWeight={500}>
                          Sales Trends
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6 }}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          backgroundColor: 'background.paper',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            borderColor: '#FF9800',
                            transform: 'translateY(-2px)',
                            boxShadow: 2,
                          },
                        }}
                        onClick={() => navigate('/sales-management/reports')}
                      >
                        <CartIcon sx={{ fontSize: 32, color: '#FF9800', mb: 1 }} />
                        <Typography variant="subtitle2" fontWeight={500}>
                          Top Items
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                  },
                  transition: 'box-shadow 0.3s ease-in-out',
                }}
              >
                <CardHeader
                  title="Sales Statistics"
                  titleTypographyProps={{
                    variant: 'h6',
                    fontWeight: 600,
                  }}
                  sx={{
                    pb: 1,
                  }}
                />
                <Divider />
                <CardContent
                  sx={{
                    flexGrow: 1,
                    pt: 2,
                  }}
                >
                  <Grid container spacing={2} justifyContent="center">
                    <Grid size={{ xs: 6, sm: 6 }}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          backgroundColor: 'background.paper',
                        }}
                      >
                        <TrendingUpIcon sx={{ fontSize: 32, color: '#FF9800', mb: 1 }} />
                        <Typography variant="h6" color="#FF9800" fontWeight="bold" sx={{ mb: 0.5 }}>
                          {numberFormat(Number(data.summary?.average_transaction ?? 0).toFixed(2))}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                          Avg Transaction
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6 }}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          backgroundColor: 'background.paper',
                        }}
                      >
                        <DiscountIcon sx={{ fontSize: 32, color: '#E91E63', mb: 1 }} />
                        <Typography variant="h6" color="#E91E63" fontWeight="bold" sx={{ mb: 0.5 }}>
                          {numberFormat(data.summary.total_discounts || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                          Total Discounts
                        </Typography>
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                  },
                  transition: 'box-shadow 0.3s ease-in-out',
                }}
              >
                <CardHeader 
                  title="Clients Consulted vs Successful Sales"
                  titleTypographyProps={{
                    variant: 'h6',
                    fontWeight: 600,
                  }}
                  sx={{
                    pb: 1,
                  }}
                />
                <Divider />
                <CardContent
                  sx={{
                    flexGrow: 1,
                    pt: 2,
                    pb: 2,
                    '&:last-child': {
                      pb: 2,
                    },
                  }}
                >
                  <Box sx={{ width: '100%', height: '100%' }}>
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
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Prescription Demand Graph */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                  },
                  transition: 'box-shadow 0.3s ease-in-out',
                }}
              >
                <CardHeader 
                  title="Prescription Demand"
                  titleTypographyProps={{
                    variant: 'h6',
                    fontWeight: 600,
                  }}
                  sx={{
                    pb: 1,
                  }}
                />
                <Divider />
                <CardContent
                  sx={{
                    flexGrow: 1,
                    pt: 2,
                    pb: 2,
                    '&:last-child': {
                      pb: 2,
                    },
                  }}
                >
                  <Box sx={{ width: '100%', height: '100%' }}>
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
                  </Box>
                </CardContent>
              </Card>
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

