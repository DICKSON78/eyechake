import React, { useEffect, useRef, useState } from "react";

import { Card, CardContent, Chip, Divider, Stack, IconButton, Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import PatientFilePDF from "./PatientFilePDF";
import PatientFileView from "./PatientFileView";

import { useFetch, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const PatientFile = ({ patient }) => {
  const addToast = useToast();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    patient_id: patient?.id,
    with_items: "Yes",
    with_diagnoses: "Yes",
  });

  // Update params when patient changes
  useEffect(() => {
    if (patient?.id) {
      setParams(prev => ({ 
        ...prev, 
        patient_id: patient.id,
        with_items: "Yes",
        with_diagnoses: "Yes",
      }));
    }
  }, [patient?.id]);

  const { data, loading, error, handleFetch } = useFetch(
    "api/consultations",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => {
      // Debug logging
      console.log('PatientFile API Response:', response);
      
      // Handle paginated response from Laravel
      // API returns: {"message":"Success.","data":{"current_page":1,"data":[...]}}
      const apiData = response?.data?.data;
      console.log('PatientFile API Data:', apiData);
      
      if (!apiData || !apiData.data || apiData.data.length === 0) {
        console.log('PatientFile: No API data or empty data, returning empty');
        return {
          data: [],
          total: 0,
          page: 1,
          per_page: 25,
        };
      }
      
      const result = {
        data: apiData.data || [],
        total: apiData.total || 0,
        page: apiData.current_page || 1,
        per_page: apiData.per_page || 25,
      };
      
      console.log('PatientFile Final Result:', result);
      return result;
    }
  );

  useEffect(() => {
    document.title = `Patient File - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  // Debug logging
  useEffect(() => {
    console.log('PatientFile - Data changed:', data);
    console.log('PatientFile - Data type:', typeof data);
    console.log('PatientFile - Is array:', Array.isArray(data));
    console.log('PatientFile - Data length:', data?.length);
    console.log('PatientFile - Data.data:', data?.data);
    console.log('PatientFile - Data.data type:', typeof data?.data);
    console.log('PatientFile - Data.data is array:', Array.isArray(data?.data));
    console.log('PatientFile - Data.data length:', data?.data?.length);
    console.log('PatientFile - Params:', params);
  }, [data, params]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Consulted":
        return "success";
    }

    return "warning";
  };

  return (
    <React.Fragment>
      <Card sx={{ 
        borderTopLeftRadius: 0,
        width: "100%",
        bgcolor: "background.paper",
        boxShadow: 1,
      }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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
                field: "item_name",
                headerName: "Consultation Item",
                valueGetter: (item, index) => item.payment_cache_item.item.name,
              },
              {
                field: "consultant",
                headerName: "Consultant",
                valueGetter: (item, index) =>
                  item.payment_cache_item.consultant?.full_name || 'Not Assigned',
              },
              {
                field: "created_at",
                headerName: "Date",
                valueGetter: (item) =>
                  item.payment_cache_item.served_at || item.created_at,
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  <Chip
                    size="small"
                    color={getStatusColor(item.status)}
                    label={item.status}
                  />
                ),
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
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          modalRef.current?.open(
                            `Patient File - ${patient.full_name}`,
                            <PatientFileView
                              patient={patient}
                              consultationId={item.id}
                            />,
                            "lg"
                          );
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <PatientFilePDF
                      size="small"
                      patient={patient}
                      consultationId={item.id}
                    />
                  </Stack>
                ),
              },
            ]}
            items={Array.isArray(data?.data) ? data.data : []}
            itemCount={data?.total || 0}
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
    </React.Fragment>
  );
};

export default PatientFile;
