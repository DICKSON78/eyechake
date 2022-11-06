import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert, Card, CardContent, Chip, Divider, Stack } from "@mui/material";
import { Header as PageHeader } from "../../../components/Page";
import Table, { PageSizeSelect } from "../../../components/Table";
import Modal from "../../../components/Modal";

import { useFetch } from "../../../hooks";
import { formatError, getNonNull } from "../../../helpers";
import PatientFilePDF from "./PatientFilePDF";

const PatientFile = ({ patient }) => {

  const navigate = useNavigate();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    patient_id: patient.id,
  });

  const { data, loading, error, handleFetch } = useFetch("api/consultations", params, true, {
    data: [],
    total: 0,
    page: 1
  }, (response) => response.data.data);

  useEffect(() => {
    document.title = `Patient File - ${window.APP_NAME}`;
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Consulted":
        return "success";
    }

    return "warning";
  };

  return (
    <React.Fragment>
      {error ?
        <Alert
          sx={{ mb: 2 }}
          severity="error"
        >
          {formatError(error)}
        </Alert>
        : null
      }
      <Card>
        <PageHeader
          title="Patient File"
          trailing={
            <React.Fragment>
              <PageSizeSelect
                pageSize={params.per_page}
                onChange={(value) => setParams({ ...params, per_page: value })}
              />
            </React.Fragment>
          }
        />
        <Divider />
        <CardContent>
          <Table
            loading={loading}
            columns={[
              {
                field: "index",
                headerName: "S/N",
                valueGetter: (item, index) => ((params.per_page * (params.page - 1)) + index + 1),
              },
              {
                field: "created_at",
                headerName: "Date",
              },
              {
                field: "consultant",
                headerName: "Consultant",
                valueGetter: (item, index) => getNonNull(item.payment_cache_item.consultant).full_name
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  item.consultant === "Doctor" ?
                    <Chip
                      size="small"
                      color={getStatusColor(item.status)}
                      label={item.status}
                    />
                    : null
                ),
              },
              {
                field: "optician_status",
                headerName: "Optician Status",
                renderCell: (item) => (
                  item.optician_status ?
                    <Chip
                      size="small"
                      color={getStatusColor(item.optician_status)}
                      label={item.optician_status}
                    />
                    : null
                ),
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    divider={<Divider orientation="vertical" sx={{ height: 16 }}/>}
                    spacing={1}
                  >
                    <PatientFilePDF
                      size="small"
                      patient={patient}
                      consultationId={item.id}
                    />
                  </Stack>
                ),
              }
            ]}
            items={data.data}
            itemCount={data.total}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef}/>
    </React.Fragment>
  );
};

export default PatientFile;
