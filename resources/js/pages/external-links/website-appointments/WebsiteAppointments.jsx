import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CalendarTodayRounded as CalendarIcon,
  CheckCircleRounded as ApprovedIcon,
  CancelRounded as RejectedIcon,
  VisibilityRounded as ViewIcon,
  PhoneRounded as PhoneIcon,
  EmailRounded as EmailIcon,
  FiberNewRounded as NewIcon,
  ScheduleRounded as ScheduleIcon,
} from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Select from "../../../components/Select";
import DatePicker from "../../../components/DatePicker";
import Modal from "../../../components/Modal";
import { useFetch, usePatch, useToast } from "../../../hooks";
import { formatError, formatDateForDb } from "../../../helpers";

const WebsiteAppointments = () => {
  const addToast = useToast();
  const modalRef = React.useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: undefined,
    start_date: undefined,
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/external-links/website-appointments",
    {
      ...params,
      start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  const { data: updateData, loading: updating, error: updateError, handlePatch } = usePatch();

  useEffect(() => {
    document.title = `Website Appointments - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  useEffect(() => {
    if (updateError) {
      addToast({ message: formatError(updateError), severity: "error" });
    }
  }, [updateError, addToast]);

  useEffect(() => {
    if (updateData) {
      addToast({ message: updateData.message || "Appointment updated successfully", severity: "success" });
      handleFetch();
    }
  }, [updateData, handleFetch, addToast]);

  const handleStatusChange = (appointmentId, newStatus) => {
    handlePatch(`api/external-links/website-appointments/${appointmentId}`, {
      status: newStatus,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      case "Completed":
        return "info";
      case "Cancelled":
        return "default";
      default:
        return "default";
    }
  };

  // Check if appointment is new (created within last 48 hours)
  const isNewAppointment = (appointment) => {
    if (!appointment.created_at) return false;
    const createdAt = new Date(appointment.created_at);
    const now = new Date();
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
    return hoursDiff <= 48;
  };

  // Check if appointment is upcoming (preferred_date is in the future)
  const isUpcomingAppointment = (appointment) => {
    if (!appointment.preferred_date) return false;
    const preferredDate = new Date(appointment.preferred_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    preferredDate.setHours(0, 0, 0, 0);
    return preferredDate >= now;
  };

  // Check if appointment is past (preferred_date is in the past)
  const isPastAppointment = (appointment) => {
    if (!appointment.preferred_date) return false;
    const preferredDate = new Date(appointment.preferred_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    preferredDate.setHours(0, 0, 0, 0);
    return preferredDate < now;
  };

  const openViewModal = (appointment) => {
    const component = (
      <div style={{ padding: "20px" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Typography variant="h6" gutterBottom>
                Appointment Details
              </Typography>
              {isNewAppointment(appointment) && (
                <Chip
                  icon={<NewIcon />}
                  label="New Appointment"
                  color="primary"
                  size="small"
                  sx={{
                    bgcolor: '#667eea',
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1">
              {appointment.first_name} {appointment.last_name}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{appointment.email}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Phone
            </Typography>
            <Typography variant="body1">{appointment.phone}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Preferred Date
            </Typography>
            <Typography variant="body1">
              {appointment.preferred_date
                ? new Date(appointment.preferred_date).toLocaleDateString()
                : "N/A"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Preferred Time
            </Typography>
            <Typography variant="body1">{appointment.preferred_time || "N/A"}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Reason
            </Typography>
            <Typography variant="body1">{appointment.reason || "N/A"}</Typography>
          </Grid>
          {appointment.message && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Message
              </Typography>
              <Typography variant="body1">{appointment.message}</Typography>
            </Grid>
          )}
          {appointment.admin_reply && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Admin Reply
              </Typography>
              <Typography variant="body1">{appointment.admin_reply}</Typography>
              {appointment.replied_by_user && (
                <Typography variant="caption" color="text.secondary">
                  Replied by: {appointment.replied_by_user.full_name} on{" "}
                  {appointment.replied_at
                    ? new Date(appointment.replied_at).toLocaleString()
                    : "N/A"}
                </Typography>
              )}
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={appointment.status}
              color={getStatusColor(appointment.status)}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Submitted At
            </Typography>
            <Typography variant="body1">
              {appointment.created_at
                ? new Date(appointment.created_at).toLocaleString()
                : "N/A"}
            </Typography>
            {isNewAppointment(appointment) && (
              <Typography variant="caption" sx={{ color: '#667eea', fontWeight: 600, display: 'block', mt: 0.5 }}>
                This appointment was recently created
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              {isUpcomingAppointment(appointment) && (
                <Chip
                  icon={<ScheduleIcon />}
                  label="Upcoming"
                  size="small"
                  sx={{
                    bgcolor: '#E8F4F8',
                    color: '#667eea',
                    fontWeight: 600,
                  }}
                />
              )}
              {isPastAppointment(appointment) && (
                <Chip
                  icon={<ScheduleIcon />}
                  label="Past Appointment"
                  size="small"
                  sx={{
                    bgcolor: '#f5f5f5',
                    color: '#666',
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>
          </Grid>
        </Grid>
      </div>
    );
    modalRef.current.open("Appointment Details", component, "md");
  };

  return (
    <Page
      title="Website Appointments"
      breadcrumbs={[
        { title: "Home" },
        { title: "External Links" },
        { title: "Website Appointments" },
      ]}
    >
      <CardHeader
        title="Website Appointments"
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        sx={{
          p: 0,
          mb: 3,
        }}
      />
      <Card
        sx={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Chip
              icon={<NewIcon />}
              label="New"
              size="small"
              sx={{
                bgcolor: '#667eea',
                color: 'white',
                fontWeight: 600,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Appointments created within the last 48 hours
            </Typography>
          </Stack>
        </Box>
        <CardContent sx={{ pt: 3 }}>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Select
                label="Status"
                fullWidth
                clearable
                options={[
                  { label: "Pending", value: "Pending" },
                  { label: "Approved", value: "Approved" },
                  { label: "Rejected", value: "Rejected" },
                  { label: "Completed", value: "Completed" },
                  { label: "Cancelled", value: "Cancelled" },
                ]}
                value={params.status}
                onChange={(value) =>
                  setParams({ ...params, status: value, page: 1 })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DatePicker
                fullWidth
                label="Start Date"
                value={params.start_date || null}
                onChange={(value) =>
                  setParams({
                    ...params,
                    start_date: value instanceof Date && !isNaN(value) ? value : null,
                    page: 1,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DatePicker
                fullWidth
                label="End Date"
                value={params.end_date || null}
                onChange={(value) =>
                  setParams({
                    ...params,
                    end_date: value instanceof Date && !isNaN(value) ? value : null,
                    page: 1,
                  })
                }
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              '& .MuiTableRow-root': {
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.04)',
                },
              },
            }}
          >
            <Table
              loading={loading}
              columns={[
              {
                field: "index",
                headerName: "S/N",
                valueGetter: (item, index) =>
                  params.per_page * (params.page - 1) + index + 1,
              },
              {
                field: "name",
                headerName: "Name",
                renderCell: (item) => (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2">
                      {`${item.first_name || ""} ${item.last_name || ""}`.trim() || "N/A"}
                    </Typography>
                    {isNewAppointment(item) && (
                      <Chip
                        icon={<NewIcon />}
                        label="New"
                        size="small"
                        color="primary"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: '#667eea',
                          '& .MuiChip-icon': {
                            fontSize: '0.875rem',
                          },
                        }}
                      />
                    )}
                  </Stack>
                ),
              },
              {
                field: "email",
                headerName: "Email",
                valueGetter: (item) => item.email || "N/A",
              },
              {
                field: "phone",
                headerName: "Phone",
                valueGetter: (item) => item.phone || "N/A",
              },
              {
                field: "preferred_date",
                headerName: "Preferred Date",
                renderCell: (item) => (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2">
                      {item.preferred_date
                        ? new Date(item.preferred_date).toLocaleDateString()
                        : "N/A"}
                    </Typography>
                    {isUpcomingAppointment(item) && (
                      <Tooltip title="Upcoming Appointment">
                        <ScheduleIcon 
                          fontSize="small" 
                          sx={{ color: '#667eea', fontSize: '1rem' }} 
                        />
                      </Tooltip>
                    )}
                    {isPastAppointment(item) && (
                      <Tooltip title="Past Appointment">
                        <ScheduleIcon 
                          fontSize="small" 
                          sx={{ color: '#999', fontSize: '1rem' }} 
                        />
                      </Tooltip>
                    )}
                  </Stack>
                ),
              },
              {
                field: "preferred_time",
                headerName: "Preferred Time",
                valueGetter: (item) => item.preferred_time || "N/A",
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  <Chip
                    label={item.status}
                    color={getStatusColor(item.status)}
                    size="small"
                  />
                ),
              },
              {
                field: "created_at",
                headerName: "Submitted At",
                valueGetter: (item) =>
                  item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : "N/A",
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => openViewModal(item)}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {item.status === "Pending" && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleStatusChange(item.id, "Approved")}
                            disabled={updating}
                          >
                            <ApprovedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleStatusChange(item.id, "Rejected")}
                            disabled={updating}
                          >
                            <RejectedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Stack>
                ),
              },
            ]}
            items={data.data}
            itemCount={data.total}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
            onPageSizeChange={(value) =>
              setParams({ ...params, per_page: value, page: 1 })
            }
          />
          </Box>
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default WebsiteAppointments;

