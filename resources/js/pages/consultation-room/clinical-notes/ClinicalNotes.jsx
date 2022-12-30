import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
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
  Typography
} from "@mui/material";

import { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import DiagnosisCard from "./DiagnosisCard";
import SelectDiagnoses from "./SelectDiagnoses";
import ExternalExamination from "./ExternalExamination";
import FunctionalTests from "./FunctionalTests";
import VisualAcuity from "./VisualAcuity";
import Refraction from "./Refraction";
import Fundoscopy from "./Fundoscopy";
import ConsultationItemsCard from "./ConsultationItemsCard";
import SelectItems from "./SelectItems";
import PatientFilePDF from "../../patient-records/patient-file/PatientFilePDF";

import { useFetch, usePatch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getValidationError } from "../../../helpers";

const Subheader = ({ title, sx }) => {
  return (
    <Paper
      variant="elevation"
      sx={{
        bgcolor: "info.main",
        my: 2,
        ...(sx || {}),
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight="500"
        px={2}
        py={1}
        color="info.contrastText"
      >
        {title}
      </Typography>
    </Paper>
  );
};

const ClinicalNotes = ({ patient, consultation }) => {

  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();
  const formRef = useRef();
  const chiefComplaintRef = useRef();
  const historyPresentIllnessRef = useRef();
  const familyHistoryRef = useRef();
  const patientToReturnDateRef = useRef();
  const remarksRef = useRef();

  const [data, setData] = useState();
  const [error, setError] = useState();

  const {
    data: diagnoses,
    setData: setDiagnoses,
    loading: loadingDiagnoses,
    handleFetch: fetchDiagnoses
  } = useFetch("api/consultation-diagnoses", {
    per_page: 500,
    consultation_id: consultation.id,
  }, false, [], (response) => response.data.data.data);
  const {
    data: items,
    setData: setItems,
    loading: loadingItems,
    handleFetch: fetchItems
  } = useFetch("api/patient-payment-cache-items", {
    per_page: 500,
    consultation_id: consultation.id,
  }, false, [], (response) => response.data.data.data);

  const [patientToReturn, setPatientToReturn] = useState(consultation.patient_to_return);
  const [patientToReturnDate, setPatientToReturnDate] = useState(consultation.to_return_date ? new Date(consultation.to_return_date) : null);
  const [remarks, setRemarks] = useState(consultation.remarks);
  const [sendToOptician, setSendToOptician] = useState("No");
  const [vipPatient, setVipPatient] = useState("No");

  const { handlePatch: handleAutoSave } = usePatch();
  const { data: dataComplete, loading: loadingComplete, error: errorComplete, handlePatch: handleComplete } = usePatch();

  useEffect(() => {
    document.title = `Clinical Notes - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    fetchDiagnoses();
    fetchItems();
  }, []);

  useEffect(() => {
    if (dataComplete) {
      setData(dataComplete);

      window.setTimeout(() => {
        navigate("/consultation-room/consultation-patients/pending");
      }, 1000);
    }
  }, [dataComplete]);

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

  const autoSave = (field, value) => {
    if (value !== consultation[field]) {
      handleAutoSave(`api/consultations/${consultation.id}/auto-save-clinical-notes`, {
        what: "Consultation",
        [field]: value
      });
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
      return setError(getValidationError("Please complete all the required fields."));
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleComplete(`api/consultations/${consultation.id}/complete-clinical-notes`, {
            patient_to_return: patientToReturn,
            to_return_date: patientToReturnDate ? formatDateForDb(patientToReturnDate) : undefined,
            remarks,
            send_to_optician: sendToOptician,
            is_vip: vipPatient,
          });
        }}
      />
    );

    modalRef.current.open("Confirm Save", component, "sm");
  };

  return (
    <React.Fragment>
      <Card>
        <PageHeader
          title="Clinical Notes"
          trailing={(
            <PatientFilePDF
              consultationId={consultation.id}
              patient={patient}
            />
          )}
        />
        <Divider />
        <Form ref={formRef}>
          <CardContent>
            <Subheader
              title="History Taking"
              sx={{ mt: 0 }}
            />
            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                md={4}
                sm={8}
                xs={12}
              >
                <TextField
                  ref={chiefComplaintRef} fullWidth
                  label="C/C"
                  multiline
                  rows={2}
                  horizontal
                  required
                  defaultValue={consultation.chief_complaint}
                  onChange={(value) => autoSave("chief_complaint", value)}
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={8}
                xs={12}
              >
                <TextField
                  ref={historyPresentIllnessRef}
                  fullWidth
                  label="H/I"
                  multiline
                  rows={2}
                  horizontal
                  defaultValue={consultation.history_present_illness}
                  onChange={(value) => autoSave("history_present_illness", value)}
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={8}
                xs={12}
              >
                <TextField
                  ref={familyHistoryRef}
                  fullWidth
                  label="F/H"
                  multiline
                  rows={2}
                  horizontal
                  defaultValue={consultation.family_history}
                  onChange={(value) => autoSave("family_history", value)}
                />
              </Grid>
            </Grid>

            <Subheader title="Visual Acuity (VA)"/>
            <VisualAcuity consultation={consultation}/>

            <Subheader title="External Examination"/>
            <ExternalExamination consultation={consultation}/>

            <Subheader title="Functional Tests"/>
            <FunctionalTests consultation={consultation}/>

            <Subheader title="Refraction Details"/>
            <Refraction consultation={consultation}/>

            <Subheader title="Fundoscopy"/>
            <Fundoscopy consultation={consultation}/>

            <Subheader title="Diagnosis & Management"/>
            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                md={6}
                sm={12}
                xs={12}
              >
                <DiagnosisCard
                  title="Diagnosis"
                  diagnosisType="Final"
                  loading={loadingDiagnoses}
                  items={diagnoses}
                  consultation={consultation}
                  onClickAdd={(title, diagnosisType) => openSelectDiagnosesModal(title, diagnosisType)}
                />
              </Grid>
              <Grid
                item
                md={6}
                sm={12}
                xs={12}
              >
                <ConsultationItemsCard
                  title="Medicine"
                  consultationType="Pharmacy"
                  loading={loadingItems}
                  items={items}
                  consultation={consultation}
                  onClickAdd={(title, consultationType) => openSelectItemsModal(title, consultationType)}
                />
              </Grid>
              <Grid
                item
                md={6}
                sm={12}
                xs={12}
              >
                <ConsultationItemsCard
                  title="Procedure"
                  consultationType="Procedure"
                  loading={loadingItems}
                  items={items}
                  consultation={consultation}
                  onClickAdd={(title, consultationType) => openSelectItemsModal(title, consultationType)}
                />
              </Grid>
              {/*<Grid*/}
              {/*item*/}
              {/*md={6}*/}
              {/*sm={12}*/}
              {/*xs={12}*/}
              {/*>*/}
              {/*<ConsultationItemsCard*/}
              {/*title="Glass"*/}
              {/*consultationType="Glass"*/}
              {/*loading={loadingItems}*/}
              {/*items={items}*/}
              {/*consultation={consultation}*/}
              {/*onClickAdd={(title, consultationType) => openSelectItemsModal(title, consultationType)}*/}
              {/*/>*/}
              {/*</Grid>*/}
              {/*<Grid*/}
              {/*item*/}
              {/*md={6}*/}
              {/*sm={12}*/}
              {/*xs={12}*/}
              {/*>*/}
              {/*<ConsultationItemsCard*/}
              {/*title="Others"*/}
              {/*consultationType="Others"*/}
              {/*loading={loadingItems}*/}
              {/*items={items}*/}
              {/*consultation={consultation}*/}
              {/*onClickAdd={(title, consultationType) => openSelectItemsModal(title, consultationType)}*/}
              {/*/>*/}
              {/*</Grid>*/}
            </Grid>

            <Subheader title="Remarks"/>
            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                md={6}
                sm={12}
                xs={12}
              >
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={patientToReturn === "Yes"}
                      onChange={(event) => {
                        if (consultation.status === "Consulted") {
                          const value = event.target.checked ? "Yes" : "No";
                          autoSave("patient_to_return", value);
                          consultation.patient_to_return = value;
                          if (value === "No") {
                            autoSave("to_return_date", null);
                          }
                        }
                        setPatientToReturn(event.target.checked ? "Yes" : "No");
                      }}
                    />
                  )}
                  label="Patient to Return"
                />
              </Grid>
              <Grid
                item
                md={6}
                sm={12}
                xs={12}
              >
                {patientToReturn === "Yes" ?
                  <DatePicker
                    ref={patientToReturnDateRef}
                    fullWidth
                    label="Return Date"
                    horizontal
                    required={patientToReturn === "Yes"}
                    value={patientToReturnDate}
                    onChange={(value) => {
                      if (!isNaN(value)) {
                        if (consultation.status === "Consulted") {
                          autoSave("to_return_date", formatDateForDb(value));
                        }
                        setPatientToReturnDate(value);
                      }
                    }}
                  />
                  : null
                }
              </Grid>
              <Grid
                item
                md={6}
                sm={12}
                xs={12}
              >
                <TextField
                  ref={remarksRef}
                  fullWidth
                  placeholder="Type remarks..."
                  multiline
                  rows={3}
                  horizontal
                  defaultValue={remarks}
                  onChange={(value) => {
                    if (consultation.status === "Consulted") {
                      autoSave("remarks", value);
                    }
                    setRemarks(value);
                  }}
                />
              </Grid>
              {consultation.status === "Pending" ?
                <React.Fragment>
                  <Grid
                    item
                    md={6}
                    sm={12}
                    xs={12}
                  />
                  <Grid
                    item
                    md={6}
                    sm={12}
                    xs={12}
                  >
                    <FormControlLabel
                      control={(
                        <Checkbox
                          checked={sendToOptician === "Yes"}
                          onChange={(event) => setSendToOptician(event.target.checked ? "Yes" : "No")}
                        />
                      )}
                      label="Send to Optician"
                    />
                  </Grid>
                  <Grid
                    item
                    md={6}
                    sm={12}
                    xs={12}
                  />
                  <Grid
                    item
                    md={6}
                    sm={12}
                    xs={12}
                  >
                    <FormControlLabel
                      control={(
                        <Checkbox
                          checked={vipPatient === "Yes"}
                          onChange={(event) => setVipPatient(event.target.checked ? "Yes" : "No")}
                        />
                      )}
                      label="VIP Patient"
                    />
                  </Grid>
                </React.Fragment>
                : null
              }
            </Grid>
          </CardContent>
        </Form>
        {consultation.status === "Pending" ?
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
                disableElevation
                onClick={confirmComplete}
              >
                Save Notes
              </Button>
            </Stack>
          </React.Fragment>
          : null
        }
      </Card>
      <Modal ref={modalRef}/>
    </React.Fragment>
  );
};

export default ClinicalNotes;
