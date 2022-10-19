import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
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
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import DiagnosisCard from "./DiagnosisCard";
import SelectDiagnoses from "./SelectDiagnoses";
import ExternalExamination from "./ExternalExamination";
import VisualAcuity from "./VisualAcuity";
import Refraction from "./Refraction";
import Fundoscopy from "./Fundoscopy";
import ConsultationItemsCard from "./ConsultationItemsCard";
import SelectItems from "./SelectItems";

import { useFetch, usePatch } from "../../../hooks";
import { formatError, getValidationError } from "../../../helpers";

const Subheader = ({ title, sx }) => {
  return (
    <Paper
      square
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

  const navigate = useNavigate();

  const modalRef = useRef();
  const formRef = useRef();
  const chiefComplaintRef = useRef();
  const historyPresentIllnessRef = useRef();
  const familyHistoryRef = useRef();
  const reviewRef = useRef();
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

  const { handlePatch: handleAutoSave } = usePatch();
  const { data: dataComplete, loading: loadingComplete, error: errorComplete, handlePatch: handleComplete } = usePatch(`api/consultations/${consultation.id}`, { status: "Consulted" });

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
      }, 1500);
    }
  }, [dataComplete]);

  useEffect(() => {
    if (errorComplete) {
      setError(errorComplete);
    }
  }, [errorComplete]);

  const autoSave = (field, value) => {
    if (value && value !== consultation[field]) {
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
          handleComplete();
        }}
      />
    );

    modalRef.current.open("Confirm Complete", component, "sm");
  };

  const handleFeedback = () => {
    if (data || error) {
      return (
        <Alert
          sx={{ mt: 1 }}
          severity={error ? "error" : "success"}
        >
          {error ? formatError(error) : data ? data.message : null}
        </Alert>
      );
    }

    return null;
  };

  return (
    <React.Fragment>
      <Card>
        <PageHeader title="Clinical Notes"/>
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
                  ref={chiefComplaintRef}
                  disabled={consultation.status === "Consulted"}
                  fullWidth
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
                  disabled={consultation.status === "Consulted"}
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
                  disabled={consultation.status === "Consulted"}
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

            <Subheader title="Diagnosis"/>
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
                  title="Preliminary Diagnosis"
                  diagnosisType="Preliminary"
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
                <DiagnosisCard
                  title="Final Diagnosis"
                  diagnosisType="Final"
                  loading={loadingDiagnoses}
                  items={diagnoses}
                  consultation={consultation}
                  onClickAdd={(title, diagnosisType) => openSelectDiagnosesModal(title, diagnosisType)}
                />
              </Grid>
            </Grid>

            <Subheader title="External Examination"/>
            <ExternalExamination consultation={consultation}/>

            <Subheader title="Visual Acuity (VA)"/>
            <VisualAcuity consultation={consultation}/>

            <Subheader title="Refraction Details"/>
            <Refraction consultation={consultation}/>

            <Subheader title="Fundoscopy"/>
            <Fundoscopy consultation={consultation}/>

            <Subheader title="Management"/>
            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                md={4}
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
                md={4}
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
              <Grid
                item
                md={4}
                sm={12}
                xs={12}
              >
                <ConsultationItemsCard
                  title="Glass"
                  consultationType="Glass"
                  loading={loadingItems}
                  items={items}
                  consultation={consultation}
                  onClickAdd={(title, consultationType) => openSelectItemsModal(title, consultationType)}
                />
              </Grid>
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
                <TextField
                  ref={reviewRef}
                  disabled={consultation.status === "Consulted"}
                  fullWidth
                  label="Review"
                  multiline
                  rows={3}
                  horizontal
                  defaultValue={consultation.review}
                  onChange={(value) => autoSave("review", value)}
                />
              </Grid>
              <Grid
                item
                md={6}
                sm={12}
                xs={12}
              >
                <TextField
                  ref={remarksRef}
                  disabled={consultation.status === "Consulted"}
                  fullWidth
                  label="Remarks"
                  multiline
                  rows={3}
                  horizontal
                  defaultValue={consultation.remarks}
                  onChange={(value) => autoSave("remarks", value)}
                />
              </Grid>
            </Grid>

            {handleFeedback()}
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
                Complete Consultation
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
