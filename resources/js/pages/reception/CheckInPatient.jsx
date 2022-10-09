import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
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
  Stack,
  Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/CloseRounded";

import Page, { Header as PageHeader } from "../../components/Page";
import Modal from "../../components/Modal";
import TextField from "../../components/TextField";
import Select from "../../components/Select";
import Table, { SearchTextField } from "../../components/Table";

import { useFetch, usePost } from "../../hooks";
import { formatError, getValidationRules, numberFormat, validateInteger } from "../../helpers";

const validationRules = getValidationRules();

const CheckInPatient = () => {

  const modalRef = useRef();
  const paymentModeRef = useRef();
  const itemRef = useRef();
  const quantityRef = useRef();
  const consultantRef = useRef();

  const { data: paymentModes } = useFetch("api/payment-modes", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);
  const { data: users } = useFetch("api/users", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  const [paymentMode, setPaymentMode] = useState();
  const [consultant, setConsultant] = useState();
  const [itemName, setItemName] = useState();
  const [selectedItem, setSelectedItem] = useState();
  const [quantity, setQuantity] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);

  const { data: items, setData: setItems, handleFetch: fetchItems } = useFetch("api/items", {
    status: "Active",
    per_page: 500,
    payment_mode_id: paymentMode ? paymentMode.id : undefined,
    q: itemName,
  }, false, [], (response) => response.data.data.data);

  const { data, loading, error, handlePost } = usePost("api/patient-check-ins", {});

  useEffect(() => {
    document.title = `Check-In Patient - ${window.APP_NAME}`;
  }, []);

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
  }, [itemName]);

  useEffect(() => {
    if (data) {
      window.setTimeout(() => {
        //
      }, 1000);
    }
  }, [data]);

  const handleAddItem = () => {
    if (consultantRef.current.validate() && quantityRef.current.validate()) {
      setSelectedItems([...selectedItems, {
        payment_mode_id: paymentMode.id,
        payment_mode_name: paymentMode.name,
        item_id: selectedItem.id,
        item_name: selectedItem.name,
        unit_price: selectedItem.prices[0].unit_price,
        quantity,
        consultant_id: consultant.id,
        consultant_name: consultant.full_name,
      }]);

      setSelectedItem(null);
      setQuantity(1);
    }
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((e, i) => i !== index));
  };

  const handleSubmit = () => {
    handlePost();
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
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Patients/Customers" },
        { title: "Check-In" },
      ]}
    >
      {handleFeedback()}
      <Card>
        <PageHeader
          title="Check-In Patient"
          containerProps={{ pb: 2 }}
        />
        <Divider />
        {loading ? <LinearProgress /> : null}
        <CardContent>
          <Grid
            container
            spacing={2}
            mb={2}
          >
            <Grid
              item
              md={3}
              sm={4}
              xs={12}
            >
              <Select
                ref={paymentModeRef}
                label="Payment Mode"
                fullWidth
                required
                options={paymentModes}
                optionsText="name"
                optionsValue="id"
                value={paymentMode ? paymentMode.id : ""}
                onChange={(value) => setPaymentMode(paymentModes.find((e) => e.id === value))}
              />
            </Grid>
            <Grid
              item
              md={3}
              sm={4}
              xs={12}
            >
              <Select
                ref={consultantRef}
                label="Consultant"
                fullWidth
                required
                options={users}
                optionsText="full_name"
                optionsValue="id"
                value={consultant ? consultant.id : ""}
                onChange={(value) => setConsultant(users.find((e) => e.id === value))}
              />
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              md={3}
              sm={4}
              xs={12}
            >
              <Card variant="outlined">
                <CardHeader
                  title="Select Item"
                  titleTypographyProps={{ variant: "subtitle1" }}
                  action={(
                    <SearchTextField
                      onChange={(value) => setItemName(value)}
                    />
                  )}
                  className="no-action-margin-right"
                />
                <Divider />
                <CardContent sx={{ height: "40vh", overflowY: "auto" }}>
                  {items.map((e) => (
                    <FormControlLabel
                      key={e.id}
                      control={(
                        <Radio
                          checked={selectedItem === e}
                          onChange={(event) => setSelectedItem(e)}
                        />
                      )}
                      label={e.name}
                    />
                  ))}
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              md={9}
              sm={8}
              xs={12}
            >
              <Card
                variant="outlined"
                sx={{ mb: 1 }}
              >
                <CardHeader
                  title="Added Items"
                  titleTypographyProps={{ variant: "subtitle1" }}
                />
                <Divider />
                <CardContent>
                  {selectedItem ?
                    <Grid
                      container
                      spacing={1}
                      alignItems="flex-end"
                      mb={2}
                    >
                      <Grid
                        item
                        md={4}
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
                        md={3}
                        sm={4}
                        xs={12}
                      >
                        <TextField
                          disabled={true}
                          label="Unit Price"
                          fullWidth
                          value={selectedItem.prices.length ? numberFormat(selectedItem.prices[0].unit_price || 0) : ""}
                        />
                      </Grid>
                      <Grid
                        item
                        md={2}
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
                            (value) => value > 0 || "Quantity has to be greater than 0."
                          ]}
                          onChange={(value) => {
                            value = validateInteger(value);
                            setQuantity(value);
                          }}
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
                          value={numberFormat((selectedItem.prices[0].unit_price || 0) * (quantity || 0)) || ""}
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
                          disableElevation
                          variant="contained"
                          color="primary"
                          size="medium"
                          onClick={handleAddItem}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                    : null
                  }

                  <Table
                    columns={[
                      {
                        field: "index",
                        headerName: "S/N",
                        sortable: false,
                        valueGetter: (item, index) => (index + 1),
                      },
                      {
                        field: "item_name",
                        headerName: "Item",
                      },
                      {
                        field: "payment_mode_name",
                        headerName: "Payment Mode",
                      },
                      {
                        field: "unit_price",
                        headerName: "Unit Price",
                        valueGetter: (item, index) => numberFormat(item.unit_price || 0),
                      },
                      {
                        field: "quantity",
                        headerName: "Quantity",
                        valueGetter: (item, index) => numberFormat(item.quantity || 0),
                      },
                      {
                        field: "total_price",
                        headerName: "Subtotal",
                        valueGetter: (item, index) => numberFormat((item.unit_price || 0) * (item.quantity || 0)),
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
                                <DeleteIcon fontSize="small"/>
                              </IconButton>
                            </span>
                          </Tooltip>
                        ),
                      }
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
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
          p={2}
        >
          <Button
            variant="contained"
            disableElevation
            onClick={handleSubmit}
          >
            Send to Cashier
          </Button>
        </Stack>
      </Card>
      <Modal ref={modalRef}/>
    </Page>
  );
};

export default CheckInPatient;
