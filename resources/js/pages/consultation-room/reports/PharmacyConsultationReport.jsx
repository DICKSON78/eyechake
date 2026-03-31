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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
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

const STORAGE_KEY_PREFIX = "pharmacy_consultation_report_";
const defaultProducts = ["Carofit", "Lotel", "Olopatadine", "Softdrop", "Levofloxacin"];

const getDefaultFormData = () => ({
  employeeName: "",
  month: "",
  dateSubmitted: new Date().toISOString().split("T")[0],
  productTargets: defaultProducts.map((name) => ({ productName: name, target: "30", result: "" })),
  signature: "",
  reportDate: new Date().toISOString().split("T")[0],
  reportSummary: "",
  reportRecommendation: "",
});

const PharmacyConsultationReport = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const modalRef = useRef(null);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [dateFilter, setDateFilter] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [formData, setFormData] = useState(getDefaultFormData());

  useEffect(() => {
    const user = window.user || {};
    const privileges = user.privileges || {};
    const isAdmin = user.role === "Admin" || user.is_admin === true || user.is_admin === 1 || user.is_admin === "1";
    const hasAccess = hasReportAccess(privileges, "consultation_room", "pharmacy_consultation_report") || hasReportAccess(privileges, "medicine_center", "pharmacy_consultation_report");
    if (!isAdmin && !hasAccess) {
      addToast({ message: "You do not have access to this report.", severity: "error" });
      navigate("/consultation-room/dashboard");
    }
  }, [navigate, addToast]);

  useEffect(() => {
    document.title = `Pharmacy & Consultation Report - ${window.APP_NAME}`;
    calculateDateRange();
    loadSavedReports();
  }, [dateFilter, selectedDate]);

  const calculateDateRange = () => {
    const date = new Date(selectedDate);
    let start, end;
    switch (dateFilter) {
      case "day":
        start = end = new Date(date);
        break;
      case "week":
        start = new Date(date);
        start.setDate(date.getDate() - date.getDay());
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
        start = end = new Date(date);
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
      const filtered = reports.filter(r => {
        try {
          const d = typeof r.activities_completed === "string" ? JSON.parse(r.activities_completed) : r.activities_completed;
          return d && d._report_type === "pharmacy_consultation_report";
        } catch { return false; }
      });
      setSavedReports(filtered.map(r => {
        try {
          const d = typeof r.activities_completed === "string" ? JSON.parse(r.activities_completed) : r.activities_completed;
          return { ...d, id: r.id, _api_id: r.id, timestamp: new Date(r.created_at).getTime() };
        } catch { return { id: r.id, _api_id: r.id }; }
      }));
    } catch (error) {
      console.error("Error loading saved reports:", error);
    }
  };

  const handleProductTargetChange = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev.productTargets];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, productTargets: next };
    });
  };

  const handleAddMedicine = () => {
    setFormData((prev) => ({
      ...prev,
      productTargets: [...prev.productTargets, { productName: "", target: "30", result: "" }],
    }));
  };

  const handleRemoveMedicine = (index) => {
    setFormData((prev) => ({
      ...prev,
      productTargets: prev.productTargets.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    try {
      const reportId = currentReportId || `${STORAGE_KEY_PREFIX}${Date.now()}`;
      const toSave = {
        ...formData,
        dateFilter,
        selectedDate: selectedDate.toISOString(),
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };
      localStorage.setItem(reportId, JSON.stringify(toSave));
      setCurrentReportId(reportId);
      loadSavedReports();
      addToast({ message: currentReportId ? "Report updated." : "Report saved.", severity: "success" });
    } catch (e) {
      addToast({ message: formatError(e) || "Failed to save", severity: "error" });
    }
  };

  const handleEdit = (report) => {
    setFormData({
      ...getDefaultFormData(),
      employeeName: report.employeeName || "",
      month: report.month || "",
      dateSubmitted: report.dateSubmitted || getDefaultFormData().dateSubmitted,
      productTargets: Array.isArray(report.productTargets) && report.productTargets.length ? report.productTargets : getDefaultFormData().productTargets,
      signature: report.signature || "",
      reportDate: report.reportDate || getDefaultFormData().reportDate,
      reportSummary: report.reportSummary || "",
      reportRecommendation: report.reportRecommendation || "",
    });
    setCurrentReportId(report.id);
    if (report.selectedDate) setSelectedDate(new Date(report.selectedDate));
    if (report.dateFilter) setDateFilter(report.dateFilter);
    window.scrollTo({ top: 0, behavior: "smooth" });
    addToast({ message: "Report loaded for editing", severity: "success" });
  };

  const handleDelete = (report) => {
    const component = (
      <ConfirmationDialog
        message={`Delete report for ${report.employeeName || "Unknown"} (${report.month || "Unknown"})?`}
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          await window.axios.delete(`api/employee-reports/${report._api_id || report.id}`);
          loadSavedReports();
          if (currentReportId === report.id) {
            setCurrentReportId(null);
            setFormData(getDefaultFormData());
          }
          modalRef.current.close();
          addToast({ message: "Report deleted", severity: "success" });
        }}
      />
    );
    modalRef.current.open("Confirm Delete", component);
  };

  const handleNewReport = () => {
    setCurrentReportId(null);
    setFormData(getDefaultFormData());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = async () => {
    if (!printRef.current) {
      addToast({ message: "Report content not found", severity: "error" });
      return;
    }
    try {
      const name = formData.employeeName || "Report";
      const month = formData.month || new Date().toISOString().split("T")[0];
      await downloadHTMLAsPDF(printRef.current, `Pharmacy_Consultation_Report_${name}_${month}.pdf`);
      addToast({ message: "Report downloaded.", severity: "success" });
    } catch (e) {
      addToast({ message: formatError(e) || "Failed to download", severity: "error" });
    }
  };

  return (
    <Page
      title="Pharmacy & Consultation Report"
      breadcrumbs={[
        { title: "Home" },
        { title: "Consultation Room" },
        { title: "Reports" },
        { title: "Pharmacy & Consultation Report" },
      ]}
    >
      <Box sx={{ mb: 3, "@media print": { display: "none" } }}>
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <Select
                  fullWidth
                  label="Report Period"
                  value={dateFilter}
                  onChange={(v) => setDateFilter(v)}
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
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker fullWidth label="Select Date" value={selectedDate} onChange={(v) => setSelectedDate(v || new Date())} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker fullWidth label="Start Date" value={startDate} onChange={(v) => setStartDate(v)} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker fullWidth label="End Date" value={endDate} onChange={(v) => setEndDate(v)} />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "space-between", alignItems: "center" }}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleNewReport} size="small">
                New Report
              </Button>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                  {currentReportId ? "Update" : "Save"}
                </Button>
                <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleDownload}>
                  Download PDF
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

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
                    <TableCell>Saved</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.employeeName || "N/A"}</TableCell>
                      <TableCell>{report.month || "N/A"}</TableCell>
                      <TableCell>{report.dateSubmitted ? new Date(report.dateSubmitted).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>{new Date(parseInt(report.timestamp, 10)).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => handleEdit(report)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(report)}>
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

      <Paper ref={printRef} sx={{ p: 4, "@media print": { p: 2, boxShadow: "none" } }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3, textAlign: "center", color: "#1976d2", fontFamily: "serif" }}>
          Pharmacy & Consultation Report
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Employee Name:</strong>
              </Typography>
              <TextField fullWidth size="small" value={formData.employeeName} onChange={(v) => setFormData((p) => ({ ...p, employeeName: v }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Month:</strong>
              </Typography>
              <TextField fullWidth size="small" value={formData.month} onChange={(v) => setFormData((p) => ({ ...p, month: v }))} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Date Submitted:</strong>
              </Typography>
              <DatePicker fullWidth value={formData.dateSubmitted ? new Date(formData.dateSubmitted) : null} onChange={(v) => setFormData((p) => ({ ...p, dateSubmitted: v ? v.toISOString().split("T")[0] : "" }))} />
            </Grid>
          </Grid>
        </Box>
        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}>
          Total Medicine vs Target
        </Typography>
        <Table sx={{ mb: 4, border: "1px solid #ccc", "& .MuiTableCell-root": { border: "1px solid #ccc", padding: "8px" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>MEDICINE</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>TARGET</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>RESULTS</TableCell>
              <TableCell sx={{ fontWeight: 700, "@media print": { display: "none" } }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.productTargets.map((product, index) => (
              <TableRow key={index}>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={product.productName || ""}
                    onChange={(v) => handleProductTargetChange(index, "productName", v)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={product.target || ""}
                    onChange={(v) => handleProductTargetChange(index, "target", v)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={product.result || ""}
                    onChange={(v) => handleProductTargetChange(index, "result", v)}
                  />
                </TableCell>
                <TableCell sx={{ "@media print": { display: "none" } }}>
                  <IconButton color="error" size="small" onClick={() => handleRemoveMedicine(index)} disabled={formData.productTargets.length === 1}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddMedicine} sx={{ mb: 4, "@media print": { display: "none" } }}>
          Add Medicine
        </Button>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}>
          Report Notes
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Report Summary:</strong>
              </Typography>
              <TextField 
                fullWidth 
                multiline 
                rows={3} 
                placeholder="Enter summary of findings and observations for this report..."
                value={formData.reportSummary} 
                onChange={(v) => setFormData((p) => ({ ...p, reportSummary: v }))} 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Report Recommendation:</strong>
              </Typography>
              <TextField 
                fullWidth 
                multiline 
                rows={3} 
                placeholder="Enter recommendations based on the report data..."
                value={formData.reportRecommendation} 
                onChange={(v) => setFormData((p) => ({ ...p, reportRecommendation: v }))} 
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Signature:</strong>
              </Typography>
              <TextField fullWidth size="small" value={formData.signature} onChange={(v) => setFormData((p) => ({ ...p, signature: v }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Date:</strong>
              </Typography>
              <DatePicker fullWidth value={formData.reportDate ? new Date(formData.reportDate) : null} onChange={(v) => setFormData((p) => ({ ...p, reportDate: v ? v.toISOString().split("T")[0] : "" }))} />
            </Grid>
          </Grid>
        </Box>
      </Paper>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default PharmacyConsultationReport;
