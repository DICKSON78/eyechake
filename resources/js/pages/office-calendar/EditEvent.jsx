import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CardActions,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import Form from "../../components/Form";
import TextField from "../../components/TextField";
import Select from "../../components/Select";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { usePatch, useDelete, useToast } from "../../hooks";
import { formatError, formatDateForDb } from "../../helpers";

const EditEvent = ({ event, modal, fetchEvents }) => {
  const addToast = useToast();

  const formRef = useRef();
  const titleRef = useRef();
  const descriptionRef = useRef();
  const locationRef = useRef();

  const [formData, setFormData] = useState({
    title: event.title || "",
    description: event.description || "",
    location: event.location || "",
    start_date: new Date(event.start_date),
    end_date: event.end_date ? new Date(event.end_date) : null,
    color: event.color || "#1976d2",
    event_type: event.event_type || "Other",
    reminder_type: event.reminder_type || "None",
    reminder_datetime: event.reminder_datetime ? new Date(event.reminder_datetime) : null,
    is_all_day: event.is_all_day || false,
    is_recurring: event.is_recurring || false,
    recurring_pattern: event.recurring_pattern || null,
    recurring_end_date: event.recurring_end_date ? new Date(event.recurring_end_date) : null,
    status: event.status || "Active",
  });

  const [reminderMode, setReminderMode] = useState(() => {
    if (event.reminder_type === "None" || !event.reminder_type) return "none";
    if (event.reminder_datetime) return "custom";
    return "preset";
  });

  const { data: updateData, loading: updateLoading, error: updateError, handlePatch } = usePatch();
  const { data: deleteData, loading: deleteLoading, error: deleteError, handleDelete } = useDelete();

  useEffect(() => {
    if (updateData) {
      addToast({ message: updateData.message, severity: "success" });
      window.setTimeout(() => {
        fetchEvents();
        modal.close();
      }, 1000);
    }
  }, [updateData, fetchEvents, modal, addToast]);

  useEffect(() => {
    if (deleteData) {
      addToast({ message: deleteData.message, severity: "success" });
      window.setTimeout(() => {
        fetchEvents();
        modal.close();
      }, 1000);
    }
  }, [deleteData, fetchEvents, modal, addToast]);

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

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePatch(`api/office-calendar/${event.id}`, {
        ...formData,
        start_date: formatDateForDb(formData.start_date),
        end_date: formData.end_date ? formatDateForDb(formData.end_date) : null,
        recurring_end_date: formData.recurring_end_date ? formatDateForDb(formData.recurring_end_date) : null,
        reminder_datetime: formData.reminder_datetime ? formatDateForDb(formData.reminder_datetime) : null,
      });
    }
  };

  const handleDeleteEvent = () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      handleDelete(`api/office-calendar/${event.id}`);
    }
  };

  const eventTypeColors = {
    Meeting: "#1976d2",
    Appointment: "#2e7d32",
    Deadline: "#d32f2f",
    Task: "#ed6c02",
    Reminder: "#9c27b0",
    Other: "#616161",
  };

  // Color palette options
  const colorOptions = [
    { name: "Blue", value: "#1976d2" },
    { name: "Green", value: "#2e7d32" },
    { name: "Red", value: "#d32f2f" },
    { name: "Orange", value: "#ed6c02" },
    { name: "Purple", value: "#9c27b0" },
    { name: "Pink", value: "#c2185b" },
    { name: "Teal", value: "#00796b" },
    { name: "Gray", value: "#616161" },
    { name: "Indigo", value: "#303f9f" },
    { name: "Brown", value: "#5d4037" },
    { name: "Cyan", value: "#0097a7" },
    { name: "Amber", value: "#ff6f00" },
  ];

  return (
    <React.Fragment>
      {(updateLoading || deleteLoading) && <LinearProgress />}
      <CardContent>
        <Form ref={formRef}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                ref={titleRef}
                label="Event Title"
                fullWidth
                required
                value={formData.title}
                onChange={(value) => setFormData({ ...formData, title: value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Date & Time"
                  value={formData.start_date}
                  onChange={(value) => setFormData({ ...formData, start_date: value })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      size: "small",
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="End Date & Time"
                  value={formData.end_date}
                  onChange={(value) => setFormData({ ...formData, end_date: value })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <Select
                label="Event Type"
                fullWidth
                required
                options={[
                  { label: "Meeting", value: "Meeting" },
                  { label: "Appointment", value: "Appointment" },
                  { label: "Deadline", value: "Deadline" },
                  { label: "Task", value: "Task" },
                  { label: "Reminder", value: "Reminder" },
                  { label: "Other", value: "Other" },
                ]}
                value={formData.event_type}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    event_type: value,
                    color: eventTypeColors[value] || "#1976d2",
                  });
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Reminder
                </Typography>
                <ToggleButtonGroup
                  value={reminderMode}
                  exclusive
                  onChange={(e, newMode) => {
                    if (newMode !== null) {
                      setReminderMode(newMode);
                      if (newMode === "none") {
                        setFormData({
                          ...formData,
                          reminder_type: "None",
                          reminder_datetime: null,
                        });
                      }
                    }
                  }}
                  size="small"
                  sx={{ mb: 1 }}
                >
                  <ToggleButton value="none">None</ToggleButton>
                  <ToggleButton value="preset">Quick Presets</ToggleButton>
                  <ToggleButton value="custom">Custom Time</ToggleButton>
                </ToggleButtonGroup>

                {reminderMode === "preset" && (
                  <Select
                    label="Reminder Time"
                    fullWidth
                    sx={{ mt: 1 }}
                    options={[
                      { label: "15 minutes before", value: "15_minutes" },
                      { label: "30 minutes before", value: "30_minutes" },
                      { label: "1 hour before", value: "1_hour" },
                      { label: "2 hours before", value: "2_hours" },
                      { label: "1 day before", value: "1_day" },
                      { label: "2 days before", value: "2_days" },
                      { label: "1 week before", value: "1_week" },
                    ]}
                    value={formData.reminder_type}
                    onChange={(value) => {
                      setFormData({
                        ...formData,
                        reminder_type: value,
                        reminder_datetime: null,
                      });
                    }}
                  />
                )}

                {reminderMode === "custom" && (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="Reminder Date & Time"
                      value={formData.reminder_datetime}
                      onChange={(value) => {
                        setFormData({
                          ...formData,
                          reminder_datetime: value,
                          reminder_type: "Custom",
                        });
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          sx: { mt: 1 },
                        },
                      }}
                    />
                  </LocalizationProvider>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Select
                label="Status"
                fullWidth
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Cancelled", value: "Cancelled" },
                  { label: "Completed", value: "Completed" },
                ]}
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                ref={locationRef}
                label="Location"
                fullWidth
                value={formData.location}
                onChange={(value) => setFormData({ ...formData, location: value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                ref={descriptionRef}
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
                  Event Color
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  {colorOptions.map((color) => (
                    <Tooltip key={color.value} title={color.name} arrow>
                      <Box
                        onClick={() =>
                          setFormData({ ...formData, color: color.value })
                        }
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: color.value,
                          borderRadius: 1.5,
                          border: "2px solid",
                          borderColor:
                            formData.color === color.value
                              ? "primary.main"
                              : "transparent",
                          cursor: "pointer",
                          position: "relative",
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: "scale(1.1)",
                            boxShadow: 3,
                          },
                        }}
                      >
                        {formData.color === color.value && (
                          <CheckCircleIcon
                            sx={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              color: "white",
                              fontSize: 28,
                              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
                            }}
                          />
                        )}
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
                <Box
                  sx={{
                    mt: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1.5,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: formData.color,
                      borderRadius: 1,
                      border: "2px solid",
                      borderColor: "divider",
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Selected Color
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {colorOptions.find((c) => c.value === formData.color)
                        ?.name || "Custom"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Button
          color="error"
          onClick={handleDeleteEvent}
          disabled={deleteLoading}
        >
          Delete
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={() => modal.close()}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={updateLoading}
          >
            Update Event
          </Button>
        </Box>
      </CardActions>
    </React.Fragment>
  );
};

export default EditEvent;

