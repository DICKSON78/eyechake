import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  Box,
  Paper,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";

import { useFetch, usePost, usePatch, useDelete, useToast } from "../../../hooks";
import { formatDateForDb, formatError } from "../../../helpers";
import ReferralPDF from "./ReferralPDF";
import ConfirmationDialog from "../../../components/ConfirmationDialog";

const Referrals = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = React.useRef();
  const confirmDialogRef = React.useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    start_date: null,
    end_date: null,
    status: undefined,
  });

  const [formData, setFormData] = useState({
    referred_to_name: '',
    referred_to_type: '',
    referral_reason: '',
    clinical_summary: '',
    status: 'Pending',
    referral_date: new Date(),
    appointment_date: null,
    notes: '',
  });

  const [editingReferral, setEditingReferral] = useState(null);

  const { data, loading, error, handleFetch: fetchReferrals } = useFetch(
    "api/referrals",
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

  const { handlePost, loading: loadingPost } = usePost();
  const { handlePatch, loading: loadingPatch } = usePatch();
  const { handleDelete, loading: loadingDelete } = useDelete();

  useEffect(() => {
    document.title = `Referrals - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const referralTypes = [
    'Doctor',
    'Specialist',
    'Ophthalmologist',
    'Hospital',
    'Clinic',
    'Facility',
    'Other',
  ];

  const statusColors = {
    Pending: 'warning',
    Sent: 'info',
    Acknowledged: 'primary',
    Completed: 'success',
  };

  const handleOpenModal = (referral = null) => {
    if (referral) {
      setEditingReferral(referral);
      setFormData({
        referred_to_name: referral.referred_to_name || '',
        referred_to_type: referral.referred_to_type || '',
        referral_reason: referral.referral_reason || '',
        clinical_summary: referral.clinical_summary || '',
        status: referral.status || 'Pending',
        referral_date: referral.referral_date ? new Date(referral.referral_date) : new Date(),
        appointment_date: referral.appointment_date ? new Date(referral.appointment_date) : null,
        notes: referral.notes || '',
      });
      modalRef.current.open('Edit Referral', renderForm(), 'lg');
    } else {
      setEditingReferral(null);
      setFormData({
        referred_to_name: '',
        referred_to_type: '',
        referral_reason: '',
        clinical_summary: '',
        status: 'Pending',
        referral_date: new Date(),
        appointment_date: null,
        notes: '',
      });
      modalRef.current.open('Add Referral', renderForm(), 'lg');
    }
  };

  const handleSubmit = () => {
    if (!formData.referred_to_name.trim()) {
      addToast({ message: 'Please enter the name of who/what you are referring to', severity: 'error' });
      return;
    }
    if (!editingReferral && !formData.consultation_id) {
      addToast({ message: 'Please add referrals from the clinical notes page for a specific consultation', severity: 'error' });
      return;
    }

    const submitData = {
      consultation_id: editingReferral ? editingReferral.consultation_id : formData.consultation_id,
      referred_to_name: formData.referred_to_name,
      referred_to_type: formData.referred_to_type,
      referral_reason: formData.referral_reason,
      clinical_summary: formData.clinical_summary,
      status: formData.status,
      referral_date: formatDateForDb(formData.referral_date),
      appointment_date: formData.appointment_date ? formatDateForDb(formData.appointment_date) : null,
      notes: formData.notes,
    };

    if (editingReferral) {
      handlePatch(`api/referrals/${editingReferral.id}`, submitData, {
        onSuccess: () => {
          addToast({ message: 'Referral updated successfully', severity: 'success' });
          modalRef.current.close();
          fetchReferrals();
        },
        onError: (error) => {
          addToast({ message: formatError(error), severity: 'error' });
        },
      });
    }
  };

  const handleDeleteReferral = (referral) => {
    confirmDialogRef.current.open(
      'Delete Referral',
      `Are you sure you want to delete the referral to ${referral.referred_to_name}? This action cannot be undone.`,
      () => {
        handleDelete(`api/referrals/${referral.id}`, {
          onSuccess: () => {
            addToast({ message: 'Referral deleted successfully', severity: 'success' });
            fetchReferrals();
          },
          onError: (error) => {
            addToast({ message: formatError(error), severity: 'error' });
          },
        });
      }
    );
  };

  const renderForm = () => (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Referred To (Name)"
            required
            placeholder="Enter doctor, specialist, or facility name"
            value={formData.referred_to_name}
            onChange={(value) => setFormData({ ...formData, referred_to_name: value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Select
            fullWidth
            label="Referral Type"
            placeholder="Select type"
            options={referralTypes}
            value={formData.referred_to_type}
            onChange={(value) => setFormData({ ...formData, referred_to_type: value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Referral Reason"
            placeholder="Reason for referral"
            multiline
            rows={3}
            value={formData.referral_reason}
            onChange={(value) => setFormData({ ...formData, referral_reason: value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Clinical Summary"
            placeholder="Brief clinical summary for the referral"
            multiline
            rows={4}
            value={formData.clinical_summary}
            onChange={(value) => setFormData({ ...formData, clinical_summary: value })}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Select
            fullWidth
            label="Status"
            options={['Pending', 'Sent', 'Acknowledged', 'Completed']}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value })}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DatePicker
            fullWidth
            label="Referral Date"
            value={formData.referral_date}
            onChange={(value) => setFormData({ ...formData, referral_date: value })}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DatePicker
            fullWidth
            label="Appointment Date (Optional)"
            value={formData.appointment_date}
            onChange={(value) => setFormData({ ...formData, appointment_date: value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Additional Notes"
            placeholder="Any additional notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(value) => setFormData({ ...formData, notes: value })}
          />
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => modalRef.current.close()}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loadingPost || loadingPatch}
            >
              {editingReferral ? 'Update' : 'Create'} Referral
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

  const getPatientName = (item) => {
    const patient = item.patient || 
      item.consultation?.payment_cache_item?.payment_cache?.check_in?.patient;
    return patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'N/A';
  };

  const getPatient = (item) => {
    return item.patient || 
      item.consultation?.payment_cache_item?.payment_cache?.check_in?.patient || 
      null;
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Consultation Room" },
        { title: "Referrals" },
      ]}
    >
      <Card elevation={2}>
        <PageHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AssignmentIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Referrals Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {data && typeof data.total === 'number' ? `${data.total} total referral${data.total !== 1 ? 's' : ''}` : '0 referrals'}
                </Typography>
              </Box>
            </Box>
          }
          trailing={
            <Tooltip title="Refresh">
              <IconButton
                onClick={fetchReferrals}
                disabled={loading}
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
          {(loadingPost || loadingPatch || loadingDelete) && (
            <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
          )}

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: 'action.hover',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FilterIcon color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">
                Filter Referrals
              </Typography>
            </Box>
            <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <DatePicker
                fullWidth
                label="Start Date"
                value={params.start_date}
                onChange={(value) => {
                  setParams({ ...params, start_date: value, page: 1 });
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                fullWidth
                label="End Date"
                value={params.end_date}
                onChange={(value) => {
                  setParams({ ...params, end_date: value, page: 1 });
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                label="Status"
                placeholder="All Statuses"
                clearable
                options={['Pending', 'Sent', 'Acknowledged', 'Completed']}
                value={params.status}
                onChange={(value) => setParams({ ...params, status: value, page: 1 })}
              />
            </Grid>
          </Grid>
          </Paper>

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
                field: "patient_name",
                headerName: "Patient Name",
                valueGetter: (item) => getPatientName(item),
              },
              {
                field: "referred_to_name",
                headerName: "Referred To",
                valueGetter: (item) => item.referred_to_name,
              },
              {
                field: "referred_to_type",
                headerName: "Type",
                valueGetter: (item) => item.referred_to_type || 'N/A',
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  <Chip
                    label={item.status}
                    color={statusColors[item.status] || 'default'}
                    size="small"
                  />
                ),
              },
              {
                field: "referral_date",
                headerName: "Referral Date",
                valueGetter: (item) =>
                  item.referral_date
                    ? new Date(item.referral_date).toLocaleDateString()
                    : 'N/A',
              },
              {
                field: "referral_reason",
                headerName: "Reason",
                valueGetter: (item) =>
                  item.referral_reason
                    ? item.referral_reason.substring(0, 50) + (item.referral_reason.length > 50 ? '...' : '')
                    : 'N/A',
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => {
                  const patient = getPatient(item);
                  return (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      flexWrap="wrap"
                    >
                      <Tooltip title="Download PDF">
                        <span>
                          <ReferralPDF
                            referral={item}
                            patient={patient}
                            size="small"
                          />
                        </span>
                      </Tooltip>
                      <Tooltip title="Edit Referral">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenModal(item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Referral">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteReferral(item)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  );
                },
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
      <ConfirmationDialog ref={confirmDialogRef} />
    </Page>
  );
};

export default Referrals;

