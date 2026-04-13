import React, { useState } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useFetch, useToast } from '../../../hooks';
import { numberFormat } from '../../../helpers';
import Page from '../../../components/Page';
import KPIReportCardTable from '../../../components/reports/KPIReportCardTable';

// Safe toast — prevents "W is not a function" crash after minification
const safeToast = (fn, message) => {
  if (fn && typeof fn === 'function') {
    try { fn(message); } catch (e) { console.warn('Toast failed:', e); }
  }
};

const CustomerRelationManagementReportCard = ({
  user,
  editable = false,
  refreshTrigger = null
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Safe toast destructuring
  const toastHook = useToast();
  const showSuccess = toastHook?.showSuccess || null;
  const showError = toastHook?.showError || null;

  // Fetch KPI data from API
  const {
    data: performanceData,
    loading: performanceLoading,
    error: performanceError,
    handleFetch: fetchData
  } = useFetch('/api/performance-reports/crm', {
    dependencies: [refreshTrigger]
  });

  // Fetch saved targets from DB
  const {
    data: targetsData,
    loading: targetsLoading,
  } = useFetch('/api/department-performance/crm/targets', {
    dependencies: [refreshTrigger]
  });

  // Calculate KPIs: result / target * 100 = achievement %
  const calculatedData = React.useMemo(() => {
    if (!performanceData?.data) return null;

    const apiData = performanceData.data;
    const targetsArray = Array.isArray(targetsData)
      ? targetsData
      : (targetsData?.data || []);

    const calculatedKpis = (apiData.kpis || []).map(kpi => {
      const targetRecord = targetsArray.find(t =>
        t.kpi_name?.toLowerCase() === kpi.name?.toLowerCase() ||
        t.kpi_name?.toLowerCase() === kpi.id?.toLowerCase()
      );

      const finalTarget = parseFloat(targetRecord?.target_value ?? kpi.target ?? 0);

      // CORE: count / target * 100
      const achievementRate = finalTarget > 0
        ? Math.min(Math.round((kpi.result / finalTarget) * 100), 999)
        : 0;

      // Status for chip color
      let status = 'default';
      if (finalTarget > 0) {
        if (achievementRate >= 100) status = 'success';
        else if (achievementRate >= 75) status = 'warning';
        else status = 'error';
      }

      return {
        ...kpi,
        target: finalTarget,
        achievement_rate: achievementRate,
        status,
        description: kpi.name,
        // results: count (%) — shown in table
        results: finalTarget > 0
          ? `${numberFormat(kpi.result)} (${achievementRate}%)`
          : `${numberFormat(kpi.result)}`,
        formatted_target: numberFormat(finalTarget),
        formatted_result: numberFormat(kpi.result),
        _r: kpi.result,
        _t: finalTarget,
      };
    });

    return {
      ...apiData,
      kpis: calculatedKpis,
    };
  }, [performanceData, targetsData]);

  // Loading state
  if (performanceLoading && !performanceData) {
    return (
      <Page title="CRM Report Card">
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  // Error state
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

  return (
    <Page title="CRM Report Card">
      <Box sx={{ p: 3 }}>
        <KPIReportCardTable
          title="CUSTOMER RELATION MANAGEMENT DEPARTMENT REPORT CARD"
          kpis={calculatedData?.kpis || []}
          loading={performanceLoading || targetsLoading}
          canEdit={calculatedData?.can_edit || false}
          department="crm"
          date={selectedDate}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          remarks={calculatedData?.remarks || ''}
          recommendations={
            Array.isArray(calculatedData?.recommendations)
              ? calculatedData.recommendations.join('\n')
              : (calculatedData?.recommendations || '')
          }
        />
      </Box>
    </Page>
  );
};

export default CustomerRelationManagementReportCard;