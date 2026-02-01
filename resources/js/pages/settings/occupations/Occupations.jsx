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
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";
import CreateOccupation from "./CreateOccupation";
import EditOccupation from "./EditOccupation";

import { useFetch, useToast, useDelete } from "../../../hooks";
import { formatError, throttle } from "../../../helpers";

const Occupations = () => {
  const addToast = useToast();

  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    q: undefined,
    status: "Active",
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/occupations",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  const { handleDelete, data: deleteData, error: deleteError } = useDelete();

  useEffect(() => {
    document.title = `Occupations - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (deleteData) {
      addToast({ message: "Occupation deleted successfully", severity: "success" });
      handleFetch();
    }
  }, [deleteData]);

  useEffect(() => {
    if (deleteError) {
      addToast({ message: formatError(deleteError), severity: "error" });
    }
  }, [deleteError]);

  const openCreateOccupationModal = () => {
    let component = (
      <CreateOccupation
        modal={modalRef.current}
        fetchOccupations={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Occupation", component);
  };

  const openEditOccupationModal = (item) => {
    let component = (
      <EditOccupation
        item={item}
        modal={modalRef.current}
        fetchOccupations={handleFetch}
      />
    );

    modalRef.current.open("Edit Occupation", component);
  };

  const handleDeleteOccupation = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      handleDelete(`api/occupations/${item.id}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "default";
      default:
        return "neutral";
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Settings" },
        { title: "Occupations" },
      ]}
    >
      <Card>
        <PageHeader
          title="Occupations"
          trailing={
            <React.Fragment>
              <SearchTextField
                onChange={(value) =>
                  throttle(() => setParams({ ...params, q: value }), 1000)
                }
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateOccupationModal}
              >
                New Occupation
              </Button>
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
                valueGetter: (item, index) =>
                  params.per_page * (params.page - 1) + index + 1,
              },
              {
                field: "name",
                headerName: "Occupation Name",
              },
              {
                field: "description",
                headerName: "Description",
                valueGetter: (item) => item.description || "-",
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
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEditOccupationModal(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteOccupation(item)}
                      >
                        <DeleteIcon fontSize="small" />
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

export default Occupations;

