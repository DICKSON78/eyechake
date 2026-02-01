import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  EditRounded as EditIcon,
  DeleteRounded as DeleteIcon,
} from "@mui/icons-material";

import Page from "../../components/Page";
import Report from "../../components/reports/Report";
import { SearchTextField } from "../../components/Table";

import { numberFormat, throttle, formatError } from "../../helpers";
import Modal from "../../components/Modal";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { useDelete, useToast } from "../../hooks";

const Medicines = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = React.useRef();
  const { handleDelete, loading: deleting, error: deleteError } = useDelete();
  const [params, setParams] = useState({
    status: "Active",
    search: undefined,
  });

  useEffect(() => {
    document.title = `Medicines - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (deleteError) {
      addToast({ message: formatError(deleteError), severity: "error" });
    }
  }, [deleteError]);

  const confirmDelete = (item) => {
    const component = (
      <ConfirmationDialog
        message={`Delete medicine "${item.name}"?`}
        onCancel={() => modalRef.current.close()}
        onOk={async () => {
          await handleDelete(`api/medicines/${item.id}`);
          modalRef.current.close();
          addToast({ message: "Medicine deleted successfully", severity: "success" });
          // Refresh the page to reload the data
          window.location.reload();
        }}
      />
    );

    modalRef.current.open("Confirm Delete", component);
  };

  return (
    <Page
      title="Medicines"
      breadcrumbs={[
        { title: "Home" },
        { title: "Medicine Center" },
        { title: "Medicines" },
      ]}
    >
      <Report
        title="All Medicines"
        uri="api/medicines"
        params={params}
        headerTrailingContent={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <SearchTextField
              placeholder="Search Medicine"
              onChange={(value) =>
                throttle(() => setParams({ ...params, search: value }), 1000)
              }
              sx={{ width: 200 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/medicine-center/add-medicine')}
            >
              Add Medicine
            </Button>
          </Box>
        }
        columns={[
          {
            field: "name",
            headerName: "Medicine Name",
            valueGetter: (item) => item.name,
          },
          {
            field: "code",
            headerName: "Code",
            valueGetter: (item) => item.code || 'N/A',
          },
          {
            field: "generic_name",
            headerName: "Generic Name",
            valueGetter: (item) => item.generic_name || 'N/A',
          },
          {
            field: "brand_name",
            headerName: "Brand Name",
            valueGetter: (item) => item.brand_name || 'N/A',
          },
          {
            field: "unit_of_measure_id",
            headerName: "Unit",
            valueGetter: (item) => item.unit_of_measure?.name || 'N/A',
          },
          {
            field: "balance",
            headerName: "Current Balance",
            valueGetter: (item) => numberFormat(item.balance || 0),
          },
          {
            field: "unit_buying_price",
            headerName: "Unit Price (TZS)",
            valueGetter: (item) => `Tz ${numberFormat(item.unit_buying_price || 0)}`,
          },
          {
            field: "selling_price",
            headerName: "Selling Price (TZS)",
            valueGetter: (item) => `Tz ${numberFormat(item.selling_price || 0)}`,
          },
          {
            field: "expiry_date",
            headerName: "Expiry Date",
            valueGetter: (item) => {
              if (!item.expiry_date) return 'No expiry';
              return new Date(item.expiry_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            },
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
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => navigate(`/medicine-center/medicines/${item.id}/edit`)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={deleting ? "Deleting..." : "Delete"}>
                  <span>
                    <IconButton size="small" disabled={deleting} onClick={() => confirmDelete(item)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ),
          },
        ]}
        summationFooterColumns={[
          {
            span: 5,
            label: "TOTAL",
          },
          {
            index: 5,
            valueGetter: (items) => {
              if (!Array.isArray(items)) return 0;
              return numberFormat(
                items.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0)
              );
            },
          },
        ]}
      />
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Medicines;
