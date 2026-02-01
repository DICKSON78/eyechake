import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
import Table from "../../../components/Table";
import InvoicePDF from "./InvoicePDF";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, formatDate } from "../../../helpers";

const Invoices = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const {
    data: paymentsData,
    loading,
    error,
    handleFetch,
  } = useFetch(
    "api/patient-item-payments",
    {
      with_items: "Yes",
      with_patient: "Yes",
      per_page: perPage,
      page: page,
      sort_direction: "desc",
    },
    true,
    { data: [], total: 0 },
    (response) => {
      // Laravel paginate returns { data: [...], total: ..., current_page: ..., per_page: ... }
      // API wrapper adds another layer: response.data = { data: [...], total: ..., ... }
      const responseData = response?.data?.data;
      if (responseData) {
        return {
          data: responseData.data || [],
          total: responseData.total || 0,
        };
      }
      return { data: [], total: 0 };
    }
  );

  const payments = paymentsData?.data || [];
  const total = paymentsData?.total || 0;

  useEffect(() => {
    document.title = `Invoices - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleViewInvoice = (payment) => {
    if (!payment || !payment.id) {
      addToast({ message: "Invalid payment data", severity: "error" });
      return;
    }
    navigate(`/payment-center/invoice/${payment.id}`);
  };

  return (
    <Page
      title="Invoices"
      breadcrumbs={[
        { title: "Home" },
        { title: "Cashier" },
        { title: "Invoices" },
      ]}
    >
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ReceiptIcon color="primary" />
              <Typography variant="h5" fontWeight="bold">
                Patient Invoices
              </Typography>
            </Box>
          }
          subheader="View and download invoices for all patient payments"
        />
        <Table
          loading={loading}
          columns={[
            {
              field: "index",
              headerName: "S/N",
              valueGetter: (item, index) => index + 1,
            },
            {
              field: "invoice_number",
              headerName: "Invoice Number",
              valueGetter: (item) => item?.id ? `INV-${String(item.id).padStart(6, '0')}` : 'N/A',
            },
            {
              field: "patient_name",
              headerName: "Patient Name",
              valueGetter: (item) => {
                const patient = item.items?.[0]?.payment_cache?.check_in?.patient;
                return patient?.full_name || patient?.first_name + ' ' + (patient?.last_name || '') || 'N/A';
              },
            },
            {
              field: "patient_id",
              headerName: "Patient ID",
              valueGetter: (item) => {
                const patient = item.items?.[0]?.payment_cache?.check_in?.patient;
                return patient?.patient_id || patient?.id || 'N/A';
              },
            },
            {
              field: "amount",
              headerName: "Amount",
              valueGetter: (item) => numberFormat(item.amount || 0),
            },
            {
              field: "discount",
              headerName: "Discount",
              valueGetter: (item) => numberFormat(item.discount || 0),
            },
            {
              field: "total",
              headerName: "Total",
              valueGetter: (item) => {
                const total = Math.max(0, (item.amount || 0) - (item.discount || 0));
                return numberFormat(total);
              },
            },
            {
              field: "payment_mode",
              headerName: "Payment Mode",
              valueGetter: (item) => item.items?.[0]?.payment_mode?.name || 'N/A',
            },
            {
              field: "created_at",
              headerName: "Date",
              valueGetter: (item) => formatDate(item.created_at),
            },
            {
              field: "actions",
              headerName: "Actions",
              valueGetter: (item) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="View Invoice">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewInvoice(item)}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {item?.id && item.items?.[0]?.payment_cache?.check_in?.patient && (
                    <InvoicePDF
                      payment={item}
                      items={item.items || []}
                      patient={item.items[0].payment_cache.check_in.patient}
                      clinic={window?.user?.clinic}
                      size="small"
                    />
                  )}
                </Box>
              ),
            },
          ]}
          items={payments}
          itemCount={total}
          page={page}
          pageSize={perPage}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPerPage) => {
            setPerPage(newPerPage);
            setPage(1);
          }}
        />
      </Card>
    </Page>
  );
};

export default Invoices;

