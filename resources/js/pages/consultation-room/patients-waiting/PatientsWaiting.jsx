import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button, Card, CardContent, Chip, Divider, Stack } from "@mui/material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";

import { useFetch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getAge } from "../../../helpers";

const PatientsWaiting = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const { type } = useParams(); // 'new' or 'return' or undefined for all

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: undefined, // 'waiting' or 'in_treatment'
    department: 'consultation',
    date: new Date(),
    patient_id: undefined,
    patient_name: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/patient-waiting-times",
    {
      ...params,
      date: params.date ? formatDateForDb(params.date) : undefined,
      patient_type: type, // 'new' or 'return'
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Patients Waiting - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  // Data is already filtered by backend based on patient_type parameter
  const filteredData = data;

  const getTitle = () => {
    if (type === 'new') {
      return 'New Patients Waiting';
    } else if (type === 'return') {
      return 'Return Patients Waiting';
    }
    return 'Patients Waiting';
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Consultation Room" },
        { title: getTitle() },
      ]}
    >
      <Card>
        <PageHeader
          title={getTitle()}
          subtitle={`${(filteredData && typeof filteredData.total === 'number') ? filteredData.total : 0} patients`}
        />
        <Divider />
        <CardContent>
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
                valueGetter: (item, index) => item.patient?.full_name || 'N/A',
              },
              {
                field: "patient_id",
                headerName: "Patient Number",
                valueGetter: (item, index) => item.patient_id,
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item, index) =>
                  item.patient?.date_of_birth ? getAge(item.patient.date_of_birth) : 'N/A',
              },
              {
                field: "gender",
                headerName: "Gender",
                valueGetter: (item, index) => item.patient?.gender || 'N/A',
              },
              {
                field: "phone",
                headerName: "Phone Number",
                valueGetter: (item, index) => item.patient?.phone || 'N/A',
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  <Chip
                    label={item.status === 'waiting' ? 'Waiting' : 'In Treatment'}
                    color={item.status === 'waiting' ? 'warning' : 'info'}
                    size="small"
                  />
                ),
              },
              {
                field: "doctor",
                headerName: "Doctor",
                valueGetter: (item, index) => item.doctor?.full_name || 'Not assigned',
              },
              {
                field: "registration_time",
                headerName: "Registration Time",
                valueGetter: (item) => item.registration_time,
              },
              {
                field: "waiting_duration",
                headerName: "Waiting Duration",
                valueGetter: (item) => {
                  if (item.current_waiting_minutes) {
                    const hours = Math.floor(item.current_waiting_minutes / 60);
                    const minutes = item.current_waiting_minutes % 60;
                    return `${hours}h ${minutes}m`;
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
                    divider={
                      <Divider
                        orientation="vertical"
                        sx={{ height: 16 }}
                      />
                    }
                    spacing={1}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        // Navigate to consultation patients page
                        navigate(`/consultation-room/consultation-patients/pending`);
                      }}
                    >
                      View
                    </Button>
                  </Stack>
                ),
              },
            ]}
            items={filteredData.data}
            itemCount={filteredData.total}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
            onPageSizeChange={(value) =>
              setParams({ ...params, per_page: value, page: 1 })
            }
          />
        </CardContent>
      </Card>
    </Page>
  );
};

export default PatientsWaiting;

