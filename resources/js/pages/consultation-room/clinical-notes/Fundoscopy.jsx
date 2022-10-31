import React, { forwardRef, useImperativeHandle, useRef } from "react";

import { Grid } from "@mui/material";
import TextField from "../../../components/TextField";
import usePatch from "../../../hooks/usePatch";

const Fundoscopy = ({ consultation: { id, status, fundoscopy } }, ref) => {

  const reRef = useRef();
  const leRef = useRef();

  const { handlePatch: handleAutoSave } = usePatch();

  const autoSave = (field, value) => {
    if (!fundoscopy || (fundoscopy && value !== fundoscopy[field])) {
      handleAutoSave(`api/consultations/${id}/auto-save-clinical-notes`, { what: "Fundoscopy", [field]: value });
    }
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      return true;
    }
  }));

  return (
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
          ref={reRef}
          disabled={status === "Consulted"}
          fullWidth
          label="RE"
          multiline
          rows={2}
          horizontal
          defaultValue={fundoscopy ? fundoscopy.re : null}
          onChange={(value) => autoSave("re", value)}
        />
      </Grid>
      <Grid
        item
        md={6}
        sm={12}
        xs={12}
      >
        <TextField
          ref={leRef}
          disabled={status === "Consulted"}
          fullWidth
          label="RE"
          multiline
          rows={2}
          horizontal
          defaultValue={fundoscopy ? fundoscopy.le : null}
          onChange={(value) => autoSave("le", value)}
        />
      </Grid>
    </Grid>
  );
};

export default forwardRef(Fundoscopy);
