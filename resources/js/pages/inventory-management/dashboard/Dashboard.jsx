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
  WarningRounded as LowStockIcon,
  TrendingUpRounded as StockInIcon,
  TrendingDownRounded as StockOutIcon,
  RefreshRounded as RefreshIcon,
  MedicationRounded as PharmacyIcon,
  VisibilityRounded as LensIcon,
  CenterFocusStrongRounded as FrameIcon,
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
  deepOrange,
  lightBlue,
  lightGreen,
} from "@mui/material/colors";
import { useTheme } from "@mui/material/styles";

import Page from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import ChartWrapper from "../../../components/ChartWrapper";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();

  const [dateParams] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const [selectedFrameId, setSelectedFrameId] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  
  const [frameItems, setFrameItems] = useState([]);
  const [medicineItems, setMedicineItems] = useState([]);
  
  // Separate states for chart data
  const [frameChartData, setFrameChartData] = useState([]);
  const [medicineChartData, setMedicineChartData] = useState([]);
  const [frameChartLoading, setFrameChartLoading] = useState(false);
  const [medicineChartLoading, setMedicineChartLoading] = useState(false);

  // States for single item view
  const [isFrameFilterActive, setIsFrameFilterActive] = useState(false);
  const [isMedicineFilterActive, setIsMedicineFilterActive] = useState(false);
  const [selectedFrameName, setSelectedFrameName] = useState('');
  const [selectedMedicineName, setSelectedMedicineName] = useState('');

  // MAIN DASHBOARD DATA
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
        pharmacy_categories: [],
        sold_frames_pie_chart: [],
        sold_medicine_pie_chart: [],
        frame_items: [],
        medicine_items: [],
      },
    },
    (response) => {
      const result = response.data.data;
      if (result?.statistics?.frame_items) {
        setFrameItems(result.statistics.frame_items);
      }
      if (result?.statistics?.medicine_items) {
        setMedicineItems(result.statistics.medicine_items);
      }
      // Set initial chart data
      if (result?.statistics?.sold_frames_pie_chart) {
        setFrameChartData(result.statistics.sold_frames_pie_chart);
      }
      if (result?.statistics?.sold_medicine_pie_chart) {
        setMedicineChartData(result.statistics.sold_medicine_pie_chart);
      }
      return result;
    }
  );

  useEffect(() => {
    document.title = `Stock Management Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleRefresh = () => {
    handleFetch();
    addToast({ message: "Dashboard refreshed", severity: "success" });
  };

  // Fetch frame chart data when frame filter changes
  useEffect(() => {
    const fetchFrameChartData = async () => {
      setFrameChartLoading(true);
      try {
        const params = { ...dateParams };
        
        if (selectedFrameId) {
          params.frame_id = selectedFrameId;
          setIsFrameFilterActive(true);
          // Find and store selected frame name
          const selectedFrame = frameItems.find(f => f.id === selectedFrameId);
          setSelectedFrameName(selectedFrame?.name || 'Selected Frame');
        } else {
          setIsFrameFilterActive(false);
          setSelectedFrameName('');
        }
        
        const response = await window.axios.get('/api/inventory-management/dashboard', { params });
        const chartData = response.data?.data?.statistics?.sold_frames_pie_chart || [];
        
        setFrameChartData(chartData);
        
      } catch (err) {
        console.error('Error fetching frame chart data:', err);
        addToast({ message: "Error loading frame chart data", severity: "error" });
      } finally {
        setFrameChartLoading(false);
      }
    };

    fetchFrameChartData();
  }, [selectedFrameId, dateParams]);

  // Fetch medicine chart data when medicine filter changes
  useEffect(() => {
    const fetchMedicineChartData = async () => {
      setMedicineChartLoading(true);
      try {
        const params = { ...dateParams };
        
        if (selectedMedicineId) {
          params.medicine_id = selectedMedicineId;
          setIsMedicineFilterActive(true);
          // Find and store selected medicine name
          const selectedMedicine = medicineItems.find(m => m.id === selectedMedicineId);
          setSelectedMedicineName(selectedMedicine?.name || 'Selected Medicine');
        } else {
          setIsMedicineFilterActive(false);
          setSelectedMedicineName('');
        }
        
        const response = await window.axios.get('/api/inventory-management/dashboard', { params });
        const chartData = response.data?.data?.statistics?.sold_medicine_pie_chart || [];
        
        setMedicineChartData(chartData);
        
      } catch (err) {
        console.error('Error fetching medicine chart data:', err);
        addToast({ message: "Error loading medicine chart data", severity: "error" });
      } finally {
        setMedicineChartLoading(false);
      }
    };

    fetchMedicineChartData();
  }, [selectedMedicineId, dateParams]);

  // Colors
  const chartColors = [
    blue[500], green[500], orange[500], purple[500], pink[500], 
    cyan[500], teal[500], red[500], yellow[500], indigo[500], 
    lime[500], deepOrange[500], lightBlue[500], lightGreen[500],
    blue[700], green[700], orange[700], purple[700], pink[700],
    cyan[700], teal[700], red[700], blue[300], green[300], orange[300],
  ];

  // Helper functions
  const hasPieChartData = (chartData) => {
    return chartData && chartData.length > 0 && chartData.some(item => item.quantity_sold > 0);
  };

  const getSeriesTotal = (chartData) => {
    if (!chartData || chartData.length === 0) return 0;
    return chartData.reduce((sum, item) => sum + (item.quantity_sold || 0), 0);
  };

  const prepareChartData = (data, type = 'frame', isFilterActive = false) => {
    if (!data || data.length === 0) return { labels: [], series: [], originalData: [] };
    
    // Filter out items with zero quantity
    let filteredData = data.filter(item => (item.quantity_sold || 0) > 0);
    
    // If filter is active, we want to show ONLY the selected item with 100%
    if (isFilterActive) {
      // When filter is active, we want the pie to show only one segment with 100%
      // But we need to keep the original data for reference
      const total = filteredData.reduce((sum, item) => sum + (item.quantity_sold || 0), 0);
      
      // Create a single item representation with 100%
      const singleItemData = [{
        ...filteredData[0], // Keep the first item's properties
        quantity_sold: total, // Set total as the quantity
        isFiltered: true
      }];
      
      filteredData = singleItemData;
    }
    
    // Sort from largest to smallest
    const sortedData = [...filteredData].sort((a, b) => (b.quantity_sold || 0) - (a.quantity_sold || 0));
    
    return {
      labels: sortedData.map(e => {
        if (type === 'frame') {
          return isFilterActive ? selectedFrameName || e.frame_name || 'Selected Frame' : (e.frame_name || 'Unknown');
        } else {
          return isFilterActive ? selectedMedicineName || e.medicine_name || 'Selected Medicine' : (e.medicine_name || 'Unknown');
        }
      }),
      series: sortedData.map(e => e.quantity_sold || 0),
      originalData: sortedData,
      total: getSeriesTotal(filteredData)
    };
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

  // Prepare chart data with filter status
  const framesPrepared = prepareChartData(frameChartData, 'frame', isFrameFilterActive);
  const medicinePrepared = prepareChartData(medicineChartData, 'medicine', isMedicineFilterActive);
  
  const hasFramesData = framesPrepared.series.length > 0;
  const hasMedicineData = medicinePrepared.series.length > 0;
  
  const framesTotal = getSeriesTotal(frameChartData);
  const medicineTotal = getSeriesTotal(medicineChartData);

  // Prepare legend items based on filter status
  const getFrameLegendItems = () => {
    if (isFrameFilterActive) {
      // When filter is active, show only the selected frame in legend
      return [selectedFrameName || 'Selected Frame'];
    }
    // When no filter, show all frames
    return framesPrepared.labels;
  };

  const getMedicineLegendItems = () => {
    if (isMedicineFilterActive) {
      // When filter is active, show only the selected medicine in legend
      return [selectedMedicineName || 'Selected Medicine'];
    }
    // When no filter, show all medicines
    return medicinePrepared.labels;
  };

  // Static data
  const frameCategories = data?.statistics?.frame_categories || [];
  const frameCategoriesSeries = frameCategories.map(e => Math.max(0, parseFloat(e.total_quantity) || 0));
  const hasFrameCategories = frameCategoriesSeries.some(v => v > 0);

  const pharmacyCategories = data?.statistics?.pharmacy_categories || [];
  const pharmacyCategoriesSeries = pharmacyCategories.map(e => Math.max(0, parseFloat(e.total_quantity) || 0));
  const hasPharmacyCategories = pharmacyCategoriesSeries.some(v => v > 0);

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
        titleTypographyProps={{ variant: "h4", fontWeight: 700 }}
        action={
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
        sx={{ p: 0, mb: 2 }}
      />
      
      {!loading && data ? (
        <>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
            {/* Info Cards */}
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

          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
            {/* Frame Categories Pie Chart */}
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardHeader title="Frame Categories" />
                <Divider />
                <CardContent>
                  {!hasFrameCategories ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                      <Typography variant="body1" color="textSecondary">
                        Hakuna data ya Frame Categories
                      </Typography>
                    </Box>
                  ) : (
                    <ChartWrapper
                      options={{
                        labels: frameCategories.map(e => e.category || 'Unknown'),
                        chart: {
                          fontFamily: theme.typography.fontFamily,
                          background: "transparent",
                          toolbar: { show: false },
                        },
                        colors: chartColors,
                        dataLabels: {
                          enabled: true,
                          style: {
                            fontSize: '11px',
                            fontWeight: 600,
                            colors: ['#fff'],
                          },
                          dropShadow: {
                            enabled: true,
                            top: 1,
                            left: 1,
                            blur: 1,
                            color: '#000',
                            opacity: 0.5,
                          },
                          formatter: (val, opts) => {
                            const value = opts.w.globals.series[opts.seriesIndex];
                            const total = opts.w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                            return parseFloat(percentage) > 2 ? `${percentage}%` : '';
                          },
                        },
                        tooltip: { 
                          y: { 
                            formatter: (val, { w }) => {
                              const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                              const percentage = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                              return `${numberFormat(val)} (${percentage}%)`;
                            }
                          } 
                        },
                        legend: { 
                          position: "bottom",
                          fontSize: '12px',
                        },
                        stroke: {
                          show: true,
                          width: 2,
                          colors: ['#fff'],
                        },
                        plotOptions: {
                          pie: {
                            expandOnClick: true,
                            donut: {
                              size: '0%',
                            },
                          },
                        },
                      }}
                      series={frameCategoriesSeries}
                      type="pie"
                      height={400}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Sold Frames - FILTERABLE */}
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                      <CircularProgress size={40} />
                    </Box>
                  ) : !hasFramesData ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, flexDirection: 'column' }}>
                      <Typography variant="body1" color="textSecondary" gutterBottom>
                        {selectedFrameId 
                          ? `Hakuna data ya mauzo ya ${frameItems.find(f => f.id === selectedFrameId)?.name || 'Frame hii'}`
                          : "Hakuna data ya mauzo ya frames"}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total: {numberFormat(framesTotal)}
                      </Typography>
                    </Box>
                  ) : (
                    <ChartWrapper
                      options={{
                        chart: { 
                          toolbar: { show: false },
                        },
                        labels: isFrameFilterActive 
                          ? [selectedFrameName || 'Selected Frame'] 
                          : framesPrepared.labels,
                        colors: isFrameFilterActive 
                          ? [blue[500]] // Single color when filtered
                          : chartColors,
                        tooltip: {
                          y: {
                            formatter: (value, { seriesIndex }) => {
                              if (isFrameFilterActive) {
                                // When filtered, show 100%
                                return `${selectedFrameName || 'Selected Frame'}: ${numberFormat(framesTotal)} (100%)`;
                              }
                              const item = framesPrepared.originalData[seriesIndex];
                              const percentage = framesTotal > 0 ? ((value / framesTotal) * 100).toFixed(1) : '0';
                              return `${item?.frame_name || 'Unknown'}: ${numberFormat(value)} (${percentage}%)`;
                            }
                          }
                        },
                        dataLabels: {
                          enabled: true,
                          style: {
                            fontSize: '11px',
                            fontWeight: 600,
                            colors: ['#fff'],
                          },
                          dropShadow: {
                            enabled: true,
                            top: 1,
                            left: 1,
                            blur: 1,
                            color: '#000',
                            opacity: 0.5,
                          },
                          formatter: (val, opts) => {
                            if (isFrameFilterActive) {
                              // When filtered, always show 100%
                              return '100%';
                            }
                            const value = opts.w.globals.series[opts.seriesIndex];
                            const total = opts.w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                            return `${percentage}%`;
                          },
                        },
                        legend: { 
                          position: 'bottom',
                          fontSize: '12px',
                          show: true,
                          // Show only selected item when filtered
                          labels: {
                            colors: isFrameFilterActive ? ['#fff'] : undefined,
                          },
                        },
                        stroke: {
                          show: true,
                          width: 2,
                          colors: ['#fff'],
                        },
                        plotOptions: {
                          pie: {
                            expandOnClick: true,
                            donut: {
                              size: '0%',
                            },
                          },
                        },
                      }}
                      series={isFrameFilterActive ? [framesTotal] : framesPrepared.series}
                      type="pie"
                      height={400}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Sold Medicine - FILTERABLE */}
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                      <CircularProgress size={40} />
                    </Box>
                  ) : !hasMedicineData ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, flexDirection: 'column' }}>
                      <Typography variant="body1" color="textSecondary" gutterBottom>
                        {selectedMedicineId 
                          ? `Hakuna data ya mauzo ya ${medicineItems.find(m => m.id === selectedMedicineId)?.name || 'Medicine hii'}`
                          : "Hakuna data ya mauzo ya medicine"}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total: {numberFormat(medicineTotal)}
                      </Typography>
                    </Box>
                  ) : (
                    <ChartWrapper
                      options={{
                        chart: { 
                          toolbar: { show: false },
                        },
                        labels: isMedicineFilterActive 
                          ? [selectedMedicineName || 'Selected Medicine'] 
                          : medicinePrepared.labels,
                        colors: isMedicineFilterActive 
                          ? [teal[500]] // Single color when filtered
                          : chartColors,
                        tooltip: {
                          y: {
                            formatter: (value, { seriesIndex }) => {
                              if (isMedicineFilterActive) {
                                // When filtered, show 100%
                                return `${selectedMedicineName || 'Selected Medicine'}: ${numberFormat(medicineTotal)} (100%)`;
                              }
                              const item = medicinePrepared.originalData[seriesIndex];
                              const percentage = medicineTotal > 0 ? ((value / medicineTotal) * 100).toFixed(1) : '0';
                              return `${item?.medicine_name || 'Unknown'}: ${numberFormat(value)} (${percentage}%)`;
                            }
                          }
                        },
                        dataLabels: {
                          enabled: true,
                          style: {
                            fontSize: '11px',
                            fontWeight: 600,
                            colors: ['#fff'],
                          },
                          dropShadow: {
                            enabled: true,
                            top: 1,
                            left: 1,
                            blur: 1,
                            color: '#000',
                            opacity: 0.5,
                          },
                          formatter: (val, opts) => {
                            if (isMedicineFilterActive) {
                              // When filtered, always show 100%
                              return '100%';
                            }
                            const value = opts.w.globals.series[opts.seriesIndex];
                            const total = opts.w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                            return `${percentage}%`;
                          },
                        },
                        legend: { 
                          position: 'bottom',
                          fontSize: '12px',
                          show: true,
                          // Show only selected item when filtered
                          labels: {
                            colors: isMedicineFilterActive ? ['#fff'] : undefined,
                          },
                        },
                        stroke: {
                          show: true,
                          width: 2,
                          colors: ['#fff'],
                        },
                        plotOptions: {
                          pie: {
                            expandOnClick: true,
                            donut: {
                              size: '0%',
                            },
                          },
                        },
                      }}
                      series={isMedicineFilterActive ? [medicineTotal] : medicinePrepared.series}
                      type="pie"
                      height={400}
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
                  {!hasPharmacyCategories ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                      <Typography variant="body1" color="textSecondary">
                        Hakuna data ya Pharmacy Categories
                      </Typography>
                    </Box>
                  ) : (
                    <ChartWrapper
                      options={{
                        labels: pharmacyCategories.map(e => e.category || 'Unknown'),
                        chart: {
                          fontFamily: theme.typography.fontFamily,
                          background: "transparent",
                          toolbar: { show: false },
                        },
                        colors: chartColors,
                        dataLabels: {
                          enabled: true,
                          style: {
                            fontSize: '11px',
                            fontWeight: 600,
                            colors: ['#fff'],
                          },
                          dropShadow: {
                            enabled: true,
                            top: 1,
                            left: 1,
                            blur: 1,
                            color: '#000',
                            opacity: 0.5,
                          },
                          formatter: (val, opts) => {
                            const value = opts.w.globals.series[opts.seriesIndex];
                            const total = opts.w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                            return parseFloat(percentage) > 2 ? `${percentage}%` : '';
                          },
                        },
                        tooltip: { 
                          y: { 
                            formatter: (val, { w }) => {
                              const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                              const percentage = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                              return `${numberFormat(val)} (${percentage}%)`;
                            }
                          } 
                        },
                        legend: { position: "bottom" },
                        stroke: { show: true, width: 2, colors: ['#fff'] },
                        plotOptions: {
                          pie: {
                            expandOnClick: true,
                            donut: { size: '0%' },
                          },
                        },
                      }}
                      series={pharmacyCategoriesSeries}
                      type="pie"
                      height={400}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6">No data available.</Typography>
        </Box>
      )}
    </Page>
  );
};

export default Dashboard;