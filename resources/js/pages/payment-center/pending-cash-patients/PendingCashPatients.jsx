import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Card, CardContent, Chip, Divider, Stack, Badge, Box } from "@mui/material";
import {
  SendRounded as SendIcon,
  VisibilityRounded as VisibilityIcon,
  Star as StarIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "../PatientFilters";
import ConfirmationDialog from "../../../components/ConfirmationDialog";

import { useFetch, usePatch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getAge, getWeekStartDate } from "../../../helpers";
import { useNotificationContext } from "../../../contexts/NotificationContext";

const PendingCashPatients = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();
  const { notifications, loading: notificationsLoading } = useNotificationContext();
  const [selectedItem, setSelectedItem] = useState(null);
  const { handlePatch, loading: sendingToOptician } = usePatch();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    item_status: "Pending,Served", // Include both pending and served items for billing
    item_transaction_type: "Cash",
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    start_date: undefined, // No date limit - show all pending patients
    end_date: undefined, // No date limit - show all pending patients
    // Include both pharmacy and glass items to match notification count
    include_optician_glass: true,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/patient-payment-cache",
    {
      ...params,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => {
      // Handle paginated response from Laravel
      // Response structure: { data: { data: [...], total: X, current_page: Y, ... }, message: "..." }
      const paginatedData = response?.data?.data || response?.data || {};
      
      // Debug logging
      console.log('PendingCashPatients API Response:', {
        fullResponse: response,
        responseData: response?.data,
        paginatedData: paginatedData,
        itemsArray: paginatedData?.data,
        total: paginatedData?.total,
      });
      
      // Ensure we return the correct structure
      const result = {
        data: paginatedData?.data || paginatedData || [],
        total: paginatedData?.total || 0,
        page: paginatedData?.current_page || paginatedData?.page || 1,
        per_page: paginatedData?.per_page || 25,
      };
      
      console.log('PendingCashPatients Parsed Result:', result);
      return result;
    }
  );

  useEffect(() => {
    document.title = `Cash Patients - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      console.error('PendingCashPatients Error:', error);
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  // Debug: Log data changes
  useEffect(() => {
    if (data) {
      console.log('PendingCashPatients Data Updated:', {
        itemsCount: data.data?.length || 0,
        total: data.total,
        page: data.page,
        hasData: !!data.data,
      });
    }
  }, [data]);

  // Refresh data when notifications change to ensure real-time updates
  useEffect(() => {
    if (notifications && !notificationsLoading && handleFetch) {
      // Small delay to avoid too frequent refreshes
      const timeoutId = setTimeout(() => {
        handleFetch();
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications?.patients_sent_to_cashier, notificationsLoading]);

  const handleSendToOptician = async (item) => {
    if (!item) {
      addToast({ message: "Invalid item selected", severity: "error" });
      return;
    }

    if (!modalRef.current) {
      addToast({ message: "Modal not initialized", severity: "error" });
      return;
    }

    setSelectedItem(item);

    // Check if consultation exists - could be on payment cache or directly on item
    const hasConsultation = item?.consultation?.id || item?.consultation_id;
    const consultationId = item?.consultation?.id || item?.consultation_id;
    
    const message = hasConsultation 
      ? "Are you sure you want to send this patient to the optician?"
      : "This patient has no consultation record. Do you want to create a consultation and send them to the optician?";

    const component = (
      <ConfirmationDialog
        message={message}
        onCancel={() => {
          if (modalRef.current) {
          modalRef.current.close();
          }
          setSelectedItem(null);
        }}
        onOk={async () => {
          if (modalRef.current) {
          modalRef.current.close();
          }
          try {
            if (hasConsultation && consultationId) {
              // Update existing consultation
              await handlePatch(`api/consultations/${consultationId}`, {
                send_to_optician: "Yes",
                require_glass: "Yes",
              });
            } else {
              // Create a new consultation for this patient
              const patientId = item.check_in?.patient_id;
              const paymentCacheId = item.id;
              
              if (!patientId || !paymentCacheId) {
                addToast({ 
                  message: "Missing required information. Patient ID or Payment Cache ID not found.", 
                  severity: "error" 
                });
                setSelectedItem(null);
                return;
              }
              
              // Create consultation via the consultations API
              const response = await window.axios.post('/api/consultations', {
                payment_cache_id: paymentCacheId,
                patient_id: patientId,
                send_to_optician: "Yes",
                require_glass: "Yes", // Assume they need glass if being sent to optician
                status: "Pending"
              });

              if (response.data && response.data.success === false) {
                throw new Error(response.data.message || 'Failed to create consultation');
              }
            }
            addToast({ message: "Patient sent to optician successfully", severity: "success" });
            
            // Trigger notification refresh for real-time updates
            if (window.notificationEvents && typeof window.notificationEvents.refresh === 'function') {
              window.notificationEvents.refresh();
            }
            
            handleFetch();
          } catch (err) {
            console.error('Error sending to optician:', err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || formatError(err);
            addToast({ message: errorMessage, severity: "error" });
          }
          setSelectedItem(null);
        }}
      />
    );

    if (modalRef.current) {
    modalRef.current.open("Send to Optician", component, "sm");
    } else {
      addToast({ message: "Modal not available", severity: "error" });
    }
  };


  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: "Cash Patients" },
      ]}
    >
      <Card>
        <PageHeader
          title="Cash Patients"
          subtitle={
            <Badge
              badgeContent={notifications && typeof notifications.patients_sent_to_cashier !== 'undefined' && notifications.patients_sent_to_cashier != null ? (Number(notifications.patients_sent_to_cashier) || 0) : 0}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  height: '20px',
                  minWidth: '20px',
                  padding: '0 6px',
                },
              }}
            >
              <span>{`${(data && typeof data.total === 'number') ? data.total : 0} pending`}</span>
            </Badge>
          }
        />
        <Divider />
        <CardContent>
          <Filters
            params={params}
            setParams={setParams}
            sx={{ mb: 2 }}
          />
          <Table
            loading={loading}
            columns={[
              {
                field: "index",
                headerName: "S/N",
                valueGetter: (item, index) =>
                  params.per_page * (params.page - 1) + index + 1,
              },
              {
                field: "full_name",
                headerName: "Patient Name",
                renderCell: (item) => {
                  const patient = item?.check_in?.patient;
                  const fullName = patient?.full_name || 'N/A';
                  const isVip = patient?.is_vip;
                  const isBusinessperson = patient?.is_businessperson;
                  
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <span>{fullName}</span>
                      {isVip === true && (
                        <Chip
                          icon={<StarIcon />}
                          label="Prestige"
                          color="warning"
                          size="small"
                        />
                      )}
                      {isBusinessperson === true && (
                        <Chip
                          icon={<BusinessIcon />}
                          label="Business"
                          color="info"
                          size="small"
                        />
                      )}
                    </Box>
                  );
                },
              },
              {
                field: "patient_id",
                headerName: "Patient Number",
                valueGetter: (item, index) => item?.check_in?.patient_id || 'N/A',
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item, index) =>
                  item?.check_in?.patient?.date_of_birth ? getAge(item.check_in.patient.date_of_birth) : 'N/A',
              },
              {
                field: "gender",
                headerName: "Gender",
                valueGetter: (item, index) => item?.check_in?.patient?.gender || 'N/A',
              },
              {
                field: "phone",
                headerName: "Phone Number",
                valueGetter: (item, index) => item?.check_in?.patient?.phone || 'N/A',
              },
              {
                field: "require_glass",
                headerName: "Spectacle Required",
                renderCell: (item) => {
                  const requireGlass = item.consultation?.require_glass;
                  if (requireGlass === 'Yes') {
                    return (
                      <Chip
                        label="Yes"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    );
                  }
                  return requireGlass === 'No' ? (
                    <Chip
                      label="No"
                      color="default"
                      size="small"
                    />
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>Not specified</span>
                  );
                },
              },
              {
                field: "created_by",
                headerName: "Sent By",
                valueGetter: (item, index) => item.creator?.full_name,
              },
              {
                field: "created_at",
                headerName: "Date Sent",
              },
              {
                field: "actions",
                headerName: "Actions",
                tableCellProps: {
                  sx: {
                    minWidth: { xs: 150, sm: 250 },
                    maxWidth: { xs: 200, sm: 'none' },
                  },
                },
                renderCell: (item) => {
                  // Check if any items are served (dispensed) - this determines the workflow
                  const hasServedItems = item.items?.some(it => it.status === 'Served');
                  const hasPendingItems = item.items?.some(it => it.status === 'Pending');

                  return (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 0.75, sm: 1 },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: { xs: 'flex-start', sm: 'flex-start' },
                        flexWrap: 'wrap',
                        width: '100%',
                        maxWidth: { xs: '100%', sm: 'none' },
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => {
                          const patientId = item.check_in?.patient_id;
                          const paymentCacheId = item.id;
                          if (patientId && paymentCacheId) {
                            navigate(`/payment-center/pending-cash-patients/${patientId}/${paymentCacheId}`);
                          }
                        }}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          minWidth: { xs: "100%", sm: 100 },
                          maxWidth: { xs: "100%", sm: 'none' },
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          px: { xs: 1.5, sm: 2 },
                          py: { xs: 0.75, sm: 0.5 },
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Manage
                      </Button>
                      {hasPendingItems && !hasServedItems && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          startIcon={<SendIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendToOptician(item);
                          }}
                          disabled={sendingToOptician || loading}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: { xs: "100%", sm: 140 },
                            maxWidth: { xs: "100%", sm: 'none' },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 0.75, sm: 0.5 },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Send to Optician
                        </Button>
                      )}
                      {hasServedItems && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => {
                            const patientId = item.check_in?.patient_id;
                            const paymentCacheId = item.id;
                            if (patientId && paymentCacheId) {
                              navigate(`/payment-center/pending-cash-patients/${patientId}/${paymentCacheId}`);
                            }
                          }}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: { xs: "100%", sm: 120 },
                            maxWidth: { xs: "100%", sm: 'none' },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 0.75, sm: 0.5 },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Bill Patient
                        </Button>
                      )}
                    </Box>
                  );
                },
              },
            ]}
            items={data.data}
            itemCount={data.total}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
            onPageSizeChange={(value) =>
              setParams({ ...params, per_page: value, page: 1 })
            }
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default PendingCashPatients;
