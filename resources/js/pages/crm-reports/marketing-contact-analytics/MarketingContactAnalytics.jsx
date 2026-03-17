import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Avatar,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Person as PersonIcon,
  TrendingUp as TrendingIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Help as UnreachableIcon,
  Timeline as TimelineIcon,
  AccessTime as TimeIcon,
  MarkunreadMailbox as AttemptsIcon
} from '@mui/icons-material';
import InfoCard from '../../dashboard/InfoCard';
import { useFetch, useToast } from '../../../hooks';
import { numberFormat, formatDate } from '../../../helpers';
import ChartWrapper from '../../../components/ChartWrapper';
import Page from '../../../components/Page';
import {
  green,
  orange,
  red,
  blue,
  purple,
  cyan,
  deepOrange,
  teal,
  pink,
  indigo
} from '@mui/material/colors';

const MarketingContactAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState('7days');
  const addToast = useToast();

  const { data: analyticsData, loading: analyticsLoading } = useFetch(
    '/api/crm-reports/marketing-contact-analytics',
    { date_range: dateRange },
    true
  );

  useEffect(() => {
    if (analyticsData) {
      console.log('Marketing Analytics Data:', analyticsData);
      // Backend returns: {message, data: {...}} - we need the nested data
      if (analyticsData.data) {
        setData(analyticsData.data);
      } else {
        setData(analyticsData);
      }
      setLoading(false);
    }
  }, [analyticsData]);

  useEffect(() => {
    console.log('Data State:', data);
    console.log('Loading State:', analyticsLoading);
    console.log('Error State:', error);
  }, [data, analyticsLoading, error]);

  if (loading || analyticsLoading) {
    return (
      <Page title="Marketing Contact Analytics">
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </Page>
    );
  }

  if (error || !data) {
    return (
      <Page title="Marketing Contact Analytics">
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">
            Failed to load marketing contact analytics data.
          </Alert>
        </Container>
      </Page>
    );
  }

  // Chart data for contact status trends
  const contactTrendOptions = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
    },
    xaxis: {
      categories: data?.trend_data?.dates || [],
      labels: { 
        rotate: -45, 
        rotateAlways: true,
        style: { fontSize: '11px' }
      }
    },
    yaxis: {
      title: {
        text: 'Number of Contacts',
      },
      labels: { 
        formatter: (val) => numberFormat(val),
        style: { fontSize: '11px' }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: [green[500], orange[500], red[500]],
    grid: { 
      show: true, 
      borderColor: '#f0f0f0',
      padding: { left: 10, right: 10 }
    },
    tooltip: { theme: "dark" },
    dataLabels: { enabled: false },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      markers: { width: 14, height: 8, radius: 4 },
      fontSize: '12px',
      itemMargin: { horizontal: 15 }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: { position: 'bottom' }
      }
    }]
  };

  const contactTrendSeries = [
    {
      name: 'Called',
      data: data?.trend_data?.called || [],
    },
    {
      name: 'Not Called',
      data: data?.trend_data?.not_called || [],
    },
    {
      name: 'Unreachable',
      data: data?.trend_data?.unreachable || [],
    },
  ];

  // Chart data for contact distribution
  const contactDistributionOptions = {
    chart: {
      type: 'donut',
      height: 300,
      toolbar: { show: false },
      background: 'transparent',
    },
    labels: ['Called', 'Not Called', 'Unreachable'],
    colors: [green[500], orange[500], red[500]],
    plotOptions: {
      pie: {
        donut: { 
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => numberFormat(data?.summary?.total_contacts || 0)
            }
          }
        },
        dataLabels: { offset: -15 }
      }
    },
    dataLabels: {
      enabled: true,
      style: { fontSize: '11px', fontWeight: 500 },
      formatter: function(val, opts) {
        return opts.w.globals.labels[opts.seriesIndex] + ': ' + numberFormat(opts.w.globals.series[opts.seriesIndex]);
      },
      dropShadow: { enabled: false }
    },
    legend: { 
      position: 'bottom', 
      horizontalAlign: 'center',
      fontSize: '12px',
      markers: { width: 14, height: 8, radius: 4 },
      itemMargin: { horizontal: 15 }
    },
    tooltip: { 
      theme: "dark",
      y: { formatter: (val) => numberFormat(val) }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: { position: 'bottom' }
      }
    }]
  };

  const contactDistributionSeries = [
    data?.summary?.called_count || 0,
    data?.summary?.not_called_count || 0,
    data?.summary?.unreachable_count || 0,
  ];

  // Success rate
  const successRate = data?.summary?.total_contacts > 0 
    ? Math.round((data?.summary?.called_count / data?.summary?.total_contacts) * 100) 
    : 0;

  return (
    <Page title="Marketing Contact Analytics">
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                Marketing Contact Analytics
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                Analyze contact patterns, call success rates, and marketer performance with real-time data visualization
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                <Chip
                  label="Live Data"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
                <Chip
                  label="7-Day Analysis"
                  color="info"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 56,
                  height: 56,
                  fontSize: 28,
                }}
              >
                <PhoneIcon />
              </Avatar>
            </Box>
          </Box>
        </Paper>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              title="Called Successfully"
              count={numberFormat(data?.summary?.called_count || 0)}
              icon={<PhoneIcon />}
              color={green[500]}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              title="Not Yet Called"
              count={numberFormat(data?.summary?.not_called_count || 0)}
              icon={<PersonIcon />}
              color={orange[500]}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              title="Unreachable"
              count={numberFormat(data?.summary?.unreachable_count || 0)}
              icon={<UnreachableIcon />}
              color={red[500]}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              title="Total Contacts"
              count={numberFormat(data?.summary?.total_contacts || 0)}
              icon={<TrendingIcon />}
              color={blue[500]}
            />
          </Grid>

          {/* Additional metrics if available */}
          {data?.summary?.success_rate !== undefined && (
            <Grid item xs={12} sm={6} md={3}>
              <InfoCard
                title="Success Rate"
                count={`${data?.summary?.success_rate || successRate}%`}
                icon={<CheckIcon />}
                color={teal[500]}
              />
            </Grid>
          )}

          {data?.summary?.avg_attempts !== undefined && (
            <Grid item xs={12} sm={6} md={3}>
              <InfoCard
                title="Avg Attempts"
                count={data?.summary?.avg_attempts || 0}
                icon={<AttemptsIcon />}
                color={purple[500]}
              />
            </Grid>
          )}
        </Grid>

        {/* Charts Section - Two charts covering full width equally */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Contact Status Trends - Takes half the width */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)', 
              borderRadius: 2, 
              height: '100%',
              width: '100%'
            }}>
              <CardHeader 
                title="Contact Status Trends" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ pb: 0 }}
              />
              <Divider />
              <CardContent sx={{ p: 2, width: '100%' }}>
                <Box sx={{ width: '100%' }}>
                  <ChartWrapper
                    options={contactTrendOptions}
                    series={contactTrendSeries}
                    type="line"
                    height={300}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Distribution - Takes half the width */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)', 
              borderRadius: 2, 
              height: '100%',
              width: '100%'
            }}>
              <CardHeader 
                title="Contact Distribution" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ pb: 0 }}
              />
              <Divider />
              <CardContent sx={{ p: 2, width: '100%' }}>
                <Box sx={{ width: '100%' }}>
                  <ChartWrapper
                    options={contactDistributionOptions}
                    series={contactDistributionSeries}
                    type="donut"
                    height={300}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Marketer Performance Section */}
        {data?.marketer_performance && data.marketer_performance.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2 }}>
                <CardHeader 
                  title="Marketer Performance" 
                  titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                  sx={{ pb: 0 }}
                />
                <Divider />
                <CardContent sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    {data.marketer_performance.map((marketer, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            border: `2px solid #f0f0f0`,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: green[300],
                              boxShadow: `0 4px 12px rgba(76, 175, 80, 0.2)`,
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                bgcolor: green[100],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <PersonIcon sx={{ fontSize: 24, color: green[600] }} />
                            </Box>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {marketer.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Total: {numberFormat(marketer.total_contacts)} contacts
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Grid container spacing={1}>
                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight={700} color={green[600]}>
                                  {numberFormat(marketer.called || 0)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Called
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight={700} color={orange[600]}>
                                  {numberFormat(marketer.not_called || 0)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Pending
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight={700} color={red[600]}>
                                  {numberFormat(marketer.unreachable || 0)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Unreachable
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                          
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Success Rate
                              </Typography>
                              <Typography variant="caption" fontWeight={600}>
                                {marketer.success_rate || 
                                  (marketer.total_contacts > 0 
                                    ? Math.round((marketer.called / marketer.total_contacts) * 100) 
                                    : 0)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={marketer.success_rate || 
                                (marketer.total_contacts > 0 
                                  ? (marketer.called / marketer.total_contacts) * 100 
                                  : 0)}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: '#f0f0f0',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: green[500],
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Detailed Table */}
        <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2 }}>
          <CardHeader 
            title="Contact Details" 
            titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
            action={
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  label="Date Range"
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="90days">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
            }
          />
          <Divider />
          <CardContent sx={{ p: 2 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Patient Name</strong></TableCell>
                    <TableCell><strong>Phone</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Last Contact Date</strong></TableCell>
                    <TableCell align="center"><strong>Attempts</strong></TableCell>
                    <TableCell><strong>Marketer</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.contacts?.map((contact, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {contact.status === 'Called' && (
                            <CheckIcon fontSize="small" sx={{ color: green[600] }} />
                          )}
                          {contact.status === 'Not Called' && (
                            <PersonIcon fontSize="small" sx={{ color: orange[600] }} />
                          )}
                          {contact.status === 'Unreachable' && (
                            <UnreachableIcon fontSize="small" sx={{ color: red[600] }} />
                          )}
                          {contact.patient_name}
                        </Box>
                      </TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={contact.status}
                          size="small"
                          sx={{
                            bgcolor: 
                              contact.status === 'Called' ? green[50] :
                              contact.status === 'Not Called' ? orange[50] :
                              red[50],
                            color: 
                              contact.status === 'Called' ? green[700] :
                              contact.status === 'Not Called' ? orange[700] :
                              red[700],
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {contact.last_contact_date
                          ? formatDate(contact.last_contact_date)
                          : 'Never'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={contact.contact_attempts || 0}
                          size="small"
                          sx={{ bgcolor: '#f5f5f5', fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon fontSize="small" sx={{ color: blue[500], fontSize: 16 }} />
                          {contact.marketer_name}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Page>
  );
};

export default MarketingContactAnalytics;