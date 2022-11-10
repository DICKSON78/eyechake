import React, { useEffect, useRef, useState } from "react";
import { Alert, Card, CardContent, CardHeader, Divider, Grid, Typography } from "@mui/material";
import {
  AccountBalanceRounded as SalesIcon,
  CenterFocusStrongRounded as GlassIcon,
  DiscountRounded as DiscountIcon,
  DoneAllRounded as DoneIcon,
  MedicalInformationRounded as PharmacyIcon,
  MeetingRoomRounded as ConsultationsIcon,
  PersonAddRounded as NewPatientsIcon,
  TrendingDownRounded as ExpensesIcon
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../components/Page";
import Modal from "../../components/Modal";
import DatePicker from "../../components/DatePicker";
import LoadingSkeleton from "./LoadingSkeleton";
import InfoCard from "./InfoCard";

import { useTheme } from "@mui/material/styles";
import { blue, cyan, deepOrange, green, lightBlue, lime, orange, pink, purple, red, teal, yellow } from "@mui/material/colors";

import moment from "moment";
import { useFetch } from "../../hooks";
import { formatDateForDb, formatError, numberFormat } from "../../helpers";

import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LinearScale,
  PieController,
  Title,
  Tooltip
} from "chart.js";

Chart.register(
  ArcElement,
  BarElement,
  BarController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  Legend,
  PieController,
  Title,
  Tooltip
);

Chart.defaults.font.family = "Custom, sans-serif";
Chart.defaults.font.size = 11;

const Dashboard = () => {

  const theme = useTheme();

  const modalRef = useRef();
  const salesChartCanvasRef = useRef();
  const expensesChartCanvasRef = useRef();
  const paymentsChartCanvasRef = useRef();

  const [salesChart, setSalesChart] = useState();
  const [expensesChart, setExpensesChart] = useState();
  const [paymentsChart, setPaymentsChart] = useState();
  const [params, setParams] = useState({
    start_date: moment().subtract(7, "days").toDate(),
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
    if (data && salesChartCanvasRef && expensesChartCanvasRef && paymentsChartCanvasRef) {
      renderCharts();
    }
  }, [data, salesChartCanvasRef, expensesChartCanvasRef, paymentsChartCanvasRef, theme]);

  const renderCharts = () => {
    if (salesChart) {
      salesChart.destroy();
    }
    if (expensesChart) {
      expensesChart.destroy();
    }
    if (paymentsChart) {
      paymentsChart.destroy();
    }

    let chart = new Chart(salesChartCanvasRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Glass", "Pharmacy", "Consultation"],
        datasets: [
          {
            label: "Sales",
            data: [
              data.counts.glass,
              data.counts.pharmacy,
              data.counts.consultation,
            ],
            backgroundColor: [
              blue[300],
              green[400],
              orange[300],
              purple[300],
            ],
            borderWidth: 0,
          },
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: false,
            labels: {
              color: theme.palette.text.secondary,
            }
          },
        },
        scales: {
          x: {
            grid: {
              color: theme.palette.divider,
            },
            ticks: {
              color: theme.palette.text.secondary,
            },
          },
          y: {
            grid: {
              color: theme.palette.divider,
            },
            ticks: {
              beginAtZero: true,
              color: theme.palette.text.secondary,
            },
          },
        }
      },
    });

    setSalesChart(chart);

    chart = new Chart(expensesChartCanvasRef.current.getContext("2d"), {
      type: "pie",
      data: {
        labels: data.statistics.expenses_by_category.map((e) => e.name),
        datasets: [
          {
            data: data.statistics.expenses_by_category.map((e) => e.amount),
            backgroundColor: [
              blue[300],
              green[400],
              pink[300],
              yellow[500],
              teal[400],
              theme.palette.warning.main,
              lime[600],
              purple[300],
              cyan[400],
              red[200],
              lightBlue[400],
              deepOrange[300],
            ],
            borderWidth: 0,
          },
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: false,
          },
          legend: {
            labels: {
              color: theme.palette.text.secondary,
            },
            position: "bottom"
          },
        },
        scales: {
          x: {
            display: false,
            grid: {
              color: theme.palette.divider,
              display: false,
            },
            ticks: {
              color: theme.palette.text.secondary,
            },
          },
          y: {
            display: false,
            grid: {
              color: theme.palette.divider,
              display: false,
            },
            ticks: {
              beginAtZero: true,
              color: theme.palette.text.secondary,
            },
          },
        }
      },
    });

    setExpensesChart(chart);

    chart = new Chart(paymentsChartCanvasRef.current.getContext("2d"), {
      type: "pie",
      data: {
        labels: data.statistics.payments_by_channel.map((e) => e.name),
        datasets: [
          {
            data: data.statistics.payments_by_channel.map((e) => e.amount),
            backgroundColor: [
              yellow[500],
              blue[300],
              red[300],
              cyan[400],
              lightBlue[400],
              lime[600],
              teal[400],
              pink[300],
              deepOrange[300],
              green[400],
            ],
            borderWidth: 0,
          },
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: false,
          },
          legend: {
            labels: {
              color: theme.palette.text.secondary,
            },
            position: "bottom"
          },
        },
        scales: {
          x: {
            display: false,
            grid: {
              color: theme.palette.divider,
              display: false,
            },
            ticks: {
              color: theme.palette.text.secondary,
            },
          },
          y: {
            display: false,
            grid: {
              color: theme.palette.divider,
              display: false,
            },
            ticks: {
              beginAtZero: true,
              color: theme.palette.text.secondary,
            },
          },
        }
      },
    });

    setPaymentsChart(chart);
  };

  return (
    <Page
      title="Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Dashboard" },
      ]}
    >
      <PageHeader
        title="Dashboard"
        trailing={
          <React.Fragment>
            <DatePicker
              fullWidth
              value={params.start_date || null}
              onChange={(value) => setParams({ ...params, start_date: !isNaN(value) ? value : null })}
              containerProps={{
                width: 156,
              }}
            />
            <Typography>~</Typography>
            <DatePicker
              fullWidth
              value={params.end_date || null}
              onChange={(value) => setParams({ ...params, end_date: !isNaN(value) ? value : null })}
              containerProps={{
                width: 156,
              }}
            />
          </React.Fragment>
        }
        containerProps={{
          spacing: 1,
          p: 0,
          mb: 2,
        }}
        titleProps={{
          variant: "h5",
          fontWeight: 500,
          fontSize: "22px",
        }}
      />
      {error ?
        <Alert
          sx={{ mb: 2 }}
          severity="error"
        >
          {formatError(error)}
        </Alert>
        : null
      }
      {loading && <LoadingSkeleton />}
      {!loading && data ?
        <Grid
          container
          spacing={{ xs: 2, sm: 2, md: 3 }}
        >
          <InfoCard
            title="Total Sales"
            count={numberFormat(data.counts.total_sales)}
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
            title="New Patients"
            count={numberFormat(data.counts.new_patients)}
            icon={<NewPatientsIcon />}
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
              <CardHeader title="Sales Statistics"/>
              <Divider />
              <CardContent>
                <canvas ref={salesChartCanvasRef}/>
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
              <CardHeader title="Expense Statistics"/>
              <Divider />
              <CardContent>
                <canvas ref={expensesChartCanvasRef}/>
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
              <CardHeader title="Payment Statistics"/>
              <Divider />
              <CardContent>
                <canvas ref={paymentsChartCanvasRef}/>
              </CardContent>
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
