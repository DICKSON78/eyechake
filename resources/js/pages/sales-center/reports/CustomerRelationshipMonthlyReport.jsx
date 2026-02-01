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

const STORAGE_KEY_PREFIX = "customer_relationship_report_";

const customerRelationshipInitial = {
  totalClientsCalled: "",
  clientsReachedSuccessfully: "",
  clientsRemindedForFollowup: "",
  clientsContactedForAfterSales: "",
  clientsContactedForMarketing: "",
  positiveResponses: "",
  clientsReturnedAfterFollowup: "",
  crossSellingAchieved: "",
};

const challengesInitial = {
  supplyStockIssues: "",
  customerObjectionsPricing: "",
  marketCompetition: "",
};

const achievementsInitial = {
  bestSellingProducts: "",
  mostSuccessfulCampaign: "",
  positiveTestimonials: "",
};

const recommendationsInitial = {
  suggestionsForImproving: "",
  newStrategiesPromotions: "",
  supportResourcesNeeded: "",
};

const crmActivityLabels = [
  { label: "Total Clients Called", key: "totalClientsCalled" },
  { label: "Clients Reached Successfully", key: "clientsReachedSuccessfully" },
  { label: "Clients Reminded for Follow-up / Recheck", key: "clientsRemindedForFollowup" },
  { label: "Clients Contacted for After-Sales Feedback", key: "clientsContactedForAfterSales" },
  { label: "Clients Contacted for Marketing / Offers", key: "clientsContactedForMarketing" },
  { label: "Positive Responses / Appreciations", key: "positiveResponses" },
  { label: "Number of clients who returned after follow-up", key: "clientsReturnedAfterFollowup" },
  { label: "Cross-selling achieved through follow-up calls", key: "crossSellingAchieved" },
];

const getDefaultFormData = () => ({
  employeeName: "",
  month: "",
  dateSubmitted: new Date().toISOString().split("T")[0],
  customerRelationship: { ...customerRelationshipInitial },
  customerFeedback: "",
  challenges: { ...challengesInitial },
  achievements: { ...achievementsInitial },
  recommendations: { ...recommendationsInitial },
  signature: "",
  reportDate: new Date().toISOString().split("T")[0],
});

const CustomerRelationshipMonthlyReport = () => {
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
    if (!isAdmin && !hasReportAccess(privileges, "sales_center", "customer_relationship_report")) {
      addToast({ message: "You do not have access to this report.", severity: "error" });
      navigate("/sales-center/dashboard");
    }
  }, [navigate, addToast]);

  useEffect(() => {
    document.title = `Customer Relationship Monthly Report - ${window.APP_NAME}`;
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

  const loadSavedReports = () => {
    try {
      const reports = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
          const data = JSON.parse(localStorage.getItem(key));
          reports.push({ id: key, timestamp: key.replace(STORAGE_KEY_PREFIX, ""), ...data });
        }
      }
      reports.sort((a, b) => parseInt(b.timestamp, 10) - parseInt(a.timestamp, 10));
      setSavedReports(reports);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: typeof prev[section] === "object" ? { ...prev[section], [field]: value } : value,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleNestedInputChange = (section, subSection, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: { ...prev[section][subSection], [field]: value },
      },
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
      customerRelationship: report.customerRelationship || customerRelationshipInitial,
      customerFeedback: report.customerFeedback || "",
      challenges: report.challenges || challengesInitial,
      achievements: report.achievements || achievementsInitial,
      recommendations: report.recommendations || recommendationsInitial,
      signature: report.signature || "",
      reportDate: report.reportDate || getDefaultFormData().reportDate,
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
          localStorage.removeItem(report.id);
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
      await downloadHTMLAsPDF(printRef.current, `Customer_Relationship_Report_${name}_${month}.pdf`);
      addToast({ message: "Report downloaded.", severity: "success" });
    } catch (e) {
      addToast({ message: formatError(e) || "Failed to download", severity: "error" });
    }
  };

  return (
    <Page
      title="Customer Relationship Monthly Report"
      breadcrumbs={[
        { title: "Home" },
        { title: "Sales Center" },
        { title: "Reports" },
        { title: "Customer Relationship Monthly Report" },
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
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker fullWidth label="Select Date" value={selectedDate} onChange={(v) => setSelectedDate(v || new Date())} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker fullWidth label="Start Date" value={startDate} onChange={(v) => setStartDate(v)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
          Customer Relationship Monthly Report
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

        <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}>
          1. Customer Relationship Management
        </Typography>
        <Table sx={{ mb: 4, border: "1px dashed #ccc", "& .MuiTableCell-root": { border: "1px dashed #ccc", padding: "8px" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Activity</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Number / Summary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {crmActivityLabels.map((item) => (
              <TableRow key={item.key}>
                <TableCell>{item.label}</TableCell>
                <TableCell>{formData.customerRelationship[item.key] || " "}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}>
          2. Customer Feedback & Satisfaction
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>• Common feedback from customers:</Typography>
        <Box sx={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px", minHeight: "40px", mb: 4, p: 1 }}>
          {formData.customerFeedback || ""}
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}>
          3. Challenges Faced
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>• Supply or stock-related issues:</Typography>
        <Box sx={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px", minHeight: "40px", mb: 2, p: 1 }}>
          {formData.challenges.supplyStockIssues || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>• Customer objections or pricing challenges:</Typography>
        <Box sx={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px", minHeight: "40px", mb: 2, p: 1 }}>
          {formData.challenges.customerObjectionsPricing || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>• Market competition observations:</Typography>
        <Box sx={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px", minHeight: "40px", mb: 4, p: 1 }}>
          {formData.challenges.marketCompetition || ""}
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}>
          4. Achievements / Highlights
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>• Best-selling product(s):</Typography>
        <Box sx={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px", minHeight: "40px", mb: 2, p: 1 }}>
          {formData.achievements.bestSellingProducts || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>• Most successful campaign or event:</Typography>
        <Box sx={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px", minHeight: "40px", mb: 2, p: 1 }}>
          {formData.achievements.mostSuccessfulCampaign || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>• Notable positive customer testimonials or referrals:</Typography>
        <Box sx={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px", minHeight: "40px", mb: 4, p: 1 }}>
          {formData.achievements.positiveTestimonials || ""}
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}>
          5. Recommendations
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>• Suggestions for improving sales or marketing:</Typography>
        <Box sx={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px", minHeight: "40px", mb: 2, p: 1 }}>
          {formData.recommendations.suggestionsForImproving || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>• New strategies or promotions proposed:</Typography>
        <Box sx={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px", minHeight: "40px", mb: 2, p: 1 }}>
          {formData.recommendations.newStrategiesPromotions || ""}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>• Support or resources needed:</Typography>
        <Box sx={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px", minHeight: "40px", mb: 4, p: 1 }}>
          {formData.recommendations.supportResourcesNeeded || ""}
        </Box>

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

      <Box sx={{ mt: 4, "@media print": { display: "none" } }}>
        <Card>
          <CardHeader title="Fill Report Data" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Employee Name" value={formData.employeeName} onChange={(v) => handleInputChange(null, "employeeName", v)} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Month" value={formData.month} onChange={(v) => handleInputChange(null, "month", v)} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <DatePicker fullWidth label="Date Submitted" value={formData.dateSubmitted ? new Date(formData.dateSubmitted) : null} onChange={(v) => handleInputChange(null, "dateSubmitted", v ? v.toISOString().split("T")[0] : "")} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>1. Customer Relationship Management</Typography>
              </Grid>
              {crmActivityLabels.map((item) => (
                <Grid key={item.key} size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label={item.label} value={formData.customerRelationship[item.key] || ""} onChange={(v) => handleInputChange("customerRelationship", item.key, v)} />
                </Grid>
              ))}

              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>2. Customer Feedback & Satisfaction</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={3} label="Common feedback from customers" value={formData.customerFeedback} onChange={(v) => handleInputChange(null, "customerFeedback", v)} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>3. Challenges Faced</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={2} label="Supply or stock-related issues" value={formData.challenges.supplyStockIssues} onChange={(v) => handleInputChange("challenges", "supplyStockIssues", v)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={2} label="Customer objections or pricing" value={formData.challenges.customerObjectionsPricing} onChange={(v) => handleInputChange("challenges", "customerObjectionsPricing", v)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={2} label="Market competition observations" value={formData.challenges.marketCompetition} onChange={(v) => handleInputChange("challenges", "marketCompetition", v)} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>4. Achievements / Highlights</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={2} label="Best-selling product(s)" value={formData.achievements.bestSellingProducts} onChange={(v) => handleInputChange("achievements", "bestSellingProducts", v)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={2} label="Most successful campaign or event" value={formData.achievements.mostSuccessfulCampaign} onChange={(v) => handleInputChange("achievements", "mostSuccessfulCampaign", v)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={2} label="Notable positive testimonials or referrals" value={formData.achievements.positiveTestimonials} onChange={(v) => handleInputChange("achievements", "positiveTestimonials", v)} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>5. Recommendations</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={2} label="Suggestions for improving sales or marketing" value={formData.recommendations.suggestionsForImproving} onChange={(v) => handleInputChange("recommendations", "suggestionsForImproving", v)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={2} label="New strategies or promotions proposed" value={formData.recommendations.newStrategiesPromotions} onChange={(v) => handleInputChange("recommendations", "newStrategiesPromotions", v)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={2} label="Support or resources needed" value={formData.recommendations.supportResourcesNeeded} onChange={(v) => handleInputChange("recommendations", "supportResourcesNeeded", v)} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Signature" value={formData.signature} onChange={(v) => handleInputChange(null, "signature", v)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker fullWidth label="Report Date" value={formData.reportDate ? new Date(formData.reportDate) : null} onChange={(v) => handleInputChange(null, "reportDate", v ? v.toISOString().split("T")[0] : "")} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default CustomerRelationshipMonthlyReport;
