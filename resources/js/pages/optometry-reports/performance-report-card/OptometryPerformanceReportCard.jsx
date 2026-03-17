import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  LinearProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Visibility as EyeIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  Assessment as ReportIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  HealthAndSafety as HealthIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import InfoCard from '../../dashboard/InfoCard';
import ChartWrapper from '../../../components/ChartWrapper';
import { useFetch, useToast, usePatch } from '../../../hooks';
import { numberFormat, formatDate } from '../../../helpers';
import Page from '../../../components/Page';
import {
  green,
  orange,
  red,
  blue,
  purple,
  cyan,
  teal,
  deepOrange,
  pink,
  indigo,
  yellow,
  grey
} from '@mui/material/colors';

const OptometryPerformanceReportCard = ({ 
  user, 
  editable = false,
  refreshTrigger = null 
}) => {
  const [period, setPeriod] = useState('30days');
  const [customWeeks, setCustomWeeks] = useState(1);
  
  // Mock data for demonstration
  const mockData = {
    kpis: [
      {
        id: 'patient_satisfaction',
        name: 'Patient Satisfaction',
        target: 95,
        result: 87,
        unit: '%',
        trend: -8,
        formatted_target: '95%',
        formatted_result: '87%'
      },
      {
        id: 'treatment_success',
        name: 'Treatment Success Rate',
        target: 90,
        result: 92,
        unit: '%',
        trend: 2,
        formatted_target: '90%',
        formatted_result: '92%'
      },
      {
        id: 'service_quality',
        name: 'Service Quality',
        target: 85,
        result: 78,
        unit: '%',
        trend: -7,
        formatted_target: '85%',
        formatted_result: '78%'
      },
      {
        id: 'appointment_efficiency',
        name: 'Appointment Efficiency',
        target: 80,
        result: 75,
        unit: '%',
        trend: -5,
        formatted_target: '80%',
        formatted_result: '75%'
      }
    ],
    summary: {
      targets_achieved: 1,
      total_kpis: 4,
      completion_rate: 25
    },
    recommendations: [
      'Focus on improving patient satisfaction scores to meet target goals',
      'Enhance treatment protocols to increase success rates',
      'Optimize appointment scheduling for better efficiency'
    ]
  };

  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { patch, loading: patchLoading } = usePatch('/api/performance-reports/optometry/targets');
  const { showSuccess, showError } = useToast();

  // Auto-refresh when period changes
  useEffect(() => {
    if (period === 'custom') {
      // Simulate data refresh for custom weeks
      setLoading(true);
      setTimeout(() => {
        // Update data based on custom weeks
        const updatedData = {
          ...mockData,
          kpis: mockData.kpis.map(kpi => ({
            ...kpi,
            result: Math.round(kpi.result * (customWeeks / 4)), // Scale by weeks
            formatted_target: kpi.formatted_target,
            formatted_result: kpi.unit === 'TZS' 
              ? numberFormat(Math.round(kpi.result * (customWeeks / 4)))
              : `${Math.round(kpi.result * (customWeeks / 4))}${kpi.unit || ''}`
          }))
        };
        setData(updatedData);
        setLoading(false);
        console.log('Optometry data refreshed for ' + customWeeks + ' weeks');
      }, 1000);
    } else {
      // Simulate data refresh for fixed periods
      setLoading(true);
      setTimeout(() => {
        setData(mockData);
        setLoading(false);
        console.log('Optometry data refreshed for ' + period);
      }, 1000);
    }
  }, [period, customWeeks]);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTargets, setEditedTargets] = useState({});

  const handleEdit = () => {
    setIsEditing(true);
    const targets = {};
    data?.kpis?.forEach(kpi => {
      targets[kpi.id] = kpi.target;
    });
    setEditedTargets(targets);
  };

  const handleSave = async () => {
    // Mock save - just update local state
    const updatedKpis = data.kpis.map(kpi => ({
      ...kpi,
      target: editedTargets[kpi.id] || kpi.target
    }));
    setData(prev => ({ ...prev, kpis: updatedKpis }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTargets({});
  };

  const handleTargetChange = (kpiId, value) => {
    setEditedTargets(prev => ({
      ...prev,
      [kpiId]: value
    }));
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      if (period === 'custom') {
        // Update data based on custom weeks
        const updatedData = {
          ...mockData,
          kpis: mockData.kpis.map(kpi => ({
            ...kpi,
            result: Math.round(kpi.result * (customWeeks / 4)), // Scale by weeks
            formatted_target: kpi.formatted_target,
            formatted_result: kpi.unit === 'TZS' 
              ? numberFormat(Math.round(kpi.result * (customWeeks / 4)))
              : `${Math.round(kpi.result * (customWeeks / 4))}${kpi.unit || ''}`
          }))
        };
        setData(updatedData);
        console.log('Optometry data refreshed for ' + customWeeks + ' weeks');
      } else {
        setData(mockData);
        console.log('Optometry data refreshed for ' + period);
      }
      setLoading(false);
    }, 1000);
  };

  const getPerformanceColor = (result, target) => {
    if (target === 0) return grey[500];
    const percentage = (result / target) * 100;
    if (percentage >= 100) return green[500];
    if (percentage >= 80) return blue[500];
    if (percentage >= 60) return orange[500];
    return red[500];
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingIcon sx={{ color: green[500] }} />;
    if (trend < 0) return <TrendingDownIcon sx={{ color: red[500] }} />;
    return <TrendingFlatIcon sx={{ color: grey[500] }} />;
  };

  if (loading && !data) {
    return (
      <Page title="Optometry Report Card">
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </Box>
      </Page>
    );
  }

  if (error || !data) {
    return (
      <Page title="Optometry Report Card">
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load optometry performance data. Please try again.
          </Alert>
          <Button variant="contained" onClick={handleRefresh} startIcon={<RefreshIcon />}>
            Retry
          </Button>
        </Box>
      </Page>
    );
  }

  return (
    <Page title="Optometry Report Card">
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Paper sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          p: 4, 
          mb: 4, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Optometry Report Card
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                Track optometry performance metrics, patient outcomes, and service quality with real-time updates
              </Typography>
              <Chip
                label={`${data?.kpis?.length || 0} KPIs tracked`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: 'white' }}>Period</InputLabel>
                <Select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  sx={{ color: 'white' }}
                >
                  <MenuItem value="7days">7 Days</MenuItem>
                  <MenuItem value="30days">30 Days</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
              {period === 'custom' && (
                <TextField
                  size="small"
                  type="number"
                  label="Weeks"
                  value={customWeeks}
                  onChange={(e) => setCustomWeeks(e.target.value)}
                  sx={{ 
                    inputProps: { min: 1, max: 52 },
                    '& .MuiInputLabel-root': { color: 'white' },
                    '& .MuiInputBase-input': { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.5)' }
                    }
                  }}
                />
              )}
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={loading}
                  sx={{ 
                    bgcolor: loading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)', 
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
              {editable && !isEditing && (
                <Tooltip title="Edit Targets">
                  <IconButton 
                    onClick={handleEdit}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.1)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
              {isEditing && (
                <>
                  <Tooltip title="Save Changes">
                    <IconButton 
                      onClick={handleSave} 
                      disabled={patchLoading}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                      }}
                    >
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton 
                      onClick={handleCancel}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                      }}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Loading Indicator */}
        {loading && (
          <LinearProgress sx={{ mb: 3, borderRadius: 2, height: 6 }} />
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {data?.kpis?.map((kpi, index) => {
            const icons = {
              'patient_satisfaction': <PeopleIcon />,
              'treatment_success': <CheckIcon />,
              'service_quality': <HealthIcon />,
              'appointment_efficiency': <TimelineIcon />
            };
            
            const colors = {
              'patient_satisfaction': green[500],
              'treatment_success': blue[500],
              'service_quality': teal[500],
              'appointment_efficiency': purple[500]
            };

            return (
              <Grid item xs={12} sm={6} md={3} key={kpi.id}>
                <InfoCard
                  title={kpi.name}
                  count={kpi.formatted_result || numberFormat(kpi.result)}
                  icon={icons[kpi.id] || <ReportIcon />}
                  color={colors[kpi.id] || orange[500]}
                />
              </Grid>
            );
          })}
        </Grid>

        {/* Charts Section - Two charts per row like dashboard */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* First Row - Two Charts */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, height: '100%' }}>
              <CardHeader 
                title="Patient Satisfaction Trends" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ pb: 0 }}
              />
              <Divider />
              <CardContent sx={{ p: 2 }}>
                <ChartWrapper
                  options={{
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    chart: {
                      fontFamily: 'inherit',
                      background: 'transparent',
                      toolbar: { show: false }
                    },
                    xaxis: {
                      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
                    },
                    yaxis: {
                      title: {
                        text: 'Satisfaction Rate (%)'
                      },
                      max: 100
                    },
                    dataLabels: {
                      enabled: true,
                      formatter: function (val) {
                        return val + '%';
                      }
                    }
                  }}
                  series={[
                    {
                      name: 'Patient Satisfaction',
                      data: period === '7days' ? [
                        85, 88, 86, data?.kpis?.find(k => k.id === 'patient_satisfaction')?.result || 87
                      ] : period === '30days' ? [
                        90, 92, 88, data?.kpis?.find(k => k.id === 'patient_satisfaction')?.result || 87
                      ] : period === 'custom' ? [
                        Math.round(85 * (customWeeks / 4)),
                        Math.round(88 * (customWeeks / 4)),
                        Math.round(86 * (customWeeks / 4)),
                        Math.round((data?.kpis?.find(k => k.id === 'patient_satisfaction')?.result || 87) * (customWeeks / 4))
                      ] : [
                        85, 88, 86, data?.kpis?.find(k => k.id === 'patient_satisfaction')?.result || 87
                      ]
                    }
                  ]}
                  type="area"
                  height={280}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, height: '100%' }}>
              <CardHeader 
                title="Treatment Success Rate" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ pb: 0 }}
              />
              <Divider />
              <CardContent sx={{ p: 2 }}>
                <ChartWrapper
                  options={{
                    labels: ['Successful', 'In Progress', 'Cancelled'],
                    chart: {
                      fontFamily: 'inherit',
                      background: 'transparent',
                      toolbar: { show: false }
                    },
                    dataLabels: {
                      enabled: true,
                      formatter: function (val) {
                        return val + '%';
                      }
                    }
                  }}
                  series={[
                    period === '7days' ? [
                      data?.kpis?.find(k => k.id === 'treatment_success')?.result || 92,
                      5, 3
                    ] : period === '30days' ? [
                      (data?.kpis?.find(k => k.id === 'treatment_success')?.result || 92) + 3,
                      4, 2
                    ] : period === 'custom' ? [
                      Math.round((data?.kpis?.find(k => k.id === 'treatment_success')?.result || 92) * (customWeeks / 4)),
                      Math.round(5 * (customWeeks / 4)),
                      Math.round(3 * (customWeeks / 4))
                    ] : [
                      data?.kpis?.find(k => k.id === 'treatment_success')?.result || 92,
                      5, 3
                    ]
                  ]}
                  type="pie"
                  height={280}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Second Row - Two Charts */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, height: '100%' }}>
              <CardHeader 
                title="Service Quality Metrics" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ pb: 0 }}
              />
              <Divider />
              <CardContent sx={{ p: 2 }}>
                <ChartWrapper
                  options={{
                    labels: ['Excellent', 'Good', 'Fair', 'Poor'],
                    chart: {
                      fontFamily: 'inherit',
                      background: 'transparent',
                      toolbar: { show: false }
                    },
                    xaxis: {
                      categories: ['Excellent', 'Good', 'Fair', 'Poor']
                    },
                    yaxis: {
                      title: {
                        text: 'Service Quality (%)'
                      },
                      max: 100
                    },
                    dataLabels: {
                      enabled: true,
                      formatter: function (val) {
                        return val + '%';
                      }
                    }
                  }}
                  series={[
                    {
                      name: 'Service Quality',
                      data: period === '7days' ? [
                        65, 20, 10, 5
                      ] : period === '30days' ? [
                        data?.kpis?.find(k => k.id === 'service_quality')?.result || 78,
                        15, 5, 2
                      ] : period === 'custom' ? [
                        Math.round((data?.kpis?.find(k => k.id === 'service_quality')?.result || 78) * (customWeeks / 4)),
                        Math.round(15 * (customWeeks / 4)),
                        Math.round(5 * (customWeeks / 4)),
                        Math.round(2 * (customWeeks / 4))
                      ] : [
                        data?.kpis?.find(k => k.id === 'service_quality')?.result || 78,
                        15, 5, 2
                      ]
                    }
                  ]}
                  type="bar"
                  height={280}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, height: '100%' }}>
              <CardHeader 
                title="Appointment Efficiency" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ pb: 0 }}
              />
              <Divider />
              <CardContent sx={{ p: 2 }}>
                <ChartWrapper
                  options={{
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    chart: {
                      fontFamily: 'inherit',
                      background: 'transparent',
                      toolbar: { show: false }
                    },
                    xaxis: {
                      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
                    },
                    yaxis: {
                      title: {
                        text: 'Efficiency Rate (%)'
                      },
                      max: 100
                    },
                    dataLabels: {
                      enabled: true,
                      formatter: function (val) {
                        return val + '%';
                      }
                    }
                  }}
                  series={[
                    {
                      name: 'Appointment Efficiency',
                      data: period === '7days' ? [
                        70, 75, 72, 78, data?.kpis?.find(k => k.id === 'appointment_efficiency')?.result || 75
                      ] : period === '30days' ? [
                        80, 82, 78, 85, data?.kpis?.find(k => k.id === 'appointment_efficiency')?.result || 75
                      ] : period === 'custom' ? [
                        Math.round(70 * (customWeeks / 4)),
                        Math.round(75 * (customWeeks / 4)),
                        Math.round(72 * (customWeeks / 4)),
                        Math.round(78 * (customWeeks / 4)),
                        Math.round((data?.kpis?.find(k => k.id === 'appointment_efficiency')?.result || 75) * (customWeeks / 4))
                      ] : [
                        70, 75, 72, 78, data?.kpis?.find(k => k.id === 'appointment_efficiency')?.result || 75
                      ]
                    }
                  ]}
                  type="line"
                  height={280}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* KPI Table */}
        <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, mb: 4 }}>
          <CardHeader 
            title="Key Performance Indicators" 
            titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
            action={
              editable && !isEditing && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  Edit Targets
                </Button>
              )
            }
          />
          <Divider />
          <CardContent sx={{ p: 2 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>KPI</strong></TableCell>
                    <TableCell align="right"><strong>Target</strong></TableCell>
                    <TableCell align="right"><strong>Result</strong></TableCell>
                    <TableCell align="center"><strong>Performance</strong></TableCell>
                    <TableCell align="center"><strong>Trend</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.kpis?.map((kpi, index) => {
                    const calculatedTrend = kpi.trend || Math.round(((kpi.result - kpi.target) / kpi.target) * 100);
                    const performanceStatus = kpi.result < kpi.target ? 'Below Target' : kpi.result === kpi.target ? 'Target Achieved' : 'Above Target';
                    
                    return (
                      <TableRow key={kpi.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: `${getPerformanceColor(kpi.result, kpi.target)}20`,
                                color: getPerformanceColor(kpi.result, kpi.target),
                                fontSize: 14
                              }}
                            >
                              {kpi.id.includes('patient') && <PeopleIcon sx={{ fontSize: 16 }} />}
                              {kpi.id.includes('treatment') && <CheckIcon sx={{ fontSize: 16 }} />}
                              {kpi.id.includes('service') && <HealthIcon sx={{ fontSize: 16 }} />}
                              {kpi.id.includes('appointment') && <TimelineIcon sx={{ fontSize: 16 }} />}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500}>
                              {kpi.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {isEditing ? (
                            <TextField
                              type="number"
                              value={editedTargets[kpi.id] || kpi.target}
                              onChange={(e) => handleTargetChange(kpi.id, e.target.value)}
                              size="small"
                              sx={{ width: '100px' }}
                              InputProps={{
                                endAdornment: kpi.unit && <InputAdornment position="end">{kpi.unit}</InputAdornment>
                              }}
                            />
                          ) : (
                            <Typography variant="body2" fontWeight={500}>
                              {kpi.formatted_target || numberFormat(kpi.target)} {kpi.unit}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {kpi.formatted_result || numberFormat(kpi.result)} {kpi.unit}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={performanceStatus}
                            size="small"
                            sx={{
                              bgcolor: 
                                kpi.result < kpi.target ? orange[50] :
                                kpi.result === kpi.target ? green[50] :
                                blue[50],
                              color: 
                                kpi.result < kpi.target ? orange[700] :
                                kpi.result === kpi.target ? green[700] :
                                blue[700],
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            {calculatedTrend > 0 && (
                              <TrendingIcon fontSize="small" sx={{ color: green[600] }} />
                            )}
                            {calculatedTrend < 0 && (
                              <TrendingDownIcon fontSize="small" sx={{ color: red[600] }} />
                            )}
                            {calculatedTrend === 0 && (
                              <TrendingFlatIcon fontSize="small" sx={{ color: grey[600] }} />
                            )}
                            <Chip
                              label={`${calculatedTrend > 0 ? '+' : ''}${calculatedTrend}%`}
                              size="small"
                              sx={{ 
                                bgcolor: 
                                  calculatedTrend > 0 ? green[50] :
                                  calculatedTrend < 0 ? red[50] :
                                  grey[50],
                                color: 
                                  calculatedTrend > 0 ? green[700] :
                                  calculatedTrend < 0 ? red[700] :
                                  grey[700],
                                fontWeight: 500,
                                minWidth: '60px'
                              }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Summary and Recommendations */}
        <Grid container spacing={3}>
          {/* Summary */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2 }}>
              <CardHeader 
                title="Report Summary" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ pb: 0 }}
              />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Overall Performance
                    </Typography>
                    <Chip
                      label="Good"
                      size="small"
                      sx={{ bgcolor: blue[50], color: blue[700], fontWeight: 500 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Targets Achieved
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {data?.summary?.targets_achieved || 0} out of {data?.kpis?.length || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Completion Rate
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {data?.summary?.completion_rate || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={data?.summary?.completion_rate || 0}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2 }}>
              <CardHeader 
                title="Recommendations" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ pb: 0 }}
              />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  {data?.recommendations?.length > 0 ? (
                    data.recommendations.map((rec, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: cyan[100], color: cyan[600], fontSize: 12 }}>
                          {index + 1}
                        </Avatar>
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                          {rec}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: green[100], color: green[600], fontSize: 12 }}>
                          1
                        </Avatar>
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                          Focus on improving patient satisfaction scores to meet target goals
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: blue[100], color: blue[600], fontSize: 12 }}>
                          2
                        </Avatar>
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                          Enhance treatment protocols to increase success rates
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: orange[100], color: orange[600], fontSize: 12 }}>
                          3
                        </Avatar>
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                          Optimize appointment scheduling for better efficiency
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Page>
  );
};

export default OptometryPerformanceReportCard;
