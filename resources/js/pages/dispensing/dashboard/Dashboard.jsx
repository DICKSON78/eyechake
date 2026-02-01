import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  MedicationRounded as DispensingIcon,
  Person2Rounded as PatientIcon,
  AssignmentRounded as RequestsIcon,
  CheckCircleRounded as CompletedIcon,
  ScheduleRounded as PendingIcon,
  LibraryBooksRounded as ReportsIcon,
  InventoryRounded as StockIcon,
  TrendingUpRounded as DispensedIcon,
} from "@mui/icons-material";
import {
  blue,
  cyan,
  green,
  orange,
  purple,
  teal,
  pink,
  lime,
} from "@mui/material/colors";

import Page from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, getWeekStartDate, getWeekEndDate } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  // Set up date parameters for weekly filtering
  const [dateParams, setDateParams] = useState({
    start_date: getWeekStartDate().toISOString().split('T')[0],
    end_date: getWeekEndDate().toISOString().split('T')[0],
  });

  const { data, loading, error } = useFetch(
    "api/dispensing/dashboard",
    dateParams,
    true,
    {
      summary: {
        total_dispensed: 0,
        pending_requests: 0,
        completed_today: 0,
        items_dispensed: 0,
      },
      statistics: {
        dispensing_trend: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Dispensing Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title="Dispensing Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Dispensing Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Dispensing" },
        { title: "Dispensing Dashboard" },
      ]}
    >
      <CardHeader
        title="Dispensing Dashboard"
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        sx={{
          p: 0,
          mb: 2,
        }}
      />
      {!loading && data ? (
        <React.Fragment>
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mb: 4 }}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Dispensed"
                count={numberFormat(data.summary?.total_dispensed || 0)}
                icon={<DispensingIcon />}
                color={green[400]}
                onClick={() => navigate('/dispensing/reports/items-dispensed')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Pending Requests"
                count={numberFormat(data.summary?.pending_requests || 0)}
                icon={<PendingIcon />}
                color={orange[400]}
                onClick={() => navigate('/dispensing/dispensing-requests')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Completed Today"
                count={numberFormat(data.summary?.completed_today || 0)}
                icon={<CompletedIcon />}
                color={cyan[500]}
                onClick={() => navigate('/dispensing/reports/items-dispensed')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Items Dispensed"
                count={numberFormat(data.summary?.items_dispensed || 0)}
                icon={<DispensedIcon />}
                color={purple[400]}
                onClick={() => navigate('/dispensing/reports/items-dispensed')}
              />
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={{ xs: 1, sm: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/dispensing/dispensing-requests')}>
                        <RequestsIcon sx={{ fontSize: 28.8, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="subtitle2">Process Request</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/reception/patients')}>
                        <PatientIcon sx={{ fontSize: 28.8, color: '#2196F3', mb: 1 }} />
                        <Typography variant="subtitle2">Patient Records</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/inventory-management/dashboard')}>
                        <StockIcon sx={{ fontSize: 28.8, color: '#FF9800', mb: 1 }} />
                        <Typography variant="subtitle2">Check Stock</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/dispensing/reports')}>
                        <ReportsIcon sx={{ fontSize: 28.8, color: '#9C27B0', mb: 1 }} />
                        <Typography variant="subtitle2">Dispensing Reports</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography variant="h6" gutterBottom>
                    Dispensing Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e8', borderRadius: 2 }}>
                        <DispensingIcon sx={{ fontSize: 28.8, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="h4" color="#4CAF50" fontWeight="normal">
                          {numberFormat(data.summary?.total_dispensed || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Total Dispensed</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                        <PendingIcon sx={{ fontSize: 28.8, color: '#FF9800', mb: 1 }} />
                        <Typography variant="h4" color="#FF9800" fontWeight="normal">
                          {numberFormat(data.summary?.pending_requests || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Pending Requests</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                        <CompletedIcon sx={{ fontSize: 28.8, color: '#2196F3', mb: 1 }} />
                        <Typography variant="h4" color="#2196F3" fontWeight="normal">
                          {numberFormat(data.summary?.completed_today || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Completed Today</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                        <DispensedIcon sx={{ fontSize: 28.8, color: '#9C27B0', mb: 1 }} />
                        <Typography variant="h4" color="#9C27B0" fontWeight="normal">
                          {numberFormat(data.summary?.items_dispensed || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Items Dispensed</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </React.Fragment>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6">No data available.</Typography>
        </Box>
      )}
    </Page>
  );
};

export default Dashboard;
