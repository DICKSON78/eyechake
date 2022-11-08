import React, { useEffect, useRef, useState } from "react";
import { Alert, Card, CardContent, CardHeader, Divider, Grid, Typography } from "@mui/material";
import {
  AccountBalance as CashCollectionIcon,
  DoneAll as DoneIcon,
  PersonAddRounded as NewPatientsIcon,
  TrendingDownRounded as ExpensesIcon
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../components/Page";
import Modal from "../../components/Modal";
import DatePicker from "../../components/DatePicker";
import LoadingSkeleton from "./LoadingSkeleton";
import InfoCard from "./InfoCard";

import { useTheme } from "@mui/material/styles";
import { blue, cyan, deepOrange, green, lightBlue, lime, orange, pink, purple, red, teal } from "@mui/material/colors";

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
  const cashCollectionByConsultationTypeChartCanvasRef = useRef();
  const expensesChartCanvasRef = useRef();

  const [cashCollectionByConsultationTypeChart, setCashCollectionByConsultationTypeChart] = useState();
  const [expensesChart, setExpensesChart] = useState();
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
    if (data && cashCollectionByConsultationTypeChartCanvasRef && expensesChartCanvasRef) {
      renderCharts();
    }
  }, [data, cashCollectionByConsultationTypeChartCanvasRef, expensesChartCanvasRef, theme]);

  const renderCharts = () => {
    if (cashCollectionByConsultationTypeChart) {
      cashCollectionByConsultationTypeChart.destroy();
    }
    if (expensesChart) {
      expensesChart.destroy();
    }

    let chart = new Chart(cashCollectionByConsultationTypeChartCanvasRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels: data.statistics.cash_collection_by_consultation_type.map((e) => e.name),
        datasets: [
          {
            label: "Cash Collection",
            data: data.statistics.cash_collection_by_consultation_type.map((e) => e.amount),
            backgroundColor: [
              blue[300],
              green[300],
              orange[300],
              purple[300],
              pink[300],
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

    setCashCollectionByConsultationTypeChart(chart);

    chart = new Chart(expensesChartCanvasRef.current.getContext("2d"), {
      type: "pie",
      data: {
        labels: data.statistics.expenses_by_category.map((e) => e.name),
        datasets: [
          {
            data: data.statistics.expenses_by_category.map((e) => e.amount),
            backgroundColor: [
              blue[300],
              green[300],
              orange[300],
              purple[300],
              pink[300],
              teal[200],
              red[200],
              lightBlue[200],
              cyan[300],
              deepOrange[300],
              lime[300],
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
          fontSize: "20px",
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
            title="Cash Collection"
            count={numberFormat(data.counts.cash_collection)}
            icon={<CashCollectionIcon />}
            color={purple[400]}
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
            color={theme.palette.info.main}
          />
          <InfoCard
            title="Consulted Patients"
            count={numberFormat(data.counts.consulted_patients)}
            icon={<DoneIcon />}
            color={theme.palette.success.main}
          />

          <Grid
            item
            md={8}
            sm={12}
            xs={12}
          >
            <Card>
              <CardHeader title="Cash Collection"/>
              <Divider />
              <CardContent>
                <canvas ref={cashCollectionByConsultationTypeChartCanvasRef}/>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            md={4}
            sm={12}
            xs={12}
          >
            <Card>
              <CardHeader title="Expenses"/>
              <Divider />
              <CardContent>
                <canvas ref={expensesChartCanvasRef}/>
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
