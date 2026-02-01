import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  Radio,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/CloseRounded";

import Page from "../../components/Page";
import Modal from "../../components/Modal";
import TextField from "../../components/TextField";
import DatePicker from "../../components/DatePicker";
import Select from "../../components/Select";
import Table, { SearchTextField } from "../../components/Table";
import ConfirmationDialog from "../../components/ConfirmationDialog";

import { useFetch, usePost, useToast } from "../../hooks";
import {
  formatError,
  getValidationError,
  getValidationRules,
  numberFormat,
  throttle,
  validateInteger,
} from "../../helpers";

const validationRules = getValidationRules();

const Stocktaking = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();
  const reasonRef = useRef();
  const itemRef = useRef();
  const quantityRef = useRef();
  const unitBuyingPriceRef = useRef();

  const [reason, setReason] = useState();
  const [itemName, setItemName] = useState();
  const [itemType, setItemType] = useState();
  const [lensTypeId, setLensTypeId] = useState();
  const [selectedItem, setSelectedItem] = useState();
  const [category, setCategory] = useState(null);
  const [quantity, setQuantity] = useState();
  const [unitBuyingPrice, setUnitBuyingPrice] = useState(null);
  const [sellingPrice, setSellingPrice] = useState(null);
  const [expirationDate, setExpirationDate] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const { data: lensTypes, handleFetch: fetchLensTypes } = useFetch(
    "api/lens-types",
    {
      status: "Active",
      per_page: 500,
    },
    false,
    [],
    (response) => response.data.data.data
  );

  const {
    data: items,
    setData: setItems,
    loading: loadingItems,
    error: itemsError,
    handleFetch: fetchItems,
  } = useFetch(
    "api/items",
    {
      status: "Active",
      per_page: 5000,
      is_stock_item: "Yes",
      include_all_stock: "Yes", // Bypass balance/expiry filtering for stocktaking
      q: itemName,
      item_type: itemType,
      lens_type_id: lensTypeId,
    },
    false,
    [],
    (response) => response.data.data.data
  );

  const { data, loading, error, handlePost, setError } = usePost(
    "api/stocktakes",
    {
      reason,
      items: selectedItems,
    }
  );

  useEffect(() => {
    document.title = `Stocktaking - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (itemType !== "Lens") {
      setLensTypeId(null);
    }

    if (itemType === "Lens") {
      fetchLensTypes();
    }
  }, [itemType]);

  useEffect(() => {
    // Fetch items when filters change
    fetchItems();
  }, [itemName, itemType, lensTypeId]);

  useEffect(() => {
    if (itemsError) {
      addToast({ message: formatError(itemsError), severity: "error" });
    }
  }, [itemsError]);

  // Error boundary for component
  useEffect(() => {
    const handleError = (error) => {
      console.error("Stocktaking component error:", error);
      addToast({ message: "An error occurred. Please refresh the page.", severity: "error" });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      // Navigate back to dashboard after successful stocktake
      setTimeout(() => {
        navigate('/inventory-management/dashboard');
      }, 1500);
    }
  }, [data, navigate]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleAddItem = () => {
    try {
      if (!selectedItem) {
        addToast({ message: "Please select an item first.", severity: "warning" });
        return;
      }

      if (!quantity || quantity <= 0) {
        addToast({ message: "Please enter a valid quantity.", severity: "warning" });
        return;
      }

      if (!unitBuyingPrice || unitBuyingPrice <= 0) {
        addToast({ message: "Please enter a valid unit buying price.", severity: "warning" });
        return;
      }

      setSelectedItems([
        ...selectedItems,
        {
          item_id: selectedItem.id,
          item_name: selectedItem.name,
          category: category || selectedItem.category || null,
          quantity,
          unit_buying_price: unitBuyingPrice,
          selling_price: sellingPrice,
          expiration_date: expirationDate,
        },
      ]);

      setSelectedItem(null);
      setCategory(null);
      setQuantity(null);
      setUnitBuyingPrice(null);
      setSellingPrice(null);
      setExpirationDate(null);
    } catch (error) {
      console.error("Error adding item:", error);
      addToast({ message: "Error adding item. Please try again.", severity: "error" });
    }
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((e, i) => i !== index));
  };

  const confirmSubmit = () => {
    setError(null);

    if (!reasonRef.current.validate()) {
      return setError(
        getValidationError("Please write reason for this stocktaking.")
      );
    }

    if (!selectedItems.length) {
      return setError(getValidationError("Please add at least one item."));
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handlePost();
        }}
      />
    );

    modalRef.current.open("Confirm Save", component, "sm");
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Stock Management" },
        { title: "Stocktaking" },
      ]}
    >
      <CardHeader
        title="Stocktaking"
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        sx={{
          p: 0,
          mb: 3,
        }}
      />
      <Card>
        <Divider />
        <CardContent>
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mb: 3 }}
          >
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField
                ref={reasonRef}
                label="Reason"
                fullWidth
                required
                onChange={(value) => setReason(value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField
                disabled
                label="Prepared By"
                fullWidth
                required
                value={window.user.full_name}
              />
            </Grid>
          </Grid>

          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
          >
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined">
                <CardHeader
                  title="Select Item"
                  action={
                    <SearchTextField
                      onChange={(value) =>
                        throttle(() => setItemName(value), 1000)
                      }
                    />
                  }
                  className="no-action-margin"
                />
                <Divider />
                <CardContent sx={{ bgcolor: "background.default" }}>
                  <Select
                    placeholder="Item Type"
                    fullWidth
                    clearable
                    options={["Pharmaceutical", "Lens", "Frame", "Others", "Service"]}
                    onChange={(value) => setItemType(value)}
                  />
                  {itemType === "Lens" ? (
                    <Select
                      placeholder="Lens Type"
                      fullWidth
                      clearable
                      options={lensTypes}
                      optionsLabel="name"
                      optionsValue="id"
                      onChange={(value) => setLensTypeId(value)}
                      containerProps={{ mt: 2 }}
                    />
                  ) : null}
                </CardContent>
                <Divider />
                <CardContent sx={{ height: "42vh", overflowY: "auto" }}>
                  {loadingItems ? (
                    <Stack spacing={1}>
                      {[...Array(5)].map((_, index) => (
                        <Skeleton key={index} variant="rectangular" height={40} />
                      ))}
                    </Stack>
                  ) : items.length > 0 ? (
                    items.map((e) => (
                      <FormControlLabel
                        key={e.id}
                        control={
                          <Radio
                            size="small"
                            checked={selectedItem?.id === e.id}
                            onChange={() => setSelectedItem(e)}
                          />
                        }
                        label={<Typography variant="body2">{e.name}</Typography>}
                        sx={{ display: "flex", cursor: "pointer" }}
                        onClick={() => setSelectedItem(e)}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No items found. Try adjusting your filters.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Card
                variant="outlined"
                sx={{ mb: 1 }}
              >
                <CardHeader title="Added Items" />
                <Divider />
                <CardContent>
                  {selectedItem ? (
                    <Grid
                      container
                      spacing={{ xs: 2, sm: 2, md: 2 }}
                      alignItems="flex-end"
                      sx={{ mb: 3 }}
                    >
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                          ref={itemRef}
                          disabled={true}
                          label="Selected Item"
                          fullWidth
                          required
                          value={selectedItem.name || ""}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <TextField
                          label="Category"
                          fullWidth
                          placeholder="Enter category"
                          value={category || selectedItem.category || ""}
                          onChange={(value) => setCategory(value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <TextField
                          disabled={true}
                          label="Unit of Measure"
                          fullWidth
                          required
                          value={selectedItem.unit_of_measure?.name || ""}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
                        <TextField
                          ref={quantityRef}
                          label="Quantity"
                          fullWidth
                          required
                          defaultValue={quantity}
                          rules={[
                            validationRules.number,
                            (value) =>
                              value > 0 || "Quantity has to be greater than 0.",
                          ]}
                          onChange={(value) => {
                            value = validateInteger(value);
                            setQuantity(value);
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
                        <TextField
                          ref={unitBuyingPriceRef}
                          label="Unit Buying Price"
                          fullWidth
                          defaultValue={unitBuyingPrice}
                          rules={[
                            (value) => {
                              value = (value || "").trim();
                              return !value
                                ? true
                                : validationRules.number(value);
                            },
                            (value) => {
                              value = (value || "").trim();
                              return !value
                                ? true
                                : value > 0 ||
                                    "Price has to be greater than 0.";
                            },
                          ]}
                          onChange={(value) => {
                            value = validateInteger(value);
                            setUnitBuyingPrice(value);
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
                        <TextField
                          label="Selling Price"
                          fullWidth
                          type="number"
                          placeholder="0.00"
                          defaultValue={sellingPrice}
                          onChange={(value) => {
                            value = validateInteger(value);
                            setSellingPrice(value);
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
                        <DatePicker
                          label="Expiration Date"
                          fullWidth
                          value={expirationDate}
                          onChange={(value) => setExpirationDate(value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 12, md: 1.2 }}>
                        <Button
                          disabled={loading}
                          fullWidth
                          variant="contained"
                          color="primary"
                          size="medium"
                          onClick={handleAddItem}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  ) : null}

                  <Table
                    columns={[
                      {
                        field: "index",
                        headerName: "S/N",
                        valueGetter: (item, index) => index + 1,
                      },
                      {
                        field: "item_name",
                        headerName: "Item Name",
                      },
                      {
                        field: "category",
                        headerName: "Category",
                        valueGetter: (item, index) => item.category || "Uncategorized",
                      },
                      {
                        field: "quantity",
                        headerName: "Quantity",
                        valueGetter: (item, index) =>
                          numberFormat(item.quantity || 0),
                      },
                      {
                        field: "unit_buying_price",
                        headerName: "Unit Buying Price",
                        valueGetter: (item, index) =>
                          numberFormat(item.unit_buying_price || 0),
                      },
                      {
                        field: "selling_price",
                        headerName: "Selling Price",
                        valueGetter: (item, index) =>
                          numberFormat(item.selling_price || 0),
                      },
                      {
                        field: "expiration_date",
                        headerName: "Expiration Date",
                        valueGetter: (item, index) =>
                          item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : "-",
                      },
                      {
                        field: "actions",
                        headerName: "Actions",
                        renderCell: (item, index) => (
                          <Tooltip title="Remove">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ),
                        show: !data,
                      },
                    ]}
                    items={selectedItems}
                    hidePaginationFooter
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        {loading && <LinearProgress />}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
          p={2}
        >
          <Button
            disabled={loading || !!data}
            variant="contained"
            onClick={confirmSubmit}
          >
            Save
          </Button>
        </Stack>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Stocktaking;
