import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
import { useFetch, useToast } from "../../../hooks";
import { formatError, formatDate } from "../../../helpers";

const SalesClinicalNotesList = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch from consultations as the single source of truth - same as consultation clinical notes
  const { data, loading, error, handleFetch } = useFetch(
    "api/consultations",
    {
      search: searchTerm,
      status: statusFilter === "all" ? undefined : statusFilter,
      per_page: 50,
      with_diagnoses: "Yes",
      with_items: "Yes",
      with_visual_acuity: "Yes",
      with_external_examination: "Yes",
      with_functional_tests: "Yes",
      with_refraction: "Yes",
      with_fundoscopy: "Yes",
    },
    true,
    [],
    (response) => {
      // Robustly extract array regardless of backend pagination shape
      const payload = response?.data?.data;
      const list = Array.isArray(payload) ? payload : payload?.data;
      return Array.isArray(list) ? list : [];
    }
  );

  useEffect(() => {
    document.title = `Sales Clinical Notes - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleFetch();
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleFilterChange = (event) => {
    setStatusFilter(event.target.value);
    handleFetch();
  };

  const handleView = (note) => {
    // Navigate to glass patients clinical notes (sales section) if patient has require_glass
    // Otherwise navigate to consultation clinical notes
    const patientId = note.payment_cache_item?.payment_cache?.check_in?.patient_id;
    if (patientId && note.id) {
      if (note.require_glass === 'Yes') {
        // Navigate to sales glass patients clinical notes
        navigate(`/sales-management/glass-patients/${patientId}/${note.id}/clinical-notes`);
      } else {
        // Navigate to consultation clinical notes for viewing
        navigate(`/consultation-room/consultation-patients/consulted/${patientId}/${note.id}/clinical-notes`);
      }
    }
  };

  const handleEdit = (note) => {
    // For sales, we can view but editing should go to consultation room
    const patientId = note.payment_cache_item?.payment_cache?.check_in?.patient_id;
    if (patientId && note.id) {
      navigate(`/consultation-room/consultation-patients/consulted/${patientId}/${note.id}/clinical-notes`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Consulted":
      case "completed":
        return "success";
      case "Pending":
      case "draft":
        return "warning";
      case "Cancelled":
      case "cancelled":
        return "error";
      case "reviewed":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Consulted":
      case "completed":
        return "Consulted";
      case "Pending":
      case "draft":
        return "Pending";
      case "Cancelled":
      case "cancelled":
        return "Cancelled";
      case "reviewed":
        return "Reviewed";
      default:
        return status || "Unknown";
    }
  };

  return (
    <Page
      title="Sales Clinical Notes"
      breadcrumbs={[
        { title: "Home" },
        { title: "Sales Table" },
        { title: "Sales Clinical Notes" },
      ]}
    >
      <Card>
        <CardHeader
          title="Sales Clinical Notes"
          subheader="All clinical notes from consultations - showing all details"
        />
        <CardContent>
          {/* Search and Filter */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search clinical notes by patient name, complaint, or diagnosis..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Consulted">Consulted</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={handleFetch}
                size="small"
              >
                Refresh
              </Button>
            </Grid>
          </Grid>

          {/* Clinical Notes Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Chief Complaint</TableCell>
                  <TableCell>Diagnosis</TableCell>
                  <TableCell>Medicine/Items</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Loading clinical notes...
                    </TableCell>
                  </TableRow>
                ) : !data || !Array.isArray(data) || data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No clinical notes found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {note.payment_cache_item?.payment_cache?.check_in?.patient?.full_name || "Unknown Patient"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {note.chief_complaint || "No chief complaint"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {Array.isArray(note.diagnoses) && note.diagnoses.length > 0
                            ? note.diagnoses.map(d => d?.disease?.name).filter(Boolean).join(", ")
                            : "No diagnosis"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {Array.isArray(note.items) && note.items.length > 0
                            ? note.items.map(i => i?.item?.name).filter(Boolean).join(", ")
                            : "No items"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(note.status)}
                          color={getStatusColor(note.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(note.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleView(note)}
                            title="View All Details"
                            color="primary"
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(note)}
                            title="Edit (in Consultation Room)"
                            color="secondary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Page>
  );
};

export default SalesClinicalNotesList;
