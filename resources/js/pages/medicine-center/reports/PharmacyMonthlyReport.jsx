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

const PharmacyMonthlyReport = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const user = window.user || {};
    const privileges = user.privileges || {};
    const isAdmin = user.role === "Admin" || user.is_admin === true || user.is_admin === 1 || user.is_admin === "1";

    if (!isAdmin && !hasReportAccess(privileges, 'medicine_center', 'pharmacy_monthly_report')) {
      addToast({
        message: "You do not have access to this page.",
        severity: "error",
      });
      navigate("/medicine-center/dashboard");
    }
  }, [navigate, addToast]);

  const printRef = useRef(null);
  const modalRef = useRef(null);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [savedReports, setSavedReports] = useState([]);

  const [dateFilter, setDateFilter] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const defaultProducts = [
    "Carofit",
    "Probeta N",
    "Levofloxacin",
    "Olopat od",
    "Chloramphenicol ointment",
    "Softdrop",
  ];

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
    signature: "",
    reportDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    document.title = `Pharmacy Monthly Report - ${window.APP_NAME}`;
    calculateDateRange();
    loadSavedReports();
  }, [dateFilter, selectedDate]);

  const calculateDateRange = () => {
    const date = new Date(selectedDate);
    let start, end;
    switch (dateFilter) {
      case "day":
        start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
        break;
      case "week":
        const dayOfWeek = date.getDay();
        start = new Date(date);
        start.setDate(date.getDate() - dayOfWeek);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59);
        break;
      case "month":
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        break;
      case "year":
        start = new Date(date.getFullYear(), 0, 1);
        end = new Date(date.getFullYear(), 11, 31, 23, 59, 59);
        break;
      default:
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    }
    setStartDate(start);
    setEndDate(end);
  };

  const loadSavedReports = () => {
    try {
      const reports = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("pharmacy_monthly_report_")) {
          const data = JSON.parse(localStorage.getItem(key));
          reports.push({
            id: key,
            timestamp: key.replace("pharmacy_monthly_report_", ""),
            ...data,
          });
        }
      }
      reports.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
      setSavedReports(reports);
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
      const reportId = currentReportId || `pharmacy_monthly_report_${Date.now()}`;
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
        signature: report.signature || "",
        reportDate: report.reportDate || new Date().toISOString().split("T")[0],
      });

      if (report.dateFilter) setDateFilter(report.dateFilter);
      if (report.selectedDate) setSelectedDate(new Date(report.selectedDate));
      if (report.startDate) setStartDate(new Date(report.startDate));
      if (report.endDate) setEndDate(new Date(report.endDate));

      setCurrentReportId(report.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
      addToast({ message: "Report loaded for editing", severity: "success" });
    } catch (error) {
      addToast({ message: formatError(error) || "Failed to load report", severity: "error" });
    }
  };

  const handleDelete = (report) => {
    const component = (
      <ConfirmationDialog
        message={`Delete report for ${report.employeeName || "Unknown"} (${report.month || "Unknown Month"})?`}
        onCancel={() => modalRef.current.close()}
        onOk={async () => {
          try {
            localStorage.removeItem(report.id);
            loadSavedReports();
            if (currentReportId === report.id) {
              setCurrentReportId(null);
              handleNewReport();
            }
            modalRef.current.close();
            addToast({ message: "Report deleted successfully", severity: "success" });
          } catch (error) {
            addToast({ message: formatError(error) || "Failed to delete report", severity: "error" });
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
      signature: "",
      reportDate: new Date().toISOString().split("T")[0],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = async () => {
    try {
      if (!printRef.current) {
        addToast({ message: "Report content not found", severity: "error" });
        return;
      }
      const fileName = `Pharmacy_Monthly_Report_${formData.employeeName || "Report"}_${formData.month || "Unknown"}.pdf`;
      await downloadHTMLAsPDF(printRef.current, fileName);
      addToast({ message: "PDF downloaded successfully!", severity: "success" });
    } catch (error) {
      addToast({ message: formatError(error) || "Failed to download PDF", severity: "error" });
    }
  };

  return (
    <Page title="Pharmacy Monthly Report">
      <Modal ref={modalRef} />
      <Card>
        <CardHeader
          title="Pharmacy Monthly Report"
          avatar={<ReportIcon />}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleNewReport}
              >
                New Report
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                {currentReportId ? "Update" : "Save"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download PDF
              </Button>
            </Stack>
          }
        />
        <CardContent>
          {/* Saved Reports List */}
          {savedReports.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Saved Reports
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Month</TableCell>
                    <TableCell>Date Submitted</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.employeeName || "N/A"}</TableCell>
                      <TableCell>{report.month || "N/A"}</TableCell>
                      <TableCell>{report.dateSubmitted || "N/A"}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(report)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(report)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* Report Display */}
          <Paper
            ref={printRef}
            sx={{
              p: 4,
              "@media print": { p: 2, boxShadow: "none" },
            }}
          >
            {/* Header */}
            <Typography
              variant="h5"
              component="h1"
              sx={{
                textAlign: "center",
                fontWeight: 700,
                mb: 1,
                textTransform: "uppercase",
                fontFamily: "serif",
              }}
            >
              PHARMACY MONTHLY REPORT
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Employee Info */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={formData.employeeName}
                  onChange={(value) => handleInputChange("employeeName", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  label="Month"
                  value={formData.month}
                  onChange={(value) => handleInputChange("month", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <DatePicker
                  label="Date Submitted"
                  value={formData.dateSubmitted}
                  onChange={(date) => handleInputChange("dateSubmitted", date)}
                />
              </Grid>
            </Grid>

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
                    <TableCell>
                      <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                        {product.openingStock || " "}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                        {product.closingStock || " "}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                        {product.buyingPricePerUnit || " "}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                        {product.sellingPricePerUnit || " "}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                        {product.totalSales || " "}
                      </span>
                    </TableCell>
                    <TableCell>
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
                  <TableCell>
                    <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                      {formData.totalSales || " "}
                    </span>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell colSpan={5} sx={{ fontWeight: 700, textAlign: "right" }}>
                    TOTAL TARGET
                  </TableCell>
                  <TableCell>
                    <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                      {formData.totalTarget || "2,000,000"}
                    </span>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Divider sx={{ my: 3 }} />

            {/* Edit Inputs for Products */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Edit Product Data
            </Typography>
            <Grid container spacing={2}>
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
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Footer - Signature and Date */}
            <Box sx={{ mt: 6, mb: 2 }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    <strong>Signature:</strong>
                    <TextField
                      fullWidth
                      value={formData.signature}
                      onChange={(value) => handleInputChange("signature", value)}
                      sx={{ mt: 1 }}
                    />
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    <strong>Date:</strong>
                    <DatePicker
                      value={formData.reportDate}
                      onChange={(date) => handleInputChange("reportDate", date)}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </CardContent>
      </Card>
    </Page>
  );
};

export default PharmacyMonthlyReport;
