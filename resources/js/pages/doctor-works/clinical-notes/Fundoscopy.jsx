import React, { useRef, useState } from "react";

import { Grid } from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";

const Fundoscopy = ({ patientId, consultationId }) => {

  const formRef = useRef();
  const reRef = useRef();
  const leRef = useRef();

  const [formData, setFormData] = useState({
    re: undefined,
    le: undefined,
  });

  return (
    <Form ref={formRef}>
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
            fullWidth
            label="RE"
            multiline
            rows={2}
            horizontal
            onChange={(value) => setFormData({ ...formData, re: value })}
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
            fullWidth
            label="LE"
            multiline
            rows={2}
            horizontal
            onChange={(value) => setFormData({ ...formData, le: value })}
          />
        </Grid>
      </Grid>
    </Form>
  );
};

export default Fundoscopy;
