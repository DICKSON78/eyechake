import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  CircularProgress,
  Divider,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import {
  PointOfSaleRounded as SalesIcon,
  ShoppingCartRounded as CartIcon,
  TrendingUpRounded as TrendingIcon,
  DiscountRounded as DiscountIcon,
  AssessmentRounded as ReportsIcon,
  PictureAsPdfRounded as PdfIcon,
} from '@mui/icons-material';
import {
  blue,
  cyan,
  green,
  orange,
  purple,
  teal,
  pink,
  red,
} from '@mui/material/colors';

import Page from '../../../components/Page';
import InfoCard from '../../dashboard/InfoCard';
import ChartWrapper from '../../../components/ChartWrapper';
import { useFetch, useToast } from '../../../hooks';
import { formatError, numberFormat, getWeekStartDate, getWeekEndDate, formatDateForDb } from '../../../helpers';
import { downloadHTMLAsPDF } from '../../../helpers/pdfDownload';
import { useTheme } from '@mui/material/styles';

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();
  const printRef = useRef(null);

  // Default to today's data for the dashboard cards and charts
  const today = new Date();
  const todayStr = formatDateForDb(today);
  const [dateParams, setDateParams] = useState({
    start_date: todayStr,
    end_date: todayStr,
  });

  const { data, loading, error } = useFetch(
    'api/sales-management/dashboard',
    dateParams,
    true,
    {
      summary: {
        total_sales: 0,
        sales_today: 0,
        total_revenue: 0,
        total_transactions: 0,
        average_transaction: 0,
        total_discounts: 0,
        items_sold: 0,
        top_selling_items: [],
      },
      statistics: {
        sales_by_category: [],
        sales_by_day: [],
        sales_trend: [],
        top_customers: [],
        clients_consulted_vs_sales: [],
        prescription_demand: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Sales Management Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: 'error' });
    }
  }, [error, addToast]);

  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      if (!printRef.current) {
        addToast({ message: 'Dashboard content not found', severity: 'error' });
        return;
      }

      const startDate = dateParams.start_date || todayStr;
      const endDate = dateParams.end_date || todayStr;
      const filename = `Sales_Dashboard_Report_${startDate}_to_${endDate}.pdf`;
      
      await downloadHTMLAsPDF(printRef.current, filename);
      
      addToast({
        message: 'Dashboard report downloaded successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      addToast({
        message: formatError(error) || 'Failed to download dashboard report',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Page title='Sales Management Dashboard'>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  // Calculate performance metrics - now using backend calculated performance
  const salesPerformance = data.summary?.sales_performance || 0;

  return (
    <Page
      title='Sales Management Dashboard'
      breadcrumbs={[
        { title: 'Home' },
        { title: 'Sales Management' },
        { title: 'Sales Management Dashboard' },
      ]}
    >
      <CardHeader
        title='Sales Management Dashboard'
        titleTypographyProps={{
          variant: 'h4',
          fontWeight: 700,
        }}
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              Real-time sales performance and analytics
            </Typography>
            <Chip 
              label={`Performance: ${salesPerformance}%`} 
              color={salesPerformance >= 100 ? 'success' : salesPerformance >= 75 ? 'warning' : 'error'}
              size='small'
            />
            <Button
              variant='outlined'
              size='small'
              startIcon={<PdfIcon />}
              onClick={handleDownloadPDF}
              sx={{ ml: 'auto' }}
            >
              Download Monthly Report PDF
            </Button>
          </Box>
        }
        sx={{
          p: 0,
          mb: 3,
        }}
      />

      {/* Date Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Date Filter
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Start Date
              </Typography>
              <input
                type='date'
                value={dateParams.start_date}
                onChange={(e) => setDateParams({ ...dateParams, start_date: e.target.value })}
                style={{
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </Box>
            <Box>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                End Date
              </Typography>
              <input
                type='date'
                value={dateParams.end_date}
                onChange={(e) => setDateParams({ ...dateParams, end_date: e.target.value })}
                style={{
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </Box>
            <Button
              variant='contained'
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Apply Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box ref={printRef}>
        {!loading && data ? (
          <>
            {/* Key Performance Indicators */}
            <Grid
              container
              spacing={{ xs: 2, sm: 2, md: 3 }}
              sx={{ mb: 4 }}
            >
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <InfoCard
                  title="Total Revenue"
                  count={numberFormat(data.summary?.total_revenue || 0)}
                  subtitle="Today's sales"
                  icon={<SalesIcon />}
                  color={green[500]}
                  onClick={() => navigate('/sales-management/reports/sales-manager-monthly-report')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <InfoCard
                  title="Total Transactions"
                  count={numberFormat(data.summary?.total_transactions || 0)}
                  subtitle="Completed sales"
                  icon={<CartIcon />}
                  color={blue[500]}
                  onClick={() => navigate('/sales-management/clients')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <InfoCard
                  title="Average Transaction"
                  count={numberFormat(data.summary?.average_transaction || 0)}
                  subtitle='Per sale'
                  icon={<TrendingIcon />}
                  color={purple[500]}
                  onClick={() => navigate('/sales-management/reports/sales-manager-monthly-report')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <InfoCard
                  title='Items Sold'
                  count={numberFormat(data.summary?.items_sold || 0)}
                  subtitle='Products sold'
                  icon={<ReportsIcon />}
                  color={orange[500]}
                  onClick={() => navigate('/sales-management/prescriptions')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <InfoCard
                  title='Total Discounts'
                  count={numberFormat(data.summary?.total_discounts || 0)}
                  subtitle='Discounts given'
                  icon={<DiscountIcon />}
                  color={pink[500]}
                  onClick={() => navigate('/sales-management/reports/sales-manager-monthly-report')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <InfoCard
                  title='Sales Performance'
                  count={`${salesPerformance}%`}
                  subtitle={`vs ${numberFormat(data.summary?.sales_target || 1500000)} target`}
                  icon={<TrendingIcon />}
                  color={salesPerformance >= 100 ? green[500] : salesPerformance >= 75 ? orange[500] : red[500]}
                  onClick={() => navigate('/sales-management/reports/sales-manager-monthly-report')}
                />
              </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid
              container
              spacing={{ xs: 2, sm: 2, md: 3 }}
              sx={{ mt: 2 }}
            >
              {/* Clients Consulted vs Successful Sales Graph */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                    },
                    transition: 'box-shadow 0.3s ease-in-out',
                  }}
                >
                  <CardHeader
                    title='Clients Consulted vs Successful Sales'
                    titleTypographyProps={{
                      variant: 'h6',
                      fontWeight: 600,
                    }}
                    sx={{
                      pb: 1,
                    }}
                  />
                  <Divider />
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      pt: 2,
                      pb: 2,
                      '&:last-child': {
                        pb: 2,
                      },
                    }}
                  >
                    <Box sx={{ width: '100%', height: '100%' }}>
                      <ChartWrapper
                        options={{
                          chart: {
                            fontFamily: theme.typography.fontFamily,
                            foreColor: theme.palette.text.primary,
                            background: 'transparent',
                            toolbar: {
                              show: false,
                            },
                            type: 'line',
                          },
                          stroke: {
                            width: [3, 3],
                            curve: 'smooth',
                          },
                          colors: [blue[400], green[400]],
                          dataLabels: {
                            enabled: false,
                          },
                          grid: {
                            show: true,
                            borderColor: theme.palette.divider,
                          },
                          xaxis: {
                            categories: (data.statistics?.clients_consulted_vs_sales || []).map((e) => {
                              const date = new Date(e.date);
                              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            }),
                            axisBorder: {
                              show: false,
                              color: theme.palette.divider,
                            },
                            axisTicks: {
                              show: true,
                              color: theme.palette.divider,
                            },
                          },
                          yaxis: {
                            title: {
                              text: 'Count',
                            },
                            labels: {
                              formatter: (val) => Math.round(val),
                            },
                          },
                          tooltip: {
                            theme: 'dark',
                            shared: true,
                            y: {
                              formatter: (val) => `${Math.round(val)}`,
                            },
                          },
                          legend: {
                            position: 'top',
                            markers: {
                              width: 14,
                              height: 8,
                              radius: 4,
                            },
                          },
                        }}
                        series={[
                          {
                            name: 'Clients Consulted',
                            data: (data.statistics?.clients_consulted_vs_sales || []).map((e) => e.clients_consulted || 0),
                          },
                          {
                            name: 'Successful Sales (Count)',
                            data: (data.statistics?.clients_consulted_vs_sales || []).map((e) => e.successful_sales || 0),
                          },
                        ]}
                        type='line'
                        height={350}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Prescription Demand Graph */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                    },
                    transition: 'box-shadow 0.3s ease-in-out',
                  }}
                >
                  <CardHeader
                    title='Prescription Demand'
                    titleTypographyProps={{
                      variant: 'h6',
                      fontWeight: 600,
                    }}
                    sx={{
                      pb: 1,
                    }}
                  />
                  <Divider />
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      pt: 2,
                      pb: 2,
                      '&:last-child': {
                        pb: 2,
                      },
                    }}
                  >
                    <Box sx={{ width: '100%', height: '100%' }}>
                      <ChartWrapper
                        options={{
                          chart: {
                            fontFamily: theme.typography.fontFamily,
                            foreColor: theme.palette.text.primary,
                            background: 'transparent',
                            toolbar: {
                              show: false,
                            },
                            type: 'bar',
                          },
                          plotOptions: {
                            bar: {
                              borderRadius: 4,
                              dataLabels: {
                                position: 'top',
                              },
                            },
                          },
                          colors: [purple[400]],
                          dataLabels: {
                            enabled: true,
                            formatter: (val) => Math.round(val),
                            offsetY: -20,
                            style: {
                              fontSize: '10px',
                              colors: [theme.palette.text.primary],
                            },
                          },
                          grid: {
                            show: true,
                            borderColor: theme.palette.divider,
                          },
                          xaxis: {
                            categories: (data.statistics?.prescription_demand || []).map((e) => {
                              const date = new Date(e.date);
                              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            }),
                            axisBorder: {
                              show: false,
                              color: theme.palette.divider,
                            },
                            axisTicks: {
                              show: true,
                              color: theme.palette.divider,
                            },
                          },
                          yaxis: {
                            title: {
                              text: 'Quantity',
                            },
                            labels: {
                              formatter: (val) => Math.round(val),
                            },
                          },
                          tooltip: {
                            theme: 'dark',
                            y: {
                              formatter: (val) => `${Math.round(val)} items`,
                            },
                          },
                          legend: {
                            position: 'top',
                            markers: {
                              width: 14,
                              height: 8,
                              radius: 4,
                            },
                          },
                        }}
                        series={[
                          {
                            name: 'Prescription Quantity',
                            data: (data.statistics?.prescription_demand || []).map((e) => e.quantity || 0),
                          },
                        ]}
                        type='bar'
                        height={350}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

          {/* Performance Alert */}
          {salesPerformance < 75 && (
            <Alert severity='warning' sx={{ mb: 3 }}>
              <Typography variant='body2'>
                Sales performance is at {salesPerformance}% of the daily target. Consider reviewing sales strategies and customer engagement.
              </Typography>
            </Alert>
          )}

          {salesPerformance >= 100 && (
            <Alert severity='success' sx={{ mb: 3 }}>
              <Typography variant='body2'>
                Great job! Sales performance has exceeded the daily target at {salesPerformance}%. Keep up the excellent work!
              </Typography>
            </Alert>
          )}
        </>
      ) : (
        <Alert severity='info' sx={{ mb: 3 }}>
          <Typography variant='body2'>
            No sales data available for the selected period. Sales data will appear here once transactions are recorded.
          </Typography>
        </Alert>
      )}
      </Box>
    </Page>
  );
};

export default Dashboard;
