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
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
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

  // Set up date parameters for daily filtering (default to today)
  const [dateParams] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  // Selected item filters for individual performance charts
  const [selectedFrameId, setSelectedFrameId] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  
  // Store item lists separately so they persist during chart refetch
  const [frameItems, setFrameItems] = useState([]);
  const [medicineItems, setMedicineItems] = useState([]);
  
  // Loading states for individual charts
  const [frameChartLoading, setFrameChartLoading] = useState(false);
  const [medicineChartLoading, setMedicineChartLoading] = useState(false);
  
  // Store chart data separately
  const [frameMonthlySales, setFrameMonthlySales] = useState([]);
  const [medicineMonthlySales, setMedicineMonthlySales] = useState([]);

  // Main dashboard data fetch (without filter params - for summary and static data)
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
        frame_monthly_sales: [],
        medicine_monthly_sales: [],
        frame_items: [],
        medicine_items: [],
      },
    },
    (response) => {
      const result = response.data.data;
      // Store item lists when main data loads
      if (result?.statistics?.frame_items) {
        setFrameItems(result.statistics.frame_items);
      }
      if (result?.statistics?.medicine_items) {
        setMedicineItems(result.statistics.medicine_items);
      }
      // Initialize chart data
      if (result?.statistics?.frame_monthly_sales) {
        setFrameMonthlySales(result.statistics.frame_monthly_sales);
      }
      if (result?.statistics?.medicine_monthly_sales) {
        setMedicineMonthlySales(result.statistics.medicine_monthly_sales);
      }
      return result;
    }
  );

  useEffect(() => {
    document.title = `Stock Management Dashboard - ${window.APP_NAME}`;
  }, []);

  // Fetch frame chart data when frame filter changes
  useEffect(() => {
    if (selectedFrameId === '') {
      // Reset to original data when "All Frames" is selected
      if (data?.statistics?.frame_monthly_sales) {
        setFrameMonthlySales(data.statistics.frame_monthly_sales);
      }
      return;
    }
    
    setFrameChartLoading(true);
    window.axios.get('/api/inventory-management/dashboard', {
      params: { ...dateParams, frame_id: selectedFrameId }
    }).then((response) => {
      const chartData = response.data?.data?.statistics?.frame_monthly_sales || [];
      setFrameMonthlySales(chartData);
    }).catch((err) => {
      console.error('Error fetching frame chart data:', err);
    }).finally(() => {
      setFrameChartLoading(false);
    });
  }, [selectedFrameId]);

  // Fetch medicine chart data when medicine filter changes
  useEffect(() => {
    if (selectedMedicineId === '') {
      // Reset to original data when "All Medicines" is selected
      if (data?.statistics?.medicine_monthly_sales) {
        setMedicineMonthlySales(data.statistics.medicine_monthly_sales);
      }
      return;
    }
    
    setMedicineChartLoading(true);
    window.axios.get('/api/inventory-management/dashboard', {
      params: { ...dateParams, medicine_id: selectedMedicineId }
    }).then((response) => {
      const chartData = response.data?.data?.statistics?.medicine_monthly_sales || [];
      setMedicineMonthlySales(chartData);
    }).catch((err) => {
      console.error('Error fetching medicine chart data:', err);
    }).finally(() => {
      setMedicineChartLoading(false);
    });
  }, [selectedMedicineId]);

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

            {/* Sold Frames (Monthly) */}
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardHeader
                  title={selectedFrameId
                    ? `Sold: ${frameItems.find(f => f.id === selectedFrameId)?.name || 'Frame'} (Monthly)`
                    : "Sold Frames (Monthly)"}
                  action={
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel id="frame-filter-label">Filter by Frame</InputLabel>
                      <MuiSelect
                        labelId="frame-filter-label"
                        label="Filter by Frame"
                        value={selectedFrameId}
                        onChange={(e) => setSelectedFrameId(e.target.value)}
                      >
                        <MenuItem value="">All Frames</MenuItem>
                        {frameItems.map((item) => (
                          <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  }
                />
                <Divider />
                <CardContent>
                  {frameChartLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
                      <CircularProgress size={40} />
                    </Box>
                  ) : (
                    <ChartWrapper
                      options={{
                        chart: { toolbar: { show: false } },
                        labels: (data.statistics?.sold_frames_pie_chart || []).map(
                          (e) => e.frame_name || 'Unknown'
                        ),
                        colors: [blue[500], green[500], orange[500], purple[500], pink[500], cyan[500], teal[500], red[500], yellow[500], indigo[500]],
                        tooltip: {
                          custom: function({ series, seriesIndex, dataPointIndex, w }) {
                            const data = data.statistics?.sold_frames_pie_chart?.[dataPointIndex];
                            if (!data) return '';
                            
                            let html = `<div class="apexcharts-tooltip-custom" style="padding: 8px;">`;
                            html += `<strong>${data.frame_name}</strong><br/>`;
                            html += `Quantity Sold: ${numberFormat(data.quantity_sold || 0)}<br/>`;
                            html += `Percentage: ${((series[seriesIndex] / series.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%`;
                            html += `</div>`;
                            
                            return html;
                          }
                        },
                        plotOptions: {
                          pie: {
                            donut: {
                              size: '65%',
                              labels: {
                                show: true,
                                total: {
                                  show: true,
                                  label: 'Total Frames Sold',
                                  formatter: function (w) {
                                    const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                    return numberFormat(total);
                                  }
                                }
                              }
                            }
                          }
                        },
                        dataLabels: {
                          formatter: function (val, opts) {
                            const total = opts.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            const percentage = ((val / total) * 100).toFixed(1);
                            return `${percentage}%`;
                          }
                        },
                        legend: {
                          position: 'bottom'
                        }
                      }}
                      series={(data.statistics?.sold_frames_pie_chart || []).map(
                        (e) => e.quantity_sold || 0
                      )}
                      type="pie"
                      height={320}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Sold Medicine (Monthly) */}
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardHeader
                  title={selectedMedicineId
                    ? `Sold: ${medicineItems.find(m => m.id === selectedMedicineId)?.name || 'Medicine'} (Monthly)`
                    : "Sold Medicine (Monthly)"}
                  action={
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel id="medicine-filter-label">Filter by Medicine</InputLabel>
                      <MuiSelect
                        labelId="medicine-filter-label"
                        label="Filter by Medicine"
                        value={selectedMedicineId}
                        onChange={(e) => setSelectedMedicineId(e.target.value)}
                      >
                        <MenuItem value="">All Medicines</MenuItem>
                        {medicineItems.map((item) => (
                          <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  }
                />
                <Divider />
                <CardContent>
                  {medicineChartLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
                      <CircularProgress size={40} />
                    </Box>
                  ) : (
                    <ChartWrapper
                      options={{
                        chart: { toolbar: { show: false } },
                        labels: (data.statistics?.sold_medicine_pie_chart || []).map(
                          (e) => e.medicine_name || 'Unknown'
                        ),
                        colors: [teal[500], green[500], blue[500], orange[500], purple[500], pink[500], cyan[500], red[500], yellow[500], indigo[500]],
                        tooltip: {
                          custom: function({ series, seriesIndex, dataPointIndex, w }) {
                            const data = data.statistics?.sold_medicine_pie_chart?.[dataPointIndex];
                            if (!data) return '';
                            
                            let html = `<div class="apexcharts-tooltip-custom" style="padding: 8px;">`;
                            html += `<strong>${data.medicine_name}</strong><br/>`;
                            html += `Quantity Sold: ${numberFormat(data.quantity_sold || 0)}<br/>`;
                            html += `Percentage: ${((series[seriesIndex] / series.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%`;
                            html += `</div>`;
                            
                            return html;
                          }
                        },
                        plotOptions: {
                          pie: {
                            donut: {
                              size: '65%',
                              labels: {
                                show: true,
                                total: {
                                  show: true,
                                  label: 'Total Medicine Sold',
                                  formatter: function (w) {
                                    const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                    return numberFormat(total);
                                  }
                                }
                              }
                            }
                          }
                        },
                        dataLabels: {
                          formatter: function (val, opts) {
                            const total = opts.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            const percentage = ((val / total) * 100).toFixed(1);
                            return `${percentage}%`;
                          }
                        },
                        legend: {
                          position: 'bottom'
                        }
                      }}
                      series={(data.statistics?.sold_medicine_pie_chart || []).map(
                        (e) => e.quantity_sold || 0
                      )}
                      type="pie"
                      height={320}
                    />
                  )}
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
