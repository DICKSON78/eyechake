import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  Skeleton,
  Box,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  SendRounded as SendToCashierIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import PatientDetails from "../../reception/patients/PatientDetails";
import Table from "../../../components/Table";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat } from "../../../helpers";

const SalesPatientItems = () => {
  const { patientId, paymentCacheId } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const [loadingPatient, setLoadingPatient] = useState(true);

  const {
    data: paymentCache,
    loading: loadingCache,
    error,
    handleFetch,
  } = useFetch(
    paymentCacheId ? `api/patient-payment-cache/${paymentCacheId}` : null,
    null,
    !!paymentCacheId,
    null,
    (response) => {
      const raw = response?.data?.data ?? response?.data;
      return raw ?? null;
    }
  );

  const patient = paymentCache?.check_in?.patient;
  const items = paymentCache?.items ?? [];

  useEffect(() => {
    document.title = `Manage Patient - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleBack = () => {
    navigate("/sales-management/patients-sent-to-sales");
  };

  // Check if there are any unpaid items
  const hasUnpaidItems = items.some(item => 
    item?.status === 'Pending' || item?.status === 'Billed'
  );

  // Check if patient has glass items (needs to go to optician)
  const hasGlassItems = items.some(item => 
    item?.consultation_type?.name === 'Glass'
  );

  const handleSendToCashier = () => {
    navigate(`/payment-center/pending-cash-patients/${patientId}/${paymentCacheId}`);
  };

  const handleSendToOptician = () => {
    // Navigate to optician center - patient is ready for dispensing
    navigate(`/optician-center/glass-patients`);
    addToast({ message: 'Patient sent to optician for dispensing', severity: 'success' });
  };

  if (!paymentCacheId) {
    return (
      <Page
        title="Manage Patient"
        breadcrumbs={[
          { title: "Home" },
          { title: "Sales Table" },
          { title: "Patients Sent to Sales" },
          { title: "Manage" },
        ]}
      >
        <Card>
          <CardContent>
            <Typography color="text.secondary">Missing payment cache. Please go back and try again.</Typography>
            <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
              Back to list
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Sales Table" },
        { title: "Patients Sent to Sales", onClick: handleBack },
        { title: patient ? (patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`).trim() || "Manage" : "Manage" },
      ]}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Button startIcon={<BackIcon />} onClick={handleBack} variant="outlined">
          Back to list
        </Button>
        <Stack direction="row" spacing={2}>
          {/* Show appropriate button based on payment status */}
          {hasUnpaidItems ? (
            <Button
              variant="contained"
              startIcon={<SendToCashierIcon />}
              onClick={handleSendToCashier}
              disabled={loadingCache || !paymentCache}
            >
              Send to Cashier
            </Button>
          ) : hasGlassItems ? (
            <Button
              variant="contained"
              color="success"
              startIcon={<SendToCashierIcon />}
              onClick={handleSendToOptician}
              disabled={loadingCache || !paymentCache}
            >
              Send to Optician
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<SendToCashierIcon />}
              onClick={handleSendToCashier}
              disabled={loadingCache || !paymentCache}
            >
              Complete
            </Button>
          )}
        </Stack>
      </Stack>

      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={() => {}}
      />

      {loadingPatient ? (
        <Skeleton variant="rounded" height={120} sx={{ mt: 2 }} />
      ) : null}

      <Card sx={{ mt: 2 }}>
        <PageHeader
          title="Items in this visit"
          subtitle={paymentCache ? `${items.length} item(s)` : "Loading…"}
        />
        <Divider />
        <CardContent>
          {loadingCache && !paymentCache ? (
            <Skeleton variant="rounded" height={200} />
          ) : error && !paymentCache ? (
            <Typography color="error">Failed to load items. {formatError(error)}</Typography>
          ) : !Array.isArray(items) || items.length === 0 ? (
            <Typography color="text.secondary">No items in this visit.</Typography>
          ) : (
            <Table
              loading={false}
              columns={[
                {
                  field: "index",
                  headerName: "S/N",
                  valueGetter: (item, index) => index + 1,
                },
                {
                  field: "item_name",
                  headerName: "Item",
                  valueGetter: (item) => item?.item?.name ?? "—",
                },
                {
                  field: "payment_mode",
                  headerName: "Payment Mode",
                  valueGetter: (item) => item?.payment_mode?.name ?? "—",
                },
                {
                  field: "unit_price",
                  headerName: "Unit Price",
                  valueGetter: (item) => numberFormat(item?.unit_price ?? 0),
                },
                {
                  field: "quantity",
                  headerName: "Qty",
                  valueGetter: (item) => numberFormat(item?.quantity ?? 0),
                },
                {
                  field: "subtotal",
                  headerName: "Subtotal",
                  valueGetter: (item) =>
                    numberFormat((item?.unit_price ?? 0) * (item?.quantity ?? 0)),
                },
                {
                  field: "status",
                  headerName: "Status",
                  valueGetter: (item) => item?.status ?? "—",
                },
              ]}
              items={items}
              itemCount={items.length}
              page={1}
              pageSize={items.length || 25}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
              hidePaginationFooter
            />
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default SalesPatientItems;
