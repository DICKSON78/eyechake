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
  Alert,
} from "@mui/material";
import {
  Person2Rounded as PatientIcon,
  AssessmentRounded as ClinicalNotesIcon,
  VisibilityRounded as EyeExamIcon,
  MedicationRounded as PrescriptionIcon,
  ScheduleRounded as ScheduleIcon,
  PeopleRounded as PeopleIcon,
  PersonAddRounded as NewPatientIcon,
  PersonSearchRounded as ReturnPatientIcon,
  CallMadeRounded as ReferralIcon,
  LocalHospitalRounded as ProcedureIcon,
} from "@mui/icons-material";
import {
  cyan,
  green,
  orange,
  purple,
  pink,
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
    "api/consultation-room/dashboard",
    dateParams,
    true,
    {
      summary: {
        total_consultations: 0,
        consultations_today: 0,
        scheduled_consultations: 0,
        pending_consultations: 0,
        completed_consultations: 0,
        total_patients_consulted: 0,
        clinical_notes_created: 0,
        prescriptions_written: 0,
        eye_examinations: 0,
        total_patients_seen: 0,
        total_patients_waiting: 0,
        new_patients_waiting: 0,
        return_patients_waiting: 0,
        referrals_made_today: 0,
      },
      statistics: {
        consultations_by_status: [],
        consultations_by_doctor: [],
        top_diagnosis: [],
        consultations_trend: [],
      },
    },
    (response) => response.data.data
  );


  useEffect(() => {
    document.title = `Consultation Room Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title="Consultation Room Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Consultation Room Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Consultation Room" },
        { title: "Consultation Room Dashboard" },
      ]}
    >
      <CardHeader
        title="Consultation Room Dashboard"
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        sx={{
          p: 0,
          mb: 3,
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formatError(error)}. Please try refreshing the page or contact support if the issue persists.
        </Alert>
      )}

      {(!loading && data) ? (
        <React.Fragment>
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mb: 4 }}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <InfoCard
                title="Total Patient Seen"
                count={numberFormat(data.summary?.total_patients_seen || 0)}
                icon={<PatientIcon />}
                color={green[400]}
                onClick={() => navigate('/consultation-room/patients-seen')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <InfoCard
                title="Total Patients Waiting"
                count={numberFormat(data.summary?.total_patients_waiting || 0)}
                icon={<PeopleIcon />}
                color={orange[400]}
                onClick={() => navigate('/consultation-room/patients-waiting')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <InfoCard
                title="New Patient Waiting"
                count={numberFormat(data.summary?.new_patients_waiting || 0)}
                icon={<NewPatientIcon />}
                color={cyan[400]}
                onClick={() => navigate('/consultation-room/patients-waiting/new')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <InfoCard
                title="Return Patient Waiting"
                count={numberFormat(data.summary?.return_patients_waiting || 0)}
                icon={<ReturnPatientIcon />}
                color={pink[400]}
                onClick={() => navigate('/consultation-room/patients-waiting/return')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <InfoCard
                title="Referral Made Today"
                count={numberFormat(data.summary?.referrals_made_today || 0)}
                icon={<ReferralIcon />}
                color={purple[400]}
                onClick={() => navigate('/consultation-room/referrals-today')}
              />
            </Grid>
          </Grid>

          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            justifyContent="stretch"
            sx={{
              "& .MuiCard-root": {
                minHeight: "100%",
              },
            }}
          >
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/consultation-room/consultation-patients/pending')}>
                        <PatientIcon sx={{ fontSize: 28.8, color: '#FF5722', mb: 1 }} />
                        <Typography variant="subtitle2">Start Consultation</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/consultation-room/clinical-notes')}>
                        <ClinicalNotesIcon sx={{ fontSize: 28.8, color: '#2196F3', mb: 1 }} />
                        <Typography variant="subtitle2">Clinical Notes</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/consultation-room/eye-examinations')}>
                        <EyeExamIcon sx={{ fontSize: 28.8, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="subtitle2">Eye Examination</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/consultation-room/prescriptions')}>
                        <PrescriptionIcon sx={{ fontSize: 28.8, color: '#9C27B0', mb: 1 }} />
                        <Typography variant="subtitle2">Prescription</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/consultation-room/procedure-requests')}>
                        <ProcedureIcon sx={{ fontSize: 28.8, color: purple[600], mb: 1 }} />
                        <Typography variant="subtitle2">Procedure Requests</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Consultation Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <PatientIcon sx={{ fontSize: 28.8, color: '#FF9800', mb: 1 }} />
                        <Typography variant="h6" color="#FF9800" fontWeight="bold">
                          {numberFormat(data.summary.consultations_today || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Today's Consultations</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <ScheduleIcon sx={{ fontSize: 28.8, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="h6" color="#4CAF50" fontWeight="bold">
                          {numberFormat(data.summary.scheduled_consultations || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Scheduled Today</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <ClinicalNotesIcon sx={{ fontSize: 28.8, color: '#2196F3', mb: 1 }} />
                        <Typography variant="h6" color="#2196F3" fontWeight="bold">
                          {numberFormat(data.summary.clinical_notes_created || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Notes Created</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <PrescriptionIcon sx={{ fontSize: 28.8, color: '#9C27B0', mb: 1 }} />
                        <Typography variant="h6" color="#9C27B0" fontWeight="bold">
                          {numberFormat(data.summary.prescriptions_written || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Prescriptions</Typography>
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
          <CircularProgress />
        </Box>
      )}
    </Page>
  );
};

export default Dashboard;
