import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
} from "@mui/material";
import {
  EventNoteRounded as AppointmentsIcon,
  Person2Rounded as PersonIcon,
  DoneAllRounded as DoneIcon,
  FilterAltRounded as FilterIcon,
  LocalActivityRounded as OutreachProgrammesIcon,
  LocationSearchingRounded as MarketResearchIcon,
  NorthEastRounded as ViewMoreIcon,
  SendRounded as MarketingStrategiesIcon,
  TaskRounded as DailyActivitiesIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
import Modal from "../../../components/Modal";
import LoadingSkeleton from "./LoadingSkeleton";
import InfoCard from "./InfoCard";
import Filters from "../../dashboard/Filters";
import Chart from "react-apexcharts";

import useTheme from "@mui/material/styles/useTheme";
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
import { useFetch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, numberFormat } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();

  const theme = useTheme();
  const addToast = useToast();

  const modalRef = useRef();

  const [params, setParams] = useState({
    start_date: new Date(),
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/marketing/dashboard",
    {
      ...params,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Completed":
        return "success";
    }

    return "neutral";
  };

  return (
    <Page
      title="Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing Management" },
        { title: "Dashboard" },
      ]}
    >
      <CardHeader
        title="Dashboard"
        action={
          <Tooltip title="Show filters">
            <IconButton onClick={openFiltersModal}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
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
      {loading && <LoadingSkeleton />}
      {!loading && data ? (
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
          <Grid
            item
            md={3}
            sm={6}
            xs={12}
          >
            <Card>
              <InfoCard
                title="Registered Patients"
                count={numberFormat(data.counts.new_patients)}
                icon={<PersonIcon />}
                color={purple[400]}
                sx={{ m: 1 }}
              />
              <CardContent>
                <Chart
                  options={{
                    labels: data.statistics.patients_by_information_source.map(
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
                        donut: {
                          size: "50%",
                        },
                      },
                    },
                    colors: [
                      purple[400],
                      teal[400],
                      red[400],
                      lightBlue[400],
                      deepOrange[300],
                      lime[600],
                      pink[400],
                      cyan[500],
                      green[500],
                      yellow[600],
                    ],
                    stroke: {
                      show: true,
                      width: 3,
                      colors:
                        data.statistics.patients_by_information_source.map(
                          (e) => theme.palette.background.paper
                        ),
                    },
                    dataLabels: {
                      style: {
                        fontWeight: "400",
                        fontSize: "10px",
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
                        colors:
                          data.statistics.patients_by_information_source.map(
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
                  series={data.statistics.patients_by_information_source.map(
                    (e) => e.patients
                  )}
                  type="donut"
                  height={
                    data.statistics.patients_by_information_source.length
                      ? 288
                      : 256
                  }
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid
            item
            md={3}
            sm={6}
            xs={12}
          >
            <Card>
              <InfoCard
                title="Daily Activities"
                count={numberFormat(
                  data.statistics.daily_activities.reduce(
                    (acc, e) => acc + e.activities,
                    0
                  )
                )}
                icon={<DailyActivitiesIcon />}
                color={blue[400]}
                sx={{ m: 1 }}
              />
              <CardContent>
                <Chart
                  options={{
                    labels: data.statistics.daily_activities.map(
                      (e) => e.status
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
                        donut: {
                          size: "50%",
                        },
                      },
                    },
                    colors: [blue[400], lime[600], purple[400]],
                    stroke: {
                      show: true,
                      width: 3,
                      colors: data.statistics.daily_activities.map(
                        (e) => theme.palette.background.paper
                      ),
                    },
                    dataLabels: {
                      style: {
                        fontWeight: "400",
                        fontSize: "10px",
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
                        colors: data.statistics.daily_activities.map(
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
                  series={data.statistics.daily_activities.map(
                    (e) => e.activities
                  )}
                  type="donut"
                  height={data.statistics.daily_activities.length ? 288 : 256}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid
            item
            md={3}
            sm={6}
            xs={12}
          >
            <Card>
              <InfoCard
                title="Appointments"
                count={numberFormat(
                  data.statistics.appointments.reduce(
                    (acc, e) => acc + e.appointments,
                    0
                  )
                )}
                icon={<AppointmentsIcon />}
                color={theme.palette.warning.main}
                sx={{ m: 1 }}
              />
              <CardContent>
                <Chart
                  options={{
                    labels: data.statistics.appointments.map((e) => e.status),
                    chart: {
                      fontFamily: theme.typography.fontFamily,
                      background: "transparent",
                      toolbar: {
                        show: false,
                      },
                    },
                    plotOptions: {
                      pie: {
                        donut: {
                          size: "50%",
                        },
                      },
                    },
                    colors: [
                      theme.palette.warning.main,
                      cyan[500],
                      lightBlue[400],
                    ],
                    stroke: {
                      show: true,
                      width: 3,
                      colors: data.statistics.appointments.map(
                        (e) => theme.palette.background.paper
                      ),
                    },
                    dataLabels: {
                      style: {
                        fontWeight: "400",
                        fontSize: "10px",
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
                        colors: data.statistics.appointments.map(
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
                  series={data.statistics.appointments.map(
                    (e) => e.appointments
                  )}
                  type="donut"
                  height={data.statistics.appointments.length ? 288 : 256}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid
            item
            md={3}
            sm={6}
            xs={12}
          >
            <Card>
              <InfoCard
                title="Outreach Programmes"
                count={numberFormat(
                  data.statistics.outreach_programmes.reduce(
                    (acc, e) => acc + e.programmes,
                    0
                  )
                )}
                icon={<OutreachProgrammesIcon />}
                color={cyan[500]}
                sx={{ m: 1 }}
              />
              <CardContent>
                <Chart
                  options={{
                    labels: data.statistics.outreach_programmes.map(
                      (e) => e.status
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
                        donut: {
                          size: "50%",
                        },
                      },
                    },
                    colors: [cyan[500], pink[400], yellow[600]],
                    stroke: {
                      show: true,
                      width: 3,
                      colors: data.statistics.outreach_programmes.map(
                        (e) => theme.palette.background.paper
                      ),
                    },
                    dataLabels: {
                      style: {
                        fontWeight: "400",
                        fontSize: "10px",
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
                        colors: data.statistics.outreach_programmes.map(
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
                  series={data.statistics.outreach_programmes.map(
                    (e) => e.programmes
                  )}
                  type="donut"
                  height={
                    data.statistics.outreach_programmes.length ? 288 : 256
                  }
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid
            item
            md={6}
            sm={12}
            xs={12}
          >
            <Card>
              <CardHeader title="Patient Registration" />
              <Divider />
              <Chart
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
                    },
                  },
                  colors: [teal[400], pink[400], theme.palette.info.main],
                  stroke: {
                    show: true,
                    width: [3, 3, 3],
                    curve: "smooth",
                  },
                  dataLabels: {
                    enabled: false,
                    style: {
                      fontWeight: "400",
                      fontSize: "10px",
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
                    data: data.statistics.yearly.map((e) => ({
                      x: e.month,
                      y:
                        e.statistics.find((f) => f.name === "new_patients_male")
                          ?.amount || 0,
                    })),
                  },
                  {
                    name: "Female",
                    data: data.statistics.yearly.map((e) => ({
                      x: e.month,
                      y:
                        e.statistics.find(
                          (f) => f.name === "new_patients_female"
                        )?.amount || 0,
                    })),
                  },
                  {
                    name: "Total",
                    data: data.statistics.yearly.map((e) => ({
                      x: e.month,
                      y:
                        (e.statistics.find(
                          (f) => f.name === "new_patients_male"
                        )?.amount || 0) +
                        (e.statistics.find(
                          (f) => f.name === "new_patients_female"
                        )?.amount || 0),
                    })),
                  },
                ]}
                type="line"
                height="272"
              />
            </Card>
          </Grid>

          <Grid
            item
            md={6}
            sm={12}
            xs={12}
          >
            <Card variant="outlined-elevation">
              <CardHeader
                title="Today's Activities"
                action={
                  <Tooltip title="View all">
                    <IconButton
                      size="small"
                      onClick={() => navigate("/marketing/daily-activities")}
                    >
                      <ViewMoreIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <Divider />
              <CardContent>
                <List disablePadding>
                  {data.lists.daily_activities.map((e, i) => (
                    <ListItem
                      key={e.id}
                      dense
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: [
                              theme.palette.primary.main,
                              theme.palette.secondary.main,
                            ][i % 2],
                          }}
                        >
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={e.creator?.full_name}
                        secondary={e.description}
                        primaryTypographyProps={{ noWrap: true }}
                        secondaryTypographyProps={{ noWrap: true }}
                      />
                      <Box flexGrow={1} />
                      <Chip
                        size="small"
                        color={getStatusColor(e.status)}
                        label={e.status}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Dashboard;
