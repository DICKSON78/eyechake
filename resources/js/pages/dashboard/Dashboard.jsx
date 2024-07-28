import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Person2Rounded as PersonIcon,
  AccountBalanceRounded as SalesIcon,
  DiscountRounded as DiscountIcon,
  DoneAllRounded as DoneIcon,
  FilterAltRounded as FilterIcon,
  MoneyRounded as NetProfitIcon,
  TrendingDownRounded as ExpensesIcon,
} from "@mui/icons-material";

import Page from "../../components/Page";
import Modal from "../../components/Modal";
import LoadingSkeleton from "./LoadingSkeleton";
import InfoCard from "./InfoCard";
import Filters from "./Filters";
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
import { useFetch, useToast } from "../../hooks";
import {
  formatDateForDb,
  formatError,
  numberFormat,
  round,
} from "../../helpers";

const Dashboard = ({ setSmsBalance }) => {
  const theme = useTheme();
  const addToast = useToast();

  const modalRef = useRef();

  const [params, setParams] = useState({
    clinic_id: undefined,
    start_date: new Date(),
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/dashboard",
    {
      ...params,
      clinic: undefined,
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
    if (data) {
      setSmsBalance(data.summary.sms_balance);
    }
  }, [data]);

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
      breadcrumbs={[{ title: "Home" }, { title: "Dashboard" }]}
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
            md={6}
            sm={12}
            xs={12}
          >
            <Grid
              container
              spacing={{ xs: 2, sm: 2, md: 3 }}
            >
              <InfoCard
                title="Total Sales"
                count={numberFormat(data.summary.total_sales)}
                icon={<SalesIcon />}
                color={purple[400]}
              />
              <InfoCard
                title="Expenses"
                count={numberFormat(data.summary.expenses)}
                icon={<ExpensesIcon />}
                color={theme.palette.warning.main}
              />
              <InfoCard
                title="Net Profit"
                count={numberFormat(
                  data.summary.total_sales - data.summary.expenses
                )}
                icon={<NetProfitIcon />}
                color={cyan[500]}
              />
              <InfoCard
                title="Total Discount"
                count={numberFormat(data.summary.discount)}
                icon={<DiscountIcon />}
                color={pink[400]}
              />
              <InfoCard
                title="Registered Patients"
                count={numberFormat(data.summary.new_patients)}
                icon={<PersonIcon />}
                color={blue[400]}
              />
              <InfoCard
                title="Consulted Patients"
                count={numberFormat(data.summary.consulted_patients)}
                icon={<DoneIcon />}
                color={green[500]}
              />
            </Grid>
          </Grid>
          <Grid
            item
            md={6}
            sm={12}
            xs={12}
          >
            <Grid
              container
              spacing={{ xs: 2, sm: 2, md: 3 }}
            >
              <Grid
                item
                md={6}
                sm={12}
                xs={12}
              >
                <Card>
                  <CardHeader title="Expenses by Category" />
                  <Divider />
                  <CardContent>
                    <Chart
                      options={{
                        labels: data.statistics.expenses_by_category.map(
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
                          colors: data.statistics.expenses_by_category.map(
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
                            colors: data.statistics.expenses_by_category.map(
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
                      series={data.statistics.expenses_by_category.map(
                        (e) => e.amount
                      )}
                      type="pie"
                      height={
                        data.statistics.expenses_by_category.length ? 288 : 256
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
                  <CardHeader title="Payments by Channel" />
                  <Divider />
                  <CardContent>
                    <Chart
                      options={{
                        labels: data.statistics.payments_by_channel.map(
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
                          colors: data.statistics.payments_by_channel.map(
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
                            colors: data.statistics.payments_by_channel.map(
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
                      series={data.statistics.payments_by_channel.map(
                        (e) => e.amount
                      )}
                      type="pie"
                      height={
                        data.statistics.payments_by_channel.length ? 288 : 256
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Grid
            item
            md={6}
            sm={12}
            xs={12}
            sx={{ order: { xs: 5, sm: 5, md: 4 } }}
          >
            <Grid
              container
              spacing={{ xs: 2, sm: 2, md: 3 }}
            >
              <Grid
                item
                md={12}
                sm={12}
                xs={12}
              >
                <Card>
                  <CardHeader title="Sales vs Expenses" />
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
                          borderRadius: 8,
                          borderRadiusApplication: "around",
                          borderRadiusWhenStacked: "all",
                        },
                      },
                      colors: [purple[400], theme.palette.warning.main],
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
                        name: "Sales",
                        data: data.statistics.yearly.map((e) => ({
                          x: e.month,
                          y:
                            e.statistics.find((f) => f.name === "total_sales")
                              ?.amount || 0,
                        })),
                      },
                      {
                        name: "Expenses",
                        data: data.statistics.yearly.map((e) => ({
                          x: e.month,
                          y:
                            e.statistics.find((f) => f.name === "expenses")
                              ?.amount || 0,
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
                md={12}
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
                      colors: [teal[400], pink[400], theme.palette.info.main],
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
                        data: data.statistics.yearly.map((e) => ({
                          x: e.month,
                          y:
                            e.statistics.find(
                              (f) => f.name === "new_patients_male"
                            )?.amount || 0,
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
            </Grid>
          </Grid>

          <Grid
            item
            md={6}
            sm={12}
            xs={12}
            sx={{ order: { xs: 4, sm: 4, md: 5 } }}
          >
            <Grid
              container
              spacing={{ xs: 2, sm: 2, md: 3 }}
            >
              <Grid
                item
                md={12}
                sm={12}
                xs={12}
              >
                <Card>
                  <CardHeader title="Consultations by Item" />
                  <Divider />
                  <CardContent>
                    {data.statistics.consultations_by_item.map((e, i, a) => (
                      <Chart
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
              <Grid
                item
                md={12}
                sm={12}
                xs={12}
              >
                <Card>
                  <CardHeader title="Top Diagnosis" />
                  <Divider />
                  <CardContent>
                    {data.statistics.top_diagnosis.map((e, i, a) => (
                      <Chart
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
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Dashboard;
