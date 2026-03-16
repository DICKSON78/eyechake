import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
} from "@mui/material";
import Page, { Header as PageHeader } from "../../components/Page";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Filters from "./PatientFilters";
import PatientDetails from "../reception/patients/PatientDetails";

import { useFetch, useToast } from "../../hooks";
import {
  capitalize,
  formatDateForDb,
  formatError,
  getAge,
} from "../../helpers";
import { useNotificationContext } from "../../contexts/NotificationContext";

const ConsultationPatients = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();
  const { notifications, refreshNotifications, loading: notificationsLoading } = useNotificationContext();

  const { status } = useParams();

  // Debug user privileges
  console.log('ConsultationPatients User Info:', {
    user: window.user,
    privileges: window.user?.privileges,
    role: window.user?.role,
    isAdmin: window.user?.role === 'Admin' || window.user?.is_admin,
  });

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: "Sent to Optician",
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    item_payment_mode_id: 'consultant', // This is what optician center expects for procedures
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    end_date: new Date(),
    // Add consultation-specific filters for proper backend filtering
    require_glass: "Yes",
    patient_direction: undefined, // Will be set to "Direct to Optician" if needed
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/consultations",
    {
      ...params,
      status: status ? capitalize(status) : params.status, // Use URL status if provided, otherwise use default
      start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
      // For pending status, remove require_glass filter to match notifications logic
      require_glass: status === 'pending' ? undefined : params.require_glass,
      // For pending status, use today's date to match notifications logic
      ...(status === 'pending' && {
        start_date: formatDateForDb(new Date()),
        end_date: formatDateForDb(new Date()),
      }),
      // For pending status, remove item_payment_mode_id filter to match notifications logic
      ...(status === 'pending' && {
        item_payment_mode_id: undefined,
      }),
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => {
      // Debug logging
      console.log('ConsultationPatients API params:', {
        status: status ? capitalize(status) : params.status,
        start_date: status === 'pending' ? formatDateForDb(new Date()) : (params.start_date ? formatDateForDb(params.start_date) : undefined),
        end_date: status === 'pending' ? formatDateForDb(new Date()) : (params.end_date ? formatDateForDb(params.end_date) : undefined),
        require_glass: status === 'pending' ? undefined : params.require_glass,
        item_payment_mode_id: status === 'pending' ? undefined : params.item_payment_mode_id,
      });
      
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
    document.title = `${getTitle()} - ${window.APP_NAME}`;
  }, [status]);

  // Keep notifications in sync when arriving and after data refresh
  useEffect(() => {
    refreshNotifications?.();
  }, []);

  useEffect(() => {
    if (!loading) {
      // small debounce to let list settle before refreshing badges
      const t = setTimeout(() => refreshNotifications?.(), 300);
      return () => clearTimeout(t);
    }
  }, [loading, refreshNotifications]);

  useEffect(() => {
    if (error) {
      // Check if it's a 403 unauthorized error
      if (error?.response?.status === 403) {
        addToast({ 
          message: "You don't have permission to access consultation room. Please contact administrator.", 
          severity: "error" 
        });
        // Redirect to dashboard if unauthorized
        navigate('/dashboard');
      } else {
        addToast({ message: formatError(error), severity: "error" });
      }
    }
  }, [error, addToast, navigate]);

  const getTitle = () => {
    if (status === "pending") {
      return "Patients Sent to Doctor";
    }
    if (status === "consulted") {
      return "Consulted Patients";
    }
  };

  const openPatientRecord = (patientId) => {
    if (!patientId) return;
    // Reuse the full patient records page (file, payments, attachments)
    navigate(`/patient-records/patients/${patientId}/patient-file`);
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Consultation Room" },
        { title: getTitle() },
      ]}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: { xs: "auto", md: "calc(100vh - 180px)" },
          minHeight: { xs: "calc(100vh - 200px)", sm: "calc(100vh - 180px)", md: "600px" },
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <Card
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <PageHeader
            title={getTitle()}
            subtitle={
              status === 'pending'
                ? `${(data && typeof data.total === 'number') ? data.total : (Array.isArray(data) ? data.length : 0)} pending`
                : undefined
            }
            trailing={
              <React.Fragment>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!params.consultant_id}
                      onChange={(event) =>
                        setParams({
                          ...params,
                          consultant_id: event.target.checked
                            ? window.user?.id
                            : undefined,
                        })
                      }
                    />
                  }
                  label="My Patients Only"
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    },
                  }}
                />
              </React.Fragment>
            }
          />
          <Divider />
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflow: "hidden",
              p: { xs: 1.5, sm: 2, md: 3 },
              "&:last-child": {
                pb: { xs: 1.5, sm: 2, md: 3 },
              },
            }}
          >
            <Box
              sx={{
                mb: { xs: 1.5, sm: 2 },
                flexShrink: 0,
              }}
            >
              <Filters
                params={params}
                setParams={setParams}
              />
            </Box>
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                minHeight: 0,
                width: "100%",
              }}
            >
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
                    valueGetter: (item, index) =>
                      item.payment_cache_item?.payment_cache?.check_in?.patient
                        ?.full_name || "N/A",
                  },
                  {
                    field: "patient_id",
                    headerName: "Patient Number",
                    valueGetter: (item, index) =>
                      item.payment_cache_item?.payment_cache?.check_in?.patient_id || "N/A",
                  },
                  {
                    field: "date_of_birth",
                    headerName: "Age",
                    valueGetter: (item, index) =>
                      item.payment_cache_item?.payment_cache?.check_in?.patient?.date_of_birth
                        ? getAge(
                            item.payment_cache_item.payment_cache.check_in.patient
                              .date_of_birth
                          )
                        : "N/A",
                  },
                  {
                    field: "gender",
                    headerName: "Gender",
                    valueGetter: (item, index) =>
                      item.payment_cache_item?.payment_cache?.check_in?.patient?.gender || "N/A",
                  },
                  {
                    field: "phone",
                    headerName: "Phone Number",
                    valueGetter: (item, index) =>
                      item.payment_cache_item?.payment_cache?.check_in?.patient?.phone || "N/A",
                  },
                  {
                    field: "created_by",
                    headerName: "Sent By",
                    valueGetter: (item, index) => item.creator?.full_name || "N/A",
                    show: status === "pending",
                  },
                  {
                    field: "consultant",
                    headerName: "Consultant",
                    valueGetter: (item, index) =>
                      item.payment_cache_item?.consultant?.full_name || "N/A",
                  },
                  {
                    field: "created_at",
                    headerName:
                      status === "pending" ? "Date Sent" : "Date Consulted",
                    valueGetter: (item) =>
                      item.payment_cache_item?.served_at || item.created_at || "N/A",
                  },
                  {
                    field: "item_name",
                    headerName: "Consultation Item",
                    valueGetter: (item, index) => item.payment_cache_item?.item?.name || "N/A",
                  },
                  {
                    field: "actions",
                    headerName: "Actions",
                    renderCell: (item) => (
                      <Stack
                        direction="row"
                        alignItems="center"
                        divider={
                          <Divider
                            orientation="vertical"
                            sx={{ height: 16 }}
                          />
                        }
                        spacing={1}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            openPatientRecord(
                              item.payment_cache_item?.payment_cache?.check_in?.patient_id
                            )
                          }
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            px: { xs: 1, sm: 2 },
                          }}
                        >
                          Record
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() =>
                            navigate(
                              `/consultation-room/consultation-patients/${status}/${item.payment_cache_item?.payment_cache?.check_in?.patient_id}/${item.id}/clinical-notes`
                            )
                          }
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            px: { xs: 1, sm: 2 },
                          }}
                        >
                          {status === "pending" ? "Manage" : "View"}
                        </Button>
                      </Stack>
                    ),
                  },
                ]}
                items={data.data || []}
                itemCount={data.total || 0}
                page={params.page}
                pageSize={params.per_page}
                onPageChange={(page) => setParams({ ...params, page })}
                onPageSizeChange={(value) =>
                  setParams({ ...params, per_page: value, page: 1 })
                }
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default ConsultationPatients;
