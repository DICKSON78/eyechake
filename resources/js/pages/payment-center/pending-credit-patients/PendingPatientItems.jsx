import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Alert, Button, Card, CardContent, Divider, Grid, LinearProgress, Skeleton, Stack } from "@mui/material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import PatientDetails from "../../reception/patients/PatientDetails";
import Table from "../../../components/Table";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import ConfirmationDialog from "../../../components/ConfirmationDialog";

import { useFetch, usePost } from "../../../hooks";
import {
  formatError,
  getNonNull,
  getValidationError,
  getValidationRules,
  numberFormat,
  validateInteger
} from "../../../helpers";

const validationRules = getValidationRules();

const PendingPatientItems = () => {

  const navigate = useNavigate();
  const { patientId, paymentCacheId } = useParams();

  const modalRef = useRef();
  const discountRef = useRef();
  const paymentChannelRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();
  const [discount, setDiscount] = useState();
  const [paymentChannel, setPaymentChannel] = useState();

  const { data: paymentChannels, handleFetch: fetchPaymentChannels } = useFetch("api/payment-channels", {
    status: "Active",
    per_page: 500
  }, false, [], (response) => response.data.data.data);

  const [selectedItems, setSelectedItems] = useState([]);

  const {
    data: items,
    setData: setItems,
    loading: loadingItems,
    handleFetch: fetchItems
  } = useFetch("api/patient-payment-cache-items", {
    status: "Pending",
    per_page: 500,
    payment_cache_id: paymentCacheId,
    payment_mode_type: "Credit"
  }, false, [], (response) => response.data.data.data);

  const { data, loading, error, handlePost, setError } = usePost("api/patient-payment-cache-items/make-credit-payment", {
    payment_cache_id: paymentCacheId,
    items: selectedItems.map((e) => e.id),
    discount,
    payment_channel_id: paymentChannel ? paymentChannel.id : null,
  });

  useEffect(() => {
    document.title = `Pending Patient Items - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (patient) {
      fetchItems();
      fetchPaymentChannels();
    }
  }, [patient]);

  useEffect(() => {
    if (data) {
      fetchItems();

      setSelectedItems([]);
      discountRef.current.setValue(null);
      paymentChannelRef.current.setValue(null);
    }
  }, [data]);

  const confirmSubmitMakePayment = (title) => {
    if (!selectedItems.length) {
      return setError(getValidationError("Please select at least one item."));
    }

    if (!discountRef.current.validate() || !paymentChannelRef.current.validate()) {
      return false;
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

  const handleFeedback = () => {
    if (data || error) {
      return (
        <Alert
          sx={{ mt: 2 }}
          severity={error ? "error" : "success"}
        >
          {error ? formatError(error) : data ? data.message : null}
        </Alert>
      );
    }

    return null;
  };

  const getTotalAmount = () => {
    return items.reduce((total, e) => total += ((e.unit_price || 0) * (e.quantity || 0)), 0);
  };

  const getSelectedAmount = () => {
    return selectedItems.reduce((total, e) => total += ((e.unit_price || 0) * (e.quantity || 0)), 0);
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: "Credit Patients Approval" },
        { title: patientId },
      ]}
    >
      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={(responseData) => setPatient(responseData)}
      />

      {loadingPatient ?
        <Skeleton
          variant="rounded"
          height={256}
        />
        : null
      }

      {patient ?
        <Card>
          <PageHeader title="Pending Patient Items"/>
          <Divider />
          <CardContent>
            <Table
              loading={loadingItems}
              columns={[
                {
                  field: "index",
                  headerName: "S/N",
                  valueGetter: (item, index) => (index + 1),
                },
                {
                  field: "item_id",
                  headerName: "Item Name",
                  valueGetter: (item, index) => getNonNull(item.item).name,
                },
                {
                  field: "payment_mode_id",
                  headerName: "Payment Mode",
                  valueGetter: (item, index) => getNonNull(item.payment_mode).name,
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
                }
              ]}
              items={items}
              hidePaginationFooter
              checkboxSelection
              checked={selectedItems}
              setChecked={setSelectedItems}
              footerItems={[
                [
                  {
                    value: "Total",
                    tableCellProps: { colSpan: 6 },
                  },
                  {
                    value: numberFormat(getTotalAmount() || 0),
                  }
                ]
              ]}
            />

            <Grid
              container
              spacing={2}
              mt={1}
            >
              <Grid
                item
                md={4}
                sm={4}
                xs={12}
              >
                <TextField
                  ref={discountRef}
                  label="Discount"
                  fullWidth
                  rules={[
                    validationRules.optionalInteger,
                    (value) => value <= getSelectedAmount() || "Discount cannot be greater than total selected amount."
                  ]}
                  onChange={(value) => {
                    value = validateInteger(value);
                    setDiscount(value);
                  }}
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={4}
                xs={12}
              >
                <TextField
                  disabled
                  label="Selected Grand Total"
                  fullWidth
                  value={numberFormat(getSelectedAmount() - (discount || 0))}
                />
              </Grid>

              <Grid
                item
                md={4}
                sm={4}
                xs={12}
              >
                <Select
                  ref={paymentChannelRef}
                  label="Payment Channel"
                  fullWidth
                  required
                  options={paymentChannels}
                  optionsLabel="name"
                  optionsValue="id"
                  value={paymentChannels.length ? (paymentChannel ? paymentChannel.id : "") : ""}
                  onChange={(value) => setPaymentChannel(paymentChannels.find((e) => e.id === value))}
                />
              </Grid>
            </Grid>
            {handleFeedback()}
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
              color="secondary"
              disableElevation
              onClick={() => console.log(true)}
            >
              Print Receipt
            </Button>
            <Button
              disabled={loading}
              variant="contained"
              disableElevation
              onClick={() => confirmSubmitMakePayment("Make Payment")}
            >
              Make Payment
            </Button>
          </Stack>
        </Card>
        : null
      }
      <Modal ref={modalRef}/>
    </Page>
  );
};

export default PendingPatientItems;
