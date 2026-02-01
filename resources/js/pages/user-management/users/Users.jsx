import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
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
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import MoreIcon from "@mui/icons-material/MoreVertRounded";
import AssessmentIcon from "@mui/icons-material/AssessmentRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "./Filters";
import EditUser from "./EditUser";
import EditUserAccessDetails from "./EditUserAccessDetails";

import { useFetch, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const Users = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();

  const [item, setItem] = useState();
  const [anchorEl, setAnchorEl] = useState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    clinic_id: undefined,
    employee_number: undefined,
    name: undefined,
    gender: undefined,
    department_id: undefined,
    job_title_id: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/users",
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
    document.title = `Employees - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openEditUserModal = (item) => {
    let component = (
      <EditUser
        item={item}
        modal={modalRef.current}
        fetchUsers={handleFetch}
      />
    );

    modalRef.current.open("Edit User", component, "md");
  };

  const openEditUserAccessDetailsModal = () => {
    let component = (
      <EditUserAccessDetails
        item={item}
        modal={modalRef.current}
        fetchUsers={handleFetch}
      />
    );

    modalRef.current.open(
      "Edit User Access Details",
      component,
      "sm",
      item.full_name
    );
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
    }

    return "neutral";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Employee Management" },
        { title: "Employees" },
      ]}
    >
      <Card>
        <PageHeader
          title="Employees"
          trailing={
            <React.Fragment>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/user-management/users/new")}
              >
                New Employee
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
          <Box
            sx={{
              width: '100%',
              maxWidth: '100%',
              overflowX: 'auto',
              overflowY: 'visible',
              '& .MuiTableContainer-root': {
                overflowX: 'auto',
                overflowY: 'visible',
              },
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
                headerName: "Full Name",
              },
              {
                field: "employee_number",
                headerName: "Employee Number",
                hideOnMobile: true,
              },
              {
                field: "gender",
                headerName: "Gender",
                hideOnMobile: true,
              },
              {
                field: "phone",
                headerName: "Phone Number",
                hideOnMobile: true,
              },
              {
                field: "designation",
                headerName: "Designation",
                hideOnMobile: true,
              },
              {
                field: "department_id",
                headerName: "Department",
                valueGetter: (item, index) => item.department?.name,
                hideOnMobile: true,
              },
              {
                field: "job_title_id",
                headerName: "Job Title",
                valueGetter: (item, index) => item.job_title?.name,
                hideOnMobile: true,
              },
              {
                field: "sales_performance",
                headerName: "Initiated Deals",
                valueGetter: (item) => item.sales_performance?.initiated_deals || 0,
                hideOnMobile: true,
              },
              {
                field: "sales_performance",
                headerName: "Closed Deals",
                valueGetter: (item) => item.sales_performance?.closed_deals || 0,
                hideOnMobile: true,
              },
              {
                field: "created_by",
                headerName: "Created By",
                valueGetter: (item, index) => item.creator?.full_name,
                show: false,
              },
              {
                field: "created_at",
                headerName: "Date Created",
                show: false,
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
                field: "clinic_id",
                headerName: "Clinic",
                valueGetter: (item) => item.clinic?.name,
                show: window.user.role === "Admin",
              },
              {
                field: "actions",
                headerName: "Actions",
                tableCellProps: {
                  sx: {
                    position: { xs: 'relative', sm: 'sticky' },
                    right: { xs: 'auto', sm: 0 },
                    backgroundColor: { xs: 'transparent', sm: 'background.paper' },
                    zIndex: { xs: 0, sm: 1 },
                    minWidth: { xs: 80, sm: 100 },
                    maxWidth: { xs: 100, sm: 'none' },
                    whiteSpace: 'nowrap',
                  },
                },
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
                    sx={{
                      flexWrap: 'nowrap',
                    }}
                  >
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEditUserModal(item)}
                        sx={{
                          padding: { xs: 0.5, sm: 1 },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More">
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuOpen(event, item)}
                        sx={{
                          padding: { xs: 0.5, sm: 1 },
                        }}
                      >
                        <MoreIcon fontSize="small" />
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
          </Box>
        </CardContent>
      </Card>
      {item ? (
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              openEditUserAccessDetailsModal();
              handleMenuClose();
            }}
          >
            Edit Access Details
          </MenuItem>
        </Menu>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Users;
