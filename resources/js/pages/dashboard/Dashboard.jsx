import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Card, CardContent, CardHeader, Divider, Grid } from "@mui/material";
import { AccountBalance as CashCollectionIcon, DoneAll as DoneIcon, PersonAddRounded as NewPatientsIcon, TrendingDownRounded as ExpensesIcon } from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../components/Page";
import Modal from "../../components/Modal";
import Select from "../../components/Select";
import LoadingSkeleton from "./LoadingSkeleton";
import InfoCard from "./InfoCard";

import { useTheme } from "@mui/material/styles";
import { blue, cyan, deepOrange, green, lightBlue, lime, orange, pink, purple, red, teal } from "@mui/material/colors";

import { useFetch } from "../../hooks";
import { formatError, numberFormat } from "../../helpers";

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
  const navigate = useNavigate();

  const modalRef = useRef();
  const consultationTypesChartCanvasRef = useRef();
  const expensesChartCanvasRef = useRef();
  const collectionByChannelChartCanvasRef = useRef();

  const [consultationTypesChart, setConsultationTypesChart] = useState();
  const [expensesChart, setExpensesChart] = useState();
  const [collectionByChannelChart, setCollectionByChannelChart] = useState();
  const [params, setParams] = useState({
    past_days: 7,
  });

  const { data, loading, error, handleFetch } = useFetch("api/dashboard", params, true, null, (response) => response.data.data);

  useEffect(() => {
    document.title = `Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (data && consultationTypesChartCanvasRef && expensesChartCanvasRef) {
      renderCharts();
    }
  }, [data, consultationTypesChartCanvasRef, expensesChartCanvasRef, theme]);

  const renderCharts = () => {
    if (consultationTypesChart) {
      consultationTypesChart.destroy();
    }
    if (expensesChart) {
      expensesChart.destroy();
    }

    let chart = new Chart(consultationTypesChartCanvasRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels: data.statistics.cash_collection_by_consultation_type.map((e) => e.name),
        datasets: [
          {
            label: "Cash Collection by Consultation Type",
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

    setConsultationTypesChart(chart);

    chart = new Chart(expensesChartCanvasRef.current.getContext("2d"), {
      type: "pie",
      data: {
        labels: data.statistics.expenses_by_category.map((e) => e.name),
        datasets: [
          {
            label: "Expenses by Category",
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
            }
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
          <Select
            placeholder="Past Days"
            options={[
              { label: "Last 7 days", value: 7 },
              { label: "Last 14 days", value: 14 },
              { label: "Last 30 days", value: 30 },
            ]}
            optionsLabel="label"
            optionsValue="value"
            value={params.past_days}
            onChange={(value) => setParams({ ...params, past_days: value })}
          />
        }
        containerProps={{
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
              <CardHeader
                title="Cash Collection"
                titleTypographyProps={{
                  variant: "subtitle1",
                }}
              />
              <Divider />
              <CardContent>
                <canvas ref={consultationTypesChartCanvasRef}/>
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
              <CardHeader
                title="Expenses"
                titleTypographyProps={{
                  variant: "subtitle1",
                }}
              />
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
