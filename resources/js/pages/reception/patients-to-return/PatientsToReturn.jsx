import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import {
  EventNoteRounded as CalendarIcon,
  PersonRounded as PersonIcon,
  PhoneRounded as PhoneIcon,
  EmailRounded as EmailIcon,
  VisibilityRounded as ViewIcon,
  RefreshRounded as RefreshIcon,
  StarRounded as VipIcon,
  BusinessRounded as BusinessIcon,
  VolunteerActivismRounded as OutreachIcon,
  CheckCircleRounded as CheckInIcon,
  WarningRounded as OverdueIcon,
  TodayRounded as TodayIcon,
} from "@mui/icons-material";
import { orange, red, green, blue, purple, cyan, pink } from "@mui/material/colors";

import Page from "../../../components/Page";
import Modal from "../../../components/Modal";
import { useFetch, useToast } from "../../../hooks";
import { formatError, formatDate } from "../../../helpers";

const PatientsToReturn = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();

  const [params, setParams] = useState({
    start_date: undefined,
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/patients-to-return/this-week",
    params,
    true,
    {
      summary: {
        total: 0,
        today: 0,
        this_week: 0,
        overdue: 0,
      },
      data: [],
      start_date: undefined,
      end_date: undefined,
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Patients Scheduled to Return - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleCheckIn = (patientId) => {
    navigate(`/reception/patients/${patientId}/check-in`);
  };

  const handleViewRecord = (patientId) => {
    navigate(`/reception/patients/${patientId}/records/patient-file`);
  };

  const handleViewDetails = (patient) => {
    const patientDetails = (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Patient Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Patient Name
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {patient.patient_name || "N/A"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Patient Number
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              #{patient.patient_number || "N/A"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Phone Number
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {patient.phone || "N/A"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {patient.email || "N/A"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Gender & Age
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {patient.gender || "N/A"} {patient.age ? `• Age: ${patient.age}` : ""}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Payment Mode
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {patient.payment_mode || "N/A"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Doctor
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {patient.doctor || "N/A"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Last Visit
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {patient.consultation_date_display || "N/A"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Return Date
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {patient.to_return_date_display || patient.date_display || "N/A"}
            </Typography>
          </Grid>
          {patient.chief_complaint && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                Chief Complaint
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {patient.chief_complaint}
              </Typography>
            </Grid>
          )}
          {patient.remarks && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                Notes
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontStyle: "italic" }}>
                {patient.remarks}
              </Typography>
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {patient.is_vip && (
                <Chip icon={<VipIcon />} label="VIP" color="warning" size="small" />
              )}
              {patient.is_businessperson && (
                <Chip icon={<BusinessIcon />} label="Business" color="warning" size="small" />
              )}
              {patient.is_outreach && (
                <Chip icon={<OutreachIcon />} label="Outreach" color="success" size="small" />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    );

    modalRef.current.open("Patient Details", patientDetails, "md");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "today":
        return { bg: orange[50], border: orange[300], icon: <TodayIcon />, color: "warning" };
      case "overdue":
        return { bg: red[50], border: red[300], icon: <OverdueIcon />, color: "error" };
      default:
        return { bg: blue[50], border: blue[300], icon: <CalendarIcon />, color: "info" };
    }
  };

  // Flatten all patients from all day groups
  const allPatients = data?.data
    ? data.data.flatMap((dayGroup) =>
        (dayGroup.patients || []).map((patient) => ({
          ...patient,
          returnDate: dayGroup.date_display,
          returnDay: dayGroup.day_name,
          status: dayGroup.status,
        }))
      )
    : [];

  // Sort patients: overdue first, then today, then upcoming
  const sortedPatients = [...allPatients].sort((a, b) => {
    const statusOrder = { overdue: 0, today: 1, upcoming: 2 };
    const statusDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.to_return_date || a.returnDate) - new Date(b.to_return_date || b.returnDate);
  });

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Patients Scheduled to Return" },
      ]}
    >
      <Grid container spacing={3}>
        {/* Summary Cards - Increased Size */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card 
                sx={{ 
                  bgcolor: blue[50], 
                  border: `2px solid ${blue[200]}`,
                  height: '100%',
                  minHeight: 100,
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: blue[500], width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
                      <CalendarIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: "bold", color: blue[700] }}>
                        {data.summary?.total || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: "text.secondary", fontWeight: 500 }}>
                        Total This Week
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card 
                sx={{ 
                  bgcolor: orange[50], 
                  border: `2px solid ${orange[200]}`,
                  height: '100%',
                  minHeight: 100,
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: orange[500], width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
                      <TodayIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: "bold", color: orange[700] }}>
                        {data.summary?.today || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: "text.secondary", fontWeight: 500 }}>
                        Returning Today
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card 
                sx={{ 
                  bgcolor: red[50], 
                  border: `2px solid ${red[200]}`,
                  height: '100%',
                  minHeight: 100,
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: red[500], width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
                      <OverdueIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: "bold", color: red[700] }}>
                        {data.summary?.overdue || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: "text.secondary", fontWeight: 500 }}>
                        Overdue
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card 
                sx={{ 
                  bgcolor: green[50], 
                  border: `2px solid ${green[200]}`,
                  height: '100%',
                  minHeight: 100,
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: green[500], width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
                      <CalendarIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: "bold", color: green[700] }}>
                        {data.summary?.this_week || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: "text.secondary", fontWeight: 500 }}>
                        Days This Week
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Patients Table */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Patients Scheduled to Return This Week"
              titleTypographyProps={{
                variant: "h5",
                fontWeight: 600,
              }}
              action={
                <Tooltip title="Refresh">
                  <IconButton onClick={handleFetch} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent>
              {loading ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <CircularProgress />
                </Box>
              ) : sortedPatients.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Patient Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Return Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedPatients.map((patient, index) => {
                        const statusColors = getStatusColor(patient.status);
                        return (
                          <TableRow
                            key={index}
                            hover
                            sx={{
                              bgcolor: statusColors.bg,
                              '&:hover': {
                                bgcolor: statusColors.bg,
                                opacity: 0.9,
                              },
                            }}
                          >
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Avatar sx={{ bgcolor: blue[500], width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
                                  <PersonIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight="medium">
                                    {patient.patient_name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    #{patient.patient_number}
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={0.5}>
                                  {patient.is_vip === true && (
                                    <Chip icon={<VipIcon />} label="VIP" color="warning" size="small" sx={{ height: 20 }} />
                                  )}
                                  {patient.is_businessperson === true && (
                                    <Chip icon={<BusinessIcon />} label="Business" color="info" size="small" sx={{ height: 20 }} />
                                  )}
                                  {patient.is_outreach === true && (
                                    <Chip icon={<OutreachIcon />} label="Outreach" color="success" size="small" sx={{ height: 20 }} />
                                  )}
                                </Stack>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{patient.phone || "N/A"}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {patient.returnDay} - {patient.returnDate}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={statusColors.icon}
                                label={
                                  patient.status === "today"
                                    ? "Today"
                                    : patient.status === "overdue"
                                    ? "Overdue"
                                    : "Upcoming"
                                }
                                color={statusColors.color}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewDetails(patient)}
                                    sx={{ color: blue[500] }}
                                  >
                                    <ViewIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Check In">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCheckIn(patient.patient_id)}
                                    sx={{ color: green[500] }}
                                  >
                                    <CheckInIcon />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <CalendarIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No patients scheduled to return this week
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default PatientsToReturn;
