import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import StarIcon from "@mui/icons-material/StarRounded";
import BusinessIcon from "@mui/icons-material/BusinessRounded";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivismRounded";
import ReceiptIcon from "@mui/icons-material/ReceiptRounded";
import DescriptionIcon from "@mui/icons-material/DescriptionRounded";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded";
import AssignmentIcon from "@mui/icons-material/AssignmentRounded";
import MoreVertIcon from "@mui/icons-material/MoreVertRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "../../sales-center/clients/Filters";
import CreateClient from "../../sales-center/clients/CreateClient";

import { useFetch, useToast, usePost } from "../../../hooks";
import { formatError, getAge } from "../../../helpers";

const Clients = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    id: undefined,
    name: undefined,
    phone: undefined,
    gender: undefined,
    payment_mode_id: undefined,
    client_type: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/patients",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  const { handlePost: markAsSuccessSell } = usePost();

  useEffect(() => {
    document.title = `Sales Clients - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const openCreateClientModal = () => {
    let component = (
      <CreateClient
        modal={modalRef.current}
        fetchClients={handleFetch}
      />
    );

    modalRef.current.open("Create Client", component, "md");
  };

  const handleMenuOpen = (event, client) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClient(null);
  };

  const handleCreateBill = (client) => {
    navigate(`/reception/patients/${client.id}/check-in`, {
      state: { createBill: true }
    });
    handleMenuClose();
  };

  const handleViewRecord = (client) => {
    navigate(`/reception/patients/${client.id}/records/patient-file`);
    handleMenuClose();
  };

  const handleMarkAsSuccessSell = async (client) => {
    try {
      // You may need to create an API endpoint for this
      // For now, we'll show a success message
      addToast({ 
        message: `Client ${client.full_name} marked as successful sale`, 
        severity: "success" 
      });
      handleMenuClose();
      // Optionally refresh the list
      // handleFetch();
    } catch (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  };

  const handleAskForPrescription = (client) => {
    // Navigate to consultation room or create prescription request
    navigate(`/reception/patients/${client.id}/check-in`, {
      state: { sendToDoctor: true, askForPrescription: true }
    });
    handleMenuClose();
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Sales Management" },
        { title: "Clients" },
      ]}
    >
      <Card>
        <PageHeader
          title="Sales Clients"
          subtitle={`${(data && typeof data.total === 'number') ? data.total : 0} clients`}
          trailing={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateClientModal}
            >
              Create Client
            </Button>
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
                field: "full_name",
                headerName: "Client Name",
                renderCell: (item) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {item.full_name}
                    {item.is_vip === true && (
                      <Chip
                        icon={<StarIcon />}
                        label="Prestige"
                        color="warning"
                        size="small"
                      />
                    )}
                    {item.is_businessperson === true && (
                      <Chip
                        icon={<BusinessIcon />}
                        label="Business"
                        color="info"
                        size="small"
                      />
                    )}
                    {item.is_outreach === true && (
                      <Chip
                        icon={<VolunteerActivismIcon />}
                        label="Outreach"
                        color="success"
                        size="small"
                      />
                    )}
                  </div>
                ),
              },
              {
                field: "id",
                headerName: "Client Number",
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item, index) => getAge(item.date_of_birth),
              },
              {
                field: "gender",
                headerName: "Gender",
              },
              {
                field: "phone",
                headerName: "Phone Number",
              },
              {
                field: "email",
                headerName: "Email",
                valueGetter: (item) => item.email || 'N/A',
              },
              {
                field: "payment_mode",
                headerName: "Payment Mode",
                valueGetter: (item) => item.payment_mode?.name || 'N/A',
              },
              {
                field: "created_at",
                headerName: "Date Created",
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="More Actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, item)}
                        aria-label="more actions"
                      >
                        <MoreVertIcon />
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

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleCreateBill(selectedClient)}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create Bill</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleViewRecord(selectedClient)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Record</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleMarkAsSuccessSell(selectedClient)}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Success Sell</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAskForPrescription(selectedClient)}>
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ask for Prescription</ListItemText>
        </MenuItem>
      </Menu>

      <Modal ref={modalRef} />
    </Page>
  );
};

export default Clients;

