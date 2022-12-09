import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, CardActions, CardContent, Divider, Grid, LinearProgress } from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";

import { usePatch } from "../../../hooks";
import { formatError, getValidationRules, numberFormat } from "../../../helpers";

const validationRules = getValidationRules();

const EditExpense = ({ item, modal, fetchExpenses }) => {

  const formRef = useRef();
  const amountRef = useRef();

  const [formData, setFormData] = useState({
    paid_amount: item.paid_amount,
  });

  const { data, loading, error, handlePatch } = usePatch(`api/expenses/${item.id}`, formData);

  useEffect(() => {
    if (data) {
      window.setTimeout(() => {
        modal.close();
        fetchExpenses();
      }, 1000);
    }
  }, [data]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePatch();
    }
  };

  const handleFeedback = () => {
    if (data || error) {
      return (
        <Alert
          sx={{ mb: 2 }}
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
      {loading && <LinearProgress />}
      <CardContent sx={{ maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
        {handleFeedback()}
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
                disabled
                label="Remaining Amount"
                fullWidth
                defaultValue={numberFormat(item.total_amount - item.paid_amount)}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <TextField
                ref={amountRef}
                label="Pay Amount"
                fullWidth
                required
                rules={[
                  validationRules.number,
                  (value) => value >= 0 || "Amount cannot be negative.",
                  (value) => value <= (item.total_amount - item.paid_amount) || "Amount cannot exceed remaining amount."
                ]}
                onChange={(value) => {
                  const amount = window.parseFloat(value);
                  setFormData({ ...formData, paid_amount: item.paid_amount + (isNaN(amount) ? 0 : amount) })
                }}
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <Divider />
      <CardActions>
        <Box flexGrow={1}/>
        <Button
          variant="text"
          size="large"
          onClick={() => modal.close()}
        >
          Cancel
        </Button>
        <Button
          disabled={loading}
          variant="text"
          size="large"
          onClick={handleSubmit}
        >
          Save
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default EditExpense;
