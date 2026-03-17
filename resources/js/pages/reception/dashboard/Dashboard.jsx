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

  const { data: crmPerformanceData, loading: crmPerformanceLoading } = useFetch(
    "api/performance-reports/crm",
    {
      start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    null,
    (response) => response.data.data
  );

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
                onClick={() => navigate('/consultation-room/consultation-patients/pending')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Clients Waiting Dispensing"
                count={numberFormat(data.summary.clients_waiting_for_dispensing || 0)}
                icon={<WaitingIcon />}
                color={orange[500]}
                onClick={() => navigate('/optician-center/glass-patients')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Clients Ready Served"
                count={numberFormat(data.summary.clients_already_served || 0)}
                icon={<ServedIcon />}
                color={green[500]}
                onClick={() => navigate('/reception/patients')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="New Patients"
                count={numberFormat(data.summary.new_patients || 0)}
                icon={<NewPatientIcon />}
                color={cyan[500]}
                onClick={() => navigate('/reception/register-new-client')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Patient Visits"
                count={numberFormat(data.summary.patient_visits || 0)}
                icon={<VisitsIcon />}
                color={indigo[400]}
                onClick={() => navigate('/reception/patients')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Prestige Clients"
                count={numberFormat(data.summary.vip_patients || 0)}
                icon={<VipIcon />}
                color={theme.palette.warning.main}
                onClick={() => navigate('/marketing/prestige-clients')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Patients to Return"
                count={numberFormat(data.summary.patients_to_return || 0)}
                icon={<ReturnIcon />}
                color={teal[400]}
                onClick={() => navigate('/reception/patients-scheduled-to-return')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Completed Patients"
                count={numberFormat(data.summary.completed_patients || 0)}
                icon={<CompletedIcon />}
                color={green[600]}
                onClick={() => navigate('/reception/patients')}
              />
            </Grid>
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

            <Grid size={{ xs: 12 }}>
              <PerformanceReportCard
                department="CRM"
                user={window.user}
                editable={hasPrivilege(window.user, 'crm_performance_report') || isAdmin(window.user)}
                refreshTrigger={params?.start_date}
              />
            </Grid>
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