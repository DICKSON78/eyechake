import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  TextField as MuiTextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import ReplyIcon from "@mui/icons-material/ReplyRounded";
import MoreIcon from "@mui/icons-material/MoreVertRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";

import { useFetch, usePatch, usePost, useToast } from "../../../hooks";
import { formatError, formatDate } from "../../../helpers";

const AppointmentRequests = () => {
  const addToast = useToast();
  const modalRef = useRef();
  const replyModalRef = useRef();

  const [item, setItem] = useState();
  const [anchorEl, setAnchorEl] = useState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [status, setStatus] = useState("");

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: undefined,
    search: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/appointments",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  const { data: updateData, loading: updateLoading, error: updateError, handlePatch } = usePatch();

  useEffect(() => {
    document.title = `Appointment Requests - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (updateData) {
      addToast({ message: updateData.message || "Appointment updated successfully", severity: "success" });
      handleFetch();
      setReplyDialogOpen(false);
      setReplyText("");
      setStatus("");
      setItem(null);
    }
  }, [updateData, handleFetch, addToast]);

  useEffect(() => {
    if (updateError) {
      addToast({ message: formatError(updateError), severity: "error" });
    }
  }, [updateError, addToast]);

  const handleMenuOpen = (event, appointment) => {
    setAnchorEl(event.target);
    setIsMenuOpen(true);
    setItem(appointment);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setAnchorEl(null);
  };

  const openReplyDialog = () => {
    setReplyText(item?.admin_reply || "");
    setStatus(item?.status || "Pending");
    setReplyDialogOpen(true);
    handleMenuClose();
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) {
      addToast({ message: "Please enter a reply message", severity: "error" });
      return;
    }

    handlePatch(`api/appointments/${item.id}`, {
      admin_reply: replyText,
      status: status,
    });
  };

  const handleStatusChange = (newStatus) => {
    handlePatch(`api/appointments/${item.id}`, {
      status: newStatus,
    });
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      case "Completed":
        return "info";
      case "Cancelled":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "User Management" },
        { title: "Appointment Requests" },
      ]}
    >
      <Card>
        <PageHeader title="Appointment Requests" />
        <Divider />
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <MuiTextField
              label="Search"
              size="small"
              value={params.search || ""}
              onChange={(e) =>
                setParams({ ...params, search: e.target.value, page: 1 })
              }
              sx={{ minWidth: 250 }}
            />
            <Box sx={{ minWidth: 150 }}>
              <Select
                label="Status"
                options={[
                  { label: "All", value: undefined },
                  { label: "Pending", value: "Pending" },
                  { label: "Approved", value: "Approved" },
                  { label: "Rejected", value: "Rejected" },
                  { label: "Completed", value: "Completed" },
                  { label: "Cancelled", value: "Cancelled" },
                ]}
                optionsLabel="label"
                optionsValue="value"
                value={params.status}
                onChange={(value) =>
                  setParams({ ...params, status: value, page: 1 })
                }
              />
            </Box>
          </Stack>
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
                field: "full_name",
                headerName: "Name",
                valueGetter: (item) => `${item.first_name} ${item.last_name}`,
              },
              {
                field: "email",
                headerName: "Email",
              },
              {
                field: "phone",
                headerName: "Phone",
              },
              {
                field: "preferred_date",
                headerName: "Preferred Date",
                valueGetter: (item) =>
                  item.preferred_date ? formatDate(item.preferred_date) : "N/A",
              },
              {
                field: "preferred_time",
                headerName: "Preferred Time",
                valueGetter: (item) => item.preferred_time || "N/A",
              },
              {
                field: "reason",
                headerName: "Reason",
                valueGetter: (item) => item.reason || "N/A",
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
                headerName: "Requested At",
                valueGetter: (item) => formatDate(item.created_at),
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    divider={<Divider orientation="vertical" sx={{ height: 16 }} />}
                    spacing={1}
                  >
                    <Tooltip title="Reply">
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          setItem(item);
                          openReplyDialog();
                        }}
                      >
                        <ReplyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More">
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuOpen(event, item)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Tooltip>
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
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog
        open={replyDialogOpen}
        onClose={() => {
          setReplyDialogOpen(false);
          setReplyText("");
          setStatus("");
          setItem(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Reply to Appointment Request</DialogTitle>
        <DialogContent>
          {item && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Patient Information
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {item.first_name} {item.last_name}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {item.email}
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong> {item.phone}
              </Typography>
              {item.preferred_date && (
                <Typography variant="body2">
                  <strong>Preferred Date:</strong> {formatDate(item.preferred_date)}
                </Typography>
              )}
              {item.reason && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Reason:</strong> {item.reason}
                </Typography>
              )}
              {item.message && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Message:</strong> {item.message}
                </Typography>
              )}
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <Select
              label="Status"
              fullWidth
              required
              options={[
                { label: "Pending", value: "Pending" },
                { label: "Approved", value: "Approved" },
                { label: "Rejected", value: "Rejected" },
                { label: "Completed", value: "Completed" },
                { label: "Cancelled", value: "Cancelled" },
              ]}
              optionsLabel="label"
              optionsValue="value"
              value={status}
              onChange={(value) => setStatus(value)}
            />
            <TextField
              label="Reply Message"
              fullWidth
              required
              multiline
              rows={6}
              value={replyText}
              onChange={(value) => setReplyText(value)}
              placeholder="Enter your reply message here. This will be sent to the patient via email."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setReplyDialogOpen(false);
              setReplyText("");
              setStatus("");
              setItem(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReplySubmit}
            variant="contained"
            disabled={updateLoading || !replyText.trim()}
          >
            {updateLoading ? "Sending..." : "Send Reply"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* More Actions Menu */}
      {item ? (
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={openReplyDialog}>
            <ReplyIcon sx={{ mr: 1 }} fontSize="small" />
            Reply
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange("Approved")}>
            Approve
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange("Rejected")}>
            Reject
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange("Completed")}>
            Mark as Completed
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange("Cancelled")}>
            Cancel
          </MenuItem>
        </Menu>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default AppointmentRequests;

