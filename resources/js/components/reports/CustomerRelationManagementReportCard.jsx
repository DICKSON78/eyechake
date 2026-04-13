import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
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
  TextField,
  Stack,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  EmojiEvents as EmojiEventsIcon,
  Assessment as ReportIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import InfoCard from '../../pages/dashboard/InfoCard';
import { useFetch, useToast } from '../../hooks';
import { numberFormat, formatDate } from '../../helpers';
import Page from '../../components/Page';
import KPIReportCardTable from './KPIReportCardTable';
import {
  green, orange, red, blue, purple, cyan, teal, grey
} from '@mui/material/colors';


const CustomerRelationManagementReportCard = ({
  user,
  editable = false,
  refreshTrigger = null
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTargets, setEditedTargets] = useState({});
  const [editedRemarks, setEditedRemarks] = useState('');
  const [editedRecommendations, setEditedRecommendations] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculate weekly range from selectedDate (Monday to Sunday)
  const weekRange = React.useMemo(() => {
    const date = selectedDate ? new Date(selectedDate) : new Date();
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start_date: monday.toISOString().split('T')[0],
      end_date: sunday.toISOString().split('T')[0],
    };
  }, [selectedDate]);
  const [saving, setSaving] = useState(false);

  // Toast hook
  const addToast = useToast();

  // Fetch KPI data from API
  const {
    data: performanceData,
    loading: performanceLoading,
    error: performanceError,
    handleFetch: fetchData
  } = useFetch('/api/performance-reports/crm', weekRange);

  // Fetch saved targets from DB
  const {
    data: targetsData,
    loading: targetsLoading,
  } = useFetch('/api/department-performance/crm/targets', {
    dependencies: [refreshTrigger]
  });

  // ─── Calculate KPIs: result / target * 100 = achievement % ───────────────
  const calculatedData = React.useMemo(() => {
    if (!performanceData?.data) return null;

    const apiData = performanceData.data;
    const targetsArray = Array.isArray(targetsData)
      ? targetsData
      : (targetsData?.data || []);

    const calculatedKpis = (apiData.kpis || []).map(kpi => {
      // Match saved target by kpi_name OR kpi_id
      const targetRecord = targetsArray.find(t =>
        t.kpi_name?.toLowerCase() === kpi.name?.toLowerCase() ||
        t.kpi_name?.toLowerCase() === kpi.id?.toLowerCase()
      );

      const finalTarget = parseFloat(targetRecord?.target_value ?? kpi.target ?? 0);

      // CORE CALCULATION: count / target * 100
      const achievementRate = finalTarget > 0
        ? Math.min(Math.round((kpi.result / finalTarget) * 100), 999)
        : 0;

      // Status based on achievement %
      let status = 'default';
      let statusLabel = finalTarget > 0 ? 'Below Target' : 'No Target Set';
      if (finalTarget > 0) {
        if (achievementRate >= 100) { status = 'success'; statusLabel = 'Target Achieved'; }
        else if (achievementRate >= 75) { status = 'warning'; statusLabel = 'On Track'; }
        else if (achievementRate >= 50) { status = 'error'; statusLabel = 'Below Target'; }
        else { status = 'error'; statusLabel = 'Critical'; }
      }

      return {
        ...kpi,
        target: finalTarget,
        achievement_rate: achievementRate,
        status,
        statusLabel,
        // These go to KPIReportCardTable
        description: kpi.name,
        // results shown as "40 (40%)" — count + percentage
        results: finalTarget > 0
          ? `${numberFormat(kpi.result)} (${achievementRate}%)`
          : `${numberFormat(kpi.result)}`,
        formatted_target: numberFormat(finalTarget),
        formatted_result: numberFormat(kpi.result),
        _r: kpi.result,
        _t: finalTarget,
      };
    });

    const targetsAchieved = calculatedKpis.filter(k => k.achievement_rate >= 100).length;
    const totalKpis = calculatedKpis.length;
    const completionRate = totalKpis > 0
      ? Math.round((targetsAchieved / totalKpis) * 100)
      : 0;

    return {
      ...apiData,
      kpis: calculatedKpis,
      summary: {
        targets_achieved: targetsAchieved,
        total_kpis: totalKpis,
        completion_rate: completionRate,
        overall_performance: completionRate >= 90 ? 'Excellent'
          : completionRate >= 75 ? 'Good'
          : completionRate >= 50 ? 'On Track'
          : 'Needs Improvement'
      }
    };
  }, [performanceData, targetsData]);

  // Sync edit fields when data loads
  useEffect(() => {
    if (calculatedData) {
      setEditedRemarks(calculatedData.remarks || '');
      const recs = calculatedData.recommendations;
      setEditedRecommendations(
        Array.isArray(recs) ? recs.join('\n') : (recs || '')
      );
      // Init targets: {kpi_id: target_value}
      const targets = {};
      calculatedData.kpis.forEach(kpi => {
        targets[kpi.id] = kpi.target || 0;
      });
      setEditedTargets(targets);
    }
  }, [calculatedData]);

  // ─── Save: targets + remarks + recommendations ────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save targets — send {kpi_id: value} to match PerformanceDashboardController
      await axios.patch('/api/performance-reports/crm/targets', {
        targets: editedTargets   // e.g. {called_contacts: 100, marketing_glass_leads: 40}
      });

      // 2. Save remarks & recommendations
      await axios.patch('/api/performance-reports/crm/report', {
        remarks: editedRemarks,
        recommendations: editedRecommendations,
        date: new Date().toISOString().split('T')[0]
      });

      addToast({ message: 'CRM report updated successfully', severity: 'success' });
      setIsEditing(false);
      if (fetchData && typeof fetchData === 'function') fetchData();

    } catch (err) {
      console.error('Save error:', err);
      addToast({
        message: 'Failed to update: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to current saved values
    if (calculatedData) {
      setEditedRemarks(calculatedData.remarks || '');
      const recs = calculatedData.recommendations;
      setEditedRecommendations(
        Array.isArray(recs) ? recs.join('\n') : (recs || '')
      );
      const targets = {};
      calculatedData.kpis.forEach(kpi => { targets[kpi.id] = kpi.target || 0; });
      setEditedTargets(targets);
    }
  };

  const handleEdit = () => setIsEditing(true);

  // ─── Loading / Error states ───────────────────────────────────────────────
  if (performanceLoading && !performanceData) {
    return (
      <Page title="CRM Report Card">
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  if (performanceError || !performanceData?.data) {
    return (
      <Page title="CRM Report Card">
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load CRM performance data. Please try again.
          </Alert>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={() => fetchData()}>
            Retry
          </Button>
        </Box>
      </Page>
    );
  }

  const kpis = calculatedData?.kpis || [];

  // Icons & colors per KPI id
  const kpiIcons = {
    called_contacts:      <PhoneIcon />,
    not_called_contacts:  <PeopleIcon />,
    unreachable_contacts: <CampaignIcon />,
    marketing_glass_leads: <CheckIcon />,
  };
  const kpiColors = {
    called_contacts:      green[500],
    not_called_contacts:  orange[500],
    unreachable_contacts: red[500],
    marketing_glass_leads: blue[500],
  };

  // Refresh function for table data
  const handleRefresh = () => {
    if (fetchData && typeof fetchData === 'function') {
      fetchData();
    }
  };

  return (
    <Page title="CRM Report Card">
      <Box sx={{ p: 1 }}>

        {/* ── KPI Table (PDF + Filter + Edit remarks inside) ── */}
        <KPIReportCardTable
          title="CUSTOMER RELATION MANAGEMENT DEPARTMENT REPORT CARD"
          kpis={kpis}
          loading={performanceLoading || targetsLoading}
          canEdit={calculatedData?.can_edit || false}
          department="crm"
          date={selectedDate}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onRefresh={handleRefresh}
          recommendations={
            Array.isArray(calculatedData?.recommendations)
              ? calculatedData.recommendations.join('\n')
              : (calculatedData?.recommendations || '')
          }
        />

        {/* ── Edit Recommendations (when isEditing) ── */}
        {isEditing && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={12}>
              <Card>
                <CardHeader
                  title="Recommendations"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                  avatar={<Avatar sx={{ bgcolor: teal[100], color: teal[700] }}><CampaignIcon /></Avatar>}
                />
                <Divider />
                <CardContent>
                  <TextField
                    fullWidth multiline rows={4}
                    value={editedRecommendations}
                    onChange={e => setEditedRecommendations(e.target.value)}
                    placeholder="Enter performance recommendations..."
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

      </Box>
    </Page>
  );
};

export default CustomerRelationManagementReportCard;