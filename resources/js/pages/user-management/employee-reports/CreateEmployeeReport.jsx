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
import { usePost, useToast } from "../../../hooks";
import { formatDateForDb, formatError } from "../../../helpers";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

const CreateEmployeeReport = ({ initialReportType, modal, fetchReports }) => {
  const addToast = useToast();

  const formRef = useRef();
  const reportTypeRef = useRef();
  const reportDateRef = useRef();
  const activitiesRef = useRef();
  const achievementsRef = useRef();
  const challengesRef = useRef();
  const tasksPendingRef = useRef();
  const nextPlansRef = useRef();
  const notesRef = useRef();

  const [reportType, setReportType] = useState(initialReportType || "Daily");
  const [reportDate, setReportDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);

  const [formData, setFormData] = useState({
    report_type: initialReportType || "Daily",
    report_date: new Date(),
    end_date: null,
    activities_completed: "",
    achievements: "",
    challenges_faced: "",
    tasks_pending: "",
    next_period_plans: "",
    additional_notes: "",
    status: "Draft",
  });

  const { data, loading, error, handlePost } = usePost("api/employee-reports", {
    ...formData,
    report_date: formatDateForDb(formData.report_date),
    end_date: formData.end_date ? formatDateForDb(formData.end_date) : null,
  });

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchReports();
        modal.close();
      }, 1000);
    }
  }, [data, fetchReports, modal, addToast]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

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
      handlePost();
    }
  };

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent>
        <Form ref={formRef}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Select
                ref={reportTypeRef}
                label="Report Type"
                fullWidth
                required
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
                ref={reportDateRef}
                label={
                  reportType === "Daily"
                    ? "Report Date"
                    : reportType === "Weekly"
                    ? "Week Start Date"
                    : "Month Start Date"
                }
                fullWidth
                required
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
                ref={activitiesRef}
                label="What activities did you complete during this period?"
                fullWidth
                multiline
                rows={4}
                value={formData.activities_completed}
                onChange={(value) =>
                  setFormData({ ...formData, activities_completed: value })
                }
                placeholder="Describe the activities you completed..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Achievements
              </Typography>
              <TextField
                ref={achievementsRef}
                label="What achievements did you accomplish?"
                fullWidth
                multiline
                rows={3}
                value={formData.achievements}
                onChange={(value) =>
                  setFormData({ ...formData, achievements: value })
                }
                placeholder="List your achievements..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Challenges Faced
              </Typography>
              <TextField
                ref={challengesRef}
                label="What challenges did you encounter?"
                fullWidth
                multiline
                rows={3}
                value={formData.challenges_faced}
                onChange={(value) =>
                  setFormData({ ...formData, challenges_faced: value })
                }
                placeholder="Describe any challenges you faced..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Pending Tasks
              </Typography>
              <TextField
                ref={tasksPendingRef}
                label="What tasks are still pending?"
                fullWidth
                multiline
                rows={3}
                value={formData.tasks_pending}
                onChange={(value) =>
                  setFormData({ ...formData, tasks_pending: value })
                }
                placeholder="List pending tasks..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Plans for Next Period
              </Typography>
              <TextField
                ref={nextPlansRef}
                label="What are your plans for the next period?"
                fullWidth
                multiline
                rows={3}
                value={formData.next_period_plans}
                onChange={(value) =>
                  setFormData({ ...formData, next_period_plans: value })
                }
                placeholder="Describe your plans for the next period..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Additional Notes
              </Typography>
              <TextField
                ref={notesRef}
                label="Any additional notes or comments"
                fullWidth
                multiline
                rows={3}
                value={formData.additional_notes}
                onChange={(value) =>
                  setFormData({ ...formData, additional_notes: value })
                }
                placeholder="Add any additional notes..."
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
        <Button onClick={() => modal.close()}>Cancel</Button>
        <Button
          variant="outlined"
          onClick={() => {
            setFormData({ ...formData, status: "Draft" });
            handleSubmit();
          }}
          disabled={loading}
        >
          Save as Draft
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setFormData({ ...formData, status: "Submitted" });
            handleSubmit();
          }}
          disabled={loading}
        >
          Submit Report
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default CreateEmployeeReport;

