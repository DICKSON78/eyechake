import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, CardHeader, Divider, Grid,
  Typography, CircularProgress, LinearProgress,
} from '@mui/material';
import {
  TrendingUpRounded as TrendingIcon,
  DiscountRounded as DiscountIcon,
} from '@mui/icons-material';
import { green, pink, orange, red } from '@mui/material/colors';

import Page from '../../../components/Page';
import InfoCard from '../../dashboard/InfoCard';
import KPIReportCardTable from '../../../components/reports/KPIReportCardTable';
import { useFetch, useToast } from '../../../hooks';
import { formatError, numberFormat, formatDateForDb } from '../../../helpers';

const KPICard = ({ kpi }) => {
  const percentage = kpi.target > 0 ? Math.min(100, Math.round((kpi.result / kpi.target) * 100)) : 0;
  const color = percentage >= 100 ? green[500] : percentage >= 75 ? orange[500] : red[500];
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>{kpi.name}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight={700} color={color}>{kpi.formatted_result}</Typography>
          <Typography variant="body2" color="text.secondary">Target: {kpi.formatted_target}</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{ height: 6, borderRadius: 3, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }}
        />
        <Typography variant="caption" color={color} sx={{ mt: 0.5, display: 'block' }}>{percentage}% of target</Typography>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const today = formatDateForDb(new Date());

  const { data, loading, error } = useFetch(
    'api/sales-management/dashboard',
    { start_date: today, end_date: today },
    true,
    { summary: { total_discounts: 0, sales_performance: 0, sales_target: 1500000 } },
    (response) => response.data.data
  );

  const { data: kpiData, loading: kpiLoading } = useFetch(
    'api/performance-reports/sales',
    { start_date: today, end_date: today },
    true,
    null,
    (response) => response.data.data
  );

  const { data: crmKpiData, loading: crmKpiLoading } = useFetch(
    'api/performance-reports/crm',
    { start_date: today, end_date: today },
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Sales Management Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) addToast({ message: formatError(error), severity: 'error' });
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title='Sales Management Dashboard'>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  const salesPerformance = data.summary?.sales_performance || 0;
  const kpis = kpiData?.kpis || [];

  return (
    <Page
      title='Sales Management Dashboard'
      breadcrumbs={[{ title: 'Home' }, { title: 'Sales Management' }, { title: 'Dashboard' }]}
    >
      <Typography variant='h4' fontWeight={700} sx={{ mb: 3 }}>Sales Management Dashboard</Typography>

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoCard
            title='Sales Performance'
            count={`${salesPerformance}%`}
            subtitle={`vs ${numberFormat(data.summary?.sales_target || 1500000)} target`}
            icon={<TrendingIcon />}
            color={salesPerformance >= 100 ? green[500] : salesPerformance >= 75 ? orange[500] : red[500]}
  
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoCard
            title='Total Discount'
            count={numberFormat(data.summary?.total_discounts || 0)}
            subtitle='Discounts given today'
            icon={<DiscountIcon />}
            color={pink[500]}
  
          />
        </Grid>
      </Grid>

      {/* KPI Report Cards */}
      {kpis.length>0 && <KPIReportCardTable title="SALES DEPARTMENT REPORT CARD" kpis={kpis} loading={kpiLoading} />}
      {crmKpiData?.kpis && <KPIReportCardTable title="CUSTOMER RELATION MANAGEMENT DEPARTMENT REPORT CARD" kpis={crmKpiData.kpis} loading={crmKpiLoading} />}
    </Page>
  );
};

export default Dashboard;
