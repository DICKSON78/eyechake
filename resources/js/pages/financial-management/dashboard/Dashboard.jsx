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
  Button,
  Stack,
  Chip,
  Paper,
} from "@mui/material";
import {
  AccountBalanceRounded as FinancialIcon,
  AttachMoneyRounded as RevenueIcon,
  MoneyOffRounded as ExpenseIcon,
  TrendingUpRounded as ProfitIcon,
  TrendingDownRounded as LossIcon,
  ReceiptRounded as BillsIcon,
  PaymentRounded as PaymentsIcon,
  LibraryBooksRounded as ReportsIcon,
  AddRounded as AddIcon,
  RefreshRounded as RefreshIcon,
  DateRangeRounded as DateRangeIcon,
  AssessmentRounded as AnalyticsIcon,
  CheckCircleRounded as ClearedIcon,
  HourglassEmptyRounded as PendingIcon,
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
} from "@mui/material/colors";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import Page from "../../../components/Page";
import InfoCard from "../../../pages/dashboard/InfoCard";
import ChartWrapper from "../../../components/ChartWrapper";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, formatDateForDb } from "../../../helpers";
import { useTheme } from "@mui/material/styles";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();

  const [dateParams, setDateParams] = useState({
    start_date: formatDateForDb(new Date()),
    end_date: formatDateForDb(new Date()),
  });

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const { data, loading, error, handleFetch } = useFetch(
    "api/financial-management/dashboard",
    dateParams,
    true,
    {
      summary: {
        total_revenue: 0,
        total_expenses: 0,
        net_profit: 0,
        pending_bills: 0,
        expense_payments: 0,
        daily_collections: 0,
      },
      statistics: {
        top_expense_categories: [],
        payment_trends: [],
        expense_trends: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Financial Management Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      console.error("Dashboard API Error:", error);
      if (error?.response?.status === 401) {
        addToast({ message: "Authentication failed. Please login again.", severity: "error" });
        localStorage.removeItem("token");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        addToast({ message: formatError(error), severity: "error" });
      }
    }
  }, [error, addToast]);

  const handleRefresh = () => {
    handleFetch();
    addToast({ message: "Dashboard refreshed", severity: "success" });
  };

  const handleDateChange = () => {
    if (startDate && endDate && startDate <= endDate) {
      setDateParams({
        start_date: formatDateForDb(startDate),
        end_date: formatDateForDb(endDate),
      });
    } else {
      addToast({ message: "Please select valid date range", severity: "warning" });
    }
  };

  const handleResetDates = () => {
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setDateParams({
      start_date: formatDateForDb(today),
      end_date: formatDateForDb(today),
    });
  };

  const profitMargin = data.summary?.total_revenue > 0 
    ? ((data.summary?.net_profit / data.summary?.total_revenue) * 100).toFixed(1)
    : 0;

  if (loading && !data) {
    return (
      <Page title="Financial Management Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Financial Management Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Financial Management" },
        { title: "Dashboard" },
      ]}
    >
      {/* Header with Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Financial Management Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track revenue, expenses, and financial performance
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { width: { xs: '100%', sm: 140 } }
                }
              }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { width: { xs: '100%', sm: 140 } }
                }
              }}
            />
          </LocalizationProvider>
          <Button
            variant="contained"
            size="small"
            startIcon={<DateRangeIcon />}
            onClick={handleDateChange}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #653a8f 100%)',
              },
            }}
          >
            Apply
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleResetDates}
          >
            Reset
          </Button>
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {!loading && data ? (
        <React.Fragment>
          {/* Summary Cards */}
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mb: 4 }}
          >
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <InfoCard
                title="Collections"
                count={numberFormat(data.summary?.daily_collections || 0)}
                icon={<PaymentsIcon />}
                color={cyan[500]}
                onClick={() => navigate('/financial-management/reports/cash-collection')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <InfoCard
                title="Total Revenue"
                count={numberFormat(data.summary?.total_revenue || 0)}
                icon={<RevenueIcon />}
                color={green[500]}
                onClick={() => navigate('/financial-management/reports/cash-collection')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <InfoCard
                title="Total Expenses"
                count={numberFormat(data.summary?.total_expenses || 0)}
                icon={<ExpenseIcon />}
                color={red[500]}
                onClick={() => navigate('/financial-management/expenses')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <InfoCard
                title="Net Profit"
                count={numberFormat(data.summary?.net_profit || 0)}
                icon={data.summary?.net_profit >= 0 ? <ProfitIcon /> : <LossIcon />}
                color={data.summary?.net_profit >= 0 ? teal[500] : orange[500]}
                onClick={() => navigate('/financial-management/reports/balance-sheet')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <InfoCard
                title="Pending Bills"
                count={numberFormat(data.summary?.pending_bills || 0)}
                icon={<PendingIcon />}
                color={orange[500]}
                onClick={() => navigate('/financial-management/reports/pending-patient-bills')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <InfoCard
                title="Running Cost"
                count={numberFormat(data.summary?.running_cost || 0)}
                icon={<ExpenseIcon />}
                color={pink[500]}
                onClick={() => navigate('/financial-management/expenses')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <InfoCard
                title="Improvement Cost"
                count={numberFormat(data.summary?.improvement_cost || 0)}
                icon={<AddIcon />}
                color={purple[500]}
                onClick={() => navigate('/financial-management/expenses')}
              />
            </Grid>
          </Grid>

          {/* Additional Stats Row */}
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Profit Margin
                    </Typography>
                    <AnalyticsIcon sx={{ color: teal[500], fontSize: 28 }} />
                  </Stack>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: data.summary?.net_profit >= 0 ? teal[600] : orange[600],
                      mb: 0.5,
                    }}
                  >
                    {profitMargin}%
                  </Typography>
                  <Chip
                    label={data.summary?.net_profit >= 0 ? "Positive" : "Negative"}
                    size="small"
                    sx={{
                      bgcolor: data.summary?.net_profit >= 0 ? teal[100] : orange[100],
                      color: data.summary?.net_profit >= 0 ? teal[700] : orange[700],
                      fontWeight: 600,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #FFF9E6 0%, #FFEDD8 100%)',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Expense Payments
                    </Typography>
                    <PaymentsIcon sx={{ color: orange[500], fontSize: 28 }} />
                  </Stack>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: orange[600],
                      mb: 0.5,
                    }}
                  >
                    {numberFormat(data.summary?.expense_payments || 0)}
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => navigate('/financial-management/expense-payments')}
                    sx={{ mt: 0.5, textTransform: 'none' }}
                  >
                    View Details →
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #F0E8FF 0%, #E8F4F8 100%)',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Financial Reports
                    </Typography>
                    <ReportsIcon sx={{ color: purple[500], fontSize: 28 }} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Access comprehensive financial reports and analytics
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ReportsIcon />}
                    onClick={() => navigate('/financial-management/reports')}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #653a8f 100%)',
                      },
                    }}
                  >
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
            {/* Revenue vs Expenses Trend */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card
                sx={{
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  borderRadius: '16px',
                }}
              >
                <CardHeader
                  title="Revenue vs Expenses Trend"
                  subheader="Last 7 days comparison"
                  titleTypographyProps={{
                    variant: "h6",
                    fontWeight: 700,
                    color: '#1C1C1C',
                  }}
                  subheaderTypographyProps={{
                    variant: "body2",
                    color: 'text.secondary',
                  }}
                />
                <Divider />
                <CardContent>
                  <ChartWrapper
                    options={{
                      chart: {
                        fontFamily: theme.typography.fontFamily,
                        foreColor: theme.palette.text.primary,
                        background: "transparent",
                        toolbar: { show: false },
                        type: 'line',
                      },
                      stroke: { width: [3, 3], curve: "smooth" },
                      colors: [green[500], red[500]],
                      dataLabels: { enabled: false },
                      grid: { show: true, borderColor: theme.palette.divider },
                      xaxis: {
                        categories: (data.statistics?.payment_trends || []).map((e) =>
                          new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        ),
                        axisBorder: { show: false, color: theme.palette.divider },
                        axisTicks: { show: true, color: theme.palette.divider },
                      },
                      yaxis: {
                        title: { text: "Amount (TZS)" },
                        labels: { formatter: (val) => numberFormat(Math.round(val)) }
                      },
                      tooltip: {
                        theme: "dark",
                        shared: true,
                        y: { formatter: (val) => `${numberFormat(Math.round(val))} TZS` }
                      },
                      legend: {
                        position: "top",
                        markers: { width: 14, height: 8, radius: 4 }
                      },
                    }}
                    series={[
                      {
                        name: "Revenue",
                        data: (data.statistics?.payment_trends || []).map((e) => parseFloat(e.revenue || 0))
                      },
                      {
                        name: "Expenses",
                        data: (data.statistics?.expense_trends || []).map((e) => parseFloat(e.expenses || 0))
                      },
                    ]}
                    type="line"
                    height={350}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Expense Categories */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  borderRadius: '16px',
                }}
              >
                <CardHeader
                  title="Expense Categories"
                  subheader="Top categories breakdown"
                  titleTypographyProps={{
                    variant: "h6",
                    fontWeight: 700,
                    color: '#1C1C1C',
                  }}
                  subheaderTypographyProps={{
                    variant: "body2",
                    color: 'text.secondary',
                  }}
                />
                <Divider />
                <CardContent>
                  <ChartWrapper
                    options={{
                      labels: (data.statistics?.top_expense_categories || []).map((e) => e.name) || [],
                      chart: {
                        fontFamily: theme.typography.fontFamily,
                        background: "transparent",
                        toolbar: { show: false },
                        type: 'donut',
                      },
                      plotOptions: { pie: { donut: { size: "60%" } } },
                      colors: [purple[400], pink[400], orange[400], teal[400]],
                      dataLabels: {
                        enabled: true,
                        style: { fontSize: "11px", colors: [theme.palette.text.primary] },
                        formatter: function(val, opts) {
                          return opts.w.globals.labels[opts.seriesIndex] + '\n' + numberFormat(opts.w.globals.series[opts.seriesIndex]);
                        },
                      },
                      tooltip: { y: { formatter: (val) => `${numberFormat(val)} TZS` } },
                      legend: {
                        position: "bottom",
                        labels: { colors: [theme.palette.text.secondary] },
                        markers: { width: 14, height: 8, radius: 4 },
                      },
                    }}
                    series={(data.statistics?.top_expense_categories || []).map((e) => parseFloat(e.total_amount || 0)) || []}
                    type="donut"
                    height={350}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions Section */}
          <Card
            sx={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)',
            }}
          >
            <CardHeader
              title="Quick Actions"
              subheader="Common financial management tasks"
              titleTypographyProps={{
                variant: "h6",
                fontWeight: 700,
                color: '#1C1C1C',
              }}
              subheaderTypographyProps={{
                variant: "body2",
                color: 'text.secondary',
              }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      bgcolor: 'white',
                      '&:hover': {
                        borderColor: green[300],
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 20px rgba(76, 175, 80, 0.2)',
                      },
                    }}
                    onClick={() => navigate('/financial-management/expenses')}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: green[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1.5,
                      }}
                    >
                      <AddIcon sx={{ fontSize: 28, color: green[600] }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      Add Expense
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Record new expense
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      bgcolor: 'white',
                      '&:hover': {
                        borderColor: blue[300],
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 20px rgba(33, 150, 243, 0.2)',
                      },
                    }}
                    onClick={() => navigate('/financial-management/expense-payments')}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: blue[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1.5,
                      }}
                    >
                      <PaymentsIcon sx={{ fontSize: 28, color: blue[600] }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      Expense Payments
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Manage payments
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      bgcolor: 'white',
                      '&:hover': {
                        borderColor: purple[300],
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 20px rgba(156, 39, 176, 0.2)',
                      },
                    }}
                    onClick={() => navigate('/financial-management/reports')}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: purple[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1.5,
                      }}
                    >
                      <ReportsIcon sx={{ fontSize: 28, color: purple[600] }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      Financial Reports
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      View all reports
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      bgcolor: 'white',
                      '&:hover': {
                        borderColor: teal[300],
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 20px rgba(0, 150, 136, 0.2)',
                      },
                    }}
                    onClick={() => navigate('/financial-management/reports/balance-sheet')}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: teal[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1.5,
                      }}
                    >
                      <FinancialIcon sx={{ fontSize: 28, color: teal[600] }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      Balance Sheet
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Financial overview
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </React.Fragment>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6" color="text.secondary">No data available.</Typography>
        </Box>
      )}
    </Page>
  );
};

export default Dashboard;
