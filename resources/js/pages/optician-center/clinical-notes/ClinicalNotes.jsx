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
import Refraction from "./Refraction";
import ConsultationItemsCard from "./ConsultationItemsCard";
import SelectItems from "../../consultation-room/clinical-notes/SelectItems";
import PatientFilePDF from "../../patient-records/patient-file/PatientFilePDF";

import { useFetch, usePatch } from "../../../hooks";
import { formatError, getValidationError } from "../../../helpers";

const Subheader = ({ title, sx }) => {
  return (
    <Paper
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
  const remarksRef = useRef();

  const [data, setData] = useState();
  const [error, setError] = useState();

  const {
    data: items,
    setData: setItems,
    loading: loadingItems,
    handleFetch: fetchItems
  } = useFetch("api/patient-payment-cache-items", {
    per_page: 500,
    consultation_id: consultation.id,
  }, false, [], (response) => response.data.data.data);

  const [remarks, setRemarks] = useState(consultation.remarks);

  const { data: dataComplete, loading: loadingComplete, error: errorComplete, handlePatch: handleComplete } = usePatch();

  useEffect(() => {
    document.title = `Clinical Notes - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (dataComplete) {
      setData(dataComplete);

      window.setTimeout(() => {
        navigate("/optician-center/consultation-patients/pending");
      }, 1500);
    }
  }, [dataComplete]);

  useEffect(() => {
    if (errorComplete) {
      setError(errorComplete);
    }
  }, [errorComplete]);

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
            remarks,
            optician: "Yes",
          });
        }}
      />
    );

    modalRef.current.open("Confirm Save", component, "sm");
  };

  const handleFeedback = () => {
    if (data || error) {
      return (
        <Alert
          sx={{ mt: 2 }}
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
              title="Refraction Details"
              sx={{ mt: 0 }}
            />
            <Refraction consultation={consultation}/>

            <Subheader title="Management"/>
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
                  ref={remarksRef}
                  disabled={consultation.optician_status === "Consulted"}
                  fullWidth
                  placeholder="Type remarks..."
                  multiline
                  rows={3}
                  horizontal
                  defaultValue={remarks}
                  onChange={(value) => setRemarks(value)}
                />
              </Grid>
            </Grid>

            {handleFeedback()}
          </CardContent>
        </Form>
        {consultation.optician_status === "Pending" ?
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
