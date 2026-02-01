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
} from "@mui/material";
import Card from "@mui/material/Card";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import DatePicker from "../../../components/DatePicker";

import { useFetch, usePatch, useToast } from "../../../hooks";
import {
  formatDateForDb,
  formatError,
  getValidationRules,
} from "../../../helpers";

const validationRules = getValidationRules();

const EditExpense = ({ item, modal, fetchExpenses }) => {
  const addToast = useToast();

  const formRef = useRef();
  const categoryRef = useRef();
  const totalAmountRef = useRef();
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
    category_id: item.category_id,
    total_amount: item.total_amount,
    description: item.description,
    expense_date: new Date(item.expense_date),
  });

  const { data, loading, error, handlePatch } = usePatch(
    `api/expenses/${item.id}`,
    {
      ...formData,
      expense_date: formatDateForDb(formData.expense_date),
    }
  );

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
      handlePatch();
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
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={categories.find((e) => e.id === formData.category_id)}
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
                    defaultValue={formData.total_amount}
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
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: "grey.50",
                      border: "1px solid",
                      borderColor: "divider",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Current Paid Amount
                    </Typography>
                    <Typography variant="h6" color="text.primary" fontWeight="bold">
                      TZS {parseFloat(item.paid_amount || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Note: Paid amount cannot be edited here. Use the Payments section to manage payments.
                    </Typography>
                  </Box>
                </Grid>
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
                    defaultValue={formData.description}
                    onChange={(value) =>
                      setFormData({ ...formData, description: value })
                    }
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
          {loading ? "Updating..." : "Update Expense"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default EditExpense;
