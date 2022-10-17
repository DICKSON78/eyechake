import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip
} from "@mui/material";
import { EditRounded as EditIcon, MoreVert as MoreIcon } from "@mui/icons-material";
import Page from "../../components/Page";
import Table, { PageSizeSelect, SearchTextField } from "../../components/Table";
import Modal from "../../components/Modal";
import CreateUser from "./CreateUser";
import EditUser from "./EditUser";
import Filter from "./Filter";
import ConfirmationDialog from "../../components/ConfirmationDialog";

import { useFetch, usePatch } from "../../hooks";
import { formatError, numberFormat } from "../../helpers";

const Users = () => {

  const modalRef = useRef();

  const [item, setItem] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    q: undefined,
    role: undefined,
    status: undefined,
  });

  const { data, loading: loadingFetch, error: errorFetch, handleFetch } = useFetch("api/users", params, true, {
    data: [],
    total: 0,
    page: 1
  }, (response) => response.data.data);
  const { data: dataPatch, loading: loadingPatch, error: errorPatch, handlePatch } = usePatch();

  const [anchorEl, setAnchorEl] = useState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    document.title = `Users - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    setLoading(loadingFetch || loadingPatch);
  }, [loadingFetch, loadingPatch]);

  useEffect(() => {
    setError(errorFetch || errorPatch);
  }, [errorFetch, errorPatch]);

  useEffect(() => {
    if (dataPatch) {
      if (params.page !== 1) {
        setParams({ ...params, page: 1 });
      } else {
        handleFetch();
      }
    }
  }, [dataPatch]);

  const openFilterModal = () => {
    let component = (
      <Filter
        params={params}
        modal={modalRef.current}
        onOk={(updated) => {
          setParams(updated);
          modalRef.current.close();
        }}
      />
    );

    modalRef.current.open("Filter", component);
  };

  const openCreateUserModal = () => {
    let component = (
      <CreateUser
        modal={modalRef.current}
        fetchUsers={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create User", component);
  };

  const openEditUserModal = (item) => {
    let component = (
      <EditUser
        item={item}
        modal={modalRef.current}
        fetchUsers={handleFetch}
      />
    );

    modalRef.current.open("Edit User", component);
  };

  const confirmUpdateStatus = (item, status, title) => {
    setItem(item);
    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handlePatch(`api/users/${item.id}`, { status });
        }}
      />
    );

    modalRef.current.open(title, component, "sm", item.name);
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.target);
    setIsMenuOpen(true);
    setItem(item);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setAnchorEl(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "neutral";
    }

    return "neutral";
  };

  return (
    <Page
      title="Users"
      breadcrumbs={[
        { title: "Home" },
        { title: "Admin" },
        { title: "Users" },
      ]}
    >
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
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          p={2}
        >
          <PageSizeSelect
            pageSize={params.per_page}
            onChange={(value) => setParams({ ...params, per_page: value })}
          />
          <Box flexGrow={1}/>
          <SearchTextField onChange={(value) => setParams({ ...params, q: value })}/>
          <Button
            variant="outlined"
            onClick={openFilterModal}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={openCreateUserModal}
          >
            New User
          </Button>
        </Stack>
        <Divider />
        <CardContent>
          <Table
            loading={loading}
            columns={[
              {
                field: "id",
                headerName: "ID",
                flex: 0.05,
              },
              {
                field: "name",
                headerName: "Name",
                flex: 0.15,
              },
              {
                field: "phone",
                headerName: "Phone",
                flex: 0.1,
              },
              {
                field: "email",
                headerName: "Email",
                flex: 0.15,
              },
              {
                field: "role",
                headerName: "Role",
                flex: 0.1,
              },
              {
                field: "status",
                headerName: "Status",
                flex: 0.1,
                renderCell: (item) => (
                  <Chip
                    size="small"
                    color={getStatusColor(item.status)}
                    label={item.status}
                  />
                ),
              },
              {
                field: "last_login",
                headerName: "Last Login",
                flex: 0.1,
              },
              {
                field: "sms_balance",
                headerName: "SMS Balance",
                flex: 0.1,
                valueGetter: (item) => item.role === "Admin" ? "N/A" : numberFormat(item.sms_balance),
              },
              {
                field: "actions",
                headerName: "Actions",
                flex: 0.15,
                renderCell: (item) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    divider={<Divider orientation="vertical" sx={{ height: 16 }}/>}
                    spacing={1}
                  >
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEditUserModal(item)}
                      >
                        <EditIcon fontSize="small"/>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More">
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuOpen(event, item)}
                      >
                        <MoreIcon fontSize="small"/>
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ),
              }
            ]}
            items={data.data}
            itemCount={data.total}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
            checkboxSelection
            onCheck={(selected1) => setSelected(selected1)}
          />
        </CardContent>
      </Card>

      {item ?
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          {item.status === "Inactive" ?
            <MenuItem
              onClick={() => {
                confirmUpdateStatus(item, "Active", "Activate");
                handleMenuClose();
              }}
            >
              Activate
            </MenuItem>
            : null
          }
          {item.status === "Active" ?
            <MenuItem
              onClick={() => {
                confirmUpdateStatus(item, "Inactive", "Deactivate");
                handleMenuClose();
              }}
            >
              Deactivate
            </MenuItem>
            : null
          }
        </Menu>
        : null
      }
      <Modal ref={modalRef}/>
    </Page>
  );
};

export default Users;
