import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
import StarIcon from "@mui/icons-material/StarRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "./Filters";
import CreateVipPatient from "../../reception/vip-patients/CreateVipPatient";
import EditPatient from "../../reception/patients/EditPatient";

import { useFetch, useToast } from "../../../hooks";
import { useNotificationContext } from "../../../contexts/NotificationContext";
import { formatError, getAge } from "../../../helpers";

const PrestigeClients = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();
  const { setNotificationField, refreshNotifications, lockNotificationKey, unlockNotificationKey } = useNotificationContext();

  const [item, setItem] = useState();
  const [anchorEl, setAnchorEl] = useState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/marketing/prestige-clients",
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
    document.title = `Prestige Clients - ${window.APP_NAME}`;
    // Lock IMMEDIATELY to prevent initial server value from flashing
    lockNotificationKey?.('vip_patients');
    // Set a safe immediate value (0) to avoid showing stale counts
    setNotificationField?.('vip_patients', 0);
    // Now fetch server notifications in the background
    refreshNotifications?.();
    return () => {
      unlockNotificationKey?.('vip_patients');
    };
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  // Keep the VIP badge in sync with the visible list length
  useEffect(() => {
    if (data && Array.isArray(data.data)) {
      // Clamp to list length to avoid brief server-side overcount
      setNotificationField?.('vip_patients', Math.max(0, data.data.length));
    }
  }, [data, setNotificationField]);

  const openCreateVipPatientModal = () => {
    let component = (
      <CreateVipPatient
        modal={modalRef.current}
        fetchPatients={handleFetch}
      />
    );

    modalRef.current.open("Add Prestige Client", component, "md");
  };

  const openEditPatientModal = (item) => {
    let component = (
      <EditPatient
        item={item}
        modal={modalRef.current}
        fetchPatients={handleFetch}
      />
    );

    modalRef.current.open("Edit Prestige Client", component, "md");
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

  const getColumns = () => {
    return [
      {
        field: "index",
        headerName: "S/N",
        valueGetter: (item, index) =>
          params.per_page * (params.page - 1) + index + 1,
      },
      {
        field: "vip_badge",
        headerName: "Prestige",
        renderCell: (item) => (
          <Chip
            icon={<StarIcon />}
            label="Prestige"
            color="warning"
            variant="filled"
            size="small"
          />
        ),
      },
      {
        field: "full_name",
        headerName: "Client Name",
        renderCell: (item) => (
          <Chip
            label={item.full_name}
            size="small"
            color="primary"
            variant="outlined"
          />
        ),
      },
      {
        field: "id",
        headerName: "Patient Number",
      },
      {
        field: "date_of_birth",
        headerName: "Age",
        valueGetter: (item) => getAge(item.date_of_birth),
      },
      {
        field: "gender",
        headerName: "Gender",
        valueGetter: (item) => item.gender?.name || (typeof item.gender === 'string' ? item.gender : "N/A"),
      },
      {
        field: "phone",
        headerName: "Phone",
      },
      {
        field: "email",
        headerName: "Email",
        valueGetter: (item) => item.email || "N/A",
      },
      {
        field: "region",
        headerName: "Region",
        valueGetter: (item) => item.region?.name || (typeof item.region === 'string' ? item.region : "N/A"),
      },
      {
        field: "district",
        headerName: "District",
        valueGetter: (item) => item.district?.name || (typeof item.district === 'string' ? item.district : "N/A"),
      },
      {
        field: "ward",
        headerName: "Ward",
        valueGetter: (item) => item.ward?.name || (typeof item.ward === 'string' ? item.ward : "N/A"),
      },
      {
        field: "information_source",
        headerName: "Source",
        valueGetter: (item) => item.information_source?.name || (typeof item.information_source === 'string' ? item.information_source : "N/A"),
      },
      {
        field: "calling_status",
        headerName: "Calling Status",
        valueGetter: (item) => {
          const status = item.calling_status?.status;
          if (!status) return "Need to Call";
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
        },
        renderCell: (item) => {
          const status = item.calling_status?.status || "need_to_call";
          const colors = {
            need_to_call: "warning",
            called: "success",
            unreachable: "error",
          };
          const labels = {
            need_to_call: "Need to Call",
            called: "Called",
            unreachable: "Unreachable",
          };
          return (
            <Chip
              label={labels[status]}
              size="small"
              color={colors[status]}
            />
          );
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        renderCell: (item) => (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => openEditPatientModal(item)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              size="small"
              color="warning"
              onClick={() =>
                navigate(`/reception/patients/${item.id}/check-in`)
              }
            >
              Priority Check-In
            </Button>
            <Tooltip title="More">
              <IconButton
                size="small"
                onClick={(event) => handleMenuOpen(event, item)}
              >
                <MoreIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ];
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing Management" },
        { title: "Prestige Clients" },
      ]}
    >
      <Card>
        <PageHeader
          title="Prestige Clients"
          subtitle="Clients marked as Prestige in the registration form"
          trailing={
            <React.Fragment>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateVipPatientModal}
                color="primary"
              >
                Add Prestige Client
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
            columns={getColumns()}
            items={data.data || []}
            itemCount={data.total || 0}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
            onPageSizeChange={(value) =>
              setParams({ ...params, per_page: value, page: 1 })
            }
          />
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
              handleMenuClose();
              navigate(`/reception/patients/${item.id}/records/patient-file`);
            }}
          >
            View Records
          </MenuItem>
        </Menu>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default PrestigeClients;
