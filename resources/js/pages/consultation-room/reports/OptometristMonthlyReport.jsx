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
import { formatError, hasReportAccess } from "../../../helpers";
import { downloadHTMLAsPDF } from "../../../helpers/pdfDownload";

const OptometristMonthlyReport = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  
  // Check access: user must have consultation_room privilege OR optometrist_monthly_report privilege
  // Admins always have access to all pages
  useEffect(() => {
    const user = window.user || {};
    const privileges = user.privileges || {};
    
    // Admins have access to all pages without checking privileges
    const isAdmin = user.role === "Admin" || user.is_admin === true || user.is_admin === 1 || user.is_admin === "1";
    
    if (!isAdmin && !hasReportAccess(privileges, 'consultation_room', 'optometrist_monthly_report')) {
      addToast({ 
        message: "You do not have access to this page.", 
        severity: "error" 
      });
      navigate("/consultation-room/dashboard");
    }
  }, [navigate, addToast]);
  const printRef = useRef(null);
  const modalRef = useRef(null);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [savedReports, setSavedReports] = useState([]);

  // Date filter state
  const [dateFilter, setDateFilter] = useState("month"); // day, week, month, year
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Default products list for Pharmacy section
  const defaultProducts = [
    "Carofit",
    "Probeta N",
    "Levofloxacin",
    "Olopat od",
    "Chloramphenicol ointment",
    "Softdrop",
  ];

  // Form data state (Pharmacy & Consultation section moved to separate report)
  const [formData, setFormData] = useState({
    name: "",
    month: "",
    dateSubmitted: new Date().toISOString().split("T")[0],
    
    // Pharmacy & Product Sales Summary
    products: defaultProducts.map((name) => ({
      productName: name,
      openingStock: "",
      closingStock: "",
      buyingPricePerUnit: "",
      sellingPricePerUnit: "",
      totalSales: "",
      profit: "",
    })),
    totalSales: "",
    totalTarget: "2,000,000",
    
    // Sales Targets & Achievements - General
    salesTargets: {
      bluecutVsTransitionRatio: { target: "10:2", result: "" },
      averageBifocalLensMonthly: { target: "5", result: "" },
      averageProgressiveLensMonthly: { target: "10", result: "" },
      contactLenses: { target: "4", result: "" },
      newConsultationVsReturning: { target: "10:5", result: "" },
    },
    
    // Task Section
    tasks: {
      contentCreated: "",
      patientConsultedVsContacted: "",
      presentationMade: "",
    },
    
    // OBSERVATION Section
    observation: {
      challengingUniqueCase: "",
    },
    
    // Section 2: Challenges
    challenges: {
      equipmentIssues: "",
      patientRelatedChallenges: "",
      otherChallenges: "",
    },
    
    // Section 3: Achievements / Success
    achievements: {
      positiveOutcomes: "",
      trainingSkillsGained: "",
      patientAppreciation: "",
    },
    
    // Section 4: Recommendations
    recommendations: {
      serviceImprovementSuggestions: "",
      otherRecommendations: "",
    },
    
    signature: "",
    reportDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    document.title = `Monthly Optometrist Report - ${window.APP_NAME}`;
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
        if (key && key.startsWith("optometrist_monthly_report_")) {
          const reportData = JSON.parse(localStorage.getItem(key));
          reports.push({
            id: key,
            timestamp: key.replace("optometrist_monthly_report_", ""),
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

  const handleNestedInputChange = (section, subSection, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section][subSection],
          [field]: value,
        },
      },
    }));
  };

  const handleProductChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.products];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, products: updated };
    });
  };

  const calculateProfit = (index) => {
    setFormData((prev) => {
      const product = prev.products[index];
      const buying = parseFloat(product.buyingPricePerUnit) || 0;
      const selling = parseFloat(product.sellingPricePerUnit) || 0;
      const closing = parseFloat(product.closingStock) || 0;
      if (buying && selling && closing) {
        const profit = (selling - buying) * closing;
        const updated = [...prev.products];
        updated[index] = { ...updated[index], profit: profit.toString() };
        return { ...prev, products: updated };
      }
      return prev;
    });
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

      const reportId = currentReportId || `optometrist_monthly_report_${Date.now()}`;
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
        name: report.name || "",
        month: report.month || "",
        dateSubmitted: report.dateSubmitted || new Date().toISOString().split("T")[0],
        products: report.products || defaultProducts.map((name) => ({
          productName: name,
          openingStock: "",
          closingStock: "",
          buyingPricePerUnit: "",
          sellingPricePerUnit: "",
          totalSales: "",
          profit: "",
        })),
        totalSales: report.totalSales || "",
        totalTarget: report.totalTarget || "2,000,000",
        salesTargets: report.salesTargets || {
          bluecutVsTransitionRatio: { target: "10:2", result: "" },
          averageBifocalLensMonthly: { target: "5", result: "" },
          averageProgressiveLensMonthly: { target: "10", result: "" },
          contactLenses: { target: "4", result: "" },
          newConsultationVsReturning: { target: "10:5", result: "" },
        },
        tasks: report.tasks || {
          contentCreated: "",
          patientConsultedVsContacted: "",
          presentationMade: "",
        },
        observation: report.observation || {
          challengingUniqueCase: "",
        },
        challenges: report.challenges || {
          equipmentIssues: "",
          patientRelatedChallenges: "",
          otherChallenges: "",
        },
        achievements: report.achievements || {
          positiveOutcomes: "",
          trainingSkillsGained: "",
          patientAppreciation: "",
        },
        recommendations: report.recommendations || {
          serviceImprovementSuggestions: "",
          otherRecommendations: "",
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
        message={`Delete report for ${report.name || "Unknown Optometrist"} (${report.month || "Unknown Month"})?`}
        onCancel={() => modalRef.current.close()}
        onOk={async () => {
          try {
            localStorage.removeItem(report.id);
            loadSavedReports();
            if (currentReportId === report.id) {
              setCurrentReportId(null);
              // Reset form
              setFormData({
                name: "",
                month: "",
                dateSubmitted: new Date().toISOString().split("T")[0],
                products: defaultProducts.map((name) => ({
                  productName: name,
                  openingStock: "",
                  closingStock: "",
                  buyingPricePerUnit: "",
                  sellingPricePerUnit: "",
                  totalSales: "",
                  profit: "",
                })),
                totalSales: "",
                totalTarget: "2,000,000",
                salesTargets: {
                  bluecutVsTransitionRatio: { target: "10:2", result: "" },
                  averageBifocalLensMonthly: { target: "5", result: "" },
                  averageProgressiveLensMonthly: { target: "10", result: "" },
                  contactLenses: { target: "4", result: "" },
                  newConsultationVsReturning: { target: "10:5", result: "" },
                },
                tasks: {
                  contentCreated: "",
                  patientConsultedVsContacted: "",
                  presentationMade: "",
                },
                observation: {
                  challengingUniqueCase: "",
                },
                challenges: {
                  equipmentIssues: "",
                  patientRelatedChallenges: "",
                  otherChallenges: "",
                },
                achievements: {
                  positiveOutcomes: "",
                  trainingSkillsGained: "",
                  patientAppreciation: "",
                },
                recommendations: {
                  serviceImprovementSuggestions: "",
                  otherRecommendations: "",
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
      name: "",
      month: "",
      dateSubmitted: new Date().toISOString().split("T")[0],
      products: defaultProducts.map((name) => ({
        productName: name,
        openingStock: "",
        closingStock: "",
        buyingPricePerUnit: "",
        sellingPricePerUnit: "",
        totalSales: "",
        profit: "",
      })),
      totalSales: "",
      totalTarget: "2,000,000",
      salesTargets: {
        bluecutVsTransitionRatio: { target: "10:2", result: "" },
        averageBifocalLensMonthly: { target: "5", result: "" },
        averageProgressiveLensMonthly: { target: "10", result: "" },
        contactLenses: { target: "4", result: "" },
        newConsultationVsReturning: { target: "10:5", result: "" },
      },
      tasks: {
        contentCreated: "",
        patientConsultedVsContacted: "",
        presentationMade: "",
      },
      observation: {
        challengingUniqueCase: "",
      },
      challenges: {
        equipmentIssues: "",
        patientRelatedChallenges: "",
        otherChallenges: "",
      },
      achievements: {
        positiveOutcomes: "",
        trainingSkillsGained: "",
        patientAppreciation: "",
      },
      recommendations: {
        serviceImprovementSuggestions: "",
        otherRecommendations: "",
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

      const filename = `Optometrist_Monthly_Report_${formData.name || 'Report'}_${formData.month || new Date().toISOString().split('T')[0]}.pdf`;
      
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

  return (
    <Page
      title="Monthly Optometrist Report"
      breadcrumbs={[
        { title: "Home" },
        { title: "Consultation Room" },
        { title: "Reports" },
        { title: "Monthly Optometrist Report" },
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
                    <TableCell>Name</TableCell>
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
                      <TableCell>{report.name || "N/A"}</TableCell>
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
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 1,
            textAlign: "center",
            color: "#1976d2",
            fontFamily: "serif",
          }}
        >
          SIKAF EYE CARE
        </Typography>
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
          Monthly Optometrist Report
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Name:</strong>{" "}
                <span style={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", display: "inline-block", paddingBottom: "2px" }}>
                  {formData.name || " "}
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

        {/* Section A: Pharmacy & Product Sales Summary */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}
        >
          A. Pharmacy & Product Sales Summary
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
              <TableCell sx={{ fontWeight: 700 }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Opening Stock</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Closing Stock</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Buying price per Unit (Tsh)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Selling Price per Unit (Tsh)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total Sales (Tsh)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Profit (Tsh)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.products.map((product, index) => (
              <TableRow key={index}>
                <TableCell>{product.productName}</TableCell>
                <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                  <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                    {product.openingStock || " "}
                  </span>
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                  <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                    {product.closingStock || " "}
                  </span>
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                  <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                    {product.buyingPricePerUnit || " "}
                  </span>
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                  <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                    {product.sellingPricePerUnit || " "}
                  </span>
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                  <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                    {product.totalSales || " "}
                  </span>
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                  <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                    {product.profit || " "}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell colSpan={5} sx={{ fontWeight: 700, textAlign: "right" }}>
                TOTAL SALES
              </TableCell>
              <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                  {formData.totalSales || " "}
                </span>
              </TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}></TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell colSpan={5} sx={{ fontWeight: 700, textAlign: "right", border: "1px solid #ccc" }}>
                TOTAL TARGET
              </TableCell>
              <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                  {formData.totalTarget || "2,000,000"}
                </span>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Divider sx={{ my: 3 }} />

        {/* Sales Targets & Achievements */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, fontFamily: "serif" }}
        >
          Sales Targets & Achievements
        </Typography>

        <Table
          sx={{
            mb: 2,
            border: "1px solid #ccc",
            "& .MuiTableCell-root": {
              border: "1px solid #ccc",
              padding: "8px",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Metric</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Results</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Bluecut vs transition lens ratio</TableCell>
              <TableCell>{formData.salesTargets.bluecutVsTransitionRatio.target}</TableCell>
              <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                  {formData.salesTargets.bluecutVsTransitionRatio.result || " "}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Average Bifocal lens (monthly)</TableCell>
              <TableCell>{formData.salesTargets.averageBifocalLensMonthly.target}</TableCell>
              <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                  {formData.salesTargets.averageBifocalLensMonthly.result || " "}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Average Progressive lens (monthly)</TableCell>
              <TableCell>{formData.salesTargets.averageProgressiveLensMonthly.target}</TableCell>
              <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                  {formData.salesTargets.averageProgressiveLensMonthly.result || " "}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Contact lenses</TableCell>
              <TableCell>{formData.salesTargets.contactLenses.target}</TableCell>
              <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                  {formData.salesTargets.contactLenses.result || " "}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>New consultation vs Returning patients</TableCell>
              <TableCell>{formData.salesTargets.newConsultationVsReturning.target}</TableCell>
              <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                  {formData.salesTargets.newConsultationVsReturning.result || " "}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Task Section */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, fontFamily: "serif" }}
        >
          Task
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Content created:{" "}
            <span style={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", display: "inline-block", paddingBottom: "2px" }}>
              {formData.tasks.contentCreated || " "}
            </span>
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Patient consulted vs contacted:{" "}
            <span style={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", display: "inline-block", paddingBottom: "2px" }}>
              {formData.tasks.patientConsultedVsContacted || " "}
            </span>
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Presentation made:{" "}
            <span style={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", display: "inline-block", paddingBottom: "2px" }}>
              {formData.tasks.presentationMade || " "}
            </span>
          </Typography>
        </Box>

        {/* OBSERVATION Section */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, fontFamily: "serif" }}
        >
          OBSERVATION
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Challenging/unique case and how it was managed:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000",
            minHeight: "60px",
            mb: 4,
            p: 1,
          }}
        >
          {formData.observation.challengingUniqueCase || ""}
        </Box>

        {/* Section 2: Challenges */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
        >
          2. Challenges
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Equipment Issues:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000",
            minHeight: "40px",
            mb: 2,
            p: 1,
          }}
        >
          {formData.challenges.equipmentIssues || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Patient-Related Challenges:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000",
            minHeight: "40px",
            mb: 2,
            p: 1,
          }}
        >
          {formData.challenges.patientRelatedChallenges || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Other Challenges:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000",
            minHeight: "40px",
            mb: 4,
            p: 1,
          }}
        >
          {formData.challenges.otherChallenges || ""}
        </Box>

        {/* Section 3: Achievements / Success */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
        >
          3. Achievements / Success
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Positive Outcomes or Notable Cases:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000",
            minHeight: "40px",
            mb: 2,
            p: 1,
          }}
        >
          {formData.achievements.positiveOutcomes || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Training or Skills Gained:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000",
            minHeight: "40px",
            mb: 2,
            p: 1,
          }}
        >
          {formData.achievements.trainingSkillsGained || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Patient Appreciation / Feedback:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000",
            minHeight: "40px",
            mb: 4,
            p: 1,
          }}
        >
          {formData.achievements.patientAppreciation || ""}
        </Box>

        {/* Section 4: Recommendations */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
        >
          4. Recommendations
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Service Improvement Suggestions:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000",
            minHeight: "40px",
            mb: 2,
            p: 1,
          }}
        >
          {formData.recommendations.serviceImprovementSuggestions || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          • Other Recommendations:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000",
            minHeight: "40px",
            mb: 4,
            p: 1,
          }}
        >
          {formData.recommendations.otherRecommendations || ""}
        </Box>

        {/* Signature and Date */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Signature:</strong>{" "}
            <span style={{ borderBottom: "1px solid #000", minWidth: "200px", display: "inline-block" }}>
              {formData.signature || "_________________________"}
            </span>
          </Typography>
          <Typography variant="body1">
            <strong>Date:</strong>{" "}
            <span style={{ borderBottom: "1px solid #000", minWidth: "200px", display: "inline-block" }}>
              {formData.reportDate || "_________________________"}
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
                  label="Name"
                  value={formData.name}
                  onChange={(value) => handleInputChange(null, "name", value)}
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

              {/* Section A: Pharmacy & Product Sales Summary */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  A. Pharmacy & Product Sales Summary
                </Typography>
              </Grid>

              {formData.products.map((product, index) => (
                <React.Fragment key={index}>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      {product.productName}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Opening Stock"
                      value={product.openingStock}
                      onChange={(value) => handleProductChange(index, "openingStock", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Closing Stock"
                      value={product.closingStock}
                      onChange={(value) => {
                        handleProductChange(index, "closingStock", value);
                        setTimeout(() => calculateProfit(index), 100);
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Buying Price per Unit (Tsh)"
                      value={product.buyingPricePerUnit}
                      onChange={(value) => {
                        handleProductChange(index, "buyingPricePerUnit", value);
                        setTimeout(() => calculateProfit(index), 100);
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Selling Price per Unit (Tsh)"
                      value={product.sellingPricePerUnit}
                      onChange={(value) => {
                        handleProductChange(index, "sellingPricePerUnit", value);
                        setTimeout(() => calculateProfit(index), 100);
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Total Sales (Tsh)"
                      value={product.totalSales}
                      onChange={(value) => handleProductChange(index, "totalSales", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Profit (Tsh)"
                      value={product.profit}
                      onChange={(value) => handleProductChange(index, "profit", value)}
                      helperText="Auto-calculated when buying/selling prices and closing stock are entered"
                    />
                  </Grid>
                </React.Fragment>
              ))}

              {/* Summary Fields */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Summary
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Total Sales (Tsh)"
                  value={formData.totalSales}
                  onChange={(value) => handleInputChange(null, "totalSales", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Total Target (Tsh)"
                  value={formData.totalTarget}
                  onChange={(value) => handleInputChange(null, "totalTarget", value)}
                />
              </Grid>

              {/* Sales Targets & Achievements - General */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Sales Targets & Achievements - General
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Bluecut vs transition lens ratio (Result)"
                  value={formData.salesTargets.bluecutVsTransitionRatio.result}
                  onChange={(value) =>
                    handleNestedInputChange("salesTargets", "bluecutVsTransitionRatio", "result", value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Average Bifocal lens monthly (Result)"
                  value={formData.salesTargets.averageBifocalLensMonthly.result}
                  onChange={(value) =>
                    handleNestedInputChange("salesTargets", "averageBifocalLensMonthly", "result", value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Average Progressive lens monthly (Result)"
                  value={formData.salesTargets.averageProgressiveLensMonthly.result}
                  onChange={(value) =>
                    handleNestedInputChange("salesTargets", "averageProgressiveLensMonthly", "result", value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Contact lenses (Result)"
                  value={formData.salesTargets.contactLenses.result}
                  onChange={(value) =>
                    handleNestedInputChange("salesTargets", "contactLenses", "result", value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="New consultation vs Returning patients (Result)"
                  value={formData.salesTargets.newConsultationVsReturning.result}
                  onChange={(value) =>
                    handleNestedInputChange("salesTargets", "newConsultationVsReturning", "result", value)
                  }
                />
              </Grid>

              {/* Task Section */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Task
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Content created"
                  value={formData.tasks.contentCreated}
                  onChange={(value) => handleInputChange("tasks", "contentCreated", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Patient consulted vs contacted"
                  value={formData.tasks.patientConsultedVsContacted}
                  onChange={(value) => handleInputChange("tasks", "patientConsultedVsContacted", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Presentation made"
                  value={formData.tasks.presentationMade}
                  onChange={(value) => handleInputChange("tasks", "presentationMade", value)}
                />
              </Grid>

              {/* OBSERVATION Section */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  OBSERVATION
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Challenging/unique case and how it was managed"
                  value={formData.observation.challengingUniqueCase}
                  onChange={(value) => handleInputChange("observation", "challengingUniqueCase", value)}
                />
              </Grid>

              {/* Section 2: Challenges */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Section 2: Challenges
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Equipment Issues"
                  value={formData.challenges.equipmentIssues}
                  onChange={(value) => handleInputChange("challenges", "equipmentIssues", value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Patient-Related Challenges"
                  value={formData.challenges.patientRelatedChallenges}
                  onChange={(value) => handleInputChange("challenges", "patientRelatedChallenges", value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Other Challenges"
                  value={formData.challenges.otherChallenges}
                  onChange={(value) => handleInputChange("challenges", "otherChallenges", value)}
                />
              </Grid>

              {/* Section 3: Achievements / Success */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Section 3: Achievements / Success
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Positive Outcomes or Notable Cases"
                  value={formData.achievements.positiveOutcomes}
                  onChange={(value) => handleInputChange("achievements", "positiveOutcomes", value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Training or Skills Gained"
                  value={formData.achievements.trainingSkillsGained}
                  onChange={(value) => handleInputChange("achievements", "trainingSkillsGained", value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Patient Appreciation / Feedback"
                  value={formData.achievements.patientAppreciation}
                  onChange={(value) => handleInputChange("achievements", "patientAppreciation", value)}
                />
              </Grid>

              {/* Section 4: Recommendations */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Section 4: Recommendations
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Service Improvement Suggestions"
                  value={formData.recommendations.serviceImprovementSuggestions}
                  onChange={(value) => handleInputChange("recommendations", "serviceImprovementSuggestions", value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Other Recommendations"
                  value={formData.recommendations.otherRecommendations}
                  onChange={(value) => handleInputChange("recommendations", "otherRecommendations", value)}
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

export default OptometristMonthlyReport;

