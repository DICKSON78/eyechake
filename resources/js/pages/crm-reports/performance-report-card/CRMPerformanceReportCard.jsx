import React, { useState, useEffect } from 'react';
import {
  Box,
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
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Avatar,
  LinearProgress,
  Divider,
  Container,
  TextField,
  InputAdornment,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Phone as PhoneIcon,
  People as PeopleIcon,
  LocalActivityRounded as EventsIcon,
  Campaign as CampaignIcon,
  EmojiEvents as EmojiEventsIcon,
  Assessment as ReportIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import InfoCard from '../../dashboard/InfoCard';
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
  deepOrange,
  teal,
  pink,
  indigo,
  yellow,
  grey
} from '@mui/material/colors';

const CRMPerformanceReportCard = ({ 
  user, 
  editable = false,
  refreshTrigger = null 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTargets, setEditedTargets] = useState({});
  const { patch, loading: patchLoading } = usePatch('/api/performance-reports/crm/targets');
  const { showSuccess, showError } = useToast();

  const {
    data: performanceData,
    loading: performanceLoading,
    error: performanceError,
    handleFetch: fetchData
  } = useFetch('/api/performance-reports/crm', {
    dependencies: [refreshTrigger]
  });

  // Calculate performance metrics from real data
  const calculatedData = React.useMemo(() => {
    if (!performanceData?.data) return null;
    
    const apiData = performanceData.data;
    const calculatedKpis = apiData.kpis?.map(kpi => {
      // Calculate achievement rate
      const achievementRate = kpi.target > 0 ? Math.round((kpi.result / kpi.target) * 100) : 0;
      
      // Calculate trend (simulated for demo - in real app this would come from historical data)
      const trend = Math.round(((kpi.result - kpi.target) / kpi.target) * 100);
      
      // Determine performance status
      let performanceStatus = 'Below Target';
      let statusColor = orange[700];
      if (achievementRate >= 100) {
        performanceStatus = 'Above Target';
        statusColor = blue[700];
      } else if (achievementRate >= 90) {
        performanceStatus = 'Target Achieved';
        statusColor = green[700];
      }
      
      return {
        ...kpi,
        achievement_rate: achievementRate,
        performance_status: performanceStatus,
        status_color: statusColor,
        calculated_trend: trend,
        formatted_result: kpi.unit === 'TZS' ? numberFormat(kpi.result) : `${kpi.result}${kpi.unit || ''}`,
        formatted_target: kpi.unit === 'TZS' ? numberFormat(kpi.target) : `${kpi.target}${kpi.unit || ''}`
      };
    }) || [];
    
    // Calculate summary metrics
    const targetsAchieved = calculatedKpis.filter(kpi => kpi.achievement_rate >= 100).length;
    const totalKpis = calculatedKpis.length;
    const completionRate = totalKpis > 0 ? Math.round((targetsAchieved / totalKpis) * 100) : 0;
    
    // Generate recommendations based on performance
    const recommendations = [];
    const belowTargetKpis = calculatedKpis.filter(kpi => kpi.achievement_rate < 80);
    
    if (belowTargetKpis.length > 0) {
      recommendations.push(`Focus on improving ${belowTargetKpis.map(kpi => kpi.name).join(', ')} to meet performance targets`);
    }
    
    if (calculatedKpis.some(kpi => kpi.id === 'contacts_made' && kpi.achievement_rate < 80)) {
      recommendations.push('Increase daily contact targets through better time management and prospecting');
    }
    
    if (calculatedKpis.some(kpi => kpi.id === 'conversion_rate' && kpi.achievement_rate < 80)) {
      recommendations.push('Enhance conversion techniques through training and better product knowledge');
    }
    
    if (calculatedKpis.some(kpi => kpi.id === 'follow_up_calls' && kpi.achievement_rate < 80)) {
      recommendations.push('Implement systematic follow-up schedule to improve engagement and conversion');
    }
    
    return {
      ...apiData,
      kpis: calculatedKpis,
      summary: {
        targets_achieved: targetsAchieved,
        total_kpis: totalKpis,
        completion_rate: completionRate,
        overall_performance: completionRate >= 80 ? 'Good' : completionRate >= 60 ? 'On Track' : 'Needs Improvement'
      },
      recommendations: recommendations.length > 0 ? recommendations : [
        'Maintain current performance levels and continue monitoring',
        'Focus on continuous improvement through training and development'
      ],
      calculated_at: new Date().toISOString()
    };
  }, [performanceData]);

  useEffect(() => {
    if (performanceData) {
      console.log('CRM Performance Data:', performanceData);
      // Backend returns: {message, data: {...}} - we need the nested data
      console.log('Performance data received successfully');
    }
  }, [performanceData]);

  const handleEdit = () => {
    setIsEditing(true);
    const targets = {};
    if (calculatedData?.kpis) {
      calculatedData.kpis.forEach(kpi => {
        targets[kpi.id] = kpi.target;
      });
    }
    setEditedTargets(targets);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await patch('/api/performance-reports/crm/targets', {
        targets: editedTargets
      });
      addToast('Targets updated successfully', 'success');
      setIsEditing(false);
      // Refresh data
      fetchData();
    } catch (error) {
      addToast('Failed to update targets', 'error');
    } finally {
      setLoading(false);
    }
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
    setIsRefreshing(true);
    fetchData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getPerformanceColor = (result, target) => {
    if (target === 0) return grey[500];
    const percentage = (result / target) * 100;
    if (percentage < 100) return orange[500]; // Below Target
    if (percentage === 100) return green[500]; // Target Achieved
    return blue[500]; // Above Target
  };

  const getIndicatorColor = (result, target) => {
    if (target === 0) return 'default';
    const percentage = (result / target) * 100;
    if (percentage < 100) return 'warning'; // Yellow
    if (percentage === 100) return 'success'; // Green
    return 'info'; // Blue
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingIcon sx={{ color: green[500] }} />;
    if (trend < 0) return <TrendingDownIcon sx={{ color: red[500] }} />;
    return <TrendingFlatIcon sx={{ color: grey[500] }} />;
  };

  if (performanceLoading && !performanceData) {
    return (
      <Page title="CRM Report Card">
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </Box>
      </Page>
    );
  }

  if (performanceError || !performanceData) {
    return (
      <Page title="CRM Report Card">
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load CRM performance data. Please try again.
          </Alert>
          <Button variant="contained" onClick={handleRefresh} startIcon={<RefreshIcon />}>
            Retry
          </Button>
        </Box>
      </Page>
    );
  }

  return (
    <Page title="CRM Report Card">
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
                CRM Report Card
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                Track CRM performance metrics, contact rates, and lead conversion with real-time updates
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                <Chip
                  label={`Updated: ${formatDate(new Date())}`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 500 }}
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
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={performanceLoading}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <RefreshIcon />
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
                      disabled={loading}
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
        {performanceLoading && (
          <LinearProgress sx={{ mb: 3, borderRadius: 2, height: 6 }} />
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {calculatedData?.kpis?.map((kpi, index) => {
            const icons = {
              'called_contacts': <PhoneIcon />,
              'marketing_glass_leads': <CampaignIcon />,
              'contact_success_rate': <CheckIcon />,
              'leads_generated': <PeopleIcon />,
              'converted_leads': <EmojiEventsIcon />
            };
            
            const colors = {
              'called_contacts': green[500],
              'marketing_glass_leads': blue[500],
              'contact_success_rate': teal[500],
              'leads_generated': purple[500],
              'converted_leads': cyan[500]
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
                  {calculatedData?.kpis?.map((kpi, index) => {
                    const calculatedTrend = kpi.calculated_trend || 0;
                    const performanceStatus = kpi.performance_status || 'Below Target';
                    
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
                              {kpi.id.includes('contact') && <PhoneIcon sx={{ fontSize: 16 }} />}
                              {kpi.id.includes('lead') && <PeopleIcon sx={{ fontSize: 16 }} />}
                              {kpi.id.includes('success') && <CheckIcon sx={{ fontSize: 16 }} />}
                              {kpi.id.includes('conversion') && <EmojiEventsIcon sx={{ fontSize: 16 }} />}
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
                                kpi.achievement_rate < 80 ? orange[50] :
                                kpi.achievement_rate === 100 ? green[50] :
                                blue[50],
                              color: 
                                kpi.achievement_rate < 80 ? orange[700] :
                                kpi.achievement_rate === 100 ? green[700] :
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

          {/* Recommendations */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, height: '100%' }}>
              <CardHeader 
                title="Recommendations" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                avatar={
                  <Avatar sx={{ bgcolor: teal[100], color: teal[700] }}>
                    <CampaignIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="body1" paragraph>
                  {calculatedData?.summary?.overall_performance || 'Continue following up with pending contacts and focus on converting marketing leads to sales.'}
                </Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {calculatedData?.recommendations_list?.map((rec, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: blue[50], color: blue[700] }}>
                        <CheckIcon sx={{ fontSize: 14 }} />
                      </Avatar>
                      <Typography variant="body2">{rec}</Typography>
                    </Box>
                  )) || (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: blue[50], color: blue[700] }}>
                          <CheckIcon sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Typography variant="body2">Focus on calling unreachable leads during peak hours</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: blue[50], color: blue[700] }}>
                          <CheckIcon sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Typography variant="body2">Increase follow-up attempts for warm leads</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: blue[50], color: blue[700] }}>
                          <CheckIcon sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Typography variant="body2">Schedule appointments for interested prospects</Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

        {/* Summary Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Summary */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, height: '100%' }}>
              <CardHeader 
                title="Report Summary" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                avatar={
                  <Avatar sx={{ bgcolor: purple[100], color: purple[700] }}>
                    <ReportIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Overall Performance
                    </Typography>
                    <Chip
                      label={calculatedData?.summary?.overall_performance || 'On Track'}
                      size="small"
                      sx={{ 
                        bgcolor: calculatedData?.summary?.overall_performance === 'Excellent' ? green[50] :
                                calculatedData?.summary?.overall_performance === 'Good' ? blue[50] :
                                calculatedData?.summary?.overall_performance === 'On Track' ? orange[50] :
                                red[50],
                        color: calculatedData?.summary?.overall_performance === 'Excellent' ? green[700] :
                                calculatedData?.summary?.overall_performance === 'Good' ? blue[700] :
                                calculatedData?.summary?.overall_performance === 'On Track' ? orange[700] :
                                red[700],
                        fontWeight: 500
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Targets Achieved
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {calculatedData?.summary?.targets_achieved || 0} out of {calculatedData?.kpis?.length || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Completion Rate
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {calculatedData?.summary?.completion_rate || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculatedData?.summary?.completion_rate || 0}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, height: '100%' }}>
              <CardHeader 
                title="Recommendations" 
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                avatar={
                  <Avatar sx={{ bgcolor: teal[100], color: teal[700] }}>
                    <CampaignIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {calculatedData?.recommendations && Array.isArray(calculatedData.recommendations) ? (
                    calculatedData.recommendations.map((rec, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: teal[100], color: teal[600], fontSize: 12 }}>
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
                        <Avatar sx={{ width: 24, height: 24, bgcolor: blue[100], color: blue[600], fontSize: 12 }}>
                          1
                        </Avatar>
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                          Focus on improving Patient Contact Status - Not Called, Patient Contact Status - Unreachable, Marketing Glass Leads to meet performance targets
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

export default CRMPerformanceReportCard;