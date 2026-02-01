import React from "react";
import {
  Box,
  Button,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Grid,
  Typography,
  Paper,
} from "@mui/material";
import {
  CheckCircleRounded as ApprovedIcon,
  CancelRounded as RejectedIcon,
  PersonRounded as PersonIcon,
  CalendarTodayRounded as CalendarIcon,
} from "@mui/icons-material";
import { green, red, blue } from "@mui/material/colors";

const ViewEmployeeReport = ({ report, modal }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Draft":
        return "default";
      case "Submitted":
        return "info";
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      default:
        return "default";
    }
  };

  const formatDateRange = () => {
    if (report.report_type === "Daily") {
      return new Date(report.report_date).toLocaleDateString();
    } else {
      const start = new Date(report.report_date).toLocaleDateString();
      const end = report.end_date
        ? new Date(report.end_date).toLocaleDateString()
        : "";
      return `${start} - ${end}`;
    }
  };

  return (
    <React.Fragment>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: blue[50] }}>
                <Typography variant="caption" color="text.secondary">
                  Report Type
                </Typography>
                <Typography variant="h6">{report.report_type} Report</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: blue[50] }}>
                <Typography variant="caption" color="text.secondary">
                  Report Period
                </Typography>
                <Typography variant="h6">{formatDateRange()}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: blue[50] }}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    icon={
                      report.status === "Approved" ? (
                        <ApprovedIcon />
                      ) : report.status === "Rejected" ? (
                        <RejectedIcon />
                      ) : null
                    }
                    label={report.status}
                    color={getStatusColor(report.status)}
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: blue[50] }}>
                <Typography variant="caption" color="text.secondary">
                  Employee
                </Typography>
                <Typography variant="h6">
                  {report.employee?.full_name || "N/A"}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
              Activities Completed
            </Typography>
            <Paper sx={{ p: 2, bgcolor: "background.default", minHeight: 100 }}>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {report.activities_completed || "No activities recorded."}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
              Achievements
            </Typography>
            <Paper sx={{ p: 2, bgcolor: "background.default", minHeight: 80 }}>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {report.achievements || "No achievements recorded."}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
              Challenges Faced
            </Typography>
            <Paper sx={{ p: 2, bgcolor: "background.default", minHeight: 80 }}>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {report.challenges_faced || "No challenges recorded."}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
              Pending Tasks
            </Typography>
            <Paper sx={{ p: 2, bgcolor: "background.default", minHeight: 80 }}>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {report.tasks_pending || "No pending tasks."}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
              Plans for Next Period
            </Typography>
            <Paper sx={{ p: 2, bgcolor: "background.default", minHeight: 80 }}>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {report.next_period_plans || "No plans recorded."}
              </Typography>
            </Paper>
          </Grid>

          {report.additional_notes && (
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                Additional Notes
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "background.default", minHeight: 80 }}>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {report.additional_notes}
                </Typography>
              </Paper>
            </Grid>
          )}

          {report.status !== "Draft" && (
            <>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Submitted By
                </Typography>
                <Typography variant="body1">
                  {report.submitted_by?.full_name || "N/A"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {report.submitted_at
                    ? new Date(report.submitted_at).toLocaleString()
                    : ""}
                </Typography>
              </Grid>
              {report.status === "Approved" && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Approved By
                  </Typography>
                  <Typography variant="body1">
                    {report.approved_by?.full_name || "N/A"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {report.approved_at
                      ? new Date(report.approved_at).toLocaleString()
                      : ""}
                  </Typography>
                </Grid>
              )}
              {report.status === "Rejected" && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Rejected By
                  </Typography>
                  <Typography variant="body1">
                    {report.rejected_by?.full_name || "N/A"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {report.rejected_at
                      ? new Date(report.rejected_at).toLocaleString()
                      : ""}
                  </Typography>
                </Grid>
              )}
              {report.manager_comments && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                    Manager Comments
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "background.default" }}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {report.manager_comments}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              {report.rejection_reason && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: red[700] }}>
                    Rejection Reason
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: red[50] }}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {report.rejection_reason}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </>
          )}
        </Grid>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
        <Button onClick={() => modal.close()}>Close</Button>
      </CardActions>
    </React.Fragment>
  );
};

export default ViewEmployeeReport;

