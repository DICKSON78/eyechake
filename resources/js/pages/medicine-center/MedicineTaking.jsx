import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  MedicationRounded as MedicineIcon,
  PersonRounded as PatientIcon,
  ScheduleRounded as ScheduleIcon,
  CheckCircleRounded as CompletedIcon,
  WarningRounded as WarningIcon,
  CheckRounded as CheckIcon,
  EditRounded as EditIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../components/Page";
import Table from "../../components/Table";
import DatePicker from "../../components/DatePicker";
import { useFetch, usePatch, useToast } from "../../hooks";
import { formatError, numberFormat, formatDateForDb } from "../../helpers";

const MedicineTaking = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [takenDateTime, setTakenDateTime] = useState(new Date());

  const { data, loading, error, handleFetch } = useFetch(
    "api/medicine-taking",
    {},
    true,
    { data: [], count: 0 }
  );

  const { handlePatch, loading: updating } = usePatch();

  useEffect(() => {
    document.title = `Medicine Taking - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleMarkAsTaken = (record) => {
    setSelectedRecord(record);
    setTakenDateTime(new Date());
    setMarkDialogOpen(true);
  };

  const handleConfirmMarkAsTaken = () => {
    if (!selectedRecord) return;

    // Use the mark-taken endpoint which automatically sets taken_at and status
    fetch(`/api/medicine-taking/${selectedRecord.id}/mark-taken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
      credentials: 'same-origin',
    })
    .then(response => response.json())
    .then(result => {
      if (result.success !== false) {
        addToast({ message: 'Medicine marked as taken successfully', severity: 'success' });
        setMarkDialogOpen(false);
        setSelectedRecord(null);
        handleFetch();
      } else {
        addToast({ message: formatError(result), severity: 'error' });
      }
    })
    .catch(error => {
      addToast({ message: 'Error marking medicine as taken', severity: 'error' });
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Missed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CompletedIcon />;
      case 'Pending':
        return <ScheduleIcon />;
      case 'Missed':
        return <WarningIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  return (
    <Page
      title="Medicine Taking"
      breadcrumbs={[
        { title: "Home" },
        { title: "Medicine Center" },
        { title: "Medicine Taking" },
      ]}
    >
      <Card>
        <PageHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MedicineIcon sx={{ fontSize: 28.8, color: 'primary.main' }} />
              <Typography variant="h5">Medicine Taking Records</Typography>
            </Box>
          }
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/medicine-center/medicine-taking/create')}
            >
              Add Medicine Taking
            </Button>
          }
        />

        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table
              loading={loading}
              columns={[
                {
                  field: "index",
                  headerName: "S/N",
                  valueGetter: (item, index) => index + 1,
                },
                {
                  field: "patient_name",
                  headerName: "Patient Name",
                  valueGetter: (item) => item.patient?.name || 'N/A',
                },
                {
                  field: "medicine_name",
                  headerName: "Medicine",
                  valueGetter: (item) => item.medicine?.name || 'N/A',
                },
                {
                  field: "dosage",
                  headerName: "Dosage",
                  valueGetter: (item) => item.dosage || 'N/A',
                },
                {
                  field: "scheduled_time",
                  headerName: "Scheduled Time",
                  valueGetter: (item) => {
                    const date = formatDate(item.scheduled_date);
                    const time = formatTime(item.scheduled_time);
                    return `${date} at ${time}`;
                  },
                },
                {
                  field: "taken_time",
                  headerName: "Taken Time",
                  valueGetter: (item) => {
                    if (!item.taken_at) return 'Not taken';
                    const date = formatDate(item.taken_at);
                    const time = formatTime(item.taken_at.split('T')[1]);
                    return `${date} at ${time}`;
                  },
                },
                {
                  field: "status",
                  headerName: "Status",
                  renderCell: (item) => (
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status)}
                      size="small"
                      icon={getStatusIcon(item.status)}
                    />
                  ),
                },
                {
                  field: "notes",
                  headerName: "Notes",
                  valueGetter: (item) => item.notes || 'No notes',
                },
                {
                  field: "actions",
                  headerName: "Actions",
                  renderCell: (item) => (
                    <Stack direction="row" spacing={1}>
                      {item.status === 'Pending' && (
                        <Tooltip title="Mark as Taken">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleMarkAsTaken(item)}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  ),
                },
              ]}
              items={data.data}
              itemCount={data.count}
            />
          )}
        </CardContent>
      </Card>

      {/* Mark as Taken Dialog */}
      <Dialog 
        open={markDialogOpen} 
        onClose={() => setMarkDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Mark Medicine as Taken
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Patient:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedRecord.patient?.name || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Medicine:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedRecord.medicine?.name || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Dosage:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedRecord.dosage || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Scheduled Time:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(selectedRecord.scheduled_date)} at {formatTime(selectedRecord.scheduled_time)}
                </Typography>
              </Box>
              <DatePicker
                label="Date & Time Taken"
                value={takenDateTime}
                onChange={(value) => setTakenDateTime(value)}
                fullWidth
                required
                showTime
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmMarkAsTaken}
            disabled={updating}
            startIcon={<CheckIcon />}
          >
            {updating ? 'Marking...' : 'Mark as Taken'}
          </Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
};

export default MedicineTaking;
