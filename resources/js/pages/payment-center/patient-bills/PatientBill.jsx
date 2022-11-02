import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Alert, Button, Card, CardContent, CardHeader, Divider, LinearProgress, Skeleton, Stack } from "@mui/material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Table from "../../../components/Table";
import PatientDetails from "../../reception/patients/PatientDetails";
import Descriptions from "../../../components/Descriptions";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import PatientBillPayments from "./PatientBillPayments";

import { capitalize, formatError, getNonNull, numberFormat } from "../../../helpers";
import { useFetch, usePatch } from "../../../hooks";


const PatientBill = () => {

  const navigate = useNavigate();
  const { status, patientId, billId } = useParams();

  const modalRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();
  const [error, setError] = useState();

  const { data: bill, loading: loadingBill, error: errorFetchBill, handleFetch: fetchBill } = useFetch(`api/patient-item-bills/${billId}`, null, true, null, (response) => response.data.data);
  const { data, loading, error: errorClearBill, handlePatch } = usePatch(`api/patient-item-bills/${billId}/clear`);

  const {
    data: items,
    setData: setItems,
    loading: loadingItems,
    handleFetch: fetchItems
  } = useFetch("api/patient-payment-cache-items", {
    per_page: 500,
    bill_id: billId
  }, false, [], (response) => response.data.data.data);

  useEffect(() => {
    if (!patientId || !billId) {
      return navigate(`/payment-center/patient-bills/${(status || "pending")}`);
    }

    document.title = `Patient Bill - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (patient && bill) {
      fetchItems();
    }
  }, [patient, bill]);

  useEffect(() => {
    if (data) {
      fetchBill();
    }
  }, [data]);

  useEffect(() => {
    if (errorFetchBill) {
      setError(errorFetchBill);
    }
  }, [errorFetchBill]);

  useEffect(() => {
    if (errorClearBill) {
      setError(errorClearBill);
    }
  }, [errorClearBill]);

  const showBillPaymentsModal = () => {
    let component = (
      <PatientBillPayments
        bill={bill}
        modal={modalRef.current}
        fetchBill={fetchBill}
      />
    );

    modalRef.current.open("Bill Payments", component, "lg");
  };

  const confirmClearBill = () => {
    setError(null);

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handlePatch();
        }}
      />
    );

    modalRef.current.open("Clear Bill", component, "sm");
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

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Bill Room" },
        { title: `${capitalize(status)} Patient Bills` },
        { title: patientId },
      ]}
    >
      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={(responseData) => setPatient(responseData)}
      />

      {loadingPatient || loadingBill ?
        <Skeleton
          variant="rounded"
          height={256}
        />
        : null
      }

      {patient && bill ?
        <Card>
          <PageHeader
            title="Patient Bill"
            trailing={
              <Button
                variant="contained"
                color="secondary"
                disableElevation
                onClick={() => console.log(true)}
              >
                PDF
              </Button>
            }
          />
          <Divider />
          <CardContent>
            <Descriptions
              columns={4}
              items={[
                { label: "Bill Number", value: bill.id },
                { label: "Bill Amount", value: numberFormat(bill.amount) },
                { label: "Discount", value: numberFormat(bill.discount) },
                { label: "Amount Paid", value: numberFormat(bill.amount_paid || 0) },
                { label: "Created By", value: getNonNull(bill.creator).full_name },
                { label: "Date Created", value: bill.created_at },
                { label: "Bill Status", value: bill.status },
                { label: "Cleared By", value: getNonNull(bill.clearer).full_name },
                { label: "Date Cleared", value: bill.cleared_at },
              ]}
              containerProps={{
                variant: "outlined",
                sx: {
                  mb: 2,
                  p: 2,
                }
              }}
              itemSpacing={1}
            />
            <Card variant="outlined">
              <CardHeader
                title="Bill Items"
                titleTypographyProps={{
                  variant: "subtitle1"
                }}
              />
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
                      valueGetter: (item, index) => item.item.name,
                    },
                    {
                      field: "payment_mode_id",
                      headerName: "Payment Mode",
                      valueGetter: (item, index) => item.payment_mode.name,
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
                  footerItems={[
                    [
                      {
                        value: "Total",
                        tableCellProps: { colSpan: 5 },
                      },
                      {
                        value: numberFormat(getTotalAmount() || 0),
                      }
                    ]
                  ]}
                />
              </CardContent>
            </Card>
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
              variant="contained"
              color="success"
              disableElevation
              onClick={showBillPaymentsModal}
            >
              Bill Payments
            </Button>
            {bill.status === "Pending" ?
              <Button
                disabled={loading}
                variant="contained"
                color="primary"
                disableElevation
                onClick={confirmClearBill}
              >
                Clear Bill
              </Button>
              : null
            }
          </Stack>
        </Card>
        : null
      }
      <Modal ref={modalRef}/>
    </Page>
  );
};

export default PatientBill;
