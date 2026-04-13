import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  LocalHospitalRounded as DoctorIcon,
  PeopleRounded as PatientsIcon,
  PersonAddRounded as NewPatientIcon,
  EventNoteRounded as VisitsIcon,
  StarRounded as VipIcon,
  ScheduleRounded as ReturnIcon,
  DoneAllRounded as CompletedIcon,
  RefreshRounded as RefreshIcon,
  FilterAltRounded as FilterIcon,
  HourglassEmptyRounded as WaitingIcon,
  CheckCircleRounded as ServedIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
import Modal from "../../../components/Modal";
import InfoCard from "../../dashboard/InfoCard";
import Filters from "../../dashboard/Filters";
import ChartWrapper from "../../../components/ChartWrapper";
import PerformanceReportCard from "../../../components/PerformanceReportCard";
import CustomerRelationManagementReportCard from "../../../components/reports/CustomerRelationManagementReportCard";
import notificationEvents from "../../../utils/notificationEvents";
import { hasPrivilege, isAdmin } from "../../../helpers/privileges";
import { useTheme } from "@mui/material/styles";
import {
  blue,
  cyan,
  green,
  indigo,
  orange,
  pink,
  purple,
  red,
  teal,
} from "@mui/material/colors";
import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, numberFormat, formatDateForDb, getWeekStartDate } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();

  usePrivilege('reception', '/dashboard');

  // Safe navigate - only navigate if user has access
  const safeNavigate = (path, requiredPrivilege) => {
    if (isAdmin(window.user)) {
      navigate(path);
      return;
    }
    if (!requiredPrivilege || hasPrivilege(window.user, requiredPrivilege)) {
      navigate(path);
    }
  };

  const modalRef = useRef();

  const [params, setParams] = useState({
    clinic_id: undefined,
    start_date: new Date(),
    end_date: new Date(),
  });

  useEffect(() => {
    document.title = `Reception Dashboard - ${window.APP_NAME}`;
  }, []);

  const { data, loading, error, handleFetch } = useFetch(
    "api/reception/dashboard",
    {
      ...params,
      clinic: undefined,
      start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    {
      summary: {
        total_patients: 0,
        new_patients: 0,
        patient_visits: 0,
        waiting_patients: 0,
        vip_patients: 0,
        patients_to_return: 0,
        spectacle_patients: 0,
        completed_patients: 0,
        clients_sent_to_doctor: 0,
        clients_waiting_for_dispensing: 0,
        clients_already_served: 0,
      },
      statistics: {
        patients_by_gender: [],
        vip_patients_by_status: [],
        waiting_patients_by_department: [],
        daily_registrations: [],
      },
    },
    (response) => response.data.data
  );

  // Fetch CRM KPI data from marketing API (same as Marketing module)
  const { data: crmData, loading: crmLoading } = useFetch(
    "api/marketing/client-calling-status",
    { ...params, per_page: 1000 }, // Fetch more data to get better statistics
    true,
    null,
    (response) => {
      console.log('Marketing API Response:', response);
      return response.data.data;
    }
  );

  // Show CRM KPI table to all users
  const canViewPerformance = true;

  // Transform marketing data to KPI format
  const transformToKPIs = (data) => {
    console.log('CRM Data Debug:', data); // Debug log
    
    if (!data || !data.data) {
      console.log('No data or data.data found');
      return [];
    }
    
    const total = data.total || 0;
    const patients = data.data || [];
    
    console.log('Total patients:', total);
    console.log('Patients array:', patients);
    
    // Check first patient structure
    if (patients.length > 0) {
      console.log('First patient structure:', patients[0]);
      console.log('First patient calling_status:', patients[0].calling_status);
    }
    
    // Count statuses with fallback for missing calling_status
    const called = patients.filter(item => {
      const status = item.calling_status?.status || item.status || 'need_to_call';
      return status === 'called';
    }).length;
    
    const notCalled = patients.filter(item => {
      const status = item.calling_status?.status || item.status || 'need_to_call';
      return status === 'need_to_call';
    }).length;
    
    const unreachable = patients.filter(item => {
      const status = item.calling_status?.status || item.status || 'need_to_call';
      return status === 'unreachable';
    }).length;
    
    console.log('Called:', called, 'Not Called:', notCalled, 'Unreachable:', unreachable);
    
    return [
      {
        description: "Patient Contact Status - Called",
        target: "100%",
        results: total > 0 ? `${Math.round((called / total) * 100)}%` : "0%",
        status: called > 0 ? "success" : "pending"
      },
      {
        description: "Patient Contact Status - Not Called",
        target: "0%",
        results: total > 0 ? `${Math.round((notCalled / total) * 100)}%` : "0%",
        status: notCalled > 0 ? "warning" : "success"
      },
      {
        description: "Patient Contact Status - Unreachable",
        target: "0%",
        results: total > 0 ? `${Math.round((unreachable / total) * 100)}%` : "0%",
        status: unreachable > 0 ? "error" : "success"
      },
      {
        description: "Marketing Glass Leads",
        target: "50+",
        results: total.toString(),
        status: total >= 50 ? "success" : total >= 30 ? "warning" : "error"
      }
    ];
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    if (!loading) {
      setIsRefreshing(true);
      handleFetch();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [handleFetch, loading]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        handleFetch();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [handleFetch, loading]);

  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe(() => {
      setTimeout(() => {
        if (!loading) {
          handleFetch();
        }
      }, 500);
    });
    return () => unsubscribe();
  }, [handleFetch, loading]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

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

  if (loading) {
    return (
      <Page title="Reception Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Reception Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Dashboard" },
      ]}
    >
      <CardHeader
        title="Reception Dashboard"
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={loading || isRefreshing ? "Refreshing..." : "Refresh data"}>
              <span>
                <IconButton
                  onClick={handleRefresh}
                  disabled={loading || isRefreshing}
                  sx={{
                    animation: (loading || isRefreshing) ? 'spin 1s linear infinite' : 'none',
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
      {!loading && data ? (
        <React.Fragment>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Clients Sent to Doctor"
                count={numberFormat(data.summary.clients_sent_to_doctor || 0)}
                icon={<DoctorIcon />}
                color={blue[500]}
                onClick={() => safeNavigate('/consultation-room/consultation-patients/pending', 'consultation_room')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Clients Waiting Dispensing"
                count={numberFormat(data.summary.clients_waiting_for_dispensing || 0)}
                icon={<WaitingIcon />}
                color={orange[500]}
                onClick={() => safeNavigate('/optician-center/glass-patients', 'optician_center')}
              />
            </Grid>
            {/* Commented out: Clients Ready Served card
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Clients Ready Served"
                count={numberFormat(data.summary.clients_already_served || 0)}
                icon={<ServedIcon />}
                color={green[500]}
                onClick={() => safeNavigate('/reception/patients', 'reception')}
              />
            </Grid>
            */}
            {/* Commented out: New Patients card
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="New Patients"
                count={numberFormat(data.summary.new_patients || 0)}
                icon={<NewPatientIcon />}
                color={cyan[500]}
                onClick={() => safeNavigate('/reception/register-new-client', 'reception')}
              />
            </Grid>
            */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Patient Visits"
                count={numberFormat(data.summary.patient_visits || 0)}
                icon={<VisitsIcon />}
                color={indigo[400]}
                onClick={() => safeNavigate('/reception/patients', 'reception')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Prestige Clients"
                count={numberFormat(data.summary.vip_patients || 0)}
                icon={<VipIcon />}
                color={theme.palette.warning.main}
                onClick={() => safeNavigate('/marketing/prestige-clients', 'marketing')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Patients to Return"
                count={numberFormat(data.summary.patients_to_return || 0)}
                icon={<ReturnIcon />}
                color={teal[400]}
                onClick={() => safeNavigate('/reception/patients-scheduled-to-return', 'reception')}
              />
            </Grid>
            {/* Commented out: Completed Patients card
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Completed Patients"
                count={numberFormat(data.summary.completed_patients || 0)}
                icon={<CompletedIcon />}
                color={green[600]}
                onClick={() => safeNavigate('/reception/patients', 'reception')}
              />
            </Grid>
            */}
          </Grid>

          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title="Patients by Gender" />
                <Divider />
                <CardContent>
                  <ChartWrapper
                    options={{
                      labels: (data.statistics.patients_by_gender || []).map((e) => e.gender) || [],
                      chart: {
                        fontFamily: theme.typography.fontFamily,
                        background: "transparent",
                        toolbar: { show: false },
                      },
                      plotOptions: { pie: { donut: { size: "50%" } } },
                      colors: [blue[400], pink[400]],
                      stroke: {
                        show: true,
                        width: 3,
                        colors: (data.statistics.patients_by_gender || []).map(
                          (e) => theme.palette.background.paper
                        ) || [],
                      },
                      dataLabels: {
                        style: { fontWeight: "400", fontSize: "9px" },
                        dropShadow: { enabled: false },
                      },
                      tooltip: { y: { formatter: (val) => numberFormat(val) } },
                      legend: {
                        position: "bottom",
                        labels: {
                          colors: (data.statistics.patients_by_gender || []).map(
                            (e) => theme.palette.text.secondary
                          ) || [],
                          useSeriesColors: false,
                        },
                        markers: { width: 14, height: 8, radius: 4 },
                      },
                    }}
                    series={(data.statistics.patients_by_gender || []).map((e) => e.patients) || []}
                    type="donut"
                    height={(data.statistics.patients_by_gender || []).length ? 288 : 256}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title="Daily Registrations" />
                <Divider />
                <ChartWrapper
                  options={{
                    chart: {
                      fontFamily: theme.typography.fontFamily,
                      foreColor: theme.palette.text.primary,
                      background: "transparent",
                      toolbar: { show: false },
                    },
                    plotOptions: {
                      bar: {
                        borderRadius: 0,
                        borderRadiusApplication: "end",
                        borderRadiusWhenStacked: "last",
                      },
                    },
                    colors: [purple[400]],
                    stroke: { show: true, width: 3, curve: "smooth" },
                    dataLabels: { enabled: false },
                    grid: { show: false, borderColor: theme.palette.divider },
                    xaxis: {
                      categories: (data.statistics.daily_registrations || []).map((e) => e.date) || [],
                      axisBorder: { show: false, color: theme.palette.divider },
                      axisTicks: { show: true, color: theme.palette.divider, height: 6 },
                    },
                    yaxis: {
                      axisBorder: { show: false, color: theme.palette.divider },
                      axisTicks: { show: true, color: theme.palette.divider, width: 6 },
                      labels: { formatter: (val) => numberFormat(val) },
                    },
                    tooltip: { theme: "dark", fillSeriesColor: true },
                  }}
                  series={[
                    {
                      name: "Registrations",
                      data: (data.statistics.daily_registrations || []).map((e) => e.count) || [],
                    },
                  ]}
                  type="bar"
                  height="272"
                />
              </Card>
            </Grid>

            {canViewPerformance && (
            <Grid size={{ xs: 12 }}>
              <CustomerRelationManagementReportCard 
                dateParams={{
                  start_date: params.start_date
                    ? formatDateForDb(params.start_date)
                    : undefined,
                  end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
                }} 
              />
            </Grid>
            )}
          </Grid>
        </React.Fragment>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6">No data available.</Typography>
        </Box>
      )}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Dashboard;