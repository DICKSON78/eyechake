import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, Divider, Grid, IconButton, Tooltip as MuiTooltip } from "@mui/material";
import {
  AccountBalanceRounded as SalesIcon,
  CenterFocusStrongRounded as GlassIcon,
  DiscountRounded as DiscountIcon,
  DoneAllRounded as DoneIcon,
  FilterAltRounded as FilterIcon,
  MedicalInformationRounded as PharmacyIcon,
  MeetingRoomRounded as ConsultationsIcon,
  MoneyRounded as NetProfitIcon,
  TrendingDownRounded as ExpensesIcon
} from "@mui/icons-material";

import Page from "../../components/Page";
import Modal from "../../components/Modal";
import LoadingSkeleton from "./LoadingSkeleton";
import InfoCard from "./InfoCard";
import Filters from "./Filters";
import Chart from "react-apexcharts";

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
  yellow
} from "@mui/material/colors";
import { useFetch, useToast } from "../../hooks";
import { formatDateForDb, formatError, numberFormat } from "../../helpers";

const Dashboard = () => {

  const theme = useTheme();
  const addToast = useToast();

  const modalRef = useRef();

  const [params, setParams] = useState({
    start_date: new Date(),
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch("api/dashboard", {
    ...params,
    start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
    end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
  }, true, null, (response) => response.data.data);

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

  return (
    <Page
      title="Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Dashboard" },
      ]}
    >
      <CardHeader
        title="Dashboard"
        action={(
          <MuiTooltip title="Show filters">
            <IconButton onClick={openFiltersModal}>
              <FilterIcon />
            </IconButton>
          </MuiTooltip>
        )}
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
      {!loading && data ?
        <Grid
          container
          spacing={{ xs: 2, sm: 2, md: 3 }}
        >
          <InfoCard
            title="Total Sales"
            count={numberFormat(data.counts.total_sales - data.counts.discount)}
            icon={<SalesIcon />}
            color={purple[300]}
          />
          <InfoCard
            title="Discount"
            count={numberFormat(data.counts.discount)}
            icon={<DiscountIcon />}
            color={cyan[500]}
          />
          <InfoCard
            title="Glass"
            count={numberFormat(data.counts.glass)}
            icon={<GlassIcon />}
            color={lime[600]}
          />
          <InfoCard
            title="Pharmacy"
            count={numberFormat(data.counts.pharmacy)}
            icon={<PharmacyIcon />}
            color={pink[300]}
          />
          <InfoCard
            title="Consultation"
            count={numberFormat(data.counts.consultation)}
            icon={<ConsultationsIcon />}
            color={teal[400]}
          />
          <InfoCard
            title="Expenses"
            count={numberFormat(data.counts.expenses)}
            icon={<ExpensesIcon />}
            color={theme.palette.warning.main}
          />
          <InfoCard
            title="Net Profit"
            count={numberFormat(data.counts.total_sales - data.counts.discount - data.counts.expenses)}
            icon={<NetProfitIcon />}
            color={blue[300]}
          />
          <InfoCard
            title="Consulted Patients"
            count={numberFormat(data.counts.consulted_patients)}
            icon={<DoneIcon />}
            color={green[400]}
          />

          <Grid
            item
            md={6}
            sm={12}
            xs={12}
          >
            <Card>
              <CardHeader
                title="Sales by Category"
                titleTypographyProps={{
                  variant: "subtitle1",
                  fontWeight: 700,
                  color: "text.secondary",
                }}
              />
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
                      distributed: true,
                    },
                  },
                  colors: [
                    lime[600],
                    pink[300],
                    teal[400],
                    orange[300],
                    blue[300],
                    green[400],
                  ],
                  stroke: {
                    show: false,
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
                    }
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
                    }
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
                  }
                }}
                series={[
                  {
                    name: "Sales",
                    data: [
                      { x: "Glass", y: data.counts.glass },
                      { x: "Pharmacy", y: data.counts.pharmacy },
                      { x: "Consultation", y: data.counts.consultation },
                      { x: "Procedure", y: data.counts.procedure },
                    ]
                  }
                ]}
                type="bar"
                height="272"
              />
            </Card>
          </Grid>
          <Grid
            item
            md={3}
            sm={12}
            xs={12}
          >
            <Card>
              <CardHeader
                title="Expenses by Category"
                titleTypographyProps={{
                  variant: "subtitle1",
                  fontWeight: 700,
                  color: "text.secondary",
                }}
              />
              <Divider />
              <CardContent>
                <Chart
                  options={{
                    labels: data.statistics.expenses_by_category.map((e) => e.name),
                    chart: {
                      fontFamily: theme.typography.fontFamily,
                      background: "transparent",
                      toolbar: {
                        show: false,
                      },
                    },
                    colors: [
                      teal[400],
                      deepOrange[300],
                      purple[300],
                      red[300],
                      cyan[400],
                      lightBlue[400],
                      lime[600],
                      pink[300],
                      green[400],
                      yellow[500],
                    ],
                    stroke: {
                      show: false,
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
                        formatter: (val, { series, seriesIndex, dataPointIndex, w }) => numberFormat(val),
                      }
                    },
                    legend: {
                      position: "bottom",
                      labels: {
                        colors: data.statistics.expenses_by_category.map((e) => theme.palette.text.secondary),
                        useSeriesColors: false,
                      },
                      markers: {
                        width: 14,
                        height: 8,
                        radius: 4,
                      },
                    }
                  }}
                  series={data.statistics.expenses_by_category.map((e) => e.amount)}
                  type="pie"
                  height={data.statistics.expenses_by_category.length ? 288 : 256}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            md={3}
            sm={12}
            xs={12}
          >
            <Card>
              <CardHeader
                title="Payments by Channel"
                titleTypographyProps={{
                  variant: "subtitle1",
                  fontWeight: 700,
                  color: "text.secondary",
                }}
              />
              <Divider />
              <CardContent>
                <Chart
                  options={{
                    labels: data.statistics.payments_by_channel.map((e) => e.name),
                    chart: {
                      fontFamily: theme.typography.fontFamily,
                      background: "transparent",
                      toolbar: {
                        show: false,
                      },
                    },
                    colors: [
                      cyan[400],
                      deepOrange[300],
                      teal[400],
                      purple[300],
                      red[300],
                      lightBlue[400],
                      lime[600],
                      pink[300],
                      green[400],
                      yellow[500],
                    ],
                    stroke: {
                      show: false,
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
                        formatter: (val, { series, seriesIndex, dataPointIndex, w }) => numberFormat(val),
                      }
                    },
                    legend: {
                      position: "bottom",
                      labels: {
                        colors: data.statistics.payments_by_channel.map((e) => theme.palette.text.secondary),
                        useSeriesColors: false,
                      },
                      markers: {
                        width: 14,
                        height: 8,
                        radius: 4,
                      },
                    }
                  }}
                  series={data.statistics.payments_by_channel.map((e) => e.amount)}
                  type="pie"
                  height={data.statistics.payments_by_channel.length ? 288 : 256}
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
              <CardHeader
                title="Sales vs Expenses"
                titleTypographyProps={{
                  variant: "subtitle1",
                  fontWeight: 700,
                  color: "text.secondary",
                }}
              />
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
                  colors: [
                    theme.palette.primary.main,
                    theme.palette.warning.main,
                  ],
                  stroke: {
                    show: false,
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
                    }
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
                    }
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
                  }
                }}
                series={[
                  {
                    name: "Sales",
                    data: data.yearly_statistics.map((e) => ({
                      x: e.month,
                      y: (e.statistics.find((f) => f.name === "total_sales")?.amount || 0) - (e.statistics.find((f) => f.name === "discount")?.amount || 0),
                    })),
                  },
                  {
                    name: "Expenses",
                    data: data.yearly_statistics.map((e) => ({
                      x: e.month,
                      y: e.statistics.find((f) => f.name === "expenses")?.amount || 0,
                    })),
                  },
                ]}
                type="bar"
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
            <Card>
              <CardHeader
                title="Patient Registration"
                titleTypographyProps={{
                  variant: "subtitle1",
                  fontWeight: 700,
                  color: "text.secondary",
                }}
              />
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
                  colors: [
                    teal[400],
                    pink[300],
                    theme.palette.info.main,
                  ],
                  stroke: {
                    show: true,
                    width: [4, 4, 4],
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
                    }
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
                    }
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
                  }
                }}
                series={[
                  {
                    name: "Male",
                    data: data.yearly_statistics.map((e) => ({
                      x: e.month,
                      y: e.statistics.find((f) => f.name === "new_patients_male")?.amount || 0,
                    })),
                  },
                  {
                    name: "Female",
                    data: data.yearly_statistics.map((e) => ({
                      x: e.month,
                      y: e.statistics.find((f) => f.name === "new_patients_female")?.amount || 0,
                    })),
                  },
                  {
                    name: "Total",
                    data: data.yearly_statistics.map((e) => ({
                      x: e.month,
                      y: (e.statistics.find((f) => f.name === "new_patients_male")?.amount || 0) + (e.statistics.find((f) => f.name === "new_patients_female")?.amount || 0),
                    })),
                  },
                ]}
                type="line"
                height="272"
              />
            </Card>
          </Grid>
        </Grid>
        : null
      }
      <Modal ref={modalRef}/>
    </Page>
  );
};

export default Dashboard;
