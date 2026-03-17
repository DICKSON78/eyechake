import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Paper,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assessment as ReportIcon,
  ShoppingCart as SalesIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import Page from '../../components/Page';

const SalesReports = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect directly to performance report card
    navigate('/sales-reports/performance-report-card');
  }, [navigate]);

  // Show loading or redirecting message
  return (
    <Page
      title="Sales Reports"
      breadcrumbs={[
        { title: 'Home' },
        { title: 'Sales Reports' },
      ]}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6" color="text.secondary">
          Loading Sales Report Card...
        </Typography>
      </Box>
    </Page>
  );
};

export default SalesReports;
