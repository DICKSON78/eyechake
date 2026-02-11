import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  Save as SaveIcon,
  Download as DownloadIcon,
  AssessmentRounded as ReportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import Page from "../../../components/Page";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import Modal from "../../../components/Modal";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";
import { downloadHTMLAsPDF } from "../../../helpers/pdfDownload";

const ReceptionistMonthlyReport = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  
  // Check access: user must have reception privilege OR receptionist_monthly_report privilege
  // Admins always have access to all pages
  usePrivilege('reception', '/reception/dashboard', 'receptionist_monthly_report');
  const printRef = useRef(null);
  const modalRef = useRef(null);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [savedReports, setSavedReports] = useState([]);

  // Date filter state
  const [dateFilter, setDateFilter] = useState("month"); // day, week, month, year
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Default patient flow categories
  const patientFlowCategories = [
    "Total Patients Attended",
    "New Patients",
    "Returning Patients",
    "Walk-in Patients",
    "Appointment Bookings",
    "Missed / Cancelled Appointments",
  ];

  // Default customer relationship activities
  const customerRelationshipActivities = [
    "Total Clients Called",
    "Clients Reached Successfully",
    "Clients Reminded for Follow-up / Recheck",
    "Clients Contacted for After-Sales Feedback",
    "Clients Contacted for Marketing / Offers",
    "Number of clients who returned after follow-up",
    "Cross-selling achieved through follow-up calls",
  ];

  // Form data state
  const [formData, setFormData] = useState({
    employeeName: "",
    month: "",
    dateSubmitted: new Date().toISOString().split("T")[0],
    
    // Section 1: Patient Flow Summary
    patientFlow: {
      totalPatientsAttended: "",
      newPatients: "",
      returningPatients: "",
      walkInPatients: "",
      appointmentBookings: "",
      missedCancelledAppointments: "",
    },
    
    // Section 2: Customer Relationship Management
    customerRelationship: {
      totalClientsCalled: "",
      clientsReachedSuccessfully: "",
      clientsRemindedForFollowup: "",
      clientsContactedForAfterSales: "",
      clientsContactedForMarketing: "",
      clientsReturnedAfterFollowup: "",
      crossSellingAchieved: "",
    },
    
    // Section 3: Customer Engagement Summary
    customerEngagement: {
      suggestionsReceived: "",
      actionsTaken: "",
    },
    
    // Section 4: Challenges Faced
    challenges: {
      difficultyReachingClients: "",
      commonCustomerConcerns: "",
      coordinationChallenges: "",
    },
    
    // Section 5: Achievements / Highlights
    achievements: {
      newIdeasImplemented: "",
    },
    
    // Section 6: Recommendations
    recommendations: {
      suggestionsForImproving: "",
      toolsResourcesNeeded: "",
      trainingSupportNeeded: "",
    },
    
    reportSummary: "",
    reportRecommendation: "",

    signature: "",
    reportDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    document.title = `Detailed Receptionist & Customer Relationship Monthly Report - ${window.APP_NAME}`;
    calculateDateRange();
    loadSavedReports();
  }, [dateFilter, selectedDate]);

  const calculateDateRange = () => {
    const date = new Date(selectedDate);
    let start, end;

    switch (dateFilter) {
      case "day":
        start = new Date(date);
        end = new Date(date);
        break;
      case "week":
        const dayOfWeek = date.getDay();
        start = new Date(date);
        start.setDate(date.getDate() - dayOfWeek);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case "month":
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        break;
      case "year":
        start = new Date(date.getFullYear(), 0, 1);
        end = new Date(date.getFullYear(), 11, 31);
        break;
      default:
        start = new Date(date);
        end = new Date(date);
    }

    setStartDate(start);
    setEndDate(end);
  };

  const loadSavedReports = () => {
    try {
      const reports = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("receptionist_monthly_report_")) {
          const reportData = JSON.parse(localStorage.getItem(key));
          reports.push({
            id: key,
            timestamp: key.replace("receptionist_monthly_report_", ""),
            ...reportData,
          });
        }
      }
      // Sort by timestamp (newest first)
      reports.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
      setSavedReports(reports);
    } catch (error) {
      console.error("Error loading saved reports:", error);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      const reportData = {
        ...formData,
        dateFilter,
        selectedDate: selectedDate.toISOString(),
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };

      const reportId = currentReportId || `receptionist_monthly_report_${Date.now()}`;
      localStorage.setItem(reportId, JSON.stringify(reportData));

      setCurrentReportId(reportId);
      loadSavedReports();

      addToast({
        message: currentReportId ? "Report updated successfully!" : "Report saved successfully!",
        severity: "success",
      });
    } catch (error) {
      addToast({
        message: formatError(error) || "Failed to save report",
        severity: "error",
      });
    }
  };

  const handleEdit = (report) => {
    try {
      setFormData({
        employeeName: report.employeeName || "",
        month: report.month || "",
        dateSubmitted: report.dateSubmitted || new Date().toISOString().split("T")[0],
        patientFlow: report.patientFlow || {
          totalPatientsAttended: "",
          newPatients: "",
          returningPatients: "",
          walkInPatients: "",
          appointmentBookings: "",
          missedCancelledAppointments: "",
        },
        customerRelationship: report.customerRelationship || {
          totalClientsCalled: "",
          clientsReachedSuccessfully: "",
          clientsRemindedForFollowup: "",
          clientsContactedForAfterSales: "",
          clientsContactedForMarketing: "",
          clientsReturnedAfterFollowup: "",
          crossSellingAchieved: "",
        },
        customerEngagement: report.customerEngagement || {
          suggestionsReceived: "",
          actionsTaken: "",
        },
        challenges: report.challenges || {
          difficultyReachingClients: "",
          commonCustomerConcerns: "",
          coordinationChallenges: "",
        },
        achievements: report.achievements || {
          newIdeasImplemented: "",
        },
        recommendations: report.recommendations || {
          suggestionsForImproving: "",
          toolsResourcesNeeded: "",
          trainingSupportNeeded: "",
        },
        signature: report.signature || "",
        reportDate: report.reportDate || new Date().toISOString().split("T")[0],
      });

      if (report.dateFilter) {
        setDateFilter(report.dateFilter);
      }
      if (report.selectedDate) {
        setSelectedDate(new Date(report.selectedDate));
      }
      if (report.startDate) {
        setStartDate(new Date(report.startDate));
      }
      if (report.endDate) {
        setEndDate(new Date(report.endDate));
      }

      setCurrentReportId(report.id);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });

      addToast({
        message: "Report loaded for editing",
        severity: "success",
      });
    } catch (error) {
      addToast({
        message: formatError(error) || "Failed to load report",
        severity: "error",
      });
    }
  };

  const handleDelete = (report) => {
    const component = (
      <ConfirmationDialog
        message={`Delete report for ${report.employeeName || "Unknown Employee"} (${report.month || "Unknown Month"})?`}
        onCancel={() => modalRef.current.close()}
        onOk={async () => {
          try {
            localStorage.removeItem(report.id);
            loadSavedReports();
            if (currentReportId === report.id) {
              setCurrentReportId(null);
              // Reset form
              setFormData({
                employeeName: "",
                month: "",
                dateSubmitted: new Date().toISOString().split("T")[0],
                patientFlow: {
                  totalPatientsAttended: "",
                  newPatients: "",
                  returningPatients: "",
                  walkInPatients: "",
                  appointmentBookings: "",
                  missedCancelledAppointments: "",
                },
                customerRelationship: {
                  totalClientsCalled: "",
                  clientsReachedSuccessfully: "",
                  clientsRemindedForFollowup: "",
                  clientsContactedForAfterSales: "",
                  clientsContactedForMarketing: "",
                  clientsReturnedAfterFollowup: "",
                  crossSellingAchieved: "",
                },
                customerEngagement: {
                  suggestionsReceived: "",
                  actionsTaken: "",
                },
                challenges: {
                  difficultyReachingClients: "",
                  commonCustomerConcerns: "",
                  coordinationChallenges: "",
                },
                achievements: {
                  newIdeasImplemented: "",
                },
                recommendations: {
                  suggestionsForImproving: "",
                  toolsResourcesNeeded: "",
                  trainingSupportNeeded: "",
                },
                signature: "",
                reportDate: new Date().toISOString().split("T")[0],
              });
            }
            modalRef.current.close();
            addToast({ message: "Report deleted successfully", severity: "success" });
          } catch (error) {
            addToast({
              message: formatError(error) || "Failed to delete report",
              severity: "error",
            });
          }
        }}
      />
    );

    modalRef.current.open("Confirm Delete", component);
  };

  const handleNewReport = () => {
    setCurrentReportId(null);
    setFormData({
      employeeName: "",
      month: "",
      dateSubmitted: new Date().toISOString().split("T")[0],
      patientFlow: {
        totalPatientsAttended: "",
        newPatients: "",
        returningPatients: "",
        walkInPatients: "",
        appointmentBookings: "",
        missedCancelledAppointments: "",
      },
      customerRelationship: {
        totalClientsCalled: "",
        clientsReachedSuccessfully: "",
        clientsRemindedForFollowup: "",
        clientsContactedForAfterSales: "",
        clientsContactedForMarketing: "",
        clientsReturnedAfterFollowup: "",
        crossSellingAchieved: "",
      },
      customerEngagement: {
        suggestionsReceived: "",
        actionsTaken: "",
      },
      challenges: {
        difficultyReachingClients: "",
        commonCustomerConcerns: "",
        coordinationChallenges: "",
      },
      achievements: {
        newIdeasImplemented: "",
      },
      recommendations: {
        suggestionsForImproving: "",
        toolsResourcesNeeded: "",
        trainingSupportNeeded: "",
      },
      signature: "",
      reportDate: new Date().toISOString().split("T")[0],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = async () => {
    try {
      if (!printRef.current) {
        addToast({
          message: "Report content not found",
          severity: "error",
        });
        return;
      }

      const filename = `Receptionist_Monthly_Report_${formData.employeeName || 'Report'}_${formData.month || new Date().toISOString().split('T')[0]}.pdf`;
      
      await downloadHTMLAsPDF(printRef.current, filename);
      
      addToast({
        message: "Report downloaded successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      addToast({
        message: formatError(error) || "Failed to download report",
        severity: "error",
      });
    }
  };

  const getPatientFlowKey = (category) => {
    const keyMap = {
      "Total Patients Attended": "totalPatientsAttended",
      "New Patients": "newPatients",
      "Returning Patients": "returningPatients",
      "Walk-in Patients": "walkInPatients",
      "Appointment Bookings": "appointmentBookings",
      "Missed / Cancelled Appointments": "missedCancelledAppointments",
    };
    return keyMap[category] || category.toLowerCase().replace(/\s+/g, "");
  };

  const getCustomerRelationshipKey = (activity) => {
    const keyMap = {
      "Total Clients Called": "totalClientsCalled",
      "Clients Reached Successfully": "clientsReachedSuccessfully",
      "Clients Reminded for Follow-up / Recheck": "clientsRemindedForFollowup",
      "Clients Contacted for After-Sales Feedback": "clientsContactedForAfterSales",
      "Clients Contacted for Marketing / Offers": "clientsContactedForMarketing",
      "Number of clients who returned after follow-up": "clientsReturnedAfterFollowup",
      "Cross-selling achieved through follow-up calls": "crossSellingAchieved",
    };
    return keyMap[activity] || activity.toLowerCase().replace(/\s+/g, "");
  };

  return (
    <Page
      title="Detailed Receptionist & Customer Relationship Monthly Report"
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Reports" },
        { title: "Detailed Receptionist & Customer Relationship Monthly Report" },
      ]}
    >
      <Box sx={{ mb: 3, "@media print": { display: "none" } }}>
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Select
                  fullWidth
                  label="Report Period"
                  value={dateFilter}
                  onChange={(value) => setDateFilter(value)}
                  options={[
                    { id: "day", name: "Daily" },
                    { id: "week", name: "Weekly" },
                    { id: "month", name: "Monthly" },
                    { id: "year", name: "Yearly" },
                  ]}
                  optionsLabel="name"
                  optionsValue="id"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  fullWidth
                  label="Select Date"
                  value={selectedDate}
                  onChange={(value) => setSelectedDate(value || new Date())}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  fullWidth
                  label="Start Date"
                  value={startDate}
                  onChange={(value) => setStartDate(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  fullWidth
                  label="End Date"
                  value={endDate}
                  onChange={(value) => setEndDate(value)}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                {currentReportId && (
                  <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                    Editing saved report
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleNewReport}
                  size="small"
                >
                  New Report
                </Button>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  {currentReportId ? "Update" : "Save"}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download PDF
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Saved Reports List */}
        {savedReports.length > 0 && (
          <Card sx={{ mt: 2 }}>
            <CardHeader title="Saved Reports" />
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Month</TableCell>
                    <TableCell>Date Submitted</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Saved Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.employeeName || "N/A"}</TableCell>
                      <TableCell>{report.month || "N/A"}</TableCell>
                      <TableCell>
                        {report.dateSubmitted
                          ? new Date(report.dateSubmitted).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {report.dateFilter
                          ? report.dateFilter.charAt(0).toUpperCase() + report.dateFilter.slice(1)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(parseInt(report.timestamp)).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEdit(report)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(report)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </Box>

      <Paper
        ref={printRef}
        sx={{
          p: 4,
          "@media print": {
            p: 2,
            boxShadow: "none",
          },
        }}
      >
        {/* Header */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 3,
            textAlign: "center",
            color: "#1976d2",
            fontFamily: "serif",
          }}
        >
          A. Detailed Receptionist & Customer Relationship Monthly Report
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Employee Name:</strong>{" "}
                <span style={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", display: "inline-block", paddingBottom: "2px" }}>
                  {formData.employeeName || " "}
                </span>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Month:</strong>{" "}
                <span style={{ borderBottom: "1px solid #000", minWidth: "250px", width: "100%", display: "inline-block", paddingBottom: "2px" }}>
                  {formData.month || " "}
                </span>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Date Submitted:</strong>{" "}
                <span style={{ borderBottom: "1px solid #000", minWidth: "250px", width: "100%", display: "inline-block", paddingBottom: "2px" }}>
                  {formData.dateSubmitted || " "}
                </span>
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section 1: Patient Flow Summary */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}
        >
          1. Patient Flow Summary
        </Typography>

        <Table
          sx={{
            mb: 4,
            border: "1px solid #ccc",
            "& .MuiTableCell-root": {
              border: "1px solid #ccc",
              padding: "8px",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Number</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patientFlowCategories.map((category, index) => {
              const key = getPatientFlowKey(category);
              return (
                <TableRow key={index}>
                  <TableCell>{category}</TableCell>
                  <TableCell>
                    <span style={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", display: "inline-block", paddingBottom: "2px" }}>
                      {formData.patientFlow[key] || ""}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Section 2: Customer Relationship Management */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
        >
          2. Customer Relationship Management
        </Typography>

        <Table
          sx={{
            mb: 4,
            border: "1px dashed #ccc",
            "& .MuiTableCell-root": {
              border: "1px dashed #ccc",
              padding: "8px",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Activity</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Number / Summary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customerRelationshipActivities.map((activity, index) => {
              const key = getCustomerRelationshipKey(activity);
              return (
                <TableRow key={index}>
                  <TableCell>{activity}</TableCell>
                  <TableCell>
                    <span style={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", display: "inline-block", paddingBottom: "2px" }}>
                      {formData.customerRelationship[key] || ""}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Section 3: Customer Engagement Summary */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
        >
          3. Customer Engagement Summary
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Suggestions received for service improvement:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px",
            minHeight: "40px",
            mb: 2,
            p: 1,
          }}
        >
          {formData.customerEngagement.suggestionsReceived || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Actions taken after receiving feedback:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px",
            minHeight: "40px",
            mb: 4,
            p: 1,
          }}
        >
          {formData.customerEngagement.actionsTaken || ""}
        </Box>

        {/* Section 4: Challenges Faced */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
        >
          4. Challenges Faced
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Difficulty in reaching clients (wrong numbers, no response, etc.):
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px",
            minHeight: "40px",
            mb: 2,
            p: 1,
          }}
        >
          {formData.challenges.difficultyReachingClients || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Common customer concerns or complaints:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px",
            minHeight: "40px",
            mb: 2,
            p: 1,
          }}
        >
          {formData.challenges.commonCustomerConcerns || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Coordination challenges with other departments:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px",
            minHeight: "40px",
            mb: 4,
            p: 1,
          }}
        >
          {formData.challenges.coordinationChallenges || ""}
        </Box>

        {/* Section 5: Achievements / Highlights */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
        >
          5. Achievements / Highlights
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • New ideas implemented to improve communication:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px",
            minHeight: "40px",
            mb: 4,
            p: 1,
          }}
        >
          {formData.achievements.newIdeasImplemented || ""}
        </Box>

        {/* Section 6: Recommendations */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
        >
          6. Recommendations
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Suggestions for improving follow-up and call systems:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px",
            minHeight: "40px",
            mb: 2,
            p: 1,
          }}
        >
          {formData.recommendations.suggestionsForImproving || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Tools or resources needed (client call logbook, phone credit, CRM system):
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px",
            minHeight: "40px",
            mb: 2,
            p: 1,
          }}
        >
          {formData.recommendations.toolsResourcesNeeded || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Training or support needed:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px",
            minHeight: "40px",
            mb: 4,
            p: 1,
          }}
        >
          {formData.recommendations.trainingSupportNeeded || ""}
        </Box>

        {/* Signature and Date */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Signature:</strong>{" "}
            <span style={{ borderBottom: "1px solid #000", minWidth: "200px", display: "inline-block" }}>
              {formData.signature || ""}
            </span>
          </Typography>
          <Typography variant="body1">
            <strong>Date:</strong>{" "}
            <span style={{ borderBottom: "1px solid #000", minWidth: "200px", display: "inline-block" }}>
              {formData.reportDate || ""}
            </span>
          </Typography>
        </Box>
      </Paper>

      {/* Editable Form (Hidden when printing) */}
      <Box sx={{ mt: 4, "@media print": { display: "none" } }}>
        <Card>
          <CardHeader title="Fill Report Data" />
          <CardContent>
            <Grid container spacing={3}>
              {/* Header Fields */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Employee Name"
                  value={formData.employeeName}
                  onChange={(value) => handleInputChange(null, "employeeName", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Month"
                  value={formData.month}
                  onChange={(value) => handleInputChange(null, "month", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <DatePicker
                  fullWidth
                  label="Date Submitted"
                  value={formData.dateSubmitted ? new Date(formData.dateSubmitted) : null}
                  onChange={(value) =>
                    handleInputChange(
                      null,
                      "dateSubmitted",
                      value ? value.toISOString().split("T")[0] : ""
                    )
                  }
                />
              </Grid>

              {/* Section 1: Patient Flow Summary */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Section 1: Patient Flow Summary
                </Typography>
              </Grid>
              {patientFlowCategories.map((category, index) => {
                const key = getPatientFlowKey(category);
                return (
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label={category}
                      value={formData.patientFlow[key] || ""}
                      onChange={(value) => handleInputChange("patientFlow", key, value)}
                    />
                  </Grid>
                );
              })}

              {/* Section 2: Customer Relationship Management */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Section 2: Customer Relationship Management
                </Typography>
              </Grid>
              {customerRelationshipActivities.map((activity, index) => {
                const key = getCustomerRelationshipKey(activity);
                return (
                  <Grid key={index} size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label={activity}
                      value={formData.customerRelationship[key] || ""}
                      onChange={(value) => handleInputChange("customerRelationship", key, value)}
                    />
                  </Grid>
                );
              })}

              {/* Section 3: Customer Engagement Summary */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Section 3: Customer Engagement Summary
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Suggestions received for service improvement"
                  value={formData.customerEngagement.suggestionsReceived}
                  onChange={(value) =>
                    handleInputChange("customerEngagement", "suggestionsReceived", value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Actions taken after receiving feedback"
                  value={formData.customerEngagement.actionsTaken}
                  onChange={(value) =>
                    handleInputChange("customerEngagement", "actionsTaken", value)
                  }
                />
              </Grid>

              {/* Section 4: Challenges Faced */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Section 4: Challenges Faced
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Difficulty in reaching clients (wrong numbers, no response, etc.)"
                  value={formData.challenges.difficultyReachingClients}
                  onChange={(value) =>
                    handleInputChange("challenges", "difficultyReachingClients", value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Common customer concerns or complaints"
                  value={formData.challenges.commonCustomerConcerns}
                  onChange={(value) =>
                    handleInputChange("challenges", "commonCustomerConcerns", value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Coordination challenges with other departments"
                  value={formData.challenges.coordinationChallenges}
                  onChange={(value) =>
                    handleInputChange("challenges", "coordinationChallenges", value)
                  }
                />
              </Grid>

              {/* Section 5: Achievements / Highlights */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Section 5: Achievements / Highlights
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="New ideas implemented to improve communication"
                  value={formData.achievements.newIdeasImplemented}
                  onChange={(value) =>
                    handleInputChange("achievements", "newIdeasImplemented", value)
                  }
                />
              </Grid>

              {/* Section 6: Recommendations */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Section 6: Recommendations
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Suggestions for improving follow-up and call systems"
                  value={formData.recommendations.suggestionsForImproving}
                  onChange={(value) =>
                    handleInputChange("recommendations", "suggestionsForImproving", value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Tools or resources needed (client call logbook, phone credit, CRM system)"
                  value={formData.recommendations.toolsResourcesNeeded}
                  onChange={(value) =>
                    handleInputChange("recommendations", "toolsResourcesNeeded", value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Training or support needed"
                  value={formData.recommendations.trainingSupportNeeded}
                  onChange={(value) =>
                    handleInputChange("recommendations", "trainingSupportNeeded", value)
                  }
                />
              </Grid>

              {/* Report Summary */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                  Report Summary
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Report Summary"
                  value={formData.reportSummary || ""}
                  onChange={(value) => handleInputChange(null, "reportSummary", value)}
                />
              </Grid>

              {/* Report Recommendation */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                  Report Recommendation
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Report Recommendation"
                  value={formData.reportRecommendation || ""}
                  onChange={(value) => handleInputChange(null, "reportRecommendation", value)}
                />
              </Grid>

              {/* Signature and Date */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Signature & Date
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Signature"
                  value={formData.signature}
                  onChange={(value) => handleInputChange(null, "signature", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  fullWidth
                  label="Report Date"
                  value={formData.reportDate ? new Date(formData.reportDate) : null}
                  onChange={(value) =>
                    handleInputChange(
                      null,
                      "reportDate",
                      value ? value.toISOString().split("T")[0] : ""
                    )
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default ReceptionistMonthlyReport;

