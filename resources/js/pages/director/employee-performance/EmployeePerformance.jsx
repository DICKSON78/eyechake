import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import {
  TrendingUpRounded as TrendingUpIcon,
  AssessmentRounded as PerformanceIcon,
  StarRounded as StarIcon,
} from "@mui/icons-material";
import {
  green,
  orange,
  red,
  blue,
  purple,
  teal,
} from "@mui/material/colors";

import Page from "../../../components/Page";
import Table from "../../../components/Table";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, formatDateForDb } from "../../../helpers";

const EmployeePerformance = () => {
  const addToast = useToast();

  const [params, setParams] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    department_id: undefined,
    job_title_id: undefined,
    user_id: undefined,
  });

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const { data, loading, error, handleFetch } = useFetch(
    "api/director/employee-performance",
    {
      ...params,
      start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
      page: page,
      per_page: perPage,
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => {
      const result = response?.data?.data;
      return {
        data: Array.isArray(result?.data) ? result.data : [],
        total: result?.total ?? 0,
        page: result?.current_page ?? result?.page ?? 1,
      };
    }
  );

  useEffect(() => {
    handleFetch();
  }, [page, perPage]);

  useEffect(() => {
    document.title = `Employee Performance - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const getPerformanceColor = (rating) => {
    switch (rating) {
      case "Excellent":
        return green[600];
      case "Good":
        return blue[600];
      case "Average":
        return orange[600];
      case "Below Average":
        return orange[400];
      case "Needs Improvement":
        return red[600];
      default:
        return "default";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return green[600];
    if (score >= 60) return blue[600];
    if (score >= 40) return orange[600];
    if (score >= 20) return orange[400];
    return red[600];
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Director" },
        { title: "Employee Performance" },
      ]}
    >
      <Card
        variant="outlined"
        sx={{
          bgcolor: "background.default",
          mb: 2,
        }}
      >
        <CardContent>
          <Grid container spacing={2}>
            <Grid item md={3} sm={6} xs={12}>
              <DatePicker
                fullWidth
                label="Start Date"
                value={params.start_date || null}
                onChange={(value) =>
                  setParams({
                    ...params,
                    start_date: !isNaN(value) ? value : null,
                  })
                }
              />
            </Grid>
            <Grid item md={3} sm={6} xs={12}>
              <DatePicker
                fullWidth
                label="End Date"
                value={params.end_date || null}
                onChange={(value) =>
                  setParams({
                    ...params,
                    end_date: !isNaN(value) ? value : null,
                  })
                }
              />
            </Grid>
            <Grid item md={3} sm={6} xs={12}>
              <Select
                label="Department"
                fullWidth
                uri="api/departments"
                optionsLabel="name"
                optionsValue="id"
                clearable
                onChange={(value) =>
                  setParams({ ...params, department_id: value })
                }
              />
            </Grid>
            <Grid item md={3} sm={6} xs={12}>
              <Select
                label="Job Title"
                fullWidth
                uri="api/job-titles"
                optionsLabel="name"
                optionsValue="id"
                clearable
                onChange={(value) =>
                  setParams({ ...params, job_title_id: value })
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Table
        loading={loading}
        columns={[
          {
            field: "employee_name",
            headerName: "Employee Name",
            valueGetter: (item) => item.employee_name,
          },
          {
            field: "employee_number",
            headerName: "Employee #",
            valueGetter: (item) => item.employee_number || "-",
          },
          {
            field: "department",
            headerName: "Department",
            valueGetter: (item) => item.department || "-",
          },
          {
            field: "job_title",
            headerName: "Job Title",
            valueGetter: (item) => item.job_title || "-",
          },
          {
            field: "total_sales",
            headerName: "Total Sales",
            valueGetter: (item) => numberFormat(item.metrics?.total_sales || 0),
          },
          {
            field: "transaction_count",
            headerName: "Transactions",
            valueGetter: (item) => numberFormat(item.metrics?.transaction_count || 0),
          },
          {
            field: "avg_transaction_value",
            headerName: "Avg Transaction",
            valueGetter: (item) => numberFormat(item.metrics?.avg_transaction_value || 0),
          },
          {
            field: "items_served",
            headerName: "Items Served",
            valueGetter: (item) => numberFormat(item.metrics?.items_served || 0),
          },
          {
            field: "consultations_count",
            headerName: "Consultations",
            valueGetter: (item) => numberFormat(item.metrics?.consultations_count || 0),
          },
          {
            field: "tasks_completed",
            headerName: "Tasks Completed",
            valueGetter: (item) => numberFormat(item.metrics?.tasks_completed || 0),
          },
          {
            field: "performance_score",
            headerName: "Performance Score",
            valueGetter: (item) => `${item.performance_score?.toFixed(1) || 0}%`,
            renderCell: (item) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={getScoreColor(item.performance_score || 0)}
                >
                  {item.performance_score?.toFixed(1) || 0}%
                </Typography>
                <Chip
                  label={item.performance_rating || "N/A"}
                  color={
                    item.performance_rating === "Excellent"
                      ? "success"
                      : item.performance_rating === "Good"
                      ? "info"
                      : item.performance_rating === "Average"
                      ? "warning"
                      : "error"
                  }
                  size="small"
                  icon={<StarIcon />}
                />
              </Box>
            ),
          },
        ]}
        items={data.data || []}
        itemCount={data.total || 0}
        page={page}
        pageSize={perPage}
        onPageChange={(newPage) => {
          setPage(newPage);
        }}
        onPageSizeChange={(value) => {
          setPerPage(value);
          setPage(1);
        }}
      />
    </Page>
  );
};

export default EmployeePerformance;

