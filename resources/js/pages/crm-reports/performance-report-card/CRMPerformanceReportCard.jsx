import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Fab
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingIcon,
  TrendingFlat as TrendingFlatIcon,
  Phone as PhoneIcon,
  People as PeopleIcon,
  LocalActivityRounded as EventsIcon,
  Campaign as CampaignIcon,
  EmojiEvents as EmojiEventsIcon,
  Assessment as ReportIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import InfoCard from '../../dashboard/InfoCard';
import { useFetch, useToast, usePatch } from '../../../hooks';
import { numberFormat, formatDate } from '../../../helpers';
import Page from '../../../components/Page';
import KPIReportCardTable from '../../../components/reports/KPIReportCardTable';
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
  const [editedRemarks, setEditedRemarks] = useState('');
  const [editedRecommendations, setEditedRecommendations] = useState('');
  const { patch, loading: patchLoading } = usePatch('/api/performance-reports/crm/targets');
  const { showSuccess, showError } = useToast();

  // Enhanced filtering states
  const [filterType, setFilterType] = useState('week');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const {
    data: performanceData,
    loading: performanceLoading,
    error: performanceError,
    handleFetch: fetchData
  } = useFetch('/api/performance-reports/crm', {
    dependencies: [refreshTrigger, filterType, selectedWeek, selectedMonth, selectedYear]
  });

  // Fetch CRM targets from database
  const {
    data: targetsData,
    loading: targetsLoading,
    error: targetsError
  } = useFetch('/api/department-performance/crm/targets', {
    dependencies: [refreshTrigger]
  });

  // Calculate performance metrics from real data
  const calculatedData = React.useMemo(() => {
    if (!performanceData?.data) return null;
    
    const apiData = performanceData.data;
    const calculatedKpis = apiData.kpis?.map(kpi => {
      // Find matching target from database
      const targetRecord = targetsData?.find(target => 
        target.kpi_name?.toLowerCase() === kpi.name?.toLowerCase()
      );
      
      // Use database target or fallback to current target
      const finalTarget = targetRecord?.target_value || kpi.target || 0;
      
      // Calculate achievement rate
      const achievementRate = finalTarget > 0 ? Math.round((kpi.result / finalTarget) * 100) : 0;
      
      // Determine performance status
      let performanceStatus = 'Please set targets';
      let statusColor = grey[600];
      
      if (finalTarget > 0) {
        if (achievementRate >= 100) {
          performanceStatus = 'Target Achieved';
          statusColor = green[600];
        } else if (achievementRate >= 80) {
          performanceStatus = 'On Track';
          statusColor = blue[600];
        } else if (achievementRate >= 50) {
          performanceStatus = 'Below Target';
          statusColor = orange[600];
        } else {
          performanceStatus = 'Critical';
          statusColor = red[600];
        }
      }

      return {
        ...kpi,
        target: finalTarget, // Use database target
        achievement_rate: achievementRate,
        performance_status: performanceStatus,
        status_color: statusColor,
        formatted_result: `${numberFormat(kpi.result)}${kpi.unit || ''}`,
        formatted_target: `${numberFormat(finalTarget)}${kpi.unit || ''}`
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
  }, [performanceData, targetsData]);

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

  useEffect(() => {
    if (performanceData) {
      console.log('CRM Performance Data:', performanceData);
      // Backend returns: {message, data: {...}} - we need the nested data
    }
  }, [performanceData]);

  const handleEdit = () => {
    const targets = {};
    calculatedData?.kpis?.forEach(kpi => {
      targets[kpi.id] = kpi.target;
    });
    setEditedTargets(targets);
    setEditedRemarks(calculatedData?.remarks || '');
    setEditedRecommendations(calculatedData?.recommendations || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // 1. Save Targets
      await patch({ targets: editedTargets });
      
      // 2. Save Remarks/Recommendations if changed
      await axios.patch(`/api/performance-reports/crm/report`, {
        remarks: editedRemarks,
        recommendations: editedRecommendations,
        date: new Date().toISOString()
      });

      showSuccess('Report analysis updated successfully');
      setIsEditing(false);
      if (refreshTrigger && typeof refreshTrigger === 'function') {
        refreshTrigger();
      }
      if (fetchData && typeof fetchData === 'function') {
        fetchData();
      }
    } catch (err) {
      showError('Failed to update analysis: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTargets({});
    setEditedRemarks('');
    setEditedRecommendations('');
  };

  // Transform CRM data to KPI format for KPIReportCardTable
  const transformCRMDataToKPIs = (data) => {
    if (!data?.kpis) return [];
    
    return data.kpis.map(kpi => {
      const achievementRate = kpi.achievement_rate || 0;
      let status = 'default';
      
      if (achievementRate >= 100) {
        status = 'success';
      } else if (achievementRate >= 75) {
        status = 'warning';
      } else if (achievementRate > 0) {
        status = 'error';
      }
      
      return {
        description: kpi.name,
        target: `${kpi.formatted_target || numberFormat(kpi.target)} ${kpi.unit || ''}`,
        results: `${kpi.formatted_result || numberFormat(kpi.result)} ${kpi.unit || ''}`,
        status: status,
        _r: kpi.result, // Raw result for progress calculation
        _t: kpi.target  // Raw target for progress calculation
      };
    });
  };

  const handleTargetChange = (kpiId, value) => {
    setEditedTargets(prev => ({
      ...prev,
      [kpiId]: value
    }));
  };

  const handleRefresh = () => {
    fetchData();
  };

  const getPerformanceColor = (result, target) => {
    if (target === 0) return grey[500];
    const percentage = (result / target) * 100;
    if (percentage < 100) return orange[500]; // Below Target
    if (percentage === 100) return green[500]; // Target Achieved
    return blue[500]; // Above Target
  };


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
              {calculatedData?.can_edit && !isEditing && (
                <Tooltip title="Edit Analysis & Targets">
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
        <KPIReportCardTable 
          title="CUSTOMER RELATION MANAGEMENT DEPARTMENT WEEKLY REPORT CARD"
          kpis={transformCRMDataToKPIs(calculatedData)}
          loading={performanceLoading || targetsLoading}
          canEdit={true}
          department="crm"
          date={new Date().toISOString()}
          remarks={calculatedData?.remarks || ''}
          recommendations={calculatedData?.recommendations || ''}
        />

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
                {/* Display current recommendations */}
                <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
                  Recommendations
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'text.secondary', 
                  fontStyle: 'italic', 
                  lineHeight: 1.6,
                  mb: 3,
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  {calculatedData?.recommendations || 'No recommendations available for this period.'}
                </Typography>
                
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={editedRemarks}
                    onChange={(e) => setEditedRemarks(e.target.value)}
                    placeholder="Enter overall performance remarks..."
                    variant="outlined"
                  />
                ) : (
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.6 }}>
                    {calculatedData?.remarks || 'No remarks provided for this period.'}
                  </Typography>
                )}
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