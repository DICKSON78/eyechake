import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Alert, Button, Card, CardContent, CardHeader, Divider, Grid, LinearProgress, Paper, Skeleton, Stack, Typography } from "@mui/material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Form from "../../../components/Form";
import Table from "../../../components/Table";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import DiagnosisCard from "./DiagnosisCard";
import SelectDiagnoses from "./SelectDiagnoses";
import ExternalExamination from "./ExternalExamination";
import VisualAcuity from "./VisualAcuity";
import RefractionDetails from "./RefractionDetails";
import Fundoscopy from "./Fundoscopy";

import { useFetch, usePost } from "../../../hooks";
import {
  formatError,
  getNonNull,
  getValidationError,
  getValidationRules,
  numberFormat,
  validateInteger
} from "../../../helpers";

const validationRules = getValidationRules();

const Subheader = ({ title }) => {
  return (
    <Paper
      square
      sx={{ bgcolor: "info.main" }}
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

const ClinicalNotes = ({ patientId, consultationId }) => {

  const navigate = useNavigate();

  const modalRef = useRef();
  const formRef = useRef();
  const chiefComplaintRef = useRef();
  const historyPresentIllnessRef = useRef();
  const familyHistoryRef = useRef();
  const reviewRef = useRef();
  const remarksRef = useRef();

  const {
    data: diagnoses,
    setData: setDiagnoses,
    loading: loadingDiagnoses,
    handleFetch: fetchDiagnoses
  } = useFetch("api/consultation-diagnoses", {
    per_page: 500,
    consultation_id: consultationId,
  }, false, [], (response) => response.data.data.data);
  const {
    data: items,
    setData: setItems,
    loading: loadingItems,
    handleFetch: fetchItems
  } = useFetch("api/patient-payment-cache-items", {
    per_page: 500,
    consultation_id: consultationId,
  }, false, [], (response) => response.data.data.data);

  const [formData, setFormData] = useState({
    chief_complaint: undefined,
    history_present_illness: undefined,
    family_history: undefined,
    review: undefined,
    remarks: undefined,
  });

  useEffect(() => {
    document.title = `Clinical Notes - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    fetchDiagnoses();
    fetchItems();
  }, []);

  const openSelectDiagnosesModal = (title, type) => {
    let component = (
      <SelectDiagnoses
        modal={modalRef.current}
        consultationId={consultationId}
        diagnosisType={type}
        selected={diagnoses.filter((e) => e.diagnosis_type === type)}
        fetchDiagnoses={fetchDiagnoses}
      />
    );

    modalRef.current.open(title, component, "md");
  };

  const confirmSubmit = () => {
    if (!formRef.current.validate()) {
      return false;
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          //handlePost();
        }}
      />
    );

    modalRef.current.open("Confirm Save", component, "sm");
  };

  const handleFeedback = () => {
    // if (data || error) {
    //   return (
    //     <Alert
    //       sx={{ mt: 1 }}
    //       severity={error ? "error" : "success"}
    //     >
    //       {error ? formatError(error) : data ? data.message : null}
    //     </Alert>
    //   );
    // }

    return null;
  };

  return (
    <React.Fragment>
      <Card>
        <PageHeader title="Clinical Notes"/>
        <Form ref={formRef}>
          <Subheader title="History Taking"/>
          <CardContent>
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
                  fullWidth
                  label="C/C"
                  multiline
                  rows={2}
                  horizontal
                  required
                  onChange={(value) => setFormData({ ...formData, chief_complaint: value })}
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
                  onChange={(value) => setFormData({ ...formData, history_present_illness: value })}
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
                  onChange={(value) => setFormData({ ...formData, family_history: value })}
                />
              </Grid>
            </Grid>
          </CardContent>

          <Subheader title="Diagnosis"/>
          <CardContent>
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
                  onClickAdd={(title, diagnosisType) => openSelectDiagnosesModal(title, diagnosisType)}
                />
              </Grid>
            </Grid>
          </CardContent>

          <Subheader title="External Examination"/>
          <CardContent>
            <ExternalExamination />
          </CardContent>

          <Subheader title="Visual Acuity (VA)"/>
          <CardContent>
            <VisualAcuity />
          </CardContent>

          <Subheader title="Refraction Details"/>
          <CardContent>
            <RefractionDetails />
          </CardContent>

          <Subheader title="Fundoscopy"/>
          <CardContent>
            <Fundoscopy />
          </CardContent>

          <Subheader title="Management"/>
          <CardContent>

          </CardContent>

          <Subheader title="Remarks"/>
          <CardContent>
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
                  fullWidth
                  label="Review"
                  multiline
                  rows={3}
                  horizontal
                  onChange={(value) => setFormData({ ...formData, review: value })}
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
                  fullWidth
                  label="Remarks"
                  multiline
                  rows={3}
                  horizontal
                  onChange={(value) => setFormData({ ...formData, remarks: value })}
                />
              </Grid>
            </Grid>

            {handleFeedback()}
          </CardContent>
        </Form>
        <Divider />
        {/*{loading && <LinearProgress />}*/}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
          p={2}
        >
          <Button
            // disabled={loading}
            variant="contained"
            disableElevation
            onClick={confirmSubmit}
          >
            Save Notes
          </Button>
        </Stack>
      </Card>
      <Modal ref={modalRef}/>
    </React.Fragment>
  );
};

export default ClinicalNotes;
