import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  FormControlLabel,
  Checkbox,
  Stack,
  Box,
} from "@mui/material";
import {
  AccountBalanceRounded as SalesIcon,
  CenterFocusStrongRounded as GlassIcon,
  DiscountRounded as DiscountIcon,
  DoneAllRounded as DoneIcon,
  FilterAltRounded as FilterIcon,
  MedicalInformationRounded as PharmacyIcon,
  MeetingRoomRounded as ConsultationsIcon,
  MoneyRounded as NetProfitIcon,
  TrendingDownRounded as ExpensesIcon,
  ReceiptRounded as BillsIcon,
  RefreshRounded as RefreshIcon,
} from "@mui/icons-material";

import Page from "../../components/Page";
import Modal from "../../components/Modal";
import LoadingSkeleton from "./LoadingSkeleton";
import InfoCard from "./InfoCard";
import Filters from "./Filters";
import StockAlertsNotification from "../../components/StockAlertsNotification";
import ChartWrapper from "../../components/ChartWrapper";
import Select from "../../components/Select";
import PatientReturnSidebar from "./PatientReturnSidebar";
import notificationEvents from "../../utils/notificationEvents";

import { useTheme } from "@mui/material/styles";
import {
  blue,
  cyan,
  deepOrange,
  green,
  indigo,
  lightBlue,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from "@mui/material/colors";
import { useFetch, useToast } from "../../hooks";
import {
  formatDateForDb,
  formatError,
  numberFormat,
  round,
  getWeekStartDate,
} from "../../helpers";

const Dashboard = ({ setSmsBalance }) => {
  const theme = useTheme();
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();

  const [params, setParams] = useState({
    clinic_id: undefined,
    start_date: new Date(), // Default to today
    end_date: new Date(),   // Default to today
  });

  const [salesExpensesPeriod, setSalesExpensesPeriod] = useState('yearly');
  const [patientRegistrationPeriod, setPatientRegistrationPeriod] = useState('yearly');
  const [statisticsLoaded, setStatisticsLoaded] = useState(false);

  // Memoize params to prevent unnecessary re-renders and ensure periods are always strings
  const fetchParams = useMemo(() => {
    const salesPeriod = typeof salesExpensesPeriod === 'string'
      ? salesExpensesPeriod
      : (salesExpensesPeriod?.value || 'yearly');
    const regPeriod = typeof patientRegistrationPeriod === 'string'
      ? patientRegistrationPeriod
      : (patientRegistrationPeriod?.value || 'yearly');

    return {
      ...params,
      clinic: undefined,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
      sales_expenses_period: salesPeriod,
      patient_registration_period: regPeriod,
      load_statistics: statisticsLoaded, // Only load statistics when needed
    };
  }, [params, salesExpensesPeriod, patientRegistrationPeriod, statisticsLoaded]);

  const { data, loading, error, handleFetch } = useFetch(
    "api/dashboard",
    fetchParams,
    true,
    null,
    (response) => response.data.data
  );

  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  // Memoize refresh handler to prevent unnecessary re-renders
  const handleRefresh = useCallback(() => {
    if (!loading) {
      setIsAutoRefreshing(true);
      handleFetch();
      setLastRefresh(Date.now());
      // Reset auto-refreshing flag after a short delay
      setTimeout(() => setIsAutoRefreshing(false), 1000);
    }
  }, [handleFetch, loading]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        handleRefresh();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [handleRefresh, loading]);

  // Listen to notification events to refresh dashboard when something changes
  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe(() => {
      // Debounce refresh to prevent too many rapid refreshes
      setTimeout(() => {
        if (!loading) {
          handleRefresh();
        }
      }, 500);
    });

    return () => unsubscribe();
  }, [handleRefresh, loading]);

  useEffect(() => {
    document.title = `Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (data && setSmsBalance && typeof setSmsBalance === 'function') {
      setSmsBalance(data.summary.sms_balance);
    }
  }, [data, setSmsBalance]);

  // Load statistics data after initial dashboard load
  useEffect(() => {
    if (data && !statisticsLoaded && !loading) {
      // Load statistics data after a short delay to improve perceived performance
      const timer = setTimeout(() => {
        setStatisticsLoaded(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [data, statisticsLoaded, loading]);

  useEffect(() => {
    if (error) {
      const errorMessage = formatError(error);
      addToast({ 
        message: errorMessage || "Failed to load dashboard data. Please try again later.", 
        severity: "error" 
      });
      console.error('Dashboard error:', error);
    }
  }, [error]);


  const openFiltersModal = () => {
    const component = (
      <Filters
        modal={modalRef.current}
        params={params}
        setParams={setParams}
      />
    );

    modalRef.current.open("Filter", component, "sm");
  };

  // Navigation functions for InfoCard components
  const navigateToFinancialManagement = () => navigate('/financial-management/dashboard');
  const navigateToReception = () => navigate('/reception/dashboard');
  const navigateToConsultationRoom = () => navigate('/consultation-room/dashboard');
  const navigateToMedicineCenter = () => navigate('/medicine-center/dashboard');
  const navigateToOpticianCenter = () => navigate('/optician-center/dashboard');
  const navigateToPatientRecords = () => navigate('/reception/patients');
  const navigateToPendingBills = () => navigate('/payment-center/patient-bills/pending');
  const navigateToSalesExpenses = () => navigate(`/dashboard/sales-expenses?period=${salesExpensesPeriod}`);
  const navigateToPatientRegistration = () => {
    const periodValue = typeof patientRegistrationPeriod === 'string' ? patientRegistrationPeriod : 'yearly';
    navigate(`/dashboard/patient-registration?period=${periodValue}`);
  };
  const navigateToClientStatistics = () => navigate('/dashboard/client-statistics');

  return (
    <Page
      title="Dashboard"
      breadcrumbs={[{ title: "Home" }, { title: "Dashboard" }]}
    >
      <CardHeader
        title="Dashboard"
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={loading || isAutoRefreshing ? "Refreshing..." : "Refresh data"}>
              <span>
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={loading || isAutoRefreshing}
                  sx={{
                    animation: (loading || isAutoRefreshing) ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Show filters">
              <IconButton onClick={openFiltersModal}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        sx={{
          p: 0,
          mb: 2,
        }}
      />
      {error && !data && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            Failed to Load Dashboard Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {formatError(error) || "An error occurred while loading the dashboard. Please try refreshing the page."}
          </Typography>
          <Button
            variant="contained"
            onClick={handleFetch}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Card>
      )}
      {data ? (
        <>
          <StockAlertsNotification />
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mb: 4 }}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Sales"
                count={numberFormat(data.summary.total_sales)}
                icon={<SalesIcon />}
                color={purple[400]}
                onClick={navigateToFinancialManagement}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Expenses"
                count={numberFormat(data.summary.expenses)}
                icon={<ExpensesIcon />}
                color={theme.palette.warning.main}
                onClick={navigateToFinancialManagement}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Net Profit"
                count={numberFormat(
                  Math.max(0, (data.summary.total_sales || 0) - (data.summary.expenses || 0))
                )}
                icon={<NetProfitIcon />}
                color={cyan[500]}
                onClick={navigateToFinancialManagement}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Discount"
                count={numberFormat(data.summary.discount)}
                icon={<DiscountIcon />}
                color={pink[400]}
                onClick={navigateToFinancialManagement}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Consultation"
                count={numberFormat(data.summary.consultation)}
                icon={<ConsultationsIcon />}
                color={green[400]}
                onClick={navigateToConsultationRoom}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Pharmacy"
                count={numberFormat(data.summary.pharmacy)}
                icon={<PharmacyIcon />}
                color={teal[400]}
                onClick={navigateToMedicineCenter}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Glass"
                count={numberFormat(data.summary.glass)}
                icon={<GlassIcon />}
                color={purple[300]}
                onClick={navigateToOpticianCenter}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Consulted Patients"
                count={numberFormat(data.summary.consulted_patients)}
                icon={<DoneIcon />}
                color={green[500]}
                onClick={navigateToConsultationRoom}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Pending Bills"
                count={numberFormat(data.summary.pending_bills || 0)}
                icon={<BillsIcon />}
                color={red[400]}
                onClick={navigateToPendingBills}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Running Cost"
                count={numberFormat(data.summary.running_cost || 0)}
                icon={<ExpensesIcon />}
                color={pink[500]}
                onClick={navigateToFinancialManagement}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Improvement Cost"
                count={numberFormat(data.summary.improvement_cost || 0)}
                icon={<SalesIcon />}
                color={lightBlue[500]}
                onClick={navigateToFinancialManagement}
              />
            </Grid>
          </Grid>

          {/* Main Content and Sidebar */}
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mt: 2 }}
          >
            {/* Patient Return Sidebar - Left Side */}
            <Grid size={{ xs: 12, md: 3 }}>
              <PatientReturnSidebar />
            </Grid>

            {/* Main Charts Section */}
            <Grid size={{ xs: 12, md: 9 }}>
              {!statisticsLoaded && (
                <Card sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Loading Statistics...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Charts and detailed statistics are being loaded.
                  </Typography>
                </Card>
              )}
              <Grid
                container
                spacing={{ xs: 2, sm: 2, md: 3 }}
                sx={{ opacity: statisticsLoaded ? 1 : 0.5 }}
              >
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardHeader title="Sales by Category" />
                    <Divider />
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
                      borderRadius: 0,
                      borderRadiusApplication: "end",
                      borderRadiusWhenStacked: "last",
                      distributed: true,
                    },
                  },
                  colors: [
                    purple[600],
                    teal[400],
                    orange[300],
                    blue[300],
                    pink[300],
                    green[400],
                  ],
                  stroke: {
                    show: false,
                  },
                  dataLabels: {
                    enabled: false,
                    style: {
                      fontWeight: "400",
                      fontSize: "9px",
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
                    show: false,
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
                    data: [
                      { x: "Consultation", y: data.summary?.consultation || 0 },
                      { x: "Pharmacy", y: data.summary?.pharmacy || 0 },
                      { x: "Glass", y: data.summary?.glass || 0 },
                      { x: "Others", y: data.summary?.others || 0 },
                    ],
                  },
                ]}
                type="bar"
                height="272"
              />
                  </Card>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Card>
              <CardHeader 
                title="Sales vs Expenses"
                action={
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={salesExpensesPeriod === "daily"}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSalesExpensesPeriod("daily");
                              }
                            }}
                            size="small"
                          />
                        }
                        label="Day"
                        sx={{ margin: 0 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={salesExpensesPeriod === "monthly"}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSalesExpensesPeriod("monthly");
                              }
                            }}
                            size="small"
                          />
                        }
                        label="Month"
                        sx={{ margin: 0 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={salesExpensesPeriod === "yearly"}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSalesExpensesPeriod("yearly");
                              }
                            }}
                            size="small"
                          />
                        }
                        label="Year"
                        sx={{ margin: 0 }}
                      />
                    </Stack>
                  </Box>
                }
              />
              <Divider />
              <Box sx={{ overflowX: 'auto', width: '100%' }}>
                <Box sx={{ minWidth: salesExpensesPeriod === 'monthly' ? 900 : 'auto' }}>
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
                          borderRadius: 0,
                          columnWidth: '70%',
                        },
                      },
                      colors: [blue[900], orange[600]],
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
                        labels: {
                          rotate: salesExpensesPeriod === 'monthly' ? -45 : 0,
                          rotateAlways: salesExpensesPeriod === 'monthly',
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
                          radius: 0,
                        },
                      },
                    }}
                    series={[
                      {
                        name: "Sales",
                        data: (data.statistics.sales_expenses || []).map((e) => ({
                          x: e.period,
                          y: e.sales || 0,
                        })),
                      },
                      {
                        name: "Expenses",
                        data: (data.statistics.sales_expenses || []).map((e) => ({
                          x: e.period,
                          y: e.expenses || 0,
                        })),
                      },
                    ]}
                    type="bar"
                    height="320"
                  />
                </Box>
              </Box>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
              <CardHeader 
                title="Patient Registration"
                action={
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={patientRegistrationPeriod === "daily"}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPatientRegistrationPeriod("daily");
                              }
                            }}
                            size="small"
                          />
                        }
                        label="Day"
                        sx={{ margin: 0 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={patientRegistrationPeriod === "monthly"}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPatientRegistrationPeriod("monthly");
                              }
                            }}
                            size="small"
                          />
                        }
                        label="Month"
                        sx={{ margin: 0 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={patientRegistrationPeriod === "yearly"}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPatientRegistrationPeriod("yearly");
                              }
                            }}
                            size="small"
                          />
                        }
                        label="Year"
                        sx={{ margin: 0 }}
                  />
                    </Stack>
                  </Box>
                }
              />
              <Divider />
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
                  colors: [blue[500], red[500], green[500]],
                  stroke: {
                    show: true,
                    width: [3, 3, 3],
                    curve: "smooth",
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
                    name: "Male",
                    data: (data.statistics.patient_registration || []).map((e) => ({
                      x: e.period,
                      y: e.male || 0,
                    })),
                  },
                  {
                    name: "Female",
                    data: (data.statistics.patient_registration || []).map((e) => ({
                      x: e.period,
                      y: e.female || 0,
                    })),
                  },
                  {
                    name: "Total",
                    data: (data.statistics.patient_registration || []).map((e) => ({
                      x: e.period,
                      y: (e.male || 0) + (e.female || 0),
                    })),
                  },
                ]}
                type="line"
                height="272"
                  />
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Card>
                    <CardHeader title="Payments by Channel" />
                    <Divider />
                    <CardContent>
                <ChartWrapper
                  options={{
                    labels: (data.statistics.payments_by_channel || []).map(
                      (e) => e.name
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
                    ],
                    stroke: {
                      show: false,
                      width: 3,
                      colors: (data.statistics.payments_by_channel || []).map(
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
                    },
                    tooltip: {
                      y: {
                        formatter: (
                          val,
                          { series, seriesIndex, dataPointIndex, w }
                        ) => numberFormat(val),
                      },
                    },
                    legend: {
                      position: "bottom",
                      labels: {
                        colors: (data.statistics.payments_by_channel || []).map(
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
                  series={(data.statistics.payments_by_channel || []).map(
                    (e) => e.amount
                  )}
                  type="pie"
                  height={
                    (data.statistics.payments_by_channel || []).length ? 288 : 256
                  }
                    />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Card>
                    <CardHeader title="Expenses by Category" />
                    <Divider />
                    <CardContent>
                <ChartWrapper
                  options={{
                    labels: (data.statistics?.expenses_by_category || []).map(
                      (e) => (typeof e === 'object' && e !== null) ? (e.name || '') : ''
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
                      red[400],
                      lightBlue[400],
                      deepOrange[300],
                      lime[600],
                      pink[400],
                      cyan[500],
                      purple[400],
                      green[500],
                      yellow[500],
                    ],
                    stroke: {
                      show: false,
                      width: 3,
                      colors: (data.statistics.expenses_by_category || []).map(
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
                    },
                    tooltip: {
                      y: {
                        formatter: (
                          val,
                          { series, seriesIndex, dataPointIndex, w }
                        ) => numberFormat(val),
                      },
                    },
                    legend: {
                      position: "bottom",
                      labels: {
                        colors: (data.statistics.expenses_by_category || []).map(
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
                  series={(data.statistics?.expenses_by_category || []).map(
                    (e) => (typeof e === 'object' && e !== null) ? (e.amount || 0) : 0
                  )}
                  type="pie"
                  height={
                    (data.statistics.expenses_by_category || []).length ? 288 : 256
                  }
                    />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
              <CardHeader title="Client Statistics" />
              <Divider />
              <CardContent>
                <ChartWrapper
                  options={{
                    labels: (data.statistics?.client_statistics || []).map(
                      (e) => (typeof e === 'object' && e !== null) ? (e.name || '') : ''
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
                      pink[400],
                      blue[400],
                      cyan[500],
                    ],
                    stroke: {
                      show: false,
                      width: 3,
                      colors: (data.statistics.client_statistics || []).map(
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
                    },
                    tooltip: {
                      y: {
                        formatter: (
                          val,
                          { series, seriesIndex, dataPointIndex, w }
                        ) => numberFormat(val),
                      },
                    },
                    legend: {
                      position: "bottom",
                      labels: {
                        colors: (data.statistics.client_statistics || []).map(
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
                  series={(data.statistics?.client_statistics || []).map(
                    (e) => (typeof e === 'object' && e !== null) ? (e.count || 0) : 0
                  )}
                  type="pie"
                  height={
                    (data.statistics.client_statistics || []).length ? 288 : 256
                  }
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardHeader title="New vs Return Patient" />
                  <Divider />
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
                      colors: [blue[500], green[500]],
                      stroke: {
                        show: true,
                        width: [3, 3],
                        curve: "smooth",
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
                        show: true,
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
                        name: "New Patient",
                        data: (data.statistics.new_vs_return_patients || data.statistics.patient_registration || []).map((e) => ({
                          x: e.period,
                          y: e.new_patients || e.new || 0,
                        })),
                      },
                      {
                        name: "Return Patient",
                        data: (data.statistics.new_vs_return_patients || data.statistics.patient_registration || []).map((e) => ({
                          x: e.period,
                          y: e.return_patients || e.return || 0,
                        })),
                      },
                    ]}
                    type="line"
                    height="272"
                  />
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Grid
                  container
                  spacing={{ xs: 2, sm: 2, md: 3 }}
                >
                  <Grid size={{ xs: 12, md: 12 }}>
                    <Card>
                      <CardHeader title="Consultations by Item" />
                      <Divider />
                      <CardContent>
                    {(data.statistics?.consultations_by_item || []).map((e, i, a) => (
                      <ChartWrapper
                        key={e.id}
                        options={{
                          chart: {
                            fontFamily: theme.typography.fontFamily,
                            foreColor: theme.palette.text.primary,
                            background: "transparent",
                            stacked: true,
                            sparkline: {
                              enabled: true,
                            },
                            toolbar: {
                              show: false,
                            },
                          },
                          plotOptions: {
                            bar: {
                              horizontal: true,
                              barHeight: 12,
                              borderRadius: 6,
                              borderRadiusApplication: "around",
                              borderRadiusWhenStacked: "all",
                              colors: {
                                backgroundBarColors: [
                                  theme.palette.background.default,
                                ],
                                backgroundBarRadius: 6,
                              },
                            },
                          },
                          title: {
                            floating: true,
                            offsetX: -8,
                            offsetY: 6,
                            text: e.name,
                            style: {
                              fontSize: 12,
                              fontWeight: 400,
                            },
                          },
                          subtitle: {
                            floating: true,
                            align: "right",
                            offsetX: 8,
                            offsetY: 6,
                            text: numberFormat(e.consultations),
                            style: {
                              fontSize: 12,
                            },
                          },
                          colors: [
                            [
                              cyan[500],
                              pink[400],
                              blue[400],
                              green[500],
                              yellow[600],
                            ][i % 3],
                          ],
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
                            max: 100,
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
                            name: "Percentage",
                            data: [
                              round(
                                (e.consultations /
                                  (a.reduce(
                                    (acc, f) => acc + f.consultations,
                                    0
                                  ) || 1)) *
                                  100,
                                2
                              ),
                            ],
                          },
                        ]}
                        type="bar"
                        height="64"
                      />
                    ))}
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, md: 12 }}>
                    <Card>
                      <CardHeader title="Top Diagnosis" />
                      <Divider />
                      <CardContent>
                    {(data.statistics.top_diagnosis || []).map((e, i, a) => (
                      <ChartWrapper
                        key={e.id}
                        options={{
                          chart: {
                            fontFamily: theme.typography.fontFamily,
                            foreColor: theme.palette.text.primary,
                            background: "transparent",
                            stacked: true,
                            sparkline: {
                              enabled: true,
                            },
                            toolbar: {
                              show: false,
                            },
                          },
                          plotOptions: {
                            bar: {
                              horizontal: true,
                              barHeight: 12,
                              borderRadius: 6,
                              borderRadiusApplication: "around",
                              borderRadiusWhenStacked: "all",
                              colors: {
                                backgroundBarColors: [
                                  theme.palette.background.default,
                                ],
                                backgroundBarRadius: 6,
                              },
                            },
                          },
                          title: {
                            floating: true,
                            offsetX: -8,
                            offsetY: 6,
                            text: `${e.code} ${e.name}`.trim(),
                            style: {
                              fontSize: 12,
                              fontWeight: 400,
                            },
                          },
                          subtitle: {
                            floating: true,
                            align: "right",
                            offsetX: 8,
                            offsetY: 6,
                            text: numberFormat(e.consultations),
                            style: {
                              fontSize: 12,
                            },
                          },
                          colors: [
                            [
                              lightBlue[400],
                              purple[400],
                              cyan[500],
                              pink[400],
                              indigo[400],
                              lime[600],
                              blue[400],
                              red[400],
                              green[500],
                              yellow[600],
                            ][i % 9],
                          ],
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
                            max: 100,
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
                            name: "Percentage",
                            data: [
                              round(
                                (e.consultations /
                                  (a.reduce(
                                    (acc, f) => acc + f.consultations,
                                    0
                                  ) || 1)) *
                                  100,
                                2
                              ),
                            ],
                          },
                        ]}
                        type="bar"
                        height="64"
                      />
                    ))}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

        </Grid>
        </>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Dashboard;
