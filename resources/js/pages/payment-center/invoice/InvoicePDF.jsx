import React, { useCallback, useState } from "react";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/DownloadRounded";
import { Document, Font, Page, pdf } from "@react-pdf/renderer";

// Use system fonts as fallback to avoid font loading issues
const fontRegular = "Helvetica";
const fontItalic = "Helvetica-Oblique";
const fontBold = "Helvetica-Bold";

import Header from "../../../components/pdf/Header";
import Descriptions from "../../../components/pdf/Descriptions";
import Table from "../../../components/pdf/Table";
import { numberFormat } from "../../../helpers";

// Register fonts with system fonts to avoid loading issues
Font.register({
  family: "Custom",
  fonts: [
    { src: fontRegular },
    { src: fontItalic, fontStyle: "italic" },
    { src: fontBold, fontWeight: 700 },
  ],
});

const PDFReportDocument = ({ payment, items, patient }) => {
  if (!payment || !payment.id) {
    return null;
  }

  const getTotalAmount = () => {
    if (!items || items.length === 0) return 0;
    return items.reduce(
      (acc, e) => acc + (Number(e.unit_price) || 0) * (Number(e.quantity) || 0),
      0
    );
  };

  const subtotal = getTotalAmount();
  const discount = Number(payment.discount) || 0;
  const calculatedAmount = Number(payment.amount) && Number(payment.amount) > 0 
    ? Number(payment.amount) 
    : subtotal;
  const grandTotal = Math.max(0, calculatedAmount - discount);

  const invoiceNumber = `PFI-${String(payment.id).padStart(6, '0')}`;
  const invoiceDate = payment.created_at 
    ? new Date(payment.created_at).toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : new Date().toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });

  const patientName = patient?.full_name || 
    (patient?.first_name && patient?.last_name ? `${patient.first_name} ${patient.last_name}` : '') ||
    patient?.first_name ||
    'N/A';

  return (
    <Document
      title="Proforma Invoice"
      creator={window.APP_NAME}
      producer={window.APP_NAME}
    >
      <Page
        size={[300]}
        style={{
          width: "100%",
          backgroundColor: "white",
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 18,
        }}
        orientation="portrait"
      >
        <Header
          title="Proforma Invoice"
          dense
        />

        <Descriptions
          columns={2}
          vertical
          items={[
            { label: "Customer Name", value: patientName },
            { label: "Invoice Number", value: invoiceNumber },
            { label: "Invoice Date", value: invoiceDate },
            { label: "Invoice Amount", value: numberFormat(calculatedAmount) },
            { label: "Discount", value: numberFormat(discount) },
            { label: "Created By", value: payment.creator?.full_name || 'N/A' },
            { label: "Date Created", value: payment.created_at || 'N/A' },
          ]}
          containerStyle={{ marginBottom: 8 }}
        />

        <Table
          containerStyle={{ marginBottom: 12 }}
          columns={[
            {
              field: "index",
              headerName: "S/N",
              valueGetter: (item, index) => index + 1,
              style: { flex: 0.35 },
            },
            {
              field: "item_id",
              headerName: "Item Name",
              valueGetter: (item, index) => item?.item?.name || 'N/A',
              style: { flex: 2 },
            },
            {
              field: "quantity",
              headerName: "Quantity",
              valueGetter: (item, index) => numberFormat(Number(item.quantity) || 0),
            },
            {
              field: "unit_price",
              headerName: "Unit Price",
              valueGetter: (item, index) => numberFormat(Number(item.unit_price) || 0),
            },
            {
              field: "total_price",
              headerName: "Subtotal",
              valueGetter: (item, index) => {
                const qty = Number(item.quantity) || 0;
                const price = Number(item.unit_price) || 0;
                return numberFormat(qty * price);
              },
            },
          ]}
          items={items || []}
          footerItems={[
            [
              { value: "SUB TOTAL", style: { flex: 0.786 } },
              { value: numberFormat(subtotal), style: { flex: 0.214 } },
            ],
            discount > 0 ? [
              { value: "DISCOUNT", style: { flex: 0.786 } },
              { value: `-${numberFormat(discount)}`, style: { flex: 0.214 } },
            ] : null,
            [
              { value: "GRAND TOTAL", style: { flex: 0.786 } },
              { value: numberFormat(grandTotal), style: { flex: 0.214 } },
            ],
          ].filter(Boolean)}
        />

        <Descriptions
          columns={1}
          items={[
            {
              label: "GRAND TOTAL",
              value: numberFormat(grandTotal),
            },
          ]}
          valueStyle={{ fontWeight: "bold" }}
        />
      </Page>
    </Document>
  );
};

const InvoicePDF = ({ payment, items, patient, clinic, size = "medium" }) => {
  const [loading, setLoading] = useState(false);

  const generatePDF = useCallback(async () => {
    if (!payment || !payment.id) {
      alert("Invoice data is incomplete: Payment ID is missing");
      return;
    }

    if (!items || items.length === 0) {
      alert("Invoice data is incomplete: No items found");
      return;
    }

    if (!patient) {
      alert("Invoice data is incomplete: Patient information is missing");
      return;
    }

    setLoading(true);
    try {
      const pdfDocument = (
        <PDFReportDocument
          payment={payment}
          items={items}
          patient={patient}
        />
      );

      const blob = await pdf(pdfDocument).toBlob();

      if (!blob || blob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const invoiceNumber = `PFI-${String(payment.id).padStart(6, '0')}`;
      const patientName = patient?.full_name || patient?.first_name || "patient";
      link.download = `invoice-${invoiceNumber}-${patientName}-${new Date()
        .toISOString()
        .split("T")[0]}.pdf`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert(`Failed to generate invoice PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [payment, items, patient]);

  return (
    <Button
      disabled={loading || !payment || !payment.id || !items || !patient}
      variant="contained"
      color="primary"
      size={size}
      startIcon={<DownloadIcon />}
      onClick={generatePDF}
    >
      {loading ? "Generating..." : "Download Invoice"}
    </Button>
  );
};

export default InvoicePDF;
