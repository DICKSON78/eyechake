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

const CashierMonthlyReport = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  
  // Check access: user must have payment_center privilege OR cashier_monthly_report privilege
  // Admins always have access to all pages
  useEffect(() => {
    const user = window.user || {};
    const privileges = user.privileges || {};
    
    // Admins have access to all pages without checking privileges
    const isAdmin = user.role === "Admin" || user.is_admin === true || user.is_admin === 1 || user.is_admin === "1";
    
    if (!isAdmin && !hasReportAccess(privileges, 'payment_center', 'cashier_monthly_report')) {
      addToast({ 
        message: "You do not have access to this page.", 
        severity: "error" 
      });
      navigate("/payment-center/dashboard");
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

  // Default products list
  const defaultProducts = [
    "Carofit",
    "Probeta N",
    "Levofloxacin",
    "Olopat od",
    "Chloramphenicol ointment",
    "Softdrop",
  ];

  // Form data state
  const [formData, setFormData] = useState({
    employeeName: "",
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
    // Section B: Monthly Targets vs Results
    monthlyTargets: {
      tiktokManagement: [
        {
          performanceArea: "Number of content posted",
          monthlyTarget: "12",
          actualResult: "",
        },
        {
          performanceArea: "New followers gained",
          monthlyTarget: "300",
          actualResult: "",
        },
        {
          performanceArea: "Average views per video",
          monthlyTarget: "1000",
          actualResult: "",
        },
        {
          performanceArea: "Number of clients influenced through TikTok",
          monthlyTarget: "15",
          actualResult: "",
        },
      ],
    },
    // Section 2: Consultation management
    consultationManagement: [
      {
        category: "New Consultations",
        performanceIndicator: "Number of new clients",
        weeklyTarget: "250 clients",
        actualResult: "",
      },
      {
        category: "New Consultations",
        performanceIndicator: "Total income from new consultations",
        weeklyTarget: "3,780,000 Tsh",
        actualResult: "",
      },
      {
        category: "Returning/review Patients",
        performanceIndicator: "Number of clients",
        weeklyTarget: "120 clients",
        actualResult: "",
      },
      {
        category: "Returning/review Patients",
        performanceIndicator: "Total income from returning/review patients",
        weeklyTarget: "600,000 Tsh",
        actualResult: "",
      },
      {
        category: "Total Consultation Target",
        performanceIndicator: "Combined number of all clients",
        weeklyTarget: "4,380,000 Tsh",
        actualResult: "",
      },
    ],
    observations: ["", ""],
    recommendations: ["", ""],
  });

  useEffect(() => {
    document.title = `Comprehensive Monthly Cashier Report - ${window.APP_NAME}`;
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

  const loadSavedReports = async () => {
    try {
      const response = await window.axios.get("api/employee-reports", {
        params: { report_type: "Monthly", per_page: 100 }
      });
      const reports = response?.data?.data?.data || [];
      const cashierReports = reports.filter(r => {
        try {
          const d = typeof r.activities_completed === "string" ? JSON.parse(r.activities_completed) : r.activities_completed;
          return d && d._report_type === "cashier_monthly_report";
        } catch { return false; }
      });
      setSavedReports(cashierReports.map(r => {
        try {
          const d = typeof r.activities_completed === "string" ? JSON.parse(r.activities_completed) : r.activities_completed;
          return { ...d, id: r.id, _api_id: r.id, timestamp: new Date(r.created_at).getTime() };
        } catch { return { id: r.id, _api_id: r.id }; }
      }));
    } catch (error) {
      console.error("Error loading saved reports:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProductChange = (index, field, value) => {
    setFormData((prev) => {
      const newProducts = [...prev.products];
      newProducts[index] = {
        ...newProducts[index],
        [field]: value,
      };
      return {
        ...prev,
        products: newProducts,
      };
    });
  };

  const handleMonthlyTargetChange = (index, field, value) => {
    setFormData((prev) => {
      const newTargets = [...prev.monthlyTargets.tiktokManagement];
      newTargets[index] = {
        ...newTargets[index],
        [field]: value,
      };
      return {
        ...prev,
        monthlyTargets: {
          ...prev.monthlyTargets,
          tiktokManagement: newTargets,
        },
      };
    });
  };

  const handleConsultationChange = (index, field, value) => {
    setFormData((prev) => {
      const newConsultations = [...prev.consultationManagement];
      newConsultations[index] = {
        ...newConsultations[index],
        [field]: value,
      };
      return {
        ...prev,
        consultationManagement: newConsultations,
      };
    });
  };

  const handleObservationsChange = (index, value) => {
    setFormData((prev) => {
      const newObservations = [...prev.observations];
      newObservations[index] = value;
      return {
        ...prev,
        observations: newObservations,
      };
    });
  };

  const handleRecommendationsChange = (index, value) => {
    setFormData((prev) => {
      const newRecommendations = [...prev.recommendations];
      newRecommendations[index] = value;
      return {
        ...prev,
        recommendations: newRecommendations,
      };
    });
  };

  const calculateProfit = (index) => {
    const product = formData.products[index];
    const buyingPrice = parseFloat(product.buyingPricePerUnit) || 0;
    const sellingPrice = parseFloat(product.sellingPricePerUnit) || 0;
    const quantity = parseFloat(product.closingStock) || 0;
    
    if (buyingPrice && sellingPrice && quantity) {
      const profit = (sellingPrice - buyingPrice) * quantity;
      handleProductChange(index, "profit", profit.toFixed(2));
    }
  };

  const handleSave = async () => {
    try {
      const reportData = {
        ...formData,
        _report_type: "cashier_monthly_report",
        dateFilter,
        selectedDate: selectedDate?.toISOString(),
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };

      const payload = {
        report_type: "Monthly",
        report_date: startDate ? startDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        end_date: endDate ? endDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        activities_completed: JSON.stringify(reportData),
        achievements: formData.totalSales || "",
        additional_notes: formData.observations?.join("\n") || "",
      };

      let response;
      if (currentReportId) {
        response = await window.axios.put(`api/employee-reports/${currentReportId}`, payload);
      } else {
        response = await window.axios.post("api/employee-reports", payload);
        setCurrentReportId(response?.data?.data?.id);
      }

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
        monthlyTargets: report.monthlyTargets || {
          tiktokManagement: [
            {
              performanceArea: "Number of content posted",
              monthlyTarget: "12",
              actualResult: "",
            },
            {
              performanceArea: "New followers gained",
              monthlyTarget: "300",
              actualResult: "",
            },
            {
              performanceArea: "Average views per video",
              monthlyTarget: "1000",
              actualResult: "",
            },
            {
              performanceArea: "Number of clients influenced through TikTok",
              monthlyTarget: "15",
              actualResult: "",
            },
          ],
        },
        consultationManagement: report.consultationManagement || [
          {
            category: "New Consultations",
            performanceIndicator: "Number of new clients",
            weeklyTarget: "250 clients",
            actualResult: "",
          },
          {
            category: "New Consultations",
            performanceIndicator: "Total income from new consultations",
            weeklyTarget: "3,780,000 Tsh",
            actualResult: "",
          },
          {
            category: "Returning/review Patients",
            performanceIndicator: "Number of clients",
            weeklyTarget: "120 clients",
            actualResult: "",
          },
          {
            category: "Returning/review Patients",
            performanceIndicator: "Total income from returning/review patients",
            weeklyTarget: "600,000 Tsh",
            actualResult: "",
          },
          {
            category: "Total Consultation Target",
            performanceIndicator: "Combined number of all clients",
            weeklyTarget: "4,380,000 Tsh",
            actualResult: "",
          },
        ],
        observations: report.observations || ["", ""],
        recommendations: report.recommendations || ["", ""],
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
            await window.axios.delete(`api/employee-reports/${report._api_id || report.id}`);
            loadSavedReports();
            if (currentReportId === report.id) {
              setCurrentReportId(null);
              // Reset form
              setFormData({
                employeeName: "",
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
        monthlyTargets: {
          tiktokManagement: [
            {
              performanceArea: "Number of content posted",
              monthlyTarget: "12",
              actualResult: "",
            },
            {
              performanceArea: "New followers gained",
              monthlyTarget: "300",
              actualResult: "",
            },
            {
              performanceArea: "Average views per video",
              monthlyTarget: "1000",
              actualResult: "",
            },
            {
              performanceArea: "Number of clients influenced through TikTok",
              monthlyTarget: "15",
              actualResult: "",
            },
          ],
        },
        consultationManagement: [
          {
            category: "New Consultations",
            performanceIndicator: "Number of new clients",
            weeklyTarget: "250 clients",
            actualResult: "",
          },
          {
            category: "New Consultations",
            performanceIndicator: "Total income from new consultations",
            weeklyTarget: "3,780,000 Tsh",
            actualResult: "",
          },
          {
            category: "Returning/review Patients",
            performanceIndicator: "Number of clients",
            weeklyTarget: "120 clients",
            actualResult: "",
          },
          {
            category: "Returning/review Patients",
            performanceIndicator: "Total income from returning/review patients",
            weeklyTarget: "600,000 Tsh",
            actualResult: "",
          },
          {
            category: "Total Consultation Target",
            performanceIndicator: "Combined number of all clients",
            weeklyTarget: "4,380,000 Tsh",
            actualResult: "",
          },
        ],
        observations: ["", ""],
        recommendations: ["", ""],
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
        monthlyTargets: {
          tiktokManagement: [
            {
              performanceArea: "Number of content posted",
              monthlyTarget: "12",
              actualResult: "",
            },
            {
              performanceArea: "New followers gained",
              monthlyTarget: "300",
              actualResult: "",
            },
            {
              performanceArea: "Average views per video",
              monthlyTarget: "1000",
              actualResult: "",
            },
            {
              performanceArea: "Number of clients influenced through TikTok",
              monthlyTarget: "15",
              actualResult: "",
            },
          ],
        },
        consultationManagement: [
          {
            category: "New Consultations",
            performanceIndicator: "Number of new clients",
            weeklyTarget: "250 clients",
            actualResult: "",
          },
          {
            category: "New Consultations",
            performanceIndicator: "Total income from new consultations",
            weeklyTarget: "3,780,000 Tsh",
            actualResult: "",
          },
          {
            category: "Returning/review Patients",
            performanceIndicator: "Number of clients",
            weeklyTarget: "120 clients",
            actualResult: "",
          },
          {
            category: "Returning/review Patients",
            performanceIndicator: "Total income from returning/review patients",
            weeklyTarget: "600,000 Tsh",
            actualResult: "",
          },
          {
            category: "Total Consultation Target",
            performanceIndicator: "Combined number of all clients",
            weeklyTarget: "4,380,000 Tsh",
            actualResult: "",
          },
        ],
        observations: ["", ""],
        recommendations: ["", ""],
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

      const filename = `Cashier_Monthly_Report_${formData.employeeName || 'Report'}_${formData.month || new Date().toISOString().split('T')[0]}.pdf`;
      
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
      title="Comprehensive Monthly Cashier Report"
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: "Reports" },
        { title: "Comprehensive Monthly Cashier Report" },
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
          Comprehensive Monthly Cashier Report
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

        <Divider sx={{ my: 4 }} />

        {/* Section B: Monthly Targets vs Results */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}
        >
          B. Monthly Targets vs Results
        </Typography>

        {/* Subsection 1: Tiktok management */}
        <Typography
          variant="h6"
          component="h3"
          sx={{ fontWeight: 600, mb: 2, mt: 3, fontFamily: "serif" }}
        >
          1: Tiktok management
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
              <TableCell sx={{ fontWeight: 700 }}>Performance Area</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Monthly Target</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actual Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.monthlyTargets?.tiktokManagement?.map((target, index) => (
              <TableRow key={index}>
                <TableCell>{target.performanceArea}</TableCell>
                <TableCell>{target.monthlyTarget}</TableCell>
                <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                  <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                    {target.actualResult || " "}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ my: 4 }} />

        {/* Section 2: Consultation management */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}
        >
          2. Consultation management
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
              <TableCell sx={{ fontWeight: 700 }}>Performance Indicator</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Weekly Target</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actual Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.consultationManagement?.map((consultation, index) => {
              // Check if this is the first occurrence of this category
              const isFirstInCategory = index === 0 || 
                formData.consultationManagement[index - 1].category !== consultation.category;
              
              // Count how many rows have the same category
              const categoryCount = formData.consultationManagement.filter(
                (c) => c.category === consultation.category
              ).length;

              return (
                <TableRow key={index}>
                  {isFirstInCategory && (
                    <TableCell 
                      rowSpan={categoryCount}
                      sx={{ 
                        border: "1px solid #ccc",
                        verticalAlign: "top",
                        fontWeight: index === 0 ? 600 : "normal"
                      }}
                    >
                      {consultation.category}
                    </TableCell>
                  )}
                  <TableCell sx={{ border: "1px solid #ccc" }}>
                    {consultation.performanceIndicator}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #ccc" }}>
                    {consultation.weeklyTarget}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                    <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                      {consultation.actualResult || " "}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Divider sx={{ my: 4 }} />

        {/* Observations / Challenges */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, fontFamily: "serif" }}
        >
          Observations / Challenges
        </Typography>

        <Box sx={{ mb: 4 }}>
          {formData.observations?.map((observation, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <span style={{ borderBottom: "1px dashed #000", minWidth: "100%", width: "100%", display: "block", paddingBottom: "2px", minHeight: "24px" }}>
                  {observation || " "}
                </span>
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Recommendations */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, fontFamily: "serif" }}
        >
          Recommendations
        </Typography>

        <Box sx={{ mb: 4 }}>
          {formData.recommendations?.map((recommendation, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <span style={{ borderBottom: "1px dashed #000", minWidth: "100%", width: "100%", display: "block", paddingBottom: "2px", minHeight: "24px" }}>
                  {recommendation || " "}
                </span>
              </Typography>
            </Box>
          ))}
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
                  onChange={(value) => handleInputChange("employeeName", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Month"
                  value={formData.month}
                  onChange={(value) => handleInputChange("month", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <DatePicker
                  fullWidth
                  label="Date Submitted"
                  value={formData.dateSubmitted ? new Date(formData.dateSubmitted) : null}
                  onChange={(value) =>
                    handleInputChange(
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
                        // Auto-calculate profit when closing stock changes
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
                  onChange={(value) => handleInputChange("totalSales", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Total Target (Tsh)"
                  value={formData.totalTarget}
                  onChange={(value) => handleInputChange("totalTarget", value)}
                />
              </Grid>

              {/* Section B: Monthly Targets vs Results */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  B. Monthly Targets vs Results
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  1: Tiktok management
                </Typography>
              </Grid>

              {formData.monthlyTargets?.tiktokManagement?.map((target, index) => (
                <React.Fragment key={index}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      {target.performanceArea}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Monthly Target"
                      value={target.monthlyTarget}
                      onChange={(value) => handleMonthlyTargetChange(index, "monthlyTarget", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Actual Result"
                      value={target.actualResult}
                      onChange={(value) => handleMonthlyTargetChange(index, "actualResult", value)}
                    />
                  </Grid>
                </React.Fragment>
              ))}

              {/* Section 2: Consultation management */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  2. Consultation management
                </Typography>
              </Grid>

              {formData.consultationManagement?.map((consultation, index) => (
                <React.Fragment key={index}>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      {consultation.category} - {consultation.performanceIndicator}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Weekly Target"
                      value={consultation.weeklyTarget}
                      onChange={(value) => handleConsultationChange(index, "weeklyTarget", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Actual Result"
                      value={consultation.actualResult}
                      onChange={(value) => handleConsultationChange(index, "actualResult", value)}
                    />
                  </Grid>
                </React.Fragment>
              ))}

              {/* Observations / Challenges */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Observations / Challenges
                </Typography>
              </Grid>

              {formData.observations?.map((observation, index) => (
                <Grid size={{ xs: 12 }} key={index}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={`Observation / Challenge ${index + 1}`}
                    value={observation}
                    onChange={(value) => handleObservationsChange(index, value)}
                  />
                </Grid>
              ))}

              {/* Recommendations */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Recommendations
                </Typography>
              </Grid>

              {formData.recommendations?.map((recommendation, index) => (
                <Grid size={{ xs: 12 }} key={index}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={`Recommendation ${index + 1}`}
                    value={recommendation}
                    onChange={(value) => handleRecommendationsChange(index, value)}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default CashierMonthlyReport;

