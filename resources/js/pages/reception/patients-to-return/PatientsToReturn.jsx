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
import { useTheme } from "@mui/material/styles";

import Page from "../../../components/Page";
import Modal from "../../../components/Modal";
import { useFetch, useToast } from "../../../hooks";
import { formatError, formatDate } from "../../../helpers";

const PatientsToReturn = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();
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
        {/* Summary Cards - Design tu imeboreshwa, data inabaki vile vile */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: blue[700], lineHeight: 1.2 }}>
                        {data.summary?.total || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, mt: 0.5 }}>
                        Total This Week
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: blue[500], width: 56, height: 56 }}>
                      <CalendarIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: orange[700], lineHeight: 1.2 }}>
                        {data.summary?.today || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, mt: 0.5 }}>
                        Returning Today
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: orange[500], width: 56, height: 56 }}>
                      <TodayIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: red[700], lineHeight: 1.2 }}>
                        {data.summary?.overdue || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, mt: 0.5 }}>
                        Overdue
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: red[500], width: 56, height: 56 }}>
                      <OverdueIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: green[700], lineHeight: 1.2 }}>
                        {data.summary?.this_week || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, mt: 0.5 }}>
                        Days This Week
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: green[500], width: 56, height: 56 }}>
                      <CalendarIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Patients Table - Design imeboreshwa, data inabaki vile vile */}
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
              sx={{ 
                '& .MuiCardHeader-action': { 
                  alignSelf: 'center',
                  mr: 1 
                } 
              }}
            />
            <Divider />
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              {loading ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <CircularProgress />
                </Box>
              ) : sortedPatients.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Patient Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Phone</TableCell>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Return Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }} align="center">Actions</TableCell>
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
                              '&:last-child td, &:last-child th': { border: 0 },
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Avatar sx={{ bgcolor: blue[100], color: blue[700], width: 36, height: 36 }}>
                                  <PersonIcon sx={{ fontSize: 20 }} />
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight="500">
                                    {patient.patient_name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    #{patient.patient_number}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{patient.phone || "N/A"}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="500">
                                {patient.returnDay}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {patient.returnDate}
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
                                sx={{ 
                                  fontWeight: 500,
                                  '& .MuiChip-icon': { 
                                    fontSize: 16,
                                    ml: 0.5 
                                  } 
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={0.5} justifyContent="center">
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewDetails(patient)}
                                    sx={{ 
                                      color: blue[600],
                                      '&:hover': { bgcolor: blue[50] }
                                    }}
                                  >
                                    <ViewIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Check In">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCheckIn(patient.patient_id)}
                                    sx={{ 
                                      color: green[600],
                                      '&:hover': { bgcolor: green[50] }
                                    }}
                                  >
                                    <CheckInIcon fontSize="small" />
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