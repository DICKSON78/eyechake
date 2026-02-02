import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Assignment as ReferralIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

import { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import Select from "../../../components/Select";
import DiagnosisCard from "./DiagnosisCard";
import SelectDiagnoses from "./SelectDiagnoses";
import ExternalExamination from "./ExternalExamination";
import FunctionalTests from "./FunctionalTests";
import VisualAcuity from "./VisualAcuity";
import Refraction from "./Refraction";
import Fundoscopy from "./Fundoscopy";
import ConsultationItemsCard from "./ConsultationItemsCard";
import SelectItems from "./SelectItems";
import PatientFilePDF, { PDFReportDocument } from "../../patient-records/patient-file/PatientFilePDF";
import PrescriptionPDF from "../prescriptions/PrescriptionPDF";
import { pdf } from "@react-pdf/renderer";

import { useFetch, usePatch, usePost, useToast } from "../../../hooks";
import { useNotificationContext } from "../../../contexts/NotificationContext";
import {
  formatDateForDb,
  formatError,
  getValidationError,
} from "../../../helpers";

const Subheader = ({ title, sx }) => {
  return (
    <Box
      sx={{
        backgroundColor: "#1976d2",
        color: "white",
        py: 1.5,
        px: 3,
        my: 2,
        borderRadius: 1,
        textAlign: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        ...sx,
      }}
    >
      <Typography
        variant="h6"
        fontWeight="600"
        sx={{ fontSize: '1rem' }}
      >
        {title}
      </Typography>
    </Box>
  );
};

const ClinicalNotes = ({ patient, consultation }) => {
  const addToast = useToast();
  const navigate = useNavigate();
  const { refreshNotificationsImmediately } = useNotificationContext();

  const modalRef = useRef();
  const formRef = useRef();
  const chiefComplaintRef = useRef();
  const historyPresentIllnessRef = useRef();
  const familyHistoryRef = useRef();
  const generalHealthRef = useRef();
  const familyOcularHistoryRef = useRef();
  const familyGeneralHistoryRef = useRef();
  const visualAcuityRef = useRef();
  const externalExaminationRef = useRef();
  const functionalTestsRef = useRef();
  const refractionRef = useRef();
  const fundoscopyRef = useRef();
  const patientToReturnDateRef = useRef();
  const returnReasonRef = useRef();
  const remarksRef = useRef();
  const doctorRecommendationsRef = useRef();
  const doctorCommentsRemarksRef = useRef();
  const referralFormRef = useRef();

  const [data, setData] = useState();
  const [error, setError] = useState();
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralFormData, setReferralFormData] = useState({
    referred_to_name: '',
    referred_to_type: '',
    referral_reason: '',
    clinical_summary: '',
    status: 'Pending',
    referral_date: new Date(),
    appointment_date: null,
    notes: '',
  });
  const [formData, setFormData] = useState({
    ...consultation,
    payment_cache_item: undefined,
    creator: undefined,
    to_return_date: consultation.to_return_date
      ? new Date(consultation.to_return_date)
      : null,
    return_reason: consultation.return_reason || '',
    return_date_preset: null, // For preset options
    doctor_recommendations: consultation.doctor_recommendations || '',
    doctor_comments_remarks: consultation.doctor_comments_remarks || '',
    lens_types: consultation.lens_types ? (typeof consultation.lens_types === 'string' ? JSON.parse(consultation.lens_types) : consultation.lens_types) : [],
  });

  const {
    data: diagnoses,
    setData: setDiagnoses,
    loading: loadingDiagnoses,
    handleFetch: fetchDiagnoses,
  } = useFetch(
    "api/consultation-diagnoses",
    {
      per_page: 500,
      consultation_id: consultation.id,
    },
    false,
    [],
    (response) => {
      // Safely extract data with fallback
      const data = response?.data?.data?.data || response?.data?.data || response?.data || [];
      return Array.isArray(data) ? data : [];
    }
  );
  const {
    data: items,
    setData: setItems,
    loading: loadingItems,
    handleFetch: fetchItems,
  } = useFetch(
    "api/patient-payment-cache-items",
    {
      per_page: 500,
      consultation_id: consultation.id,
    },
    false,
    [],
    (response) => {
      // Safely extract data with fallback
      const data = response?.data?.data?.data || response?.data?.data || response?.data || [];
      return Array.isArray(data) ? data : [];
    }
  );


  const { handlePatch: handleAutoSave } = usePatch();
  const {
    data: dataComplete,
    loading: loadingComplete,
    error: errorComplete,
    handlePatch: handleComplete,
  } = usePatch();
  const {
    data: referralData,
    loading: loadingReferral,
    error: referralError,
    handlePost: handleCreateReferral,
  } = usePost();

  useEffect(() => {
    document.title = `Clinical Notes - ${window.APP_NAME}`;

    fetchDiagnoses();
    fetchItems();
  }, []);

  useEffect(() => {
    if (dataComplete) {
      setData(dataComplete);
      // Trigger immediate notification refresh since consultation status changed
      refreshNotificationsImmediately();

      window.setTimeout(() => {
        navigate("/consultation-room/consultation-patients/pending");
      }, 1000);
    }
  }, [dataComplete, refreshNotificationsImmediately]);

  useEffect(() => {
    if (errorComplete) {
      setError(errorComplete);
    }
  }, [errorComplete]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (referralData) {
      addToast({ message: 'Referral created successfully', severity: 'success' });
      // Reset form and hide it
      setReferralFormData({
        referred_to_name: '',
        referred_to_type: '',
        referral_reason: '',
        clinical_summary: '',
        status: 'Pending',
        referral_date: new Date(),
        appointment_date: null,
        notes: '',
      });
      setShowReferralForm(false);
    }
  }, [referralData]);

  useEffect(() => {
    if (referralError) {
      addToast({ message: formatError(referralError), severity: 'error' });
    }
  }, [referralError]);

  const autoSave = (field, value) => {
    // For lens_types, compare arrays properly
    if (field === 'lens_types') {
      const currentValue = consultation[field] 
        ? (typeof consultation[field] === 'string' ? JSON.parse(consultation[field]) : consultation[field])
        : [];
      const currentStr = JSON.stringify(currentValue.sort());
      const newStr = JSON.stringify((Array.isArray(value) ? value : []).sort());
      if (currentStr !== newStr) {
        handleAutoSave(
          `api/consultations/${consultation.id}/auto-save-clinical-notes`,
          {
            what: "Consultation",
            [field]: typeof value === 'string' ? value : JSON.stringify(value),
          }
        );
      }
    } else if (value !== consultation[field]) {
      handleAutoSave(
        `api/consultations/${consultation.id}/auto-save-clinical-notes`,
        {
          what: "Consultation",
          [field]: value,
        }
      );
    }
  };

  const openSelectDiagnosesModal = (title, type) => {
    let component = (
      <SelectDiagnoses
        modal={modalRef.current}
        consultationId={consultation.id}
        diagnosisType={type}
        selected={diagnoses.filter((e) => e.diagnosis_type === type)}
        fetchDiagnoses={fetchDiagnoses}
      />
    );

    modalRef.current.open(title, component, "md");
  };

  const openSelectItemsModal = (title, type) => {
    let component = (
      <SelectItems
        modal={modalRef.current}
        consultation={consultation}
        consultationType={type}
        selected={items.filter((e) => e.consultation_type.name === type)}
        fetchItems={fetchItems}
      />
    );

    modalRef.current.open(title, component, "lg");
  };

  const confirmComplete = () => {
    setData(null);
    setError(null);

    if (!formRef.current.validate()) {
      return setError(
        getValidationError("Please complete all the required fields.")
      );
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          
          // Prepare the complete payload with all required fields
          // Note: family_ocular_history and family_general_history removed - columns don't exist in database
          const payload = {
            chief_complaint: formData.chief_complaint || '',
            history_present_illness: formData.history_present_illness || '',
            family_history: formData.family_history || '',
            general_health: formData.general_health || '',
            patient_to_return: formData.patient_to_return || 'No',
            to_return_date: formData.to_return_date
              ? formatDateForDb(formData.to_return_date)
              : null,
            return_reason: formData.return_reason || null,
            remarks: formData.remarks || '',
            doctor_recommendations: formData.doctor_recommendations || '',
            doctor_comments_remarks: formData.doctor_comments_remarks || '',
            require_glass: formData.require_glass || 'No',
            lens_types: formData.lens_types ? JSON.stringify(formData.lens_types) : null,
            visual_acuity: visualAcuityRef.current?.getFormData() || {},
            external_examination: externalExaminationRef.current?.getFormData() || {},
            functional_tests: functionalTestsRef.current?.getFormData() || {},
            refraction: refractionRef.current?.getFormData() || {},
            fundoscopy: fundoscopyRef.current?.getFormData() || {},
          };
          
          console.log('Submitting clinical notes payload:', payload);
          
          handleComplete(
            `api/consultations/${consultation.id}/complete-clinical-notes`,
            payload
          );
        }}
      />
    );

    modalRef.current.open("Confirm Save", component, "sm");
  };

  const handleCreateReferralSubmit = () => {
    if (!referralFormData.referred_to_name || !referralFormData.referred_to_name.trim()) {
      addToast({ message: 'Please enter the name of who/what you are referring to', severity: 'error' });
      return;
    }

    // Ensure referral_date is always provided and properly formatted
    let referralDate = null;
    if (referralFormData.referral_date) {
      try {
        const date = referralFormData.referral_date instanceof Date ? referralFormData.referral_date : new Date(referralFormData.referral_date);
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
    if (referralFormData.appointment_date) {
      try {
        const date = referralFormData.appointment_date instanceof Date ? referralFormData.appointment_date : new Date(referralFormData.appointment_date);
        if (!isNaN(date.getTime())) {
          appointmentDate = formatDateForDb(date);
        }
      } catch (e) {
        console.error('Error formatting appointment_date:', e);
      }
    }

    const submitData = {
      consultation_id: consultation.id,
      referred_to_name: referralFormData.referred_to_name?.trim() || '',
      referred_to_type: referralFormData.referred_to_type && referralFormData.referred_to_type.trim() ? referralFormData.referred_to_type.trim() : null,
      referral_reason: referralFormData.referral_reason && referralFormData.referral_reason.trim() ? referralFormData.referral_reason.trim() : null,
      clinical_summary: referralFormData.clinical_summary && referralFormData.clinical_summary.trim() ? referralFormData.clinical_summary.trim() : null,
      status: referralFormData.status || 'Pending',
      referral_date: referralDate,
      appointment_date: appointmentDate || null,
      notes: referralFormData.notes && referralFormData.notes.trim() ? referralFormData.notes.trim() : null,
    };

    console.log('Submitting referral data:', submitData);
    handleCreateReferral('api/referrals', submitData);
  };

  const printReferralPDF = async (referral, patientData) => {
    try {
      const resolvedPatient = patientData || patient;

      const pdfBlob = await pdf(
        <PDFReportDocument
          patient={resolvedPatient}
          consultation={consultation}
          includeReferral={referral}
        />
      ).toBlob();

      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('Generated PDF is empty or invalid');
      }

      const url = window.URL.createObjectURL(pdfBlob);

      // Try to open in new window and trigger print
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        const tryPrint = () => {
          try {
            printWindow.print();
          } catch (e) {
            console.warn('Print failed, trying alternative method:', e);
            setTimeout(() => {
              try {
                printWindow.print();
              } catch (e2) {
                console.error('Print failed after retry:', e2);
                addToast({ message: 'Print dialog could not be opened. PDF downloaded instead.', severity: 'info' });
                const link = document.createElement('a');
                link.href = url;
                link.download = `clinical-note-referral-${resolvedPatient?.full_name || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`;
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

        if (printWindow.addEventListener) {
          printWindow.addEventListener('load', () => {
            setTimeout(tryPrint, 500);
          });
        }

        printWindow.onload = () => {
          setTimeout(tryPrint, 500);
        };

        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            tryPrint();
          }
        }, 1000);
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `clinical-note-referral-${resolvedPatient?.full_name || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`;
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

  return (
    <React.Fragment>
      <Card sx={{ 
        width: '100%', 
        maxWidth: '100%',
        mx: { xs: -2, sm: -2, md: -3 }, // Override Page component margins
        px: { xs: 2, sm: 2, md: 3 }     // Add padding back to the card
      }}>
        <PageHeader
          title="Clinical Notes"
          trailing={
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 0.5, sm: 1 }, 
              flexWrap: 'wrap', 
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              width: { xs: '100%', sm: 'auto' },
              mt: { xs: 1, sm: 0 }
            }}>
              <PrescriptionPDF
                consultationId={consultation.id}
                consultation={consultation}
                patient={patient}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: { xs: 'auto', sm: 120 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                }}
              />
              <Button
                variant="outlined"
                startIcon={<ReferralIcon />}
                onClick={() => setShowReferralForm(!showReferralForm)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: { xs: 'auto', sm: 140 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  bgcolor: showReferralForm ? 'action.selected' : 'transparent',
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Create Referral
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  Referral
                </Box>
              </Button>
              <Box sx={{ 
                '& > *': { 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minWidth: { xs: 'auto', sm: 'auto' },
                  px: { xs: 1, sm: 2 },
                }
              }}>
                <PatientFilePDF
                  consultationId={consultation.id}
                  patient={patient}
                />
              </Box>
            </Box>
          }
        />
        <Divider />
        
        {/* Referral Form Section */}
        {showReferralForm && (
          <Box sx={{ p: 3, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
              Create Referral
            </Typography>
            <Form ref={referralFormRef}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <TextField
                    label="Referred To (Name) *"
                    fullWidth
                    required
                    value={referralFormData.referred_to_name}
                    onChange={(value) => setReferralFormData({ ...referralFormData, referred_to_name: value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Select
                    label="Type"
                    fullWidth
                    options={['Doctor', 'Specialist', 'Ophthalmologist', 'Hospital', 'Clinic', 'Facility', 'Other']}
                    value={referralFormData.referred_to_type}
                    onChange={(value) => setReferralFormData({ ...referralFormData, referred_to_type: value })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Reason for Referral"
                    fullWidth
                    multiline
                    rows={3}
                    value={referralFormData.referral_reason}
                    onChange={(value) => setReferralFormData({ ...referralFormData, referral_reason: value })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Clinical Summary"
                    fullWidth
                    multiline
                    rows={3}
                    value={referralFormData.clinical_summary}
                    onChange={(value) => setReferralFormData({ ...referralFormData, clinical_summary: value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Select
                    label="Status"
                    fullWidth
                    options={['Pending', 'Sent', 'Acknowledged', 'Completed']}
                    value={referralFormData.status}
                    onChange={(value) => setReferralFormData({ ...referralFormData, status: value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    label="Referral Date"
                    fullWidth
                    value={referralFormData.referral_date}
                    onChange={(value) => setReferralFormData({ ...referralFormData, referral_date: value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    label="Appointment Date (Optional)"
                    fullWidth
                    value={referralFormData.appointment_date}
                    onChange={(value) => setReferralFormData({ ...referralFormData, appointment_date: value })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Remark and Comment"
                    fullWidth
                    multiline
                    rows={3}
                    value={referralFormData.notes}
                    onChange={(value) => setReferralFormData({ ...referralFormData, notes: value })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowReferralForm(false);
                        setReferralFormData({
                          referred_to_name: '',
                          referred_to_type: '',
                          referral_reason: '',
                          clinical_summary: '',
                          status: 'Pending',
                          referral_date: new Date(),
                          appointment_date: null,
                          notes: '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleCreateReferralSubmit}
                      disabled={loadingReferral}
                    >
                      {loadingReferral ? 'Creating...' : 'Create Referral'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Form>
          </Box>
        )}
        
        <Form ref={formRef}>
          <CardContent sx={{ width: '100%', px: { xs: 1, sm: 2, md: 3 } }}>
            <Subheader
              title="History Taking"
              sx={{ mt: 0 }}
            />

            {/* Improved History Taking Layout */}
            <Box sx={{ 
              border: '1px solid #bbdefb', 
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 2 
            }}>
              <Table sx={{ width: '100%' }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #bbdefb' }}>
                      Chief Complaint
                      <Typography
                        component="span"
                        color="error.main"
                        fontWeight="700"
                        sx={{ ml: 0.5 }}
                      >
                        *
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #bbdefb' }}>History of Present Illness</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #bbdefb' }}>Family History</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ border: '1px solid #bbdefb', p: 1 }}>
                      <TextField
                        ref={chiefComplaintRef}
                        fullWidth
                        multiline
                        rows={3}
                        required
                        variant="outlined"
                        size="small"
                        placeholder="Chief Complaint"
                        defaultValue={formData.chief_complaint}
                        onChange={(value) => {
                          setFormData({ ...formData, chief_complaint: value });
                          autoSave("chief_complaint", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #bbdefb', p: 1 }}>
                      <TextField
                        ref={historyPresentIllnessRef}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        placeholder="History of Present Illness"
                        defaultValue={formData.history_present_illness}
                        onChange={(value) => {
                          setFormData({
                            ...formData,
                            history_present_illness: value,
                          });
                          autoSave("history_present_illness", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #bbdefb', p: 1 }}>
                      <TextField
                        ref={familyHistoryRef}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        placeholder="Family History"
                        defaultValue={formData.family_history}
                        onChange={(value) => {
                          setFormData({ ...formData, family_history: value });
                          autoSave("family_history", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* Second Row - GH, FOH, FGH */}
            <Box sx={{ 
              border: '1px solid #bbdefb', 
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 2 
            }}>
              <Table sx={{ width: '100%' }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #bbdefb' }}>General Health</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #bbdefb' }}>Family Ocular History</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #bbdefb' }}>Family General History</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ border: '1px solid #bbdefb', p: 1 }}>
                      <TextField
                        ref={generalHealthRef}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        placeholder="General Health"
                        defaultValue={formData.general_health}
                        onChange={(value) => {
                          setFormData({ ...formData, general_health: value });
                          autoSave("general_health", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #bbdefb', p: 1 }}>
                      <TextField
                        ref={familyOcularHistoryRef}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        placeholder="Family Ocular History"
                        defaultValue={formData.family_ocular_history}
                        onChange={(value) => {
                          setFormData({
                            ...formData,
                            family_ocular_history: value,
                          });
                          autoSave("family_ocular_history", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #bbdefb', p: 1 }}>
                      <TextField
                        ref={familyGeneralHistoryRef}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        placeholder="Family General History"
                        defaultValue={formData.family_general_history}
                        onChange={(value) => {
                          setFormData({
                            ...formData,
                            family_general_history: value,
                          });
                          autoSave("family_general_history", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>


            <Subheader title="Visual Acuity (VA)" />
            <VisualAcuity
              ref={visualAcuityRef}
              consultation={consultation}
            />

            <Subheader title="External Examination" />
            <ExternalExamination
              ref={externalExaminationRef}
              consultation={consultation}
            />

            <Subheader title="Functional Tests" />
            <FunctionalTests
              ref={functionalTestsRef}
              consultation={consultation}
            />

            <Subheader title="Refraction Details" />
            <Refraction
              ref={refractionRef}
              consultation={consultation}
            />

            <Subheader title="Fundoscopy" />
            <Fundoscopy
              ref={fundoscopyRef}
              consultation={consultation}
            />

            <Subheader title="Diagnosis & Management" />
            
            {/* Diagnosis & Management - 2 columns layout (Diagnosis, Remark & Doctor Recommendation) */}
            <Box sx={{ 
              width: '100%', 
              mb: 2, 
              display: 'grid', 
              gap: 2, 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: '1fr', 
                md: '1fr 1fr' 
              },
              '& > *': {
                minWidth: 0, // Prevent overflow on small screens
                width: '100%',
                maxWidth: '100%',
              }
            }}>
                <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
                  <Card variant="outlined" sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                    <Box sx={{ backgroundColor: '#e3f2fd', p: { xs: 1.5, md: 2 }, textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>Diagnosis</Typography>
                    </Box>
                    <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                      <DiagnosisCard
                        title=""
                        diagnosisType="Final"
                        loading={loadingDiagnoses}
                        items={diagnoses}
                        consultation={consultation}
                        onClickAdd={(title, diagnosisType) => openSelectDiagnosesModal(title, diagnosisType)}
                      />
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
                  <Card variant="outlined" sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                    <Box sx={{ backgroundColor: '#e3f2fd', p: { xs: 1.5, md: 2 }, textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>Medicine</Typography>
                    </Box>
                    <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                      <ConsultationItemsCard
                        title=""
                        consultationType="Pharmacy"
                        loading={loadingItems}
                        items={items}
                        consultation={consultation}
                        onClickAdd={(title, consultationType) => openSelectItemsModal(title, consultationType)}
                      />
                    </CardContent>
                  </Card>
                </Box>
            </Box>

            {/* Remark and Doctor Comments - Inline Layout */}
            <Subheader title="Remark & Doctor Recommendation" />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ 
                  border: '1px solid #bbdefb', 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  height: '100%'
                }}>
                  <Box sx={{ 
                    backgroundColor: '#e3f2fd', 
                    p: 2, 
                    borderBottom: '1px solid #bbdefb',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      Remark
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <TextField
                      ref={remarksRef}
                      fullWidth
                      placeholder="Enter remarks about the patient..."
                      multiline
                      rows={6}
                      variant="outlined"
                      defaultValue={formData.remarks}
                      onChange={(value) => {
                        setFormData({ ...formData, remarks: value });
                        autoSave("remarks", value);
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            border: '1px solid #bbdefb',
                          },
                          '&:hover fieldset': {
                            border: '1px solid #1976d2',
                          },
                          '&.Mui-focused fieldset': {
                            border: '2px solid #1976d2',
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ 
                  border: '1px solid #bbdefb', 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  height: '100%'
                }}>
                  <Box sx={{ 
                    backgroundColor: '#e3f2fd', 
                    p: 2, 
                    borderBottom: '1px solid #bbdefb',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      Doctor Recommendation
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <TextField
                      ref={doctorCommentsRemarksRef}
                      fullWidth
                      placeholder="Enter doctor comments and remarks about the patient's condition..."
                      multiline
                      rows={6}
                      variant="outlined"
                      defaultValue={formData.doctor_comments_remarks}
                      onChange={(value) => {
                        setFormData({ ...formData, doctor_comments_remarks: value });
                        autoSave("doctor_comments_remarks", value);
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            border: '1px solid #bbdefb',
                          },
                          '&:hover fieldset': {
                            border: '1px solid #1976d2',
                          },
                          '&.Mui-focused fieldset': {
                            border: '2px solid #1976d2',
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Lens Selection Section */}
            <Box sx={{ 
              border: '1px solid #bbdefb', 
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 2 
            }}>
              <Box sx={{ 
                backgroundColor: '#e3f2fd', 
                p: 2, 
                borderBottom: '1px solid #bbdefb',
                textAlign: 'center'
              }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Lens Selection
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {[
                    'PGX',
                    'Transition lens',
                    'Bluecut lens',
                    'Bifocal lens',
                    'Progressive',
                    'Non Photochromatic lens',
                    'Spectacle & Medication',
                    'Medication only'
                  ].map((lensType) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={lensType}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.lens_types?.includes(lensType) || false}
                            onChange={(event) => {
                              const currentLensTypes = formData.lens_types || [];
                              let updatedLensTypes;
                              if (event.target.checked) {
                                updatedLensTypes = [...currentLensTypes, lensType];
                              } else {
                                updatedLensTypes = currentLensTypes.filter(type => type !== lensType);
                              }
                              setFormData({
                                ...formData,
                                lens_types: updatedLensTypes,
                              });
                              autoSave("lens_types", JSON.stringify(updatedLensTypes));
                            }}
                          />
                        }
                        label={lensType}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>

            {/* Patient Return Section */}
            <Box sx={{ 
              border: '1px solid #bbdefb', 
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 2 
            }}>
              <Box sx={{ 
                backgroundColor: '#e3f2fd', 
                p: 2, 
                borderBottom: '1px solid #bbdefb',
                textAlign: 'center'
              }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Follow-up Information
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.patient_to_return === "Yes"}
                          onChange={(event) => {
                            const value = event.target.checked ? "Yes" : "No";
                            setFormData({
                              ...formData,
                              patient_to_return: value,
                              to_return_date:
                                value === "Yes"
                                  ? consultation.to_return_date
                                    ? new Date(consultation.to_return_date)
                                    : null
                                  : null,
                              return_date_preset: null,
                            });
                            autoSave("patient_to_return", value);

                            if (value === "No") {
                              autoSave("to_return_date", null);
                              autoSave("return_reason", null);
                            }
                          }}
                        />
                      }
                      label="Patient to Return"
                    />
                  </Grid>
                  {formData.patient_to_return === "Yes" && (
                    <>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Select
                          fullWidth
                          label="Return Date"
                          placeholder="Select return period"
                          required={formData.patient_to_return === "Yes"}
                          options={[
                            '1 Week',
                            '2 Weeks',
                            '3 Weeks',
                            '1 Month',
                            '2 Months',
                            '3 Months',
                            '6 Months',
                            'Custom Date',
                          ]}
                          value={formData.return_date_preset || null}
                          onChange={(value) => {
                            let returnDate = null;
                            const today = new Date();
                            
                            if (value && value !== 'Custom Date') {
                              switch (value) {
                                case '1 Week':
                                  returnDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                                  break;
                                case '2 Weeks':
                                  returnDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
                                  break;
                                case '3 Weeks':
                                  returnDate = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);
                                  break;
                                case '1 Month':
                                  returnDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
                                  break;
                                case '2 Months':
                                  returnDate = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());
                                  break;
                                case '3 Months':
                                  returnDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
                                  break;
                                case '6 Months':
                                  returnDate = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
                                  break;
                                default:
                                  returnDate = null;
                              }
                              
                              if (returnDate) {
                                setFormData({
                                  ...formData,
                                  to_return_date: returnDate,
                                  return_date_preset: value,
                                });
                                autoSave("to_return_date", formatDateForDb(returnDate));
                              }
                            } else if (value === 'Custom Date') {
                              setFormData({
                                ...formData,
                                return_date_preset: 'Custom Date',
                              });
                            } else {
                              setFormData({
                                ...formData,
                                return_date_preset: null,
                                to_return_date: null,
                              });
                              autoSave("to_return_date", null);
                            }
                          }}
                        />
                      </Grid>
                      {formData.return_date_preset === 'Custom Date' && (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <DatePicker
                            ref={patientToReturnDateRef}
                            fullWidth
                            label="Custom Return Date"
                            horizontal
                            required={formData.patient_to_return === "Yes"}
                            value={formData.to_return_date || null}
                            onChange={(value) => {
                              if (!isNaN(value)) {
                                setFormData({ ...formData, to_return_date: value });
                                autoSave("to_return_date", formatDateForDb(value));
                              }
                            }}
                          />
                        </Grid>
                      )}
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          ref={returnReasonRef}
                          fullWidth
                          label="Return Reason"
                          placeholder="Enter reason for patient return (e.g., Follow-up examination, Medication review, etc.)"
                          multiline
                          rows={2}
                          value={formData.return_reason || ''}
                          onChange={(value) => {
                            setFormData({ ...formData, return_reason: value });
                            autoSave("return_reason", value);
                          }}
                        />
                      </Grid>
                    </>
                  )}
                  {consultation.status === "Pending" && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.require_glass === "Yes"}
                            onChange={(event) => {
                              const value = event.target.checked ? "Yes" : "No";
                              setFormData({
                                ...formData,
                                require_glass: value,
                              });
                              autoSave("require_glass", value);
                            }}
                          />
                        }
                        label="Require Spectacle"
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Box>
          </CardContent>
        </Form>
        {consultation.status === "Pending" ? (
          <React.Fragment>
            <Divider />
            {loadingComplete && <LinearProgress />}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="flex-end"
              flexWrap="wrap"
              p={2}
            >
              <Button
                disabled={loadingComplete}
                variant="contained"
                onClick={confirmComplete}
              >
                Save Notes
              </Button>
            </Stack>
          </React.Fragment>
        ) : null}
      </Card>
      <Modal ref={modalRef} />
    </React.Fragment>
  );
};

export default ClinicalNotes;
