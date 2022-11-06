import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, CardActions, CardContent, Divider, Grid, LinearProgress } from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import DatePicker from "../../../components/DatePicker";

import { useFetch, usePost } from "../../../hooks";
import { formatDateForDb, formatError, getValidationRules } from "../../../helpers";

const validationRules = getValidationRules();

const CreateExpense = ({ modal, fetchExpenses }) => {

  const formRef = useRef();
  const categoryRef = useRef();
  const amountRef = useRef();
  const descriptionRef = useRef();
  const dateRef = useRef();

  const { data: categories } = useFetch("api/expense-categories", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  const [formData, setFormData] = useState({
    category_id: undefined,
    amount: undefined,
    description: undefined,
    expense_date: new Date(),
  });

  const { data, loading, error, handlePost } = usePost("api/expenses", {
    ...formData,
    expense_date: formatDateForDb(formData.expense_date),
  });

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
      handlePost();
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
              <Select
                ref={categoryRef}
                label="Category"
                fullWidth
                required
                options={categories}
                optionsLabel="name"
                optionsValue="id"
                value={formData.category_id || ""}
                onChange={(value) => setFormData({ ...formData, category_id: value })}
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
                label="Amount"
                fullWidth
                required
                rules={[
                  validationRules.number,
                  (value) => value >= 0 || "Amount cannot be negative."
                ]}
                onChange={(value) => setFormData({ ...formData, amount: value })}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <TextField
                ref={descriptionRef}
                label="Description"
                fullWidth
                multiline
                rows={3}
                required
                onChange={(value) => setFormData({ ...formData, description: value })}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={6}
              xs={12}
            >
              <DatePicker
                ref={dateRef}
                label="Expense Date"
                fullWidth
                required
                value={formData.expense_date}
                onChange={(value) => setFormData({ ...formData, expense_date: !isNaN(value) ? value : null })}
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
          onClick={() => modal.close()}
        >
          Cancel
        </Button>
        <Button
          disabled={loading}
          variant="text"
          onClick={handleSubmit}
        >
          Save
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default CreateExpense;
