import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  Paper,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import TextField from '../../../components/TextField';
import DatePicker from '../../../components/DatePicker';
import Select from '../../../components/Select';
import Modal from '../../../components/Modal';
import { usePost, usePatch, useDelete, useToast } from '../../../hooks';
import { formatDateForDb, formatError } from '../../../helpers';
import ReferralPDF from '../referrals/ReferralPDF';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import { Document, Page, pdf, StyleSheet, Text, View } from "@react-pdf/renderer";
import Header from "../../../components/pdf/Header";
import Footer from "../../../components/pdf/Footer";

const ReferralCard = React.forwardRef(({ consultation, referrals, fetchReferrals, patient }, ref) => {
  const addToast = useToast();
  const modalRef = React.useRef();
  const confirmDialogRef = React.useRef();

  // Use provided patient data (should be passed from parent)
  const patientInfo = patient || null;

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState('');
  const [formData, setFormData] = React.useState({
    referred_to_name: '',
    referred_to_type: '',
    referral_reason: '',
    clinical_summary: '',
    status: 'Pending',
    referral_date: new Date(),
    appointment_date: null,
    notes: '',
  });

  const [editingReferral, setEditingReferral] = React.useState(null);

  const { handlePost, loading: loadingPost } = usePost();
  const { handlePatch, loading: loadingPatch } = usePatch();
  const { handleDelete, loading: loadingDelete } = useDelete();

  // Expose handleOpenModal to parent via ref
  React.useImperativeHandle(ref, () => ({
    handleOpenModal: (referral = null) => handleOpenModal(referral)
  }));

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
      setDialogTitle('Edit Referral');
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
      setDialogTitle('Add Referral');
    }
    
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = () => {
    console.log('Form Data on submit:', formData);
    
    if (!formData.referred_to_name || !formData.referred_to_name.trim()) {
      addToast({ message: 'Please enter the name of who/what you are referring to', severity: 'error' });
      return;
    }

    // Ensure referral_date is always provided and properly formatted
    let referralDate = null;
    if (formData.referral_date) {
      try {
        const date = formData.referral_date instanceof Date ? formData.referral_date : new Date(formData.referral_date);
        if (!isNaN(date.getTime())) {
          referralDate = formatDateForDb(date);
        } else {
          referralDate = formatDateForDb(new Date());
        }
      } catch (e) {
        console.error('Error formatting referral_date:', e);
        referralDate = formatDateForDb(new Date());
      }
    } else {
      referralDate = formatDateForDb(new Date());
    }
    
    // Format appointment_date if provided
    let appointmentDate = null;
    if (formData.appointment_date) {
      try {
        const date = formData.appointment_date instanceof Date ? formData.appointment_date : new Date(formData.appointment_date);
        if (!isNaN(date.getTime())) {
          appointmentDate = formatDateForDb(date);
        }
      } catch (e) {
        console.error('Error formatting appointment_date:', e);
      }
    }
    
    const submitData = {
      consultation_id: consultation.id,
      referred_to_name: formData.referred_to_name?.trim() || '',
      referred_to_type: formData.referred_to_type && formData.referred_to_type.trim() ? formData.referred_to_type.trim() : null,
      referral_reason: formData.referral_reason && formData.referral_reason.trim() ? formData.referral_reason.trim() : null,
      clinical_summary: formData.clinical_summary && formData.clinical_summary.trim() ? formData.clinical_summary.trim() : null,
      status: formData.status || 'Pending',
      referral_date: referralDate,
      appointment_date: appointmentDate || null,
      notes: formData.notes && formData.notes.trim() ? formData.notes.trim() : null,
    };
    
    // Remove null values to avoid sending them (optional - Laravel handles nulls fine)
    // But ensure required fields are present
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '' && key !== 'referred_to_name') {
        submitData[key] = null;
      }
    });

    console.log('Submitting referral data:', submitData);

    if (editingReferral) {
      handlePatch(`api/referrals/${editingReferral.id}`, submitData, {
        onSuccess: () => {
          addToast({ message: 'Referral updated successfully', severity: 'success' });
          handleCloseDialog();
          fetchReferrals();
        },
        onError: (error) => {
          console.error('Error updating referral:', error);
          const errorMessage = formatError(error);
          addToast({ message: errorMessage || 'Failed to update referral. Please check the form and try again.', severity: 'error' });
        },
      });
    } else {
      handlePost('api/referrals', submitData, {
        onSuccess: async (response) => {
          const newReferral = response?.data?.data || response?.data;
          addToast({ message: 'Referral created successfully', severity: 'success' });
          handleCloseDialog();
          
          // Fetch updated referrals first
          await fetchReferrals();
          
          // Auto-print the referral PDF after creation
          if (newReferral?.id) {
            setTimeout(() => {
              printReferralPDF(newReferral, patientInfo);
            }, 500);
          }
        },
        onError: (error) => {
          console.error('Error creating referral:', error);
          const errorMessage = formatError(error);
          addToast({ message: errorMessage || 'Failed to create referral. Please check the form and try again.', severity: 'error' });
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

  // Function to generate and print referral PDF
  const printReferralPDF = async (referral, patient) => {
    try {
      // Import PDF styles and components inline
      const pdfStyles = StyleSheet.create({
        page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
        section: { marginBottom: 15 },
        title: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#1976d2" },
        subtitle: { fontSize: 12, fontWeight: "bold", marginTop: 10, marginBottom: 5, color: "#424242" },
        label: { fontSize: 9, fontWeight: "bold", color: "#666", marginTop: 8, marginBottom: 3 },
        value: { fontSize: 10, color: "#000", marginBottom: 5, lineHeight: 1.5 },
        divider: { borderBottom: "1 solid #e0e0e0", marginVertical: 10 },
        row: { flexDirection: "row", marginBottom: 8 },
        col: { flex: 1 },
      });

      const ReferralPDFDoc = ({ referral, patient }) => (
        <Document>
          <Page size="A4" style={pdfStyles.page}>
            <Header
              title="Referral Letter"
              subtitle={`Patient: ${patient?.full_name || "N/A"}`}
            />
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.title}>Referral Information</Text>
              <View style={pdfStyles.row}>
                <View style={pdfStyles.col}>
                  <Text style={pdfStyles.label}>Referred To:</Text>
                  <Text style={pdfStyles.value}>{referral.referred_to_name || "N/A"}</Text>
                </View>
                <View style={pdfStyles.col}>
                  <Text style={pdfStyles.label}>Type:</Text>
                  <Text style={pdfStyles.value}>{referral.referred_to_type || "N/A"}</Text>
                </View>
              </View>
              {referral.referral_reason && (
                <>
                  <View style={pdfStyles.divider} />
                  <Text style={pdfStyles.subtitle}>Reason for Referral:</Text>
                  <Text style={pdfStyles.value}>{referral.referral_reason}</Text>
                </>
              )}
              {referral.clinical_summary && (
                <>
                  <View style={pdfStyles.divider} />
                  <Text style={pdfStyles.subtitle}>Clinical Summary:</Text>
                  <Text style={pdfStyles.value}>{referral.clinical_summary}</Text>
                </>
              )}
              {referral.notes && (
                <>
                  <View style={pdfStyles.divider} />
                  <Text style={pdfStyles.subtitle}>Additional Notes:</Text>
                  <Text style={pdfStyles.value}>{referral.notes}</Text>
                </>
              )}
            </View>
            <Footer />
          </Page>
        </Document>
      );

      const pdfDoc = <ReferralPDFDoc referral={referral} patient={patient} />;
      const blob = await pdf(pdfDoc).toBlob();
      
      if (!blob || blob.size === 0) {
        throw new Error('Generated PDF is empty or invalid');
      }
      
      const url = window.URL.createObjectURL(blob);
      
      // Try to open in new window and trigger print
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        // Use multiple methods to ensure print dialog opens
        const tryPrint = () => {
          try {
            printWindow.print();
          } catch (e) {
            console.warn('Print failed, trying alternative method:', e);
            // Fallback: wait a bit longer and try again
            setTimeout(() => {
              try {
                printWindow.print();
              } catch (e2) {
                console.error('Print failed after retry:', e2);
                addToast({ message: 'Print dialog could not be opened. PDF downloaded instead.', severity: 'info' });
                // Download as fallback
                const link = document.createElement('a');
                link.href = url;
                link.download = `referral-${patient?.full_name || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                }, 100);
              }
            }, 500);
          }
        };
        
        // Try multiple approaches to trigger print
        if (printWindow.addEventListener) {
          printWindow.addEventListener('load', () => {
            setTimeout(tryPrint, 500);
          });
        }
        
        // Also try onload as fallback
        printWindow.onload = () => {
          setTimeout(tryPrint, 500);
        };
        
        // Final fallback after a delay
        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            tryPrint();
          }
        }, 1000);
      } else {
        // Popup blocked - download instead
        const link = document.createElement('a');
        link.href = url;
        link.download = `referral-${patient?.full_name || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          window.URL.revokeObjectURL(url);
        }, 100);
        addToast({ message: 'Popup blocked. PDF downloaded instead. Please open the file to print.', severity: 'info' });
      }
    } catch (error) {
      console.error('Failed to generate/print referral PDF:', error);
      addToast({ message: 'Failed to print referral PDF', severity: 'warning' });
    }
  };

  const renderForm = () => (
    <Box>
      {/* Patient Info Header */}
      {patientInfo && (
        <Box sx={{ 
          p: 2, 
          mb: 3, 
          bgcolor: '#f5f5f5',
          borderRadius: 1.5,
          border: '1px solid #e0e0e0'
        }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} divider={<Divider orientation="vertical" flexItem />}>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Patient Name
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {patientInfo.full_name || 'N/A'}
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Patient ID
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {patientInfo.patient_id || 'N/A'}
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Phone Number
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {patientInfo.phone || 'N/A'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}

      {/* Form Sections */}
      <Stack spacing={3}>
        {/* Section 1: Referral Destination */}
        <Box>
          <Typography 
            variant="subtitle1" 
            fontWeight="600" 
            color="primary" 
            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <LocationIcon fontSize="small" />
            Referral Destination
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                label="Referred To (Name) *"
                placeholder="e.g., Dr. John Smith or City Hospital"
                value={formData.referred_to_name}
                onChange={(value) => {
                  console.log('Referred To Name changed:', value);
                  setFormData({ ...formData, referred_to_name: value });
                }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <Select
                fullWidth
                label="Type"
                placeholder="Select type"
                options={referralTypes}
                value={formData.referred_to_type}
                onChange={(value) => setFormData({ ...formData, referred_to_type: value })}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Section 2: Clinical Details */}
        <Box>
          <Typography 
            variant="subtitle1" 
            fontWeight="600" 
            color="primary" 
            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <DescriptionIcon fontSize="small" />
            Clinical Details
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Reason for Referral"
              placeholder="Why is this patient being referred?"
              multiline
              rows={3}
              value={formData.referral_reason}
              onChange={(value) => setFormData({ ...formData, referral_reason: value })}
            />
            <TextField
              fullWidth
              label="Clinical Summary"
              placeholder="Relevant clinical findings and patient history"
              multiline
              rows={3}
              value={formData.clinical_summary}
              onChange={(value) => setFormData({ ...formData, clinical_summary: value })}
            />
          </Stack>
        </Box>

        <Divider />

        {/* Section 3: Status & Scheduling */}
        <Box>
          <Typography 
            variant="subtitle1" 
            fontWeight="600" 
            color="primary" 
            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <CalendarIcon fontSize="small" />
            Status & Scheduling
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Select
                fullWidth
                label="Status"
                options={['Pending', 'Sent', 'Acknowledged', 'Completed']}
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DatePicker
                fullWidth
                label="Referral Date"
                value={formData.referral_date}
                onChange={(value) => setFormData({ ...formData, referral_date: value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DatePicker
                fullWidth
                label="Appointment (Optional)"
                value={formData.appointment_date}
                onChange={(value) => setFormData({ ...formData, appointment_date: value })}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Section 4: Additional Notes */}
        <Box>
          <Typography 
            variant="subtitle1" 
            fontWeight="600" 
            color="primary" 
            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <AssignmentIcon fontSize="small" />
            Additional Notes
          </Typography>
          <TextField
            fullWidth
            label="Notes (Optional)"
            placeholder="Any special instructions or additional information"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(value) => setFormData({ ...formData, notes: value })}
          />
        </Box>
      </Stack>

    </Box>
  );

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssignmentIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold" color="primary">
            Patient Referrals
          </Typography>
          {referrals && referrals.length > 0 && (
            <Chip 
              label={referrals.length} 
              size="small" 
              color="primary"
              sx={{ fontWeight: 'bold' }}
            />
          )}
        </Box>
        <Button
          variant="contained"
          size="medium"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
            },
            boxShadow: 2,
          }}
        >
          Add Referral
        </Button>
      </Box>

      {(loadingPost || loadingPatch || loadingDelete) && (
        <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
      )}

      {referrals && referrals.length > 0 ? (
        <Grid container spacing={2}>
          {referrals.map((referral) => (
            <Grid item xs={12} key={referral.id}>
              <Card 
                elevation={2}
                sx={{
                  border: '1px solid',
                  borderColor: statusColors[referral.status] === 'warning' ? 'warning.light' :
                               statusColors[referral.status] === 'success' ? 'success.light' :
                               statusColors[referral.status] === 'info' ? 'info.light' :
                               'primary.light',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardHeader
                  avatar={
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${
                          statusColors[referral.status] === 'warning' ? '#ff9800, #f57c00' :
                          statusColors[referral.status] === 'success' ? '#4caf50, #388e3c' :
                          statusColors[referral.status] === 'info' ? '#2196f3, #1976d2' :
                          '#1976d2, #1565c0'
                        })`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      <PersonIcon />
                    </Box>
                  }
                  title={
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {referral.referred_to_name}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      {referral.referred_to_type && (
                        <Chip
                          label={referral.referred_to_type}
                          size="small"
                          variant="outlined"
                          sx={{ height: 24 }}
                        />
                      )}
                      <Chip
                        label={referral.status}
                        color={statusColors[referral.status] || 'default'}
                        size="small"
                        sx={{ fontWeight: 'bold', height: 24 }}
                      />
                    </Box>
                  }
                  action={
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Download PDF">
                        <span>
                          <ReferralPDF
                            referral={referral}
                            patient={patientInfo}
                            size="small"
                          />
                        </span>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenModal(referral)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteReferral(referral)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                />
                <Divider />
                <CardContent>
                  <Stack spacing={2}>
                    {referral.referral_reason && (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <DescriptionIcon fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="bold" color="text.primary">
                            Reason for Referral:
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            pl: 3,
                            lineHeight: 1.7,
                            textAlign: 'justify',
                          }}
                        >
                          {referral.referral_reason}
                        </Typography>
                      </Box>
                    )}

                    {referral.clinical_summary && (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <DescriptionIcon fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="bold" color="text.primary">
                            Clinical Summary:
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            pl: 3,
                            lineHeight: 1.7,
                            textAlign: 'justify',
                          }}
                        >
                          {referral.clinical_summary}
                        </Typography>
                      </Box>
                    )}

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {referral.referral_date && (
                        <Grid item xs={12} sm={6}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              backgroundColor: 'action.hover',
                              borderRadius: 1,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon fontSize="small" color="action" />
                              <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                  Referral Date
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {new Date(referral.referral_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      )}
                      {referral.appointment_date && (
                        <Grid item xs={12} sm={6}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              backgroundColor: 'action.hover',
                              borderRadius: 1,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon fontSize="small" color="action" />
                              <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                  Appointment Date
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {new Date(referral.appointment_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>

                    {referral.notes && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1.5,
                          backgroundColor: 'info.light',
                          borderRadius: 1,
                          borderLeft: '4px solid',
                          borderColor: 'info.main',
                        }}
                      >
                        <Typography variant="caption" fontWeight="bold" color="info.dark">
                          Additional Notes:
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {referral.notes}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e8eaf6 100%)',
            borderRadius: 3,
            border: '2px dashed #90caf9',
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3,
            }}
          >
            <AssignmentIcon sx={{ fontSize: 64, color: '#1976d2' }} />
          </Box>
          <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
            No Referrals Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            Create a comprehensive referral for this patient to another healthcare provider, specialist, or facility. 
            Include all relevant clinical information to ensure continuity of care.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              },
              boxShadow: 3,
            }}
          >
            Create First Referral
          </Button>
        </Paper>
      )}

      {/* Referral Form Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
          {dialogTitle}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          {renderForm()}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button 
            onClick={handleCloseDialog}
            size="large"
            sx={{ 
              minWidth: 100,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loadingPost || loadingPatch}
            size="large"
            sx={{ 
              minWidth: 120,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {editingReferral ? 'Update' : 'Create'} Referral
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog ref={confirmDialogRef} />
    </Box>
  );
});

ReferralCard.displayName = 'ReferralCard';

export default ReferralCard;

