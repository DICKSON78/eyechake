import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

import Page, { Header as PageHeader } from "../../components/Page";
import Modal from "../../components/Modal";
import PatientDetails from "./patients/PatientDetails";
import TextField from "../../components/TextField";
import Select from "../../components/Select";
import SelectUser from "../../components/SelectUser";
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

const CheckInPatient = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const { patientId } = useParams();

  const modalRef = useRef();
  const paymentModeRef = useRef();
  const itemRef = useRef();
  const quantityRef = useRef();
  const consultantRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();

  const { data: paymentModes, handleFetch: fetchPaymentModes } = useFetch(
    "api/payment-modes",
    {
      status: "Active",
      per_page: 500,
    },
    false,
    [],
    (response) => response.data.data.data
  );
  const { data: itemTypes, handleFetch: fetchItemTypes } = useFetch(
    "api/item-types",
    {
      status: "Active",
      per_page: 500,
    },
    false,
    [],
    (response) => response.data.data.data.map((e) => e.name)
  );

  const [paymentMode, setPaymentMode] = useState();
  const [consultant, setConsultant] = useState();
  const [itemName, setItemName] = useState();
  const [itemType, setItemType] = useState();
  const [lensTypeId, setLensTypeId] = useState();
  const [selectedItem, setSelectedItem] = useState();
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState();
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
    handleFetch: fetchItems,
  } = useFetch(
    "api/items",
    {
      status: "Active",
      per_page: 5000,
      payment_mode_id: paymentMode ? paymentMode.id : undefined,
      q: itemName,
      item_type: itemType,
      lens_type_id: lensTypeId,
    },
    false,
    [],
    (response) => response.data.data.data
  );

  const { data, loading, error, handlePost, setError } = usePost(
    "api/patient-check-ins",
    {
      patient_id: patientId,
      payment_mode_id: paymentMode ? paymentMode.id : undefined,
      items: selectedItems,
    }
  );

  useEffect(() => {
    document.title = `Check-In Patient - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (patient) {
      fetchPaymentModes();
      fetchItemTypes();
      setPaymentMode(patient.payment_mode);
    }
  }, [patient]);

  useEffect(() => {
    if (paymentMode) {
      setSelectedItem(null);
      setQuantity(1);
      setItems([]);
      fetchItems();
    }
  }, [paymentMode]);

  useEffect(() => {
    if (paymentMode) {
      fetchItems();
    }
  }, [itemName, itemType, lensTypeId]);

  useEffect(() => {
    if (itemType !== "Lens") {
      setLensTypeId(null);
    }

    if (itemType === "Lens") {
      fetchLensTypes();
    }
  }, [itemType]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        navigate("/reception/patients");
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleAddItem = () => {
    if (consultantRef.current.validate() && quantityRef.current.validate()) {
      setSelectedItems([
        ...selectedItems,
        {
          payment_mode_id: paymentMode.id,
          payment_mode_name: paymentMode.name,
          item_id: selectedItem.id,
          item_name: selectedItem.name,
          consultation_type_id: selectedItem.consultation_type_id,
          unit_price: selectedItem.prices[0].unit_price,
          quantity,
          comments,
          consultant_id: consultant ? consultant.id : null,
          consultant_name: consultant ? consultant.full_name : null,
        },
      ]);

      setSelectedItem(null);
      setQuantity(1);
      setComments(undefined);
    }
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((e, i) => i !== index));
  };

  const confirmSubmit = (title) => {
    setError(null);

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

    modalRef.current.open(title, component, "sm");
  };

  const getTotalAmount = () => {
    return selectedItems.reduce(
      (acc, e) => acc + (e.unit_price || 0) * (e.quantity || 0),
      0
    );
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Patients/Customers" },
        { title: "Check-In" },
        { title: patientId },
      ]}
    >
      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={(responseData) => setPatient(responseData)}
      />

      {loadingPatient ? (
        <Skeleton
          variant="rounded"
          height={256}
        />
      ) : null}

      {patient ? (
        <Card>
          <PageHeader title="Check-In Patient" />
          <Divider />
          <CardContent>
            <Grid
              container
              spacing={2}
              mb={2}
            >
              <Grid
                item
                md={3.5}
                sm={12}
                xs={12}
              >
                <Select
                  ref={paymentModeRef}
                  label="Payment Mode"
                  fullWidth
                  required
                  options={paymentModes}
                  optionsLabel="name"
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  value={paymentMode || null}
                  onChange={(value) => setPaymentMode(value)}
                />
              </Grid>
              <Grid
                item
                md={3}
                sm={12}
                xs={12}
              >
                <SelectUser
                  ref={consultantRef}
                  label="Consultant"
                  clearable
                  params={{ designation: "Doctor" }}
                  onChange={(value) => setConsultant(value)}
                />
              </Grid>
            </Grid>

            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                md={3.5}
                sm={12}
                xs={12}
              >
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
                      options={itemTypes}
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
                    {items.map((e) => (
                      <FormControlLabel
                        key={e.id}
                        control={
                          <Radio
                            size="small"
                            checked={selectedItem === e}
                            onChange={(event) => setSelectedItem(e)}
                          />
                        }
                        label={
                          <Typography variant="body2">{e.name}</Typography>
                        }
                        sx={{ display: "flex" }}
                      />
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              <Grid
                item
                md={8.5}
                sm={12}
                xs={12}
              >
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
                        spacing={1}
                        alignItems="flex-end"
                        mb={2}
                      >
                        <Grid
                          item
                          md={3}
                          sm={4}
                          xs={12}
                        >
                          <TextField
                            ref={itemRef}
                            disabled={true}
                            label="Selected Item"
                            fullWidth
                            required
                            value={selectedItem.name || ""}
                          />
                        </Grid>
                        <Grid
                          item
                          md={1.5}
                          sm={4}
                          xs={12}
                        >
                          <TextField
                            disabled={true}
                            label="Unit Price"
                            fullWidth
                            value={
                              selectedItem.prices.length
                                ? numberFormat(
                                    selectedItem.prices[0].unit_price || 0
                                  )
                                : ""
                            }
                          />
                        </Grid>
                        <Grid
                          item
                          md={1.5}
                          sm={4}
                          xs={12}
                        >
                          <TextField
                            ref={quantityRef}
                            label="Quantity"
                            fullWidth
                            required
                            defaultValue={quantity}
                            rules={[
                              validationRules.number,
                              (value) =>
                                value > 0 ||
                                "Quantity has to be greater than 0.",
                            ]}
                            onChange={(value) => {
                              value = validateInteger(value);
                              setQuantity(value);
                            }}
                          />
                        </Grid>
                        <Grid
                          item
                          md={3}
                          sm={4}
                          xs={12}
                        >
                          <TextField
                            label="Comments"
                            fullWidth
                            onChange={(value) => setComments(value)}
                          />
                        </Grid>
                        <Grid
                          item
                          md={2}
                          sm={4}
                          xs={12}
                        >
                          <TextField
                            disabled={true}
                            label="Total Price"
                            fullWidth
                            value={
                              numberFormat(
                                (selectedItem.prices[0].unit_price || 0) *
                                  (quantity || 0)
                              ) || ""
                            }
                          />
                        </Grid>
                        <Grid
                          item
                          md={1}
                          sm={2}
                          xs={12}
                        >
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
                          field: "payment_mode_name",
                          headerName: "Payment Mode",
                        },
                        {
                          field: "unit_price",
                          headerName: "Unit Price",
                          valueGetter: (item, index) =>
                            numberFormat(item.unit_price || 0),
                        },
                        {
                          field: "quantity",
                          headerName: "Quantity",
                          valueGetter: (item, index) =>
                            numberFormat(item.quantity || 0),
                        },
                        {
                          field: "total_price",
                          headerName: "Subtotal",
                          valueGetter: (item, index) =>
                            numberFormat(
                              (item.unit_price || 0) * (item.quantity || 0)
                            ),
                        },
                        {
                          field: "comments",
                          headerName: "Comments",
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
                        },
                      ]}
                      items={selectedItems}
                      hidePaginationFooter
                      footerItems={[
                        [
                          { value: "TOTAL", tableCellProps: { colSpan: 5 } },
                          { value: numberFormat(getTotalAmount() || 0) },
                        ],
                      ]}
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
              disabled={loading}
              variant="contained"
              onClick={() =>
                confirmSubmit(
                  paymentMode && paymentMode.transaction_type === "Credit"
                    ? "Confirm Send for Approval"
                    : "Confirm Send to Cashier"
                )
              }
            >
              {paymentMode && paymentMode.transaction_type === "Credit"
                ? "Send for Approval"
                : "Send to Cashier"}
            </Button>
          </Stack>
        </Card>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default CheckInPatient;
