import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Container,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
import InvoicePDF from "./InvoicePDF";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat } from "../../../helpers";

const Invoice = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();

  const [invoiceData, setInvoiceData] = useState(null);
  const [patientFallbackData, setPatientFallbackData] = useState(null);

  useEffect(() => {
    document.title = `Invoice - ${window.APP_NAME}`;
  }, []);

  const {
    data: paymentData,
    loading: loadingPayment,
    error: paymentError,
    handleFetch: refetchPayment,
  } = useFetch(
    paymentId ? `api/patient-item-payments/${paymentId}` : null,
    {
      with_items: "Yes",
      with_patient: "Yes",
    },
    !!paymentId,
    null,
    (response) => {
      try {
        console.log("Raw API response:", response);
        const data = response?.data?.data || response?.data;
        
        if (!data) {
          console.error("No data in response:", response);
          return null;
        }
        
        if (!data.id) {
          console.error("Invalid payment data structure - missing id:", data);
          return null;
        }
        
        // Validate that we have at least some items or first_item
        if (!data.items && !data.first_item) {
          console.warn("Payment data missing items and first_item:", data);
        }
        
        console.log("Processed payment data:", data);
        return data;
      } catch (error) {
        console.error("Error processing payment response:", error);
        return null;
      }
    }
  );

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!paymentData) {
        console.log("No payment data available yet");
        return;
      }

      try {
        console.log("Processing invoice data:", paymentData);

        if (!paymentData || !paymentData.id) {
          console.error("Payment data missing or missing id:", paymentData);
          addToast({ message: "Invalid payment data: missing ID", severity: "error" });
          return;
        }

        const items = paymentData.items || [];
        console.log("Invoice items:", items);

        // Improved patient data extraction with multiple fallback methods
        let patient = null;

        // Method 1: Direct patient relationship on payment
        if (paymentData.patient) {
          patient = paymentData.patient;
          console.log("Patient found via direct relationship:", patient);
        }
        // Method 2: Through first_item relationship
        else if (paymentData.first_item?.payment_cache?.check_in?.patient) {
          patient = paymentData.first_item?.payment_cache?.check_in?.patient;
          console.log("Patient found via first_item relationship:", patient);
        }
        // Method 3: Through items array
        else if (items && items.length > 0) {
          // Try each item until we find patient data
          for (const item of items) {
            if (item?.payment_cache?.check_in?.patient) {
              patient = item.payment_cache.check_in.patient;
              console.log("Patient found via item payment_cache:", patient);
              break;
            }
          }
        }

        if (!patient) {
          console.warn("No patient data found, checking alternative paths...");
          // Additional fallback: check if patient data is embedded in any item
          if (items && items.length > 0) {
            const firstItem = items[0];
            console.log("First item structure:", firstItem);

            // Check for alternative patient paths
            if (firstItem?.patient) {
              patient = firstItem.patient;
              console.log("Patient found in item.patient:", patient);
            }
            // Try to get patient from payment_cache relationship if available
            else if (firstItem?.payment_cache?.check_in?.patient) {
              patient = firstItem.payment_cache.check_in.patient;
              console.log("Patient found via alternative payment_cache path:", patient);
            }
          }
        }

        // Fallback: Try to fetch patient data separately if still not found
        if (!patient && items.length > 0) {
          try {
            console.log("Attempting to fetch patient data via fallback API call...");
            // Try to get patient ID from any available source
            let patientId = null;

            // Check items for patient ID
            for (const item of items) {
              if (item?.payment_cache?.check_in?.patient_id) {
                patientId = item.payment_cache.check_in.patient_id;
                break;
              }
            }

            if (patientId) {
              console.log("Found patient ID for fallback fetch:", patientId);
              // In a real implementation, you might want to add a fallback API call here
              // For now, we'll just log that we found the ID
            }
          } catch (fallbackError) {
            console.warn("Fallback patient fetch failed:", fallbackError);
          }
        }

        console.log("Final patient data:", patient);

        if (!items.length) {
          console.error("No items found for payment:", paymentData.id);
          addToast({ message: "No items found for this payment. The invoice cannot be generated.", severity: "error" });
          return;
        }

        // Validate item data structure and provide detailed logging
        const validatedItems = items.map((item, index) => {
          console.log(`Validating item ${index}:`, item);

          if (!item) {
            console.warn(`Item ${index} is null/undefined - skipping`);
            return null;
          }

          // Check for required fields and provide defaults
          const validatedItem = {
            ...item,
            unit_price: Number(item.unit_price) || 0,
            quantity: Number(item.quantity) || 1,
            item: item.item || { name: item.name || 'Unknown Item', id: item.item_id || 'N/A' },
            payment_mode: item.payment_mode || { name: item.payment_mode_name || 'Unknown' },
          };

          // Validate that we have essential data
          if (validatedItem.unit_price <= 0) {
            console.warn(`Item ${index} has invalid unit_price:`, validatedItem.unit_price);
          }
          if (validatedItem.quantity <= 0) {
            console.warn(`Item ${index} has invalid quantity:`, validatedItem.quantity);
          }

          return validatedItem;
        }).filter(item => item !== null);

        console.log("Validated items:", validatedItems);

        if (validatedItems.length === 0) {
          console.error("All items were invalid after validation");
          addToast({ message: "All items in this payment are invalid. Cannot generate invoice.", severity: "error" });
          return;
        }

        // Check if we have patient data - this is critical for invoices
        if (!patient || (!patient.id && !patient.patient_id)) {
          console.warn("No patient data found for invoice generation, using fallback");
          // Still create the invoice data but with a warning - don't show error as it might be recoverable
          if (!patient) {
            console.warn("Patient object is null/undefined, creating fallback");
            // Create a minimal fallback patient object
            patient = {
              full_name: 'Unknown Patient',
              first_name: 'Unknown',
              last_name: 'Patient',
              id: null,
              patient_id: null,
              phone: null,
              email: null,
              address: null
            };
          }
        }

        // Safely get clinic data
        let clinicData = null;
        try {
          if (window?.user?.clinic) {
            clinicData = window.user.clinic;
          }
        } catch (e) {
          console.warn('Failed to access window.user.clinic:', e);
        }

        // Ensure payment data has an id
        if (!paymentData || !paymentData.id) {
          console.error("Payment data is missing or missing id:", paymentData);
          addToast({ message: "Invalid payment data: Payment ID is required", severity: "error" });
          return;
        }

        // Ensure patient is always an object, never null
        const finalPatient = patient || { 
          full_name: 'Unknown Patient', 
          first_name: 'Unknown',
          last_name: 'Patient',
          id: null, 
          patient_id: null,
          phone: null, 
          email: null,
          address: null
        };

        const invoiceDataObj = {
          payment: paymentData,
          items: validatedItems,
          patient: finalPatient,
          clinic: clinicData || null,
        };

        console.log("Final invoice data object:", invoiceDataObj);
        setInvoiceData(invoiceDataObj);

      } catch (error) {
        console.error("Error processing invoice data:", error);
        console.error("Error stack:", error.stack);
        addToast({
          message: `Failed to process invoice data: ${error.message}`,
          severity: "error"
        });
      }
    };

    if (paymentData && paymentData.id) {
      fetchInvoiceData();
    }
  }, [paymentData, addToast]);

  useEffect(() => {
    if (paymentError) {
      const errorMessage = formatError(paymentError);
      addToast({ 
        message: errorMessage || "Failed to load invoice. Please try again.", 
        severity: "error" 
      });
      console.error("Invoice loading error:", paymentError);
    }
  }, [paymentError, addToast]);

  const invoiceNumber = invoiceData?.payment?.id
    ? `PFI-${String(invoiceData.payment.id).padStart(6, '0')}`
    : 'N/A';

  const invoiceDate = invoiceData?.payment?.created_at
    ? new Date(invoiceData.payment?.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  const getSubtotal = () => {
    if (!invoiceData?.items) return 0;
    return invoiceData.items.reduce(
      (acc, item) => acc + (Number(item.unit_price) || 0) * (Number(item.quantity) || 0),
      0
    );
  };

  const subtotal = getSubtotal();
  const discount = Math.max(0, Number(invoiceData?.payment?.discount) || 0);
  const calculatedAmount = Number(invoiceData?.payment?.amount) && Number(invoiceData?.payment?.amount) > 0
    ? Number(invoiceData?.payment?.amount)
    : subtotal;
  const grandTotal = Math.max(0, calculatedAmount - discount);

  if (loadingPayment) {
    return (
      <Page
        title="Invoice"
        breadcrumbs={[
          { title: "Home" },
          { title: "Cashier" },
          { title: "Invoice" },
        ]}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "50vh", gap: 2 }}>
              <LinearProgress sx={{ width: "50%" }} />
              <Typography variant="body2" color="text.secondary">
                Loading invoice...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Page>
    );
  }

  if (paymentError && !invoiceData) {
    return (
      <Page
        title="Invoice"
        breadcrumbs={[
          { title: "Home" },
          { title: "Cashier" },
          { title: "Invoice" },
        ]}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "50vh", gap: 2 }}>
              <Typography variant="h6" color="error">
                Failed to load invoice
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatError(paymentError) || "Invoice not found or an error occurred."}
              </Typography>
              <Button
                variant="contained"
                onClick={() => refetchPayment()}
                sx={{ mt: 2 }}
              >
                Retry
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Page>
    );
  }

  if (!invoiceData || !invoiceData.payment || !invoiceData.payment.id) {
    return (
      <Page
        title="Invoice"
        breadcrumbs={[
          { title: "Home" },
          { title: "Cashier" },
          { title: "Invoice" },
        ]}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "50vh", gap: 2 }}>
              <Typography variant="h6" color="error">
                Invalid Invoice Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {!invoiceData 
                  ? "No invoice data available. The payment may not exist or may have been deleted."
                  : !invoiceData.payment 
                    ? "Payment information is missing."
                    : "Payment ID is missing. Cannot generate invoice."}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(-1)}
                sx={{ mt: 2 }}
              >
                Go Back
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Page>
    );
  }


  return (
    <Page
      title="Invoice"
      breadcrumbs={[
        { title: "Home" },
        { title: "Cashier" },
        { title: "Invoice" },
      ]}
    >
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
              color: 'white',
              p: { xs: 2.5, sm: 3, md: 4 },
              boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} flexWrap="wrap">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(-1)}
                  variant="outlined"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  Back
                </Button>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <ReceiptIcon sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                      Invoice {invoiceNumber}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                      {invoiceDate}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
              {invoiceData?.payment?.id && invoiceData?.items && invoiceData.items.length > 0 && (
                <InvoicePDF
                  payment={invoiceData.payment}
                  items={invoiceData.items || []}
                  patient={invoiceData.patient || { 
                    full_name: 'Unknown Patient', 
                    first_name: 'Unknown',
                    last_name: 'Patient'
                  }}
                  clinic={invoiceData.clinic}
                />
              )}
            </Stack>
          </Box>

          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Clinic Information */}
            {invoiceData.clinic && invoiceData.clinic.name && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  mb: 4,
                  bgcolor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                  <BusinessIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {invoiceData.clinic.name || 'Clinic Information'}
                  </Typography>
                </Stack>
                <Grid container spacing={2}>
                  {invoiceData.clinic.address && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <LocationIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.5 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            Address
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {invoiceData.clinic.address}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  )}
                  {invoiceData.clinic.phone && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.5 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            Phone
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {invoiceData.clinic.phone}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  )}
                  {invoiceData.clinic.email && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <EmailIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.5 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            Email
                          </Typography>
                          <Typography variant="body2" fontWeight="500">
                            {invoiceData.clinic.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}

            {/* Patient and Invoice Details */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Patient Information */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    height: '100%',
                    bgcolor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      Bill To
                    </Typography>
                  </Stack>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                        {invoiceData.patient?.full_name || 
                         (invoiceData.patient?.first_name || invoiceData.patient?.last_name 
                           ? `${invoiceData.patient?.first_name || ''} ${invoiceData.patient?.last_name || ''}`.trim() 
                           : null) || 
                         'Unknown Patient'}
                      </Typography>
                      {(invoiceData.patient?.patient_id || invoiceData.patient?.id) && (
                        <Chip
                          label={`ID: ${invoiceData.patient?.patient_id || invoiceData.patient?.id || 'N/A'}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      )}
                    </Box>
                    {invoiceData.patient?.phone && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Phone
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {invoiceData.patient?.phone}
                        </Typography>
                      </Box>
                    )}
                    {invoiceData.patient?.email && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Email
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {invoiceData.patient?.email}
                        </Typography>
                      </Box>
                    )}
                    {invoiceData.patient?.address && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Address
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {invoiceData.patient?.address}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Grid>

              {/* Invoice Details */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    height: '100%',
                    bgcolor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                    <ReceiptIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      Invoice Details
                    </Typography>
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Invoice Number
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {invoiceNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Invoice Date
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {invoiceDate}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Payment Mode
                      </Typography>
                      <Chip 
                        label={invoiceData.items?.[0]?.payment_mode?.name || invoiceData.payment?.channel?.name || 'N/A'} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </Grid>
                    {invoiceData.payment?.channel?.name && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Payment Channel
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {invoiceData.payment?.channel?.name || 'N/A'}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Processed By
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {invoiceData.payment?.creator?.full_name || invoiceData.payment?.creator?.name || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            {/* Items Table */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                sx={{ 
                  mb: 2.5, 
                  color: 'text.primary',
                  fontSize: '1.25rem',
                  letterSpacing: '0.5px',
                }}
              >
                Items & Services
              </Typography>
              <TableContainer 
                component={Paper}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow 
                      sx={{ 
                        backgroundColor: '#f5f7fa',
                        borderBottom: '2px solid',
                        borderBottomColor: '#e0e0e0',
                        '& .MuiTableCell-head': {
                          color: '#1565C0',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          py: 2.5,
                          px: 2,
                          letterSpacing: '0.3px',
                          textTransform: 'uppercase',
                          borderRight: '1px solid',
                          borderRightColor: '#e0e0e0',
                          '&:last-child': {
                            borderRight: 'none',
                          },
                        },
                      }}
                    >
                      <TableCell>#</TableCell>
                      <TableCell>Item & Description</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(invoiceData.items || []).map((item, index) => {
                      if (!item || (!item.item && !item.name)) {
                        console.warn(`Skipping invalid item at index ${index}:`, item);
                        return null;
                      }
                      const itemName = item?.item?.name || item?.name || 'N/A';
                      const quantity = Number(item?.quantity) || 0;
                      const rate = Number(item?.unit_price) || 0;
                      const amount = quantity * rate;

                      return (
                        <TableRow 
                          key={item?.id || `item-${index}`}
                          sx={{ 
                            '&:nth-of-type(even)': { 
                              backgroundColor: '#fafbfc',
                            },
                            '&:hover': {
                              backgroundColor: '#f0f4f8',
                              transition: 'background-color 0.2s ease',
                            },
                            '& .MuiTableCell-root': {
                              borderColor: '#e8eaf0',
                              py: 2.5,
                              px: 2,
                            },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="600" color="text.primary">
                              {index + 1}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ mb: 0.5 }}>
                              {itemName}
                            </Typography>
                            {(item?.item?.unit_of_measure?.name || item?.unit_of_measure?.name) && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Unit: {item?.item?.unit_of_measure?.name || item?.unit_of_measure?.name}
                              </Typography>
                            )}
                            {item?.comments && (
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                Note: {item.comments}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="text.primary" fontWeight="500">
                              {quantity.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.primary" fontWeight="500">
                              {numberFormat(rate)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.primary" fontWeight="600">
                              {numberFormat(amount)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Payment Summary */}
            <Grid container justifyContent="flex-end">
              <Grid item xs={12} sm={8} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    bgcolor: '#f8f9fa',
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 16px rgba(25, 118, 210, 0.15)',
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'primary.main' }}>
                    Payment Summary
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" color="text.secondary" fontWeight="500">
                        Sub Total:
                      </Typography>
                      <Typography variant="body1" fontWeight="700" color="text.primary">
                        {numberFormat(subtotal)} TZS
                      </Typography>
                    </Box>
                    {discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" color="text.secondary" fontWeight="500">
                          Discount:
                        </Typography>
                        <Typography variant="body1" fontWeight="700" color="error.main">
                          -{numberFormat(discount)} TZS
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2.5,
                        backgroundColor: '#1E88E5',
                        borderRadius: 2,
                        color: 'white',
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        Total Amount:
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {numberFormat(grandTotal)} TZS
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Page>
  );
};

export default Invoice;
