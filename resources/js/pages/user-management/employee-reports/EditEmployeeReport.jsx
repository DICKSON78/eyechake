import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CardActions,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import { usePatch, useDelete, useToast } from "../../../hooks";
import { formatDateForDb, formatError } from "../../../helpers";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

const EditEmployeeReport = ({ report, modal, fetchReports }) => {
  const addToast = useToast();

  const formRef = useRef();
  const [reportType, setReportType] = useState(report.report_type);
  const [reportDate, setReportDate] = useState(new Date(report.report_date));
  const [endDate, setEndDate] = useState(
    report.end_date ? new Date(report.end_date) : null
  );

  const [formData, setFormData] = useState({
    report_type: report.report_type,
    report_date: new Date(report.report_date),
    end_date: report.end_date ? new Date(report.end_date) : null,
    activities_completed: report.activities_completed || "",
    achievements: report.achievements || "",
    challenges_faced: report.challenges_faced || "",
    tasks_pending: report.tasks_pending || "",
    next_period_plans: report.next_period_plans || "",
    additional_notes: report.additional_notes || "",
    status: report.status,
  });

  const { data: updateData, loading: updateLoading, error: updateError, handlePatch } = usePatch();
  const { data: deleteData, loading: deleteLoading, error: deleteError, handleDelete } = useDelete();

  useEffect(() => {
    if (updateData) {
      addToast({ message: updateData.message, severity: "success" });
      window.setTimeout(() => {
        fetchReports();
        modal.close();
      }, 1000);
    }
  }, [updateData, fetchReports, modal, addToast]);

  useEffect(() => {
    if (deleteData) {
      addToast({ message: deleteData.message, severity: "success" });
      window.setTimeout(() => {
        fetchReports();
        modal.close();
      }, 1000);
    }
  }, [deleteData, fetchReports, modal, addToast]);

  useEffect(() => {
    if (updateError) {
      addToast({ message: formatError(updateError), severity: "error" });
    }
  }, [updateError, addToast]);

  useEffect(() => {
    if (deleteError) {
      addToast({ message: formatError(deleteError), severity: "error" });
    }
  }, [deleteError, addToast]);

  useEffect(() => {
    // Auto-calculate end_date based on report_type
    if (reportType === "Weekly") {
      const weekStart = startOfWeek(reportDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(reportDate, { weekStartsOn: 1 });
      setFormData({
        ...formData,
        report_date: weekStart,
        end_date: weekEnd,
      });
      setEndDate(weekEnd);
    } else if (reportType === "Monthly") {
      const monthStart = startOfMonth(reportDate);
      const monthEnd = endOfMonth(reportDate);
      setFormData({
        ...formData,
        report_date: monthStart,
        end_date: monthEnd,
      });
      setEndDate(monthEnd);
    } else {
      setFormData({
        ...formData,
        report_date: reportDate,
        end_date: reportDate,
      });
      setEndDate(reportDate);
    }
  }, [reportType, reportDate]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePatch(`api/employee-reports/${report.id}`, {
        ...formData,
        report_date: formatDateForDb(formData.report_date),
        end_date: formData.end_date ? formatDateForDb(formData.end_date) : null,
      });
    }
  };

  const handleDeleteReport = () => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      handleDelete(`api/employee-reports/${report.id}`);
    }
  };

  return (
    <React.Fragment>
      {(updateLoading || deleteLoading) && <LinearProgress />}
      <CardContent>
        <Form ref={formRef}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Select
                label="Report Type"
                fullWidth
                required
                disabled={report.status !== "Draft"}
                options={[
                  { label: "Daily", value: "Daily" },
                  { label: "Weekly", value: "Weekly" },
                  { label: "Monthly", value: "Monthly" },
                ]}
                value={reportType}
                onChange={(value) => {
                  setReportType(value);
                  setFormData({ ...formData, report_type: value });
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label={
                  reportType === "Daily"
                    ? "Report Date"
                    : reportType === "Weekly"
                    ? "Week Start Date"
                    : "Month Start Date"
                }
                fullWidth
                required
                disabled={report.status !== "Draft"}
                value={reportDate}
                onChange={(value) => {
                  if (value instanceof Date && !isNaN(value)) {
                    setReportDate(value);
                  }
                }}
              />
            </Grid>
            {(reportType === "Weekly" || reportType === "Monthly") && (
              <Grid item xs={12} md={6}>
                <DatePicker
                  label={
                    reportType === "Weekly" ? "Week End Date" : "Month End Date"
                  }
                  fullWidth
                  disabled={report.status !== "Draft"}
                  value={endDate}
                  onChange={(value) => {
                    if (value instanceof Date && !isNaN(value)) {
                      setEndDate(value);
                      setFormData({ ...formData, end_date: value });
                    }
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Activities Completed
              </Typography>
              <TextField
                label="What activities did you complete during this period?"
                fullWidth
                multiline
                rows={4}
                disabled={report.status !== "Draft"}
                value={formData.activities_completed}
                onChange={(value) =>
                  setFormData({ ...formData, activities_completed: value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Achievements
              </Typography>
              <TextField
                label="What achievements did you accomplish?"
                fullWidth
                multiline
                rows={3}
                disabled={report.status !== "Draft"}
                value={formData.achievements}
                onChange={(value) =>
                  setFormData({ ...formData, achievements: value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Challenges Faced
              </Typography>
              <TextField
                label="What challenges did you encounter?"
                fullWidth
                multiline
                rows={3}
                disabled={report.status !== "Draft"}
                value={formData.challenges_faced}
                onChange={(value) =>
                  setFormData({ ...formData, challenges_faced: value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Pending Tasks
              </Typography>
              <TextField
                label="What tasks are still pending?"
                fullWidth
                multiline
                rows={3}
                disabled={report.status !== "Draft"}
                value={formData.tasks_pending}
                onChange={(value) =>
                  setFormData({ ...formData, tasks_pending: value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Plans for Next Period
              </Typography>
              <TextField
                label="What are your plans for the next period?"
                fullWidth
                multiline
                rows={3}
                disabled={report.status !== "Draft"}
                value={formData.next_period_plans}
                onChange={(value) =>
                  setFormData({ ...formData, next_period_plans: value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Additional Notes
              </Typography>
              <TextField
                label="Any additional notes or comments"
                fullWidth
                multiline
                rows={3}
                disabled={report.status !== "Draft"}
                value={formData.additional_notes}
                onChange={(value) =>
                  setFormData({ ...formData, additional_notes: value })
                }
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        {report.status === "Draft" && (
          <Button
            color="error"
            onClick={handleDeleteReport}
            disabled={deleteLoading}
          >
            Delete
          </Button>
        )}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={() => modal.close()}>Cancel</Button>
          {report.status === "Draft" && (
            <>
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData({ ...formData, status: "Draft" });
                  handleSubmit();
                }}
                disabled={updateLoading}
              >
                Save as Draft
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setFormData({ ...formData, status: "Submitted" });
                  handleSubmit();
                }}
                disabled={updateLoading}
              >
                Submit Report
              </Button>
            </>
          )}
        </Box>
      </CardActions>
    </React.Fragment>
  );
};

export default EditEmployeeReport;

