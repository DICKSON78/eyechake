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
  ContactMailRounded as ContactIcon,
  RefreshRounded as RefreshIcon,
  VisibilityRounded as ViewIcon,
  FiberNewRounded as NewIcon,
  EmailRounded as EmailIcon,
  PhoneRounded as PhoneIcon,
} from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import DatePicker from "../../../components/DatePicker";
import Modal from "../../../components/Modal";
import { useFetch, useToast } from "../../../hooks";
import { formatError, formatDateForDb } from "../../../helpers";

const ContactSubmissions = () => {
  const addToast = useToast();
  const modalRef = React.useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    start_date: undefined,
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/office-calendar/contact-submissions",
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

  useEffect(() => {
    document.title = `Contact Submissions - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  // Check if contact submission is new (created within last 48 hours)
  const isNewSubmission = (submission) => {
    if (!submission.created_at) return false;
    const createdAt = new Date(submission.created_at);
    const now = new Date();
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
    return hoursDiff <= 48;
  };

  const openViewModal = (submission) => {
    const component = (
      <div style={{ padding: "20px" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Typography variant="h6" gutterBottom>
                Contact Submission Details
              </Typography>
              {isNewSubmission(submission) && (
                <Chip
                  icon={<NewIcon />}
                  label="New Submission"
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
              {submission.first_name} {submission.last_name}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{submission.email || "N/A"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Phone
            </Typography>
            <Typography variant="body1">{submission.phone || "N/A"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Subject
            </Typography>
            <Typography variant="body1">{submission.subject || "N/A"}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Message
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {submission.message || "N/A"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Submitted At
            </Typography>
            <Typography variant="body1">
              {submission.created_at
                ? new Date(submission.created_at).toLocaleString()
                : "N/A"}
            </Typography>
            {isNewSubmission(submission) && (
              <Typography variant="caption" sx={{ color: '#667eea', fontWeight: 600, display: 'block', mt: 0.5 }}>
                This submission was recently received
              </Typography>
            )}
          </Grid>
        </Grid>
      </div>
    );
    modalRef.current.open("Contact Submission Details", component, "md");
  };

  return (
    <Page
      title="Contact Submissions"
      breadcrumbs={[
        { title: "Home" },
        { title: "Office & Communications" },
        { title: "Contact Submissions" },
      ]}
    >
      <CardHeader
        title="Contact Submissions"
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
              Submissions received within the last 48 hours
            </Typography>
          </Stack>
        </Box>
        <CardContent sx={{ pt: 3 }}>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 3 }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Tooltip title="Refresh List">
                <IconButton
                  onClick={handleFetch}
                  disabled={loading}
                  sx={{ mt: 1 }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
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
                      {isNewSubmission(item) && (
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
                  field: "subject",
                  headerName: "Subject",
                  valueGetter: (item) => item.subject || "N/A",
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

export default ContactSubmissions;

