import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  VisibilityRounded as ViewIcon,
  RefreshRounded as RefreshIcon,
  CalendarTodayRounded as CalendarIcon,
  ScheduleRounded as ScheduleIcon,
} from "@mui/icons-material";
import { blue, orange, red, teal } from "@mui/material/colors";
import { useFetch, useToast } from "../../hooks";
import { formatError, formatDate } from "../../helpers";
import Modal from "../../components/Modal";

const PatientReturnSidebar = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();
  const [selectedPatient, setSelectedPatient] = useState(null);

  const { data, loading, error, handleFetch } = useFetch(
    "api/patients-to-return/this-week",
    {},
    true,
    {
      summary: {
        total: 0,
        today: 0,
        this_week: 0,
        overdue: 0,
      },
      data: [],
    },
    (response) => {
      // Handle both direct data and nested data structures
      if (response?.data?.data) {
        return response.data.data;
      } else if (response?.data) {
        return response.data;
      } else if (response) {
        return response;
      }
      return {
        summary: {
          total: 0,
          today: 0,
          this_week: 0,
          overdue: 0,
        },
        data: [],
      };
    }
  );

  useEffect(() => {
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      handleFetch();
    }, 300000);

    return () => clearInterval(interval);
  }, [handleFetch]);

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    const patientDetails = (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Patient Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Patient Name
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {patient.patient_name || patient.patient?.full_name || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Phone Number
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {patient.phone || patient.patient?.phone_number || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Age
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {patient.age || patient.patient?.age || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Gender
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {patient.gender || patient.patient?.gender || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Return Date
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {patient.returnDate || (patient.to_return_date ? formatDate(patient.to_return_date) : "N/A")}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={
                patient.status === "today"
                  ? "Today"
                  : patient.status === "overdue"
                  ? "Overdue"
                  : "Upcoming"
              }
              color={
                patient.status === "today"
                  ? "warning"
                  : patient.status === "overdue"
                  ? "error"
                  : "info"
              }
              size="small"
            />
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Notes
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {patient.remarks || patient.notes || "No notes available"}
          </Typography>
        </Box>
        {patient.doctor && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Doctor
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {patient.doctor}
            </Typography>
          </Box>
        )}
      </Box>
    );

    modalRef.current.open("Patient Details", patientDetails, "sm");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "today":
        return orange[500];
      case "overdue":
        return red[500];
      default:
        return blue[500];
    }
  };

  // Flatten data structure to get all patients
  const allPatients = data?.data
    ? data.data.flatMap((dayGroup) =>
        (dayGroup.patients || []).map((patient) => ({
          ...patient,
          returnDate: dayGroup.date_display,
          status: dayGroup.status,
          to_return_date: patient.to_return_date || dayGroup.date,
        }))
      )
    : Array.isArray(data)
    ? data.flatMap((dayGroup) =>
        (dayGroup.patients || []).map((patient) => ({
          ...patient,
          returnDate: dayGroup.date_display,
          status: dayGroup.status,
          to_return_date: patient.to_return_date || dayGroup.date,
        }))
      )
    : [];

  // Sort patients: overdue first, then today, then upcoming
  const sortedPatients = [...allPatients].sort((a, b) => {
    const statusOrder = { overdue: 0, today: 1, upcoming: 2 };
    const statusDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    if (statusDiff !== 0) return statusDiff;
    // If same status, sort by date
    const dateA = a.to_return_date ? new Date(a.to_return_date) : new Date(0);
    const dateB = b.to_return_date ? new Date(b.to_return_date) : new Date(0);
    return dateA - dateB;
  });

  // Limit to top 10 patients
  const topPatients = sortedPatients.slice(0, 10);

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        title="Patients Scheduled to Return"
        titleTypographyProps={{
          variant: "h6",
          fontWeight: 600,
        }}
        action={
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleFetch} disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      />
      <Divider />
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {formatError(error) || "Network connectivity error. Please check your connection and try again."}
          </Alert>
        ) : topPatients.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <ScheduleIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No patients scheduled to return
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                    Patient
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                  >
                    Return Date
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topPatients.map((patient, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{
                      "&:last-child td": { border: 0 },
                      cursor: "pointer",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {patient.patient_name || patient.patient?.full_name || "Unknown"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {patient.phone || patient.patient?.phone_number || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption">
                        {patient.returnDate || (patient.to_return_date ? formatDate(patient.to_return_date) : "N/A")}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          patient.status === "today"
                            ? "Today"
                            : patient.status === "overdue"
                            ? "Overdue"
                            : "Upcoming"
                        }
                        color={
                          patient.status === "today"
                            ? "warning"
                            : patient.status === "overdue"
                            ? "error"
                            : "info"
                        }
                        size="small"
                        sx={{
                          fontSize: "0.65rem",
                          height: "20px",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPatient(patient);
                          }}
                          sx={{
                            color: getStatusColor(patient.status),
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {data?.summary?.total > 10 && (
          <Box sx={{ p: 1.5, textAlign: "center", borderTop: 1, borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary">
              Showing top 10 of {data.summary.total} patients
            </Typography>
          </Box>
        )}
      </CardContent>
      <Modal ref={modalRef} />
    </Card>
  );
};

export default PatientReturnSidebar;

