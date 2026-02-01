import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Alert,
  Box,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  EditRounded as EditIcon,
  VisibilityRounded as ViewIcon,
  SendRounded as SubmitIcon,
  CheckCircleRounded as ApprovedIcon,
  CancelRounded as RejectedIcon,
  DeleteRounded as DeleteIcon,
} from "@mui/icons-material";
import Page from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";
import DatePicker from "../../../components/DatePicker";
import CreateEmployeeReport from "./CreateEmployeeReport";
import EditEmployeeReport from "./EditEmployeeReport";
import ViewEmployeeReport from "./ViewEmployeeReport";
import { useFetch, useToast, useDelete } from "../../../hooks";
import { formatError, formatDateForDb } from "../../../helpers";

const EmployeeReports = () => {
  const addToast = useToast();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    report_type: undefined,
    status: undefined,
    start_date: undefined,
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/employee-reports/my-reports",
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

  const { handleDelete: handleDeleteReport } = useDelete();

  useEffect(() => {
    document.title = `My Reports - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const openCreateReportModal = (reportType = null) => {
    const component = (
      <CreateEmployeeReport
        initialReportType={reportType}
        modal={modalRef.current}
        fetchReports={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );
    modalRef.current.open("Create Report", component, "lg");
  };

  const openEditReportModal = (report) => {
    const component = (
      <EditEmployeeReport
        report={report}
        modal={modalRef.current}
        fetchReports={handleFetch}
      />
    );
    modalRef.current.open("Edit Report", component, "lg");
  };

  const openViewReportModal = (report) => {
    const component = (
      <ViewEmployeeReport
        report={report}
        modal={modalRef.current}
      />
    );
    modalRef.current.open("View Report", component, "lg");
  };


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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <ApprovedIcon fontSize="small" />;
      case "Rejected":
        return <RejectedIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Employee Management" },
        { title: "My Reports" },
      ]}
    >
      <CardHeader
        title="My Reports"
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => openCreateReportModal("Daily")}
              size="small"
            >
              Daily
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => openCreateReportModal("Weekly")}
              size="small"
            >
              Weekly
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openCreateReportModal("Monthly")}
              size="small"
            >
              Monthly
            </Button>
          </Stack>
        }
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        sx={{
          p: 0,
          mb: 3,
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formatError(error)}. Please try refreshing the page or contact support if the issue persists.
        </Alert>
      )}

      <Card>
        <Divider />
        <CardContent>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Select
                label="Report Type"
                fullWidth
                clearable
                options={[
                  { label: "Daily", value: "Daily" },
                  { label: "Weekly", value: "Weekly" },
                  { label: "Monthly", value: "Monthly" },
                ]}
                value={params.report_type}
                onChange={(value) =>
                  setParams({ ...params, report_type: value, page: 1 })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Select
                label="Status"
                fullWidth
                clearable
                options={[
                  { label: "Draft", value: "Draft" },
                  { label: "Submitted", value: "Submitted" },
                  { label: "Approved", value: "Approved" },
                  { label: "Rejected", value: "Rejected" },
                ]}
                value={params.status}
                onChange={(value) =>
                  setParams({ ...params, status: value, page: 1 })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                fullWidth
                label="Start Date"
                value={params.start_date || null}
                onChange={(value) =>
                  setParams({
                    ...params,
                    start_date: !isNaN(value) ? value : null,
                    page: 1,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                fullWidth
                label="End Date"
                value={params.end_date || null}
                onChange={(value) =>
                  setParams({
                    ...params,
                    end_date: !isNaN(value) ? value : null,
                    page: 1,
                  })
                }
              />
            </Grid>
          </Grid>

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
                field: "report_type",
                headerName: "Type",
              },
              {
                field: "report_date",
                headerName: "Report Date",
                valueGetter: (item) => {
                  if (item.report_type === "Daily") {
                    return new Date(item.report_date).toLocaleDateString();
                  } else if (item.report_type === "Weekly") {
                    const start = new Date(item.report_date).toLocaleDateString();
                    const end = item.end_date
                      ? new Date(item.end_date).toLocaleDateString()
                      : "";
                    return `${start} - ${end}`;
                  } else {
                    const start = new Date(item.report_date).toLocaleDateString();
                    const end = item.end_date
                      ? new Date(item.end_date).toLocaleDateString()
                      : "";
                    return `${start} - ${end}`;
                  }
                },
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  <Chip
                    icon={getStatusIcon(item.status)}
                    label={item.status}
                    color={getStatusColor(item.status)}
                    size="small"
                  />
                ),
              },
              {
                field: "submitted_at",
                headerName: "Submitted At",
                valueGetter: (item) =>
                  item.submitted_at
                    ? new Date(item.submitted_at).toLocaleString()
                    : "-",
              },
              {
                field: "approved_at",
                headerName: "Approved At",
                valueGetter: (item) =>
                  item.approved_at
                    ? new Date(item.approved_at).toLocaleString()
                    : "-",
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => openViewReportModal(item)}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {item.status === "Draft" && (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openEditReportModal(item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {item.status === "Draft" && (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(item)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default EmployeeReports;

