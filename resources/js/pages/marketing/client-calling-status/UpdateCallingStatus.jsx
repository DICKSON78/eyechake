import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CardActions,
  CardContent,
  Grid,
  LinearProgress,
} from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";

import { usePatch, useToast } from "../../../hooks";
import notificationEvents from "../../../utils/notificationEvents";
import { formatError } from "../../../helpers";

const UpdateCallingStatus = ({ patient, modal, fetchData }) => {
  const addToast = useToast();

  const formRef = useRef();
  const statusRef = useRef();
  const notesRef = useRef();

  const currentStatus = patient.calling_status?.status || "need_to_call";
  const currentNotes = patient.calling_status?.notes || "";

  const [formData, setFormData] = useState({
    status: currentStatus,
    notes: currentNotes,
  });

  const { data, loading, error, handlePatch } = usePatch(
    `api/marketing/client-calling-status/${patient.id}`,
    formData
  );

  useEffect(() => {
    if (data) {
      console.log("Calling status update successful:", data);
      addToast({ message: data.message || "Calling status updated successfully", severity: "success" });

      // Trigger notification refresh for real-time updates
      setTimeout(() => {
        notificationEvents.refresh();
      }, 500);

      window.setTimeout(() => {
        fetchData();
        modal.close();
      }, 1000);
    }
  }, [data, addToast, fetchData, modal]);

  useEffect(() => {
    if (error) {
      console.error("Calling status update error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Form data being sent:", formData);
      console.error("Patient ID:", patient.id);
      addToast({
        message: formatError(error) || "Failed to update calling status. Please try again.",
        severity: "error"
      });
    }
  }, [error, addToast, formData, patient.id]);

  const handleSubmit = () => {
    console.log("Submitting calling status update...");
    console.log("Form data:", formData);
    console.log("Patient:", patient);

    // Manual validation before form validation
    if (!formData.status) {
      addToast({ message: "Please select a status", severity: "error" });
      return;
    }

    if (!patient || !patient.id) {
      addToast({ message: "Patient information is missing", severity: "error" });
      return;
    }

    // Form validation
    const isValid = formRef.current?.validate();
    console.log("Form validation result:", isValid);

    if (isValid !== false) { // Allow undefined (no validation) or true
      console.log("Form is valid, calling handlePatch...");
      handlePatch();
    } else {
      console.log("Form validation failed");
      addToast({ message: "Please check the form for errors", severity: "error" });
    }
  };

  const statusOptions = [
    { label: "Need to Call", value: "need_to_call" },
    { label: "Called", value: "called" },
    { label: "Unreachable", value: "unreachable" },
  ];

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent>
        <Form ref={formRef}>
          <Grid container spacing={2}>
            <Grid item md={12} sm={12} xs={12}>
              <TextField
                label="Client Name"
                fullWidth
                disabled
                defaultValue={patient.full_name || ""}
              />
            </Grid>
            <Grid item md={12} sm={12} xs={12}>
              <TextField
                label="Phone"
                fullWidth
                disabled
                defaultValue={patient.phone || ""}
              />
            </Grid>
            <Grid item md={12} sm={12} xs={12}>
              <Select
                ref={statusRef}
                label="Status"
                fullWidth
                options={statusOptions}
                optionsLabel="label"
                optionsValue="value"
                required
                value={formData.status}
                onChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              />
            </Grid>
            <Grid item md={12} sm={12} xs={12}>
              <TextField
                ref={notesRef}
                label="Notes"
                fullWidth
                multiline
                rows={4}
                defaultValue={formData.notes}
                onChange={(value) =>
                  setFormData({ ...formData, notes: value })
                }
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <CardActions>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          sx={{ mr: 1 }}
          onClick={() => modal.close()}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
        >
          Update
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default UpdateCallingStatus;

