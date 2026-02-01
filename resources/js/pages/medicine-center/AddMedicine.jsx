import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  SaveRounded as SaveIcon,
  ArrowBackRounded as BackIcon,
  MedicationRounded as MedicineIcon,
  DeleteRounded as DeleteIcon,
  AddRounded as AddIcon,
} from "@mui/icons-material";

import Page from "../../components/Page";
import TextField from "../../components/TextField";
import DatePicker from "../../components/DatePicker";
import Select from "../../components/Select";
import Table from "../../components/Table";
import ConfirmationDialog from "../../components/ConfirmationDialog";

import { useFetch, usePost, useToast } from "../../hooks";
import {
  formatError,
  getValidationError,
  numberFormat,
} from "../../helpers";

const AddMedicine = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  const medicineNameRef = useRef();
  const codeRef = useRef();
  const unitOfMeasureRef = useRef();
  const quantityRef = useRef();
  const unitBuyingPriceRef = useRef();
  const sellingPriceRef = useRef();

  const [medicineName, setMedicineName] = useState("");
  const [code, setCode] = useState("");
  const [genericName, setGenericName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("");
  const [unitOfMeasureId, setUnitOfMeasureId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitBuyingPrice, setUnitBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [expirationDate, setExpirationDate] = useState(null);
  const [minimumStock, setMinimumStock] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [hasShownSuccess, setHasShownSuccess] = useState(false);

  // Fetch units of measure
  const { data: unitsOfMeasureResponse, loading: unitsLoading, error: unitsError } = useFetch(
    "api/units-of-measure",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data
  );

  // Extract the actual units of measure array from the paginated response
  const unitsOfMeasure = unitsOfMeasureResponse?.data?.data || [];

  const { data, loading, error, handlePost, setError } = usePost(
    "api/medicines/bulk-create",
    {
      medicines: selectedMedicines,
    }
  );

  useEffect(() => {
    document.title = `Add Medicine - ${window.APP_NAME}`;
    
    // Cleanup function to reset success flag
    return () => {
      setHasShownSuccess(false);
    };
  }, []);

  useEffect(() => {
    if (data && data.success && !hasShownSuccess) {
      console.log('Success response received:', data);
      setHasShownSuccess(true);
      addToast({
        message: "Medicines added successfully",
        severity: "success",
      });
      setSelectedMedicines([]);
      navigate('/medicine-center/medicines');
    }
  }, [data, hasShownSuccess]);

  useEffect(() => {
    if (error) {
      // Debug: Log the full error
      console.log('Full error object:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      
      addToast({ message: formatError(error), severity: "error" });
      setError(null);
    }
  }, [error]);

  const handleAddMedicine = () => {
    if (!medicineName || medicineName.trim() === '') {
      addToast({
        message: "Medicine name is required",
        severity: "warning",
      });
      medicineNameRef.current.focus();
      return;
    }

    if (!unitOfMeasureId) {
      addToast({
        message: "Unit of measure is required",
        severity: "warning",
      });
      unitOfMeasureRef.current.focus();
      return;
    }

    if (!quantity || quantity <= 0) {
      addToast({
        message: "Quantity must be greater than 0",
        severity: "warning",
      });
      quantityRef.current.focus();
      return;
    }

    // Debug: Log the form values
    console.log('Form values:', {
      medicineName,
      code,
      genericName,
      brandName,
      unitOfMeasureId,
      quantity,
      unitBuyingPrice,
      sellingPrice,
      expirationDate,
      minimumStock
    });

    const medicine = {
      name: medicineName.trim(),
      code: code.trim() || null, // Set to null if empty
      generic_name: genericName.trim() || null, // Set to null if empty
      brand_name: brandName.trim() || null, // Set to null if empty
      category: category.trim() || null, // Set to null if empty
      unit_of_measure_id: parseInt(unitOfMeasureId), // Ensure it's an integer
      balance: parseFloat(quantity),
      unit_buying_price: unitBuyingPrice ? parseFloat(unitBuyingPrice) : null,
      selling_price: sellingPrice ? parseFloat(sellingPrice) : null,
      expiry_date: expirationDate ? expirationDate.toISOString().split('T')[0] : null,
      minimum_stock: minimumStock ? parseFloat(minimumStock) : null,
      has_expiry: expirationDate ? 'Yes' : 'No',
      prescription_required: 'No',
      controlled_substance: 'No',
      status: 'Active',
    };

    // Debug: Log the created medicine object
    console.log('Created medicine object:', medicine);

    setSelectedMedicines([...selectedMedicines, medicine]);

    // Clear form
    setMedicineName("");
    setCode("");
    setGenericName("");
    setBrandName("");
    setCategory("");
    setUnitOfMeasureId("");
    setQuantity("");
    setUnitBuyingPrice("");
    setSellingPrice("");
    setExpirationDate(null);
    setMinimumStock("");
    medicineNameRef.current.focus();
  };

  const handleRemoveMedicine = (index) => {
    const newSelectedMedicines = [...selectedMedicines];
    newSelectedMedicines.splice(index, 1);
    setSelectedMedicines(newSelectedMedicines);
  };

  const handleSubmit = () => {
    if (selectedMedicines.length === 0) {
      addToast({
        message: "Please add at least one medicine",
        severity: "warning",
      });
      return;
    }
    
    // Reset success flag for new submission
    setHasShownSuccess(false);
    
    // Debug: Log the data being sent
    console.log('Submitting medicines:', selectedMedicines);
    handlePost();
  };

  return (
    <Page
      title="Add Medicine"
      breadcrumbs={[
        { title: "Home" },
        { title: "Medicine Center" },
        { title: "Medicines", to: "/medicine-center/medicines" },
        { title: "Add Medicine" },
      ]}
    >
      <CardHeader
        title="Add New Medicine"
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        action={
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/medicine-center/medicines')}
          >
            Back
          </Button>
        }
        sx={{
          p: 0,
          mb: 3,
        }}
      />

      <Card>
        <Divider />
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <strong>Note:</strong> Fields marked with * are required. All other fields are optional.
          </Typography>
          
          {/* Basic Information Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader 
              title="Basic Information" 
              titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    inputRef={medicineNameRef}
                    label="Medicine Name *"
                    value={medicineName || ""}
                    onChange={(value) => setMedicineName(value || "")}
                    placeholder="e.g., Paracetamol 500mg"
                    fullWidth
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    inputRef={codeRef}
                    label="Medicine Code"
                    value={code || ""}
                    onChange={(value) => setCode(value || "")}
                    placeholder="e.g., PAR500"
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Generic Name"
                    value={genericName || ""}
                    onChange={(value) => setGenericName(value || "")}
                    placeholder="e.g., Acetaminophen"
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Brand Name"
                    value={brandName || ""}
                    onChange={(value) => setBrandName(value || "")}
                    placeholder="e.g., Tylenol"
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Category"
                    value={category || ""}
                    onChange={(value) => setCategory(value || "")}
                    placeholder="e.g., Antibiotics, Pain Relief"
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Select
                    inputRef={unitOfMeasureRef}
                    label="Unit of Measure *"
                    options={Array.isArray(unitsOfMeasure) ? unitsOfMeasure : []}
                    optionsLabel="name"
                    optionsValue="id"
                    value={unitOfMeasureId || ""}
                    onChange={(value) => setUnitOfMeasureId(value || "")}
                    loading={unitsLoading}
                    placeholder={unitsError ? "Error loading units" : "Select unit"}
                    fullWidth
                    required
                  />
                  {unitsError && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      Error loading units: {unitsError?.response?.data?.message || unitsError?.message || 'Unknown error'}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Stock & Pricing Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader 
              title="Stock & Pricing Information" 
              titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    inputRef={quantityRef}
                    label="Quantity *"
                    type="number"
                    value={quantity || ""}
                    onChange={(value) => setQuantity(value || "")}
                    inputProps={{ min: 0, step: 0.01 }}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    inputRef={unitBuyingPriceRef}
                    label="Unit Buying Price (TZS)"
                    type="number"
                    value={unitBuyingPrice || ""}
                    onChange={(value) => setUnitBuyingPrice(value || "")}
                    inputProps={{ min: 0, step: 0.01 }}
                    placeholder="0.00"
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    inputRef={sellingPriceRef}
                    label="Selling Price (TZS)"
                    type="number"
                    value={sellingPrice || ""}
                    onChange={(value) => setSellingPrice(value || "")}
                    inputProps={{ min: 0, step: 0.01 }}
                    placeholder="0.00"
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    label="Expiry Date"
                    value={expirationDate}
                    onChange={setExpirationDate}
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Minimum Stock Level"
                    type="number"
                    value={minimumStock || ""}
                    onChange={(value) => setMinimumStock(value || "")}
                    inputProps={{ min: 0, step: 0.01 }}
                    placeholder="0"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Add Button - Minimized */}
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddMedicine}
              size="medium"
              sx={{ minWidth: 140 }}
            >
              Add to List
            </Button>
          </Stack>

          {selectedMedicines.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Medicines to Add ({selectedMedicines.length})
              </Typography>

              <Table
                columns={[
                  {
                    field: "name",
                    headerName: "Medicine Name",
                    valueGetter: (item) => item.name,
                  },
                  {
                    field: "code",
                    headerName: "Code",
                    valueGetter: (item) => item.code || 'N/A',
                  },
                  {
                    field: "generic_name",
                    headerName: "Generic Name",
                    valueGetter: (item) => item.generic_name || 'N/A',
                  },
                  {
                    field: "balance",
                    headerName: "Quantity",
                    valueGetter: (item) => numberFormat(item.balance),
                  },
                  {
                    field: "unit_buying_price",
                    headerName: "Unit Price (TZS)",
                    valueGetter: (item) => `Tz ${numberFormat(item.unit_buying_price)}`,
                  },
                  {
                    field: "expiry_date",
                    headerName: "Expiry Date",
                    valueGetter: (item) => {
                      if (!item.expiry_date) return 'No expiry';
                      if (typeof item.expiry_date === 'string') return item.expiry_date;
                      if (item.expiry_date instanceof Date) return item.expiry_date.toISOString().split('T')[0];
                      return 'No expiry';
                    },
                  },
                  {
                    field: "actions",
                    headerName: "Actions",
                    renderCell: (item, index) => (
                      <Tooltip title="Remove">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveMedicine(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    ),
                  },
                ]}
                items={selectedMedicines}
                itemCount={selectedMedicines.length}
              />

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/medicine-center/medicines')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ flexGrow: 1 }}
                >
                  {loading ? "Adding Medicines..." : `Add ${selectedMedicines.length} Medicine(s)`}
                </Button>
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default AddMedicine;
