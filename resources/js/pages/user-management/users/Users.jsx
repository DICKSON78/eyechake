import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Avatar,
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
  Typography,
  alpha,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import MoreIcon from "@mui/icons-material/MoreVertRounded";
import SecurityIcon from "@mui/icons-material/SecurityRounded";
import PersonIcon from "@mui/icons-material/PersonRounded";
import BadgeIcon from "@mui/icons-material/BadgeRounded";
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
    status: undefined,
    role: undefined,
  });

  const {
    data,
    loading,
    error,
    handleFetch,
  } = useFetch(
    `api/users`,
    params,
    true,
    { data: [], total: 0, page: 1, per_page: 25 },
    (response) => {
      const apiData = response?.data?.data || response?.data || [];
      return {
        data: apiData.data || [],
        total: apiData.total || 0,
        page: apiData.current_page || 1,
        per_page: apiData.per_page || 25,
      };
    }
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

  const openEditUserAccessDetailsModal = (userItem) => {
    const targetItem = userItem || item;
    console.log('DEBUG - User item passed:', userItem);
    console.log('DEBUG - Target item:', targetItem);
    console.log('DEBUG - Target item privileges:', targetItem?.privileges);
    
    if (!targetItem) {
      return;
    }
    
    let component = (
      <EditUserAccessDetails
        item={targetItem}
        modal={modalRef.current}
        fetchUsers={handleFetch}
      />
    );

    modalRef.current.open(
      "Access & Security Settings",
      component,
      "md",
      targetItem?.first_name && targetItem?.last_name 
        ? `${targetItem.first_name} ${targetItem.last_name}`
        : targetItem?.username || 'User'
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
      case "Inactive":
        return "error";
      default:
        return "default";
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0]?.substring(0, 2).toUpperCase() || "?";
  };

  // Get avatar color based on name
  const getAvatarColor = (name) => {
    if (!name) return "#9e9e9e";
    const colors = [
      "#1976d2", "#388e3c", "#d32f2f", "#7b1fa2", "#f57c00",
      "#0288d1", "#689f38", "#c2185b", "#512da8", "#00796b"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
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
                headerName: "#",
                valueGetter: (item, index) =>
                  params.per_page * (params.page - 1) + index + 1,
                tableCellProps: { sx: { width: 50, minWidth: 50 } },
              },
              {
                field: "full_name",
                headerName: "Employee",
                renderCell: (item) => (
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: getAvatarColor(item.full_name),
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      {getInitials(item.full_name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {item.full_name}
                      </Typography>
                      {item.employee_number && (
                        <Typography variant="caption" color="text.secondary">
                          #{item.employee_number}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                ),
              },
              {
                field: "designation_info",
                headerName: "Role",
                hideOnMobile: true,
                renderCell: (item) => (
                  <Box>
                    <Typography variant="body2">
                      {item.job_title?.name || "—"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.department?.name || "—"}
                    </Typography>
                  </Box>
                ),
              },
              {
                field: "contact",
                headerName: "Contact",
                hideOnMobile: true,
                renderCell: (item) => (
                  <Box>
                    <Typography variant="body2">
                      {item.phone || "—"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.gender}
                    </Typography>
                  </Box>
                ),
              },
              {
                field: "performance",
                headerName: "Performance",
                hideOnMobile: true,
                renderCell: (item) => (
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Initiated Deals">
                      <Chip
                        size="small"
                        variant="outlined"
                        color="primary"
                        label={`${item.sales_performance?.initiated_deals || 0} initiated`}
                        sx={{ fontSize: "0.7rem" }}
                      />
                    </Tooltip>
                    <Tooltip title="Closed Deals">
                      <Chip
                        size="small"
                        variant="outlined"
                        color="success"
                        label={`${item.sales_performance?.closed_deals || 0} closed`}
                        sx={{ fontSize: "0.7rem" }}
                      />
                    </Tooltip>
                  </Stack>
                ),
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  <Chip
                    size="small"
                    color={getStatusColor(item.status)}
                    label={item.status}
                    sx={{
                      fontWeight: 500,
                      minWidth: 70,
                    }}
                  />
                ),
              },
              {
                field: "clinic_id",
                headerName: "Branch",
                valueGetter: (item) => item.clinic?.name,
                show: window.user.role === "Admin",
                hideOnMobile: true,
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
                    minWidth: { xs: 80, sm: 120 },
                    maxWidth: { xs: 100, sm: 'none' },
                    whiteSpace: 'nowrap',
                  },
                },
                renderCell: (item) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{
                      flexWrap: 'nowrap',
                    }}
                  >
                    <Tooltip title="Edit Profile">
                      <IconButton
                        size="small"
                        onClick={() => openEditUserModal(item)}
                        sx={{
                          color: "primary.main",
                          "&:hover": {
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Access & Security">
                      <IconButton
                        size="small"
                        onClick={() => {
                          console.log('DEBUG - Clicked access for item:', item);
                          openEditUserAccessDetailsModal(item);
                        }}
                        sx={{
                          color: "secondary.main",
                          "&:hover": {
                            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                          },
                        }}
                      >
                        <SecurityIcon fontSize="small" />
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
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Users;
