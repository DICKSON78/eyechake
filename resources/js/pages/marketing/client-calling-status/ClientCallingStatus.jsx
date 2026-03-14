import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditRounded";
import PhoneIcon from "@mui/icons-material/PhoneRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "./Filters";
import UpdateCallingStatus from "./UpdateCallingStatus.jsx";
import { useFetch, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const ClientCallingStatus = () => {
  const addToast = useToast();
  const modalRef = React.useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    q: undefined,
    status: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/marketing/client-calling-status",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Client Calling Status - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const openUpdateStatusModal = (patient) => {
    const component = (
      <UpdateCallingStatus
        patient={patient}
        modal={modalRef.current}
        fetchData={handleFetch}
      />
    );
    modalRef.current.open("Update Calling Status", component, "sm");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "need_to_call":
        return "warning"; // Orange
      case "called":
        return "success"; // Green
      case "unreachable":
        return "error"; // Red
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "need_to_call":
        return "Need to Call";
      case "called":
        return "Called";
      case "unreachable":
        return "Unreachable";
      default:
        return "Need to Call";
    }
  };


  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing Management" },
        { title: "Client Calling Status" },
      ]}
    >
      <Card>
        <PageHeader title="Client Calling Status" />
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
                headerName: "Client Name",
              },
              {
                field: "phone",
                headerName: "Phone",
              },
              {
                field: "email",
                headerName: "Email",
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => {
                  const status = item.calling_status?.status || "need_to_call";
                  return (
                    <Chip
                      label={getStatusLabel(status)}
                      size="small"
                      color={getStatusColor(status)}
                    />
                  );
                },
              },
              {
                field: "called_by",
                headerName: "Called By",
                valueGetter: (item) =>
                  item.calling_status?.called_by_user?.full_name || "N/A",
              },
              {
                field: "called_at",
                headerName: "Called At",
                valueGetter: (item) =>
                  item.calling_status?.called_at
                    ? new Date(item.calling_status.called_at).toLocaleString()
                    : "N/A",
              },
              {
                field: "notes",
                headerName: "Notes",
                valueGetter: (item) => item.calling_status?.notes || "N/A",
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    divider={<Divider orientation="vertical" sx={{ height: 16 }} />}
                    spacing={1}
                  >
                    <Tooltip title="Update Status">
                      <IconButton
                        size="small"
                        onClick={() => openUpdateStatusModal(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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

export default ClientCallingStatus;

