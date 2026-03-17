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
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Source as SourceIcon
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
  deepOrange
} from '@mui/material/colors';

const LeadConversionReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState('30days');
  const addToast = useToast();

  const { data: conversionData, loading: conversionLoading } = useFetch(
    '/api/crm-reports/lead-conversion-report',
    { date_range: dateRange },
    true
  );

  useEffect(() => {
    if (conversionData) {
      console.log('Lead Conversion Data:', conversionData);
      // Backend returns: {message, data: {...}} - we need the nested data
      if (conversionData.data) {
        setData(conversionData.data);
      } else {
        setData(conversionData);
      }
      setLoading(false);
    }
  }, [conversionData]);

  if (loading || conversionLoading) {
    return (
      <Page title='Lead Conversion Report'>
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
      <Page title='Lead Conversion Report'>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">
            Failed to load lead conversion report data.
          </Alert>
        </Container>
      </Page>
    );
  }

  // Chart data for conversion trends
  const conversionTrendOptions = {
    chart: {
      type: 'line',
      height: 280,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    xaxis: {
      categories: data?.trend_data?.dates || [],
      labels: { rotate: -45, rotateAlways: true }
    },
    yaxis: {
      title: {
        text: 'Conversion Rate (%)'
      },
      labels: { formatter: (val) => numberFormat(val) }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#9c27b0'],
    grid: { show: true, borderColor: '#f0f0f0' },
    tooltip: { theme: "dark" },
    dataLabels: { enabled: false }
  };

  const conversionTrendSeries = [
    {
      name: 'Conversion Rate',
      data: data?.trend_data?.conversion_rates || []
    }
  ];

  // Chart data for funnel
  const funnelOptions = {
    chart: {
      type: 'bar',
      height: 280,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        distributed: true,
        dataLabels: {
          position: 'right'
        }
      }
    },
    xaxis: {
      categories: ['Total Leads', 'Contacted', 'Interested', 'Converted', 'Closed Sales'],
      labels: { style: { fontSize: '11px' } }
    },
    yaxis: {
      labels: { formatter: (val) => numberFormat(val) }
    },
    colors: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5'],
    grid: { show: true, borderColor: '#f0f0f0' },
    tooltip: { theme: "dark" },
    dataLabels: { enabled: false }
  };

  const funnelSeries = [
    {
      name: 'Lead Funnel',
      data: [
        data?.funnel?.total_leads || 0,
        data?.funnel?.contacted_leads || 0,
        data?.funnel?.interested_leads || 0,
        data?.funnel?.converted_leads || 0,
        data?.funnel?.closed_sales || 0
      ]
    }
  ];

  // Chart data for source distribution
  const sourceOptions = {
    chart: {
      type: 'donut',
      height: 280,
      toolbar: { show: false }
    },
    labels: data?.source_distribution?.map(s => s.source) || [],
    colors: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'],
    plotOptions: {
      pie: {
        donut: { size: '60%' },
        dataLabels: { offset: -10 }
      }
    },
    dataLabels: {
      enabled: true,
      style: { fontSize: '10px', fontWeight: 400 },
      formatter: function(val, opts) {
        return opts.w.globals.labels[opts.seriesIndex] + ': ' + numberFormat(opts.w.globals.series[opts.seriesIndex]);
      }
    },
    legend: { position: 'bottom', fontSize: '11px' },
    tooltip: { theme: "dark" }
  };

  const sourceSeries = data?.source_distribution?.map(s => s.count) || [];

  // Source performance table data
  const sourcePerformanceData = data?.source_performance || [];

  return (
    <Page title='Lead Conversion Report'>
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
                Lead Conversion Report
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                Track lead funnel, conversion rates, and source performance with detailed conversion metrics and analytics
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                <Chip
                  label="30-Day Analysis"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
                <Chip
                  label="Real-time Data"
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
                  fontSize: 28
                }}
              >
                <PeopleIcon />
              </Avatar>
            </Box>
          </Box>
        </Paper>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              title="Total Leads"
              count={data?.summary?.total_leads || 0}
              icon={<PeopleIcon />}
              color={purple[500]}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              title="Conversion Rate"
              count={`${data?.summary?.conversion_rate || 0}%`}
              icon={<TrendingIcon />}
              color={green[500]}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              title="Converted Leads"
              count={data?.summary?.converted_leads || 0}
              icon={<CheckIcon />}
              color={blue[500]}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              title="Drop-off Rate"
              count={`${data?.summary?.drop_off_rate || 0}%`}
              icon={<TrendingDownIcon />}
              color={orange[500]}
            />
          </Grid>
        </Grid>

        {/* Charts Section - Two charts per row like dashboard */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* First Row - Two Charts */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, height: '100%' }}>
              <CardHeader 
                title="Conversion Trends" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ pb: 0 }}
              />
              <Divider />
              <CardContent sx={{ p: 2 }}>
                <ChartWrapper
                  options={conversionTrendOptions}
                  series={conversionTrendSeries}
                  type="line"
                  height={280}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, height: '100%' }}>
              <CardHeader 
                title="Lead Funnel" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ pb: 0 }}
              />
              <Divider />
              <CardContent sx={{ p: 2 }}>
                <ChartWrapper
                  options={funnelOptions}
                  series={funnelSeries}
                  type="bar"
                  height={280}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Second Row - Two Charts */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, height: '100%' }}>
              <CardHeader 
                title="Lead Sources" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ pb: 0 }}
              />
              <Divider />
              <CardContent sx={{ p: 2 }}>
                <ChartWrapper
                  options={sourceOptions}
                  series={sourceSeries}
                  type="donut"
                  height={280}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, height: '100%' }}>
              <CardHeader 
                title="Source Performance" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ pb: 0 }}
              />
              <Divider />
              <CardContent sx={{ p: 2 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Source</strong></TableCell>
                        <TableCell align="right"><strong>Leads</strong></TableCell>
                        <TableCell align="right"><strong>Converted</strong></TableCell>
                        <TableCell align="right"><strong>Rate</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sourcePerformanceData.map((source, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SourceIcon fontSize="small" sx={{ color: blue[500] }} />
                              {source.source}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{numberFormat(source.leads)}</TableCell>
                          <TableCell align="right">{numberFormat(source.converted)}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${source.conversion_rate}%`}
                              size="small"
                              sx={{
                                bgcolor: 
                                  source.conversion_rate >= 30 ? green[50] :
                                  source.conversion_rate >= 20 ? orange[50] :
                                  red[50],
                                color: 
                                  source.conversion_rate >= 30 ? green[700] :
                                  source.conversion_rate >= 20 ? orange[700] :
                                  red[700],
                                fontWeight: 500
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Conversions */}
        <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2 }}>
          <CardHeader 
            title="Recent Conversions" 
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
                    <TableCell><strong>Lead Source</strong></TableCell>
                    <TableCell><strong>Contact Date</strong></TableCell>
                    <TableCell><strong>Conversion Date</strong></TableCell>
                    <TableCell align="right"><strong>Days to Convert</strong></TableCell>
                    <TableCell align="right"><strong>Value</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.recent_conversions?.map((conversion, index) => (
                    <TableRow key={index}>
                      <TableCell>{conversion.patient_name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SourceIcon fontSize="small" sx={{ color: blue[500] }} />
                          {conversion.lead_source}
                        </Box>
                      </TableCell>
                      <TableCell>{conversion.contact_date ? formatDate(conversion.contact_date) : 'N/A'}</TableCell>
                      <TableCell>{conversion.conversion_date ? formatDate(conversion.conversion_date) : 'N/A'}</TableCell>
                      <TableCell align="right">
                        {conversion.days_to_convert !== null ? `${conversion.days_to_convert} days` : 'N/A'}
                      </TableCell>
                      <TableCell align="right">{numberFormat(conversion.value)}</TableCell>
                      <TableCell>
                        <Chip
                          label={conversion.status}
                          color={conversion.status === 'Converted' ? 'success' : 'warning'}
                          size="small"
                          icon={conversion.status === 'Converted' ? <CheckIcon /> : <PendingIcon />}
                          sx={{ fontWeight: 500 }}
                        />
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

export default LeadConversionReport;