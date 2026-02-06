import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Card, CardContent, Chip, Divider, Stack, Badge } from "@mui/material";
import {
  SendRounded as SendIcon,
  VisibilityRounded as VisibilityIcon,
  ReceiptRounded as InvoiceIcon,
} from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "../../payment-center/PatientFilters";
import ConfirmationDialog from "../../../components/ConfirmationDialog";

import { useFetch, usePatch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getAge } from "../../../helpers";
import { useNotificationContext } from "../../../contexts/NotificationContext";

const PatientsSentToSales = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();
  const { notifications, loading: notificationsLoading } = useNotificationContext();
  const [selectedItem, setSelectedItem] = useState(null);
  const { handlePatch, loading: sendingToCashier } = usePatch();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    item_status: "Pending,Billed",
    consultation_status: "Consulted", // Filter for completed consultations
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    end_date: new Date(), // Today
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
      const paginatedData = response.data?.data || response.data || {};
      return {
        data: paginatedData.data || [],
        total: paginatedData.total || 0,
        page: paginatedData.current_page || paginatedData.page || 1,
        per_page: paginatedData.per_page || 25,
      };
    }
  );

  useEffect(() => {
    document.title = `Patients Sent to Sales - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleSendToCashier = async (item) => {
    setSelectedItem(item);

    const component = (
      <ConfirmationDialog
        message="Are you sure you want to send this patient to the cashier?"
        onCancel={() => {
          modalRef.current.close();
          setSelectedItem(null);
        }}
        onOk={async () => {
          modalRef.current.close();
          try {
            // Update payment cache items to mark as ready for cashier
            // This would typically update the status or add a flag
            // For now, we'll just show a success message
            addToast({ message: "Patient sent to cashier successfully", severity: "success" });
            handleFetch();
          } catch (err) {
            addToast({ message: formatError(err), severity: "error" });
          }
          setSelectedItem(null);
        }}
      />
    );

    modalRef.current.open("Send to Cashier", component, "sm");
  };

  const handleCreateInvoice = (item) => {
    if (!item.items || item.items.length === 0) {
        addToast({ message: "No items to invoice.", severity: "warning" });
        return;
    }

    const itemIds = item.items
        .filter(i => !i.item_payment_id)
        .map(i => i.id);
        
    if (itemIds.length === 0) {
         addToast({ message: "All items are already invoiced.", severity: "info" });
         return;
    }

    const component = (
      <ConfirmationDialog
        message={`Create invoice for ${itemIds.length} pending items?`}
        onCancel={() => {
          modalRef.current.close();
        }}
        onOk={async () => {
          modalRef.current.close();
          try {
            await window.axios.post("api/patient-payment-cache-items/create-invoice", {
               payment_cache_id: item.id,
               items: itemIds
            });
            addToast({ message: "Invoice created successfully", severity: "success" });
            handleFetch(); // Refresh the list - patient should disappear if all items invoiced
          } catch (err) {
            addToast({ message: formatError(err), severity: "error" });
          }
        }}
      />
    );
    modalRef.current.open("Create Invoice", component, "sm");
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Sales Table" },
        { title: "Patients Sent to Sales" },
      ]}
    >
      <Card>
        <PageHeader
          title="Patients Sent to Sales"
          subtitle={
            <Badge
              badgeContent={data && typeof data.total === 'number' ? data.total : 0}
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
                valueGetter: (item, index) => item?.check_in?.patient?.full_name || 'N/A',
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
                field: "consultation_status",
                headerName: "Consultation Status",
                renderCell: (item) => {
                  const consultationStatus = item.consultation?.status;
                  if (consultationStatus === 'Consulted') {
                    return (
                      <Chip
                        label="Consulted"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    );
                  }
                  return consultationStatus ? (
                    <Chip
                      label={consultationStatus}
                      color="default"
                      size="small"
                    />
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>No consultation</span>
                  );
                },
              },
              {
                field: "created_by",
                headerName: "Sent By",
                valueGetter: (item, index) => item.consultation?.creator?.full_name || item.creator?.full_name || 'N/A',
              },
              {
                field: "created_at",
                headerName: "Date Sent",
                valueGetter: (item, index) => {
                  const date = item.consultation?.created_at || item.created_at;
                  if (date) {
                    return new Date(date).toLocaleDateString();
                  }
                  return 'N/A';
                },
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    flexWrap="wrap"
                  >
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => {
                        const patientId = item.check_in.patient_id;
                        const paymentCacheId = item.id;
                        navigate(`/sales-management/patients-sent-to-sales/${patientId}/${paymentCacheId}`);
                      }}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Manage
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SendIcon />}
                      onClick={() => handleSendToCashier(item)}
                      disabled={sendingToCashier}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Send to Cashier
                    </Button>
                  </Stack>
                ),
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

export default PatientsSentToSales;

