import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import SendIcon from "@mui/icons-material/SendRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "./Filters";
import CreateBulkSms from "./CreateBulkSms";
import EditBulkSms from "./EditBulkSms";

import { useFetch, usePost, useToast } from "../../../hooks";
import { formatDateForDb, formatError } from "../../../helpers";

const BulkSms = () => {
  const addToast = useToast();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    q: undefined,
    status: undefined,
    type: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/marketing/bulk-sms",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  const { handlePost, loading: sending } = usePost();

  useEffect(() => {
    document.title = `Bulk SMS - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const openCreateBulkSmsModal = () => {
    let component = (
      <CreateBulkSms
        modal={modalRef.current}
        fetchBulkSms={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Bulk SMS Campaign", component, "lg");
  };

  const openEditBulkSmsModal = (item) => {
    let component = (
      <EditBulkSms
        item={item}
        modal={modalRef.current}
        fetchBulkSms={handleFetch}
      />
    );

    modalRef.current.open("Edit Bulk SMS Campaign", component, "lg");
  };

  const handleSendCampaign = async (campaignId) => {
    try {
      await handlePost(`api/marketing/bulk-sms/${campaignId}/send`, {});
      addToast({ message: "SMS campaign sent successfully", severity: "success" });
      handleFetch();
    } catch (err) {
      addToast({ message: formatError(err), severity: "error" });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "default";
      case "scheduled":
        return "info";
      case "sending":
        return "warning";
      case "completed":
        return "success";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "offer":
        return "success";
      case "announcement":
        return "info";
      case "reminder":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing Management" },
        { title: "Bulk SMS" },
      ]}
    >
      <Card>
        <PageHeader
          title="Bulk SMS Campaigns"
          trailing={
            <React.Fragment>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateBulkSmsModal}
              >
                New Campaign
              </Button>
            </React.Fragment>
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
                field: "title",
                headerName: "Title",
              },
              {
                field: "type",
                headerName: "Type",
                renderCell: (item) => (
                  <Chip
                    label={item.type}
                    size="small"
                    color={getTypeColor(item.type)}
                    variant="outlined"
                  />
                ),
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  <Chip
                    label={item.status}
                    size="small"
                    color={getStatusColor(item.status)}
                  />
                ),
              },
              {
                field: "total_recipients",
                headerName: "Total Recipients",
              },
              {
                field: "sent_count",
                headerName: "Sent",
              },
              {
                field: "failed_count",
                headerName: "Failed",
              },
              {
                field: "scheduled_at",
                headerName: "Scheduled At",
                valueGetter: (item) =>
                  item.scheduled_at
                    ? new Date(item.scheduled_at).toLocaleString()
                    : "N/A",
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
                    {item.status === "draft" && (
                      <Tooltip title="Send Campaign">
                        <IconButton
                          size="small"
                          onClick={() => handleSendCampaign(item.id)}
                          disabled={sending}
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEditBulkSmsModal(item)}
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

export default BulkSms;

