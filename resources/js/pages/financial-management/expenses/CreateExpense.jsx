import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  LinearProgress,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import DatePicker from "../../../components/DatePicker";
import Card from "@mui/material/Card";

import { useFetch, usePost, useToast } from "../../../hooks";
import {
  formatDateForDb,
  formatError,
  getValidationRules,
} from "../../../helpers";

const validationRules = getValidationRules();

const CreateExpense = ({ modal, fetchExpenses }) => {
  const addToast = useToast();

  const formRef = useRef();
  const categoryRef = useRef();
  const totalAmountRef = useRef();
  const paidAmountRef = useRef();
  const descriptionRef = useRef();
  const dateRef = useRef();

  const { data: categories } = useFetch(
    "api/expense-categories",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [formData, setFormData] = useState({
    category_id: undefined,
    total_amount: undefined,
    paid_amount: undefined,
    description: undefined,
    expense_date: new Date(),
    running_cost: false,
    improvement_cost: false,
  });

  const { data, loading, error, handlePost } = usePost("api/expenses", {
    ...formData,
    expense_date: formatDateForDb(formData.expense_date),
    running_cost: formData.running_cost,
    improvement_cost: formData.improvement_cost,
  });

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchExpenses();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost();
    }
  };

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent sx={{ p: 0 }}>
        <Form ref={formRef}>
          {/* Basic Information Section */}
          <Card variant="outlined" sx={{ mb: 3, boxShadow: 1 }}>
            <CardHeader 
              title="Expense Information" 
              titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Select
                    ref={categoryRef}
                    label="Category *"
                    fullWidth
                    required
                    options={categories}
                    optionsLabel="name"
                    optionsValue="id"
                    onChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    ref={dateRef}
                    label="Expense Date *"
                    fullWidth
                    required
                    value={formData.expense_date || null}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        expense_date: !isNaN(value) ? value : null,
                      })
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Amount Information Section */}
          <Card variant="outlined" sx={{ mb: 3, boxShadow: 1 }}>
            <CardHeader 
              title="Amount Details" 
              titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    ref={totalAmountRef}
                    label="Total Amount (TZS) *"
                    fullWidth
                    required
                    type="number"
                    placeholder="0.00"
                    rules={[
                      validationRules.number,
                      (value) => value >= 0 || "Amount cannot be negative.",
                    ]}
                    onChange={(value) =>
                      setFormData({ ...formData, total_amount: value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    ref={paidAmountRef}
                    label="Paid Amount (TZS) *"
                    fullWidth
                    required
                    type="number"
                    placeholder="0.00"
                    rules={[
                      validationRules.number,
                      (value) => value >= 0 || "Amount cannot be negative.",
                    ]}
                    onChange={(value) =>
                      setFormData({ ...formData, paid_amount: value })
                    }
                  />
                </Grid>
                {formData.total_amount && formData.paid_amount && (
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: "grey.50",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Remaining Amount
                      </Typography>
                      <Typography
                        variant="h6"
                        color={
                          parseFloat(formData.total_amount || 0) -
                            parseFloat(formData.paid_amount || 0) >
                          0
                            ? "warning.main"
                            : "success.main"
                        }
                        fontWeight="bold"
                      >
                        TZS{" "}
                        {(
                          parseFloat(formData.total_amount || 0) -
                          parseFloat(formData.paid_amount || 0)
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Description Section */}
          <Card variant="outlined" sx={{ mb: 3, boxShadow: 1 }}>
            <CardHeader 
              title="Additional Details" 
              titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    ref={descriptionRef}
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Enter expense description or notes..."
                    onChange={(value) =>
                      setFormData({ ...formData, description: value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!formData.running_cost}
                        onChange={(e) =>
                          setFormData({ ...formData, running_cost: e.target.checked })
                        }
                      />
                    }
                    label="Running Cost"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!formData.improvement_cost}
                        onChange={(e) =>
                          setFormData({ ...formData, improvement_cost: e.target.checked })
                        }
                      />
                    }
                    label="Improvement Costs"
                    sx={{ ml: 2 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Form>
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 2, justifyContent: "flex-end", gap: 1 }}>
        <Button
          variant="outlined"
          size="medium"
          onClick={() => modal.close()}
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="medium"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {loading ? "Saving..." : "Save Expense"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default CreateExpense;
