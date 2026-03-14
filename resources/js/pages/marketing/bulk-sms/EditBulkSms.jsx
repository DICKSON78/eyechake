import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  CardActions,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Box,
  Chip,
} from "@mui/material";
import {
  Business as BusinessIcon,
  School as StudentIcon,
  Work as EmployeeIcon,
  Star as PrestigeIcon,
  Groups as OutreachIcon,
  Campaign as CampaignIcon,
  Message as MessageIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import DatePicker from "../../../components/DatePicker";
import { usePatch, useToast } from "../../../hooks";
import { formatError, formatDateForDb } from "../../../helpers";

const EditBulkSms = ({ item, modal, fetchBulkSms }) => {
  const addToast = useToast();
  const formRef = useRef();

  const [formData, setFormData] = useState({
    title: item.title,
    message: item.message,
    type: item.type,
    status: item.status,
    scheduled_at: item.scheduled_at ? new Date(item.scheduled_at) : undefined,
    recipient_filters: item.recipient_filters || {
      is_vip: false,
      is_businessperson: false,
      is_student: false,
      is_employee: false,
      is_outreach: false,
      min_payment: undefined,
    },
  });

  const { data, loading, error, handlePatch } = usePatch();

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchBulkSms();
        modal.close();
      }, 1000);
    }
  }, [data, addToast, fetchBulkSms, modal]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePatch(`api/marketing/bulk-sms/${item.id}`, {
        ...formData,
        scheduled_at: formData.scheduled_at
          ? formatDateForDb(formData.scheduled_at)
          : undefined,
      });
    }
  };

  const typeOptions = [
    { label: "Offer", value: "offer" },
    { label: "Announcement", value: "announcement" },
    { label: "Reminder", value: "reminder" },
    { label: "Other", value: "other" },
  ];

  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Sending", value: "sending" },
    { label: "Completed", value: "completed" },
    { label: "Failed", value: "failed" },
  ];

  const clientTypeOptions = [
    { key: "is_vip", label: "Prestige", icon: <PrestigeIcon />, color: "#FF6B35" },
    { key: "is_businessperson", label: "Business", icon: <BusinessIcon />, color: "#4ECDC4" },
    { key: "is_student", label: "Student", icon: <StudentIcon />, color: "#45B7D1" },
    { key: "is_employee", label: "Employee", icon: <EmployeeIcon />, color: "#96CEB4" },
    { key: "is_outreach", label: "Outreach Client", icon: <OutreachIcon />, color: "#FFEAA7" },
  ];

  const handleClientTypeToggle = (key) => {
    setFormData({
      ...formData,
      recipient_filters: {
        ...formData.recipient_filters,
        [key]: !formData.recipient_filters[key],
      },
    });
  };

  const selectedCount = Object.values(formData.recipient_filters).filter(
    (value, index) => index < 5 && value === true
  ).length;

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent sx={{ p: 3 }}>
        <Form ref={formRef}>
          <Grid container spacing={3}>
            {/* Campaign Information Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <CampaignIcon sx={{ color: "primary.main" }} />
                <Typography variant="h6" fontWeight={600}>
                  Campaign Information
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                ref={formRef}
                fullWidth
                label="Campaign Title"
                required
                placeholder="Enter campaign title"
                value={formData.title}
                onChange={(value) =>
                  setFormData({ ...formData, title: value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                ref={formRef}
                fullWidth
                multiline
                rows={5}
                label="Message"
                required
                placeholder="Enter your SMS message here..."
                value={formData.message}
                onChange={(value) =>
                  setFormData({ ...formData, message: value })
                }
                helperText={`${formData.message?.length || 0} characters`}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <CategoryIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Campaign Type
                </Typography>
              </Box>
              <Select
                fullWidth
                label="Type"
                required
                options={typeOptions}
                value={formData.type}
                onChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <ScheduleIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Schedule
                </Typography>
              </Box>
              <DatePicker
                fullWidth
                label="Schedule Date"
                value={formData.scheduled_at || null}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    scheduled_at: !isNaN(value) ? value : undefined,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                label="Status"
                required
                options={statusOptions}
                value={formData.status}
                onChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Recipient Filters Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MessageIcon sx={{ color: "primary.main" }} />
                  <Typography variant="h6" fontWeight={600}>
                    Recipient Filters
                  </Typography>
                </Box>
                {selectedCount > 0 && (
                  <Chip
                    label={`${selectedCount} selected`}
                    color="primary"
                    size="small"
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select client types to target. You can select multiple types. If none are selected, all clients will be included.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                {clientTypeOptions.map(({ key, label, icon, color }) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: `2px solid ${
                          formData.recipient_filters[key]
                            ? color
                            : "#e0e0e0"
                        }`,
                        backgroundColor: formData.recipient_filters[key]
                          ? `${color}15`
                          : "#ffffff",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        position: "relative",
                        "&:hover": {
                          borderColor: color,
                          transform: "translateY(-2px)",
                          boxShadow: `0 4px 12px ${color}40`,
                        },
                      }}
                      onClick={() => handleClientTypeToggle(key)}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.recipient_filters[key] || false}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleClientTypeToggle(key);
                            }}
                            sx={{
                              color: color,
                              "&.Mui-checked": {
                                color: color,
                              },
                            }}
                          />
                        }
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                color: formData.recipient_filters[key]
                                  ? color
                                  : "text.secondary",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {icon}
                            </Box>
                            <Typography
                              fontWeight={600}
                              sx={{
                                fontSize: "1rem",
                                color: formData.recipient_filters[key]
                                  ? color
                                  : "text.primary",
                              }}
                            >
                              {label}
                            </Typography>
                          </Box>
                        }
                        sx={{ m: 0, width: "100%" }}
                      />
                      {formData.recipient_filters[key] && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: color,
                          }}
                        />
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Additional Filters */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Additional Filters (Optional)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    ref={formRef}
                    fullWidth
                    type="number"
                    label="Minimum Payment Amount"
                    placeholder="Enter minimum payment amount"
                    value={formData.recipient_filters.min_payment || ""}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        recipient_filters: {
                          ...formData.recipient_filters,
                          min_payment: value ? parseFloat(value) : undefined,
                        },
                      })
                    }
                    helperText="Filter clients by minimum total payment amount"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 2, justifyContent: "flex-end", gap: 1 }}>
        <Button onClick={modal.close} variant="outlined">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={<MessageIcon />}
        >
          Update Campaign
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default EditBulkSms;
