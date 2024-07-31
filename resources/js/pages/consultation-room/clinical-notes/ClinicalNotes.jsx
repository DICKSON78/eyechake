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
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";

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
import PatientFilePDF from "../../patient-records/patient-file/PatientFilePDF";

import { useFetch, usePatch, useToast } from "../../../hooks";
import {
  formatDateForDb,
  formatError,
  getValidationError,
} from "../../../helpers";

const Subheader = ({ title, sx }) => {
  return (
    <Paper
      variant="elevation"
      sx={{
        bgcolor: "info.main",
        my: 2,
        ...sx,
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
  const generalHealthRef = useRef();
  const familyOcularHistoryRef = useRef();
  const familyGeneralHistoryRef = useRef();
  const pupilsRef = useRef();
  const extraOcularMusclesRef = useRef();
  const visualAcuityRef = useRef();
  const externalExaminationRef = useRef();
  const functionalTestsRef = useRef();
  const refractionRef = useRef();
  const fundoscopyRef = useRef();
  const patientToReturnDateRef = useRef();
  const remarksRef = useRef();
  const informationSourceRef = useRef();

  const marketingEnabled =
    window.user.clinic?.preferences?.find((e) => e.key === "MARKETING_MODULE")
      ?.value === "Yes";

  const [data, setData] = useState();
  const [error, setError] = useState();
  const [formData, setFormData] = useState({
    ...consultation,
    payment_cache_item: undefined,
    creator: undefined,
    to_return_date: consultation.to_return_date
      ? new Date(consultation.to_return_date)
      : null,
    info_source_id: patient.info_source_id,
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
    (response) => response.data.data.data
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
    (response) => response.data.data.data
  );
  const { data: informationSources, handleFetch: fetchInformationSources } =
    useFetch(
      "api/marketing/information-sources",
      {
        status: "Active",
        per_page: 500,
      },
      false,
      [],
      (response) => response.data.data.data
    );

  const { handlePatch: handleAutoSave } = usePatch();
  const {
    data: dataComplete,
    loading: loadingComplete,
    error: errorComplete,
    handlePatch: handleComplete,
  } = usePatch();

  useEffect(() => {
    document.title = `Clinical Notes - ${window.APP_NAME}`;

    fetchDiagnoses();
    fetchItems();

    if (marketingEnabled) {
      fetchInformationSources();
    }
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
          handleComplete(
            `api/consultations/${consultation.id}/complete-clinical-notes`,
            {
              ...formData,
              visual_acuity: visualAcuityRef.current.getFormData(),
              external_examination:
                externalExaminationRef.current.getFormData(),
              functional_tests: functionalTestsRef.current.getFormData(),
              refraction: refractionRef.current.getFormData(),
              fundoscopy: fundoscopyRef.current.getFormData(),
              to_return_date: formData.to_return_date
                ? formatDateForDb(formData.to_return_date)
                : undefined,
            }
          );
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
          trailing={
            <PatientFilePDF
              consultationId={consultation.id}
              patient={patient}
            />
          }
        />
        <Divider />
        <Form ref={formRef}>
          <CardContent>
            <Subheader
              title="History Taking"
              sx={{ mt: 0 }}
            />

            <Table className="no-table-head">
              <TableBody>
                <TableRow>
                  <TableCell component="th">
                    <span>CC</span>
                    <Typography
                      component="span"
                      color="error.main"
                      fontWeight="700"
                    >
                      *
                    </Typography>
                  </TableCell>
                  <TableCell component="th">HI</TableCell>
                  <TableCell component="th">FH</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <TextField
                      ref={chiefComplaintRef}
                      fullWidth
                      multiline
                      rows={2}
                      required
                      defaultValue={formData.chief_complaint}
                      onChange={(value) => {
                        setFormData({ ...formData, chief_complaint: value });
                        autoSave("chief_complaint", value);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      ref={historyPresentIllnessRef}
                      fullWidth
                      multiline
                      rows={2}
                      defaultValue={formData.history_present_illness}
                      onChange={(value) => {
                        setFormData({
                          ...formData,
                          history_present_illness: value,
                        });
                        autoSave("history_present_illness", value);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      ref={familyHistoryRef}
                      fullWidth
                      multiline
                      rows={2}
                      defaultValue={formData.family_history}
                      onChange={(value) => {
                        setFormData({ ...formData, family_history: value });
                        autoSave("family_history", value);
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">GH</TableCell>
                  <TableCell component="th">FOH</TableCell>
                  <TableCell component="th">FGH</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <TextField
                      ref={generalHealthRef}
                      fullWidth
                      multiline
                      rows={2}
                      defaultValue={formData.general_health}
                      onChange={(value) => {
                        setFormData({ ...formData, general_health: value });
                        autoSave("general_health", value);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      ref={familyOcularHistoryRef}
                      fullWidth
                      multiline
                      rows={2}
                      defaultValue={formData.family_ocular_history}
                      onChange={(value) => {
                        setFormData({
                          ...formData,
                          family_ocular_history: value,
                        });
                        autoSave("family_ocular_history", value);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      ref={familyGeneralHistoryRef}
                      fullWidth
                      multiline
                      rows={2}
                      defaultValue={formData.family_general_history}
                      onChange={(value) => {
                        setFormData({
                          ...formData,
                          family_general_history: value,
                        });
                        autoSave("family_general_history", value);
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">Pupils</TableCell>
                  <TableCell component="th">EOM</TableCell>
                  <TableCell component="th" />
                </TableRow>
                <TableRow>
                  <TableCell>
                    <TextField
                      ref={pupilsRef}
                      fullWidth
                      multiline
                      rows={2}
                      defaultValue={formData.pupils}
                      onChange={(value) => {
                        setFormData({ ...formData, pupils: value });
                        autoSave("pupils", value);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      ref={extraOcularMusclesRef}
                      fullWidth
                      multiline
                      rows={2}
                      defaultValue={formData.extra_ocular_muscles}
                      onChange={(value) => {
                        setFormData({
                          ...formData,
                          extra_ocular_muscles: value,
                        });
                        autoSave("extra_ocular_muscles", value);
                      }}
                    />
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>

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
                  onClickAdd={(title, diagnosisType) =>
                    openSelectDiagnosesModal(title, diagnosisType)
                  }
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
                  onClickAdd={(title, consultationType) =>
                    openSelectItemsModal(title, consultationType)
                  }
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
                  onClickAdd={(title, consultationType) =>
                    openSelectItemsModal(title, consultationType)
                  }
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

            <Subheader title="Remarks" />
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
                  ref={remarksRef}
                  fullWidth
                  placeholder="Type remarks..."
                  multiline
                  rows={3}
                  horizontal
                  defaultValue={formData.remarks}
                  onChange={(value) => {
                    setFormData({ ...formData, remarks: value });
                    autoSave("remarks", value);
                  }}
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
                        });
                        autoSave("patient_to_return", value);

                        if (value === "No") {
                          autoSave("to_return_date", null);
                        }
                      }}
                    />
                  }
                  label="Patient to Return"
                />
              </Grid>
              <Grid
                item
                md={6}
                sm={12}
                xs={12}
              >
                {formData.patient_to_return === "Yes" ? (
                  <DatePicker
                    ref={patientToReturnDateRef}
                    fullWidth
                    label="Return Date"
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
                ) : null}
              </Grid>
              {consultation.status === "Pending" ? (
                <React.Fragment>
                  <Grid
                    item
                    md={6}
                    sm={12}
                    xs={12}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.require_glass === "Yes"}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              require_glass: event.target.checked
                                ? "Yes"
                                : "No",
                            })
                          }
                        />
                      }
                      label="Require Spectacle"
                    />
                  </Grid>
                  {marketingEnabled ? (
                    <Grid
                      item
                      md={6}
                      sm={12}
                      xs={12}
                    >
                      <Select
                        ref={informationSourceRef}
                        fullWidth
                        label="Source of Information"
                        horizontal
                        clearable
                        options={informationSources}
                        optionsLabel="name"
                        optionsValue="id"
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        value={informationSources.find(
                          (e) => e.id === formData.info_source_id
                        )}
                        onChange={(value) =>
                          setFormData({ ...formData, info_source_id: value })
                        }
                      />
                    </Grid>
                  ) : null}
                </React.Fragment>
              ) : null}
            </Grid>
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
