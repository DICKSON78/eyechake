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
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  MedicationRounded as MedicineIcon,
  Person2Rounded as PatientIcon,
  AssignmentRounded as RequestsIcon,
  CheckCircleRounded as CompletedIcon,
  ScheduleRounded as PendingIcon,
  LibraryBooksRounded as ReportsIcon,
  InventoryRounded as StockIcon,
  TrendingUpRounded as DispensedIcon,
  TrendingUpRounded as StockInIcon,
  TrendingDownRounded as StockOutIcon,
  WarningRounded as WarningIcon,
  ErrorRounded as ExpiredIcon,
  ScheduleRounded as ExpiringIcon,
  RefreshRounded as RefreshIcon,
} from "@mui/icons-material";
import {
  blue,
  cyan,
  green,
  orange,
  purple,
  teal,
  pink,
  red,
  yellow,
  indigo,
  lime,
} from "@mui/material/colors";
import { useTheme } from "@mui/material/styles";

import Page from "../../../components/Page";
import ChartWrapper from "../../../components/ChartWrapper";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, getWeekStartDate, getWeekEndDate } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();

  // Set up date parameters for weekly filtering
  const [dateParams, setDateParams] = useState({
    start_date: getWeekStartDate().toISOString().split('T')[0],
    end_date: getWeekEndDate().toISOString().split('T')[0],
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/medicine-center/dashboard",
    dateParams,
    true,
    {
      summary: {
        total_medicines_dispensed: 0,
        pending_medicines: 0,
        total_medicine_items: 0,
        low_stock_medicines: 0,
        expired_medicines: 0,
        expiring_soon_medicines: 0,
        out_of_stock_medicines: 0,
      },
      statistics: {
        medicines_by_status: [],
        top_medicines: [],
        dispensing_trend: [],
        stock_by_category: [],
        stock_movement: { stock_in: [], stock_out: [] },
        stock_alerts: {
          expired_count: 0,
          expiring_soon_count: 0,
          out_of_stock_count: 0,
        },
      },
    },
    (response) => response.data.data
  );

  const handleRefresh = () => {
    handleFetch();
    addToast({ message: "Dashboard refreshed", severity: "success" });
  };

  useEffect(() => {
    document.title = `Medicine Center Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title="Medicine Center Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Medicine Center Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Medicine Center" },
        { title: "Medicine Center Dashboard" },
      ]}
    >
      <CardHeader
        title="Pharmacy Stock Dashboard"
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        action={
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
        sx={{
          p: 0,
          mb: 2,
        }}
      />
      {loading && <div>Loading...</div>}
      {!loading && data ? (
        <React.Fragment>


          {/* Stock Alerts Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card 
                elevation={2}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/medicine-center/medicine-alerts')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Expired Items
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color={red[600]}>
                        {numberFormat(data.statistics?.stock_alerts?.expired_count || data.summary?.expired_medicines || 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: '50%', 
                      bgcolor: red[50],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <ExpiredIcon sx={{ fontSize: 32, color: red[600] }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card 
                elevation={2}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/medicine-center/medicine-alerts')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Expiring Soon
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color={orange[600]}>
                        {numberFormat(data.statistics?.stock_alerts?.expiring_soon_count || data.summary?.expiring_soon_medicines || 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Within 90 days
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: '50%', 
                      bgcolor: orange[50],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <ExpiringIcon sx={{ fontSize: 32, color: orange[600] }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card 
                elevation={2}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/medicine-center/medicine-alerts')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Out of Stock
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color={red[600]}>
                        {numberFormat(data.statistics?.stock_alerts?.out_of_stock_count || data.summary?.low_stock_medicines || 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: '50%', 
                      bgcolor: red[50],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <WarningIcon sx={{ fontSize: 32, color: red[600] }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Stock by Category Pie Chart */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={2}>
                <CardHeader title="Stock by Category" />
                <Divider />
                <CardContent>
                  <ChartWrapper
                    options={{
                      labels: (data.statistics?.stock_by_category || []).map(
                        (e) => e.category || 'Uncategorized'
                      ),
                      chart: {
                        fontFamily: theme.typography.fontFamily,
                        background: "transparent",
                        toolbar: {
                          show: false,
                        },
                      },
                      plotOptions: {
                        pie: {
                          dataLabels: {
                            offset: -16,
                          },
                        },
                      },
                      colors: [
                        blue[400],
                        red[400],
                        cyan[500],
                        green[500],
                        indigo[400],
                        teal[400],
                        purple[400],
                        lime[600],
                        pink[400],
                        yellow[500],
                        orange[400],
                      ],
                      stroke: {
                        show: false,
                        width: 3,
                        colors: (data.statistics?.stock_by_category || []).map(
                          (e) => theme.palette.background.paper
                        ),
                      },
                      dataLabels: {
                        style: {
                          fontSize: 10,
                          fontWeight: 400,
                        },
                        dropShadow: {
                          enabled: false,
                        },
                        formatter: function (val, opts) {
                          const category = opts.w.globals.labels[opts.seriesIndex];
                          const quantity = numberFormat(opts.w.globals.series[opts.seriesIndex]);
                          return `${category}: ${quantity}`;
                        },
                      },
                      tooltip: {
                        y: {
                          formatter: (val, { seriesIndex, w }) => {
                            const item = data.statistics?.stock_by_category?.[seriesIndex];
                            if (item) {
                              return `${numberFormat(item.total_quantity)} units (${item.item_count} items)`;
                            }
                            return numberFormat(val);
                          },
                        },
                      },
                      legend: {
                        position: "bottom",
                        labels: {
                          colors: (data.statistics?.stock_by_category || []).map(
                            (e) => theme.palette.text.secondary
                          ),
                          useSeriesColors: false,
                        },
                        markers: {
                          width: 14,
                          height: 8,
                          radius: 4,
                        },
                      },
                    }}
                    series={(data.statistics?.stock_by_category || []).map(
                      (e) => parseFloat(e.total_quantity) || 0
                    )}
                    type="pie"
                    height={400}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Stock In vs Stock Out Graph */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={2}>
                <CardHeader title="Stock In vs Stock Out (Last 30 Days)" />
                <Divider />
                <CardContent>
                  <ChartWrapper
                    options={{
                      chart: {
                        type: 'line',
                        fontFamily: theme.typography.fontFamily,
                        background: "transparent",
                        toolbar: {
                          show: false,
                        },
                      },
                      stroke: {
                        curve: 'smooth',
                        width: 3,
                      },
                      xaxis: {
                        categories: (() => {
                          const stockIn = data.statistics?.stock_movement?.stock_in || [];
                          const stockOut = data.statistics?.stock_movement?.stock_out || [];
                          const allDates = [...new Set([
                            ...stockIn.map(item => item.date),
                            ...stockOut.map(item => item.date)
                          ])].sort();
                          return allDates.map(date => {
                            const d = new Date(date);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                          });
                        })(),
                        labels: {
                          style: {
                            colors: theme.palette.text.secondary,
                          },
                        },
                      },
                      yaxis: {
                        title: {
                          text: 'Quantity',
                          style: {
                            color: theme.palette.text.secondary,
                          },
                        },
                        labels: {
                          style: {
                            colors: theme.palette.text.secondary,
                          },
                          formatter: (val) => numberFormat(val),
                        },
                      },
                      colors: [green[500], red[500]],
                      legend: {
                        position: 'top',
                        labels: {
                          colors: theme.palette.text.secondary,
                        },
                      },
                      tooltip: {
                        y: {
                          formatter: (val) => numberFormat(val) + ' units',
                        },
                      },
                      grid: {
                        borderColor: theme.palette.divider,
                      },
                    }}
                    series={[
                      {
                        name: 'Stock In',
                        data: (() => {
                          const stockIn = data.statistics?.stock_movement?.stock_in || [];
                          const stockOut = data.statistics?.stock_movement?.stock_out || [];
                          const allDates = [...new Set([
                            ...stockIn.map(item => item.date),
                            ...stockOut.map(item => item.date)
                          ])].sort();
                          return allDates.map(date => {
                            const item = stockIn.find(i => i.date === date);
                            return item ? parseFloat(item.quantity) : 0;
                          });
                        })(),
                      },
                      {
                        name: 'Stock Out',
                        data: (() => {
                          const stockIn = data.statistics?.stock_movement?.stock_in || [];
                          const stockOut = data.statistics?.stock_movement?.stock_out || [];
                          const allDates = [...new Set([
                            ...stockIn.map(item => item.date),
                            ...stockOut.map(item => item.date)
                          ])].sort();
                          return allDates.map(date => {
                            const item = stockOut.find(i => i.date === date);
                            return item ? parseFloat(item.quantity) : 0;
                          });
                        })(),
                      },
                    ]}
                    type="line"
                    height={400}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </React.Fragment>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6">No data available.</Typography>
        </Box>
      )}
    </Page>
  );
};

export default Dashboard;
