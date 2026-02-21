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
  InventoryRounded as InventoryIcon,
  AssessmentRounded as StocktakingIcon,
  WarningRounded as LowStockIcon,
  TrendingUpRounded as StockInIcon,
  TrendingDownRounded as StockOutIcon,
  RefreshRounded as RefreshIcon,
  MedicationRounded as PharmacyIcon,
  VisibilityRounded as LensIcon,
  CenterFocusStrongRounded as FrameIcon,
  ShoppingCartRounded as ProductsIcon,
  BarChartRounded as ChartIcon,
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
import InfoCard from "../../dashboard/InfoCard";
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
    "api/inventory-management/dashboard",
    dateParams,
    true,
    {
      summary: {
        total_items: 0,
        low_stock_items: 0,
        stock_in_today: 0,
        stock_out_today: 0,
        total_lens: 0,
        total_medicine: 0,
        total_frame: 0,
      },
      statistics: {
        frame_categories: [],
        frame_stock_movement: [],
        lens_types: [],
        pharmacy_categories: [],
        pharmacy_stock_movement: { stock_in: [], stock_out: [] },
      },
    },
    (response) => {
      console.log('Stock Management Dashboard API Response:', response);
      console.log('Statistics data:', response?.data?.data?.statistics);
      console.log('Frame categories:', response?.data?.data?.statistics?.frame_categories);
      console.log('Lens types:', response?.data?.data?.statistics?.lens_types);
      return response.data.data;
    }
  );

  useEffect(() => {
    document.title = `Stock Management Dashboard - ${window.APP_NAME}`;
  }, []);

  // Auto-refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleFetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleFetch]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleRefresh = () => {
    handleFetch();
    addToast({ message: "Dashboard refreshed", severity: "success" });
  };

  if (loading) {
    return (
      <Page title="Stock Management Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Stock Management Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Stock Management" },
        { title: "Dashboard" },
      ]}
    >
      <CardHeader
        title="Stock Management Dashboard"
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
      {!loading && data ? (
        <React.Fragment>
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mb: 4 }}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Items"
                count={numberFormat(data.summary?.total_items || 0)}
                icon={<InventoryIcon />}
                color={purple[400]}
                onClick={() => navigate('/inventory-management/stocktaking')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Low Stock Items"
                count={numberFormat(data.summary?.low_stock_items || 0)}
                icon={<LowStockIcon />}
                color={red[400]}
                onClick={() => navigate('/inventory-management/stock-alerts')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Stock In Today"
                count={numberFormat(data.summary?.stock_in_today || 0)}
                icon={<StockInIcon />}
                color={green[400]}
                onClick={() => navigate('/inventory-management/stocktaking')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Stock Out Today"
                count={numberFormat(data.summary?.stock_out_today || 0)}
                icon={<StockOutIcon />}
                color={orange[400]}
                onClick={() => navigate('/inventory-management/stock-alerts')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Lens"
                count={numberFormat(data.summary?.total_lens || 0)}
                icon={<LensIcon />}
                color={blue[500]}
                onClick={() => navigate('/inventory-management/lens-list')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Medicine"
                count={numberFormat(data.summary?.total_medicine || 0)}
                icon={<PharmacyIcon />}
                color={teal[500]}
                onClick={() => navigate('/inventory-management/stocktaking')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Frame"
                count={numberFormat(data.summary?.total_frame || 0)}
                icon={<FrameIcon />}
                color={purple[500]}
                onClick={() => navigate('/inventory-management/stocktaking')}
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
            {/* Pie Chart - Frame Categories */}
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardHeader title="Frame Categories" />
                <Divider />
                <CardContent>
                  <ChartWrapper
                    options={{
                      labels: (data.statistics?.frame_categories || []).map(
                        (e) => e.category || 'Unknown'
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
                        colors: (data.statistics?.frame_categories || []).map(
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
                          return numberFormat(opts.w.globals.series[opts.seriesIndex]);
                        },
                      },
                      tooltip: {
                        y: {
                          formatter: (val) => numberFormat(val),
                        },
                      },
                      legend: {
                        position: "bottom",
                        labels: {
                          colors: (data.statistics?.frame_categories || []).map(
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
                    series={(data.statistics?.frame_categories || []).map(
                      (e) => Math.max(0, parseFloat(e.total_quantity) || 0)
                    )}
                    type="pie"
                    height={
                      (data.statistics?.frame_categories || []).length ? 400 : 300
                    }
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions removed for Stock Management Dashboard */}

            {/* Inventory Statistics */}
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Stock Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <InventoryIcon sx={{ fontSize: 28.8, color: '#9C27B0', mb: 1 }} />
                        <Typography variant="h6" color="#9C27B0" fontWeight="bold">
                          {numberFormat(data.summary?.total_items || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Total Items</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <LowStockIcon sx={{ fontSize: 28.8, color: '#F44336', mb: 1 }} />
                        <Typography variant="h6" color="#F44336" fontWeight="bold">
                          {numberFormat(data.summary?.low_stock_items || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Low Stock</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <StockInIcon sx={{ fontSize: 28.8, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="h6" color="#4CAF50" fontWeight="bold">
                          {numberFormat(data.summary?.stock_in_today || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Stock In Today</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <StockOutIcon sx={{ fontSize: 28.8, color: '#FF9800', mb: 1 }} />
                        <Typography variant="h6" color="#FF9800" fontWeight="bold">
                          {numberFormat(data.summary?.stock_out_today || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Stock Out Today</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Lens Types Chart */}
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardHeader title="Lens Types" />
                <Divider />
                <CardContent>
                  <ChartWrapper
                    options={{
                      labels: (data.statistics?.lens_types || []).map(
                        (e) => e.lens_type || 'Unknown'
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
                        indigo[400],
                        cyan[500],
                        purple[400],
                        teal[400],
                        blue[400],
                        green[500],
                        orange[400],
                        pink[400],
                      ],
                      stroke: {
                        show: false,
                        width: 3,
                        colors: (data.statistics?.lens_types || []).map(
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
                          return numberFormat(opts.w.globals.series[opts.seriesIndex]);
                        },
                      },
                      tooltip: {
                        y: {
                          formatter: (val) => numberFormat(val),
                        },
                      },
                      legend: {
                        position: "bottom",
                        labels: {
                          colors: (data.statistics?.lens_types || []).map(
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
                    series={(data.statistics?.lens_types || []).map(
                      (e) => Math.max(0, parseFloat(e.total_quantity) || 0)
                    )}
                    type="pie"
                    height={
                      (data.statistics?.lens_types || []).length ? 400 : 300
                    }
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Pharmacy Categories Chart */}
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardHeader title="Pharmacy Items by Category" />
                <Divider />
                <CardContent>
                  <ChartWrapper
                    options={{
                      labels: (data.statistics?.pharmacy_categories || []).map(
                        (e) => e.category || 'Unknown'
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
                        teal[400],
                        green[500],
                        cyan[500],
                        blue[400],
                        purple[400],
                        orange[400],
                        pink[400],
                        yellow[500],
                      ],
                      stroke: {
                        show: false,
                        width: 3,
                        colors: (data.statistics?.pharmacy_categories || []).map(
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
                          return numberFormat(opts.w.globals.series[opts.seriesIndex]);
                        },
                      },
                      tooltip: {
                        y: {
                          formatter: (val) => numberFormat(val),
                        },
                      },
                      legend: {
                        position: "bottom",
                        labels: {
                          colors: (data.statistics?.pharmacy_categories || []).map(
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
                    series={(data.statistics?.pharmacy_categories || []).map(
                      (e) => Math.max(0, parseFloat(e.total_quantity) || 0)
                    )}
                    type="pie"
                    height={
                      (data.statistics?.pharmacy_categories || []).length ? 400 : 300
                    }
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
