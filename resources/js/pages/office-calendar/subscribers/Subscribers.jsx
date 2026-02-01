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
  EmailRounded as EmailIcon,
  RefreshRounded as RefreshIcon,
  VisibilityRounded as ViewIcon,
  FiberNewRounded as NewIcon,
} from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import DatePicker from "../../../components/DatePicker";
import Modal from "../../../components/Modal";
import { useFetch, useToast } from "../../../hooks";
import { formatError, formatDateForDb } from "../../../helpers";

const Subscribers = () => {
  const addToast = useToast();
  const modalRef = React.useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    start_date: undefined,
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/office-calendar/subscribers",
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
    (response) => {
      // Handle the response structure properly
      if (response?.data?.data) {
        return response.data.data;
      }
      return {
        data: [],
        total: 0,
        page: 1,
      };
    }
  );

  useEffect(() => {
    document.title = `Newsletter Subscribers - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  // Check if subscriber is new (created within last 48 hours)
  const isNewSubscriber = (subscriber) => {
    if (!subscriber.created_at) return false;
    const createdAt = new Date(subscriber.created_at);
    const now = new Date();
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
    return hoursDiff <= 48;
  };

  const openViewModal = (subscriber) => {
    const component = (
      <div style={{ padding: "20px" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Typography variant="h6" gutterBottom>
                Subscriber Details
              </Typography>
              {isNewSubscriber(subscriber) && (
                <Chip
                  icon={<NewIcon />}
                  label="New Subscriber"
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
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{subscriber.email || "N/A"}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Subscribed At
            </Typography>
            <Typography variant="body1">
              {subscriber.created_at
                ? new Date(subscriber.created_at).toLocaleString()
                : "N/A"}
            </Typography>
            {isNewSubscriber(subscriber) && (
              <Typography variant="caption" sx={{ color: '#667eea', fontWeight: 600, display: 'block', mt: 0.5 }}>
                This subscriber was recently added
              </Typography>
            )}
          </Grid>
        </Grid>
      </div>
    );
    modalRef.current.open("Subscriber Details", component, "md");
  };

  return (
    <Page
      title="Newsletter Subscribers"
      breadcrumbs={[
        { title: "Home" },
        { title: "Office & Communications" },
        { title: "Newsletter Subscribers" },
      ]}
    >
      <CardHeader
        title="Newsletter Subscribers"
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
              Subscribers added within the last 48 hours
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
                  field: "email",
                  headerName: "Email",
                  renderCell: (item) => (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2">
                        {item.email || "N/A"}
                      </Typography>
                      {isNewSubscriber(item) && (
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
                  field: "created_at",
                  headerName: "Subscribed At",
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

export default Subscribers;

