import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { Button, Card, CardContent, Chip, Divider, LinearProgress, Skeleton, Stack } from "@mui/material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import PatientDetails from "../../reception/patients/PatientDetails";
import Table from "../../../components/Table";
import TextField from "../../../components/TextField";
import ConfirmationDialog from "../../../components/ConfirmationDialog";

import { useFetch, usePost, useToast } from "../../../hooks";
import { formatError, getValidationError, numberFormat } from "../../../helpers";
import usePatch from "../../../hooks/usePatch";

const ProcedureRequestItems = () => {

  const addToast = useToast();
  const { patientId, paymentCacheId } = useParams();

  const modalRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();

  const [selectedItems, setSelectedItems] = useState([]);

  const {
    data: items,
    setData: setItems,
    loading: loadingItems,
    handleFetch: fetchItems
  } = useFetch("api/patient-payment-cache-items", {
    per_page: 500,
    payment_cache_id: paymentCacheId,
    consultation_type: "Procedure"
  }, false, [], (response) => response.data.data.data);

  const { handlePatch: handleAutoSave } = usePatch();
  const { data, loading, error, handlePost, setError } = usePost("api/patient-payment-cache-items/complete", {
    payment_cache_id: paymentCacheId,
    items: selectedItems.map((e) => e.id),
  });

  useEffect(() => {
    document.title = `Procedure Request Items - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (patient) {
      fetchItems();
    }
  }, [patient]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      fetchItems();
      setSelectedItems([]);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const autoSave = (item, field, value) => {
    if (value !== item[field]) {
      handleAutoSave(`api/patient-payment-cache-items/${item.id}`, {
        [field]: value
      });
    }
  };

  const confirmSubmitComplete = (title) => {
    if (!selectedItems.length) {
      return setError(getValidationError("Please select at least one procedure."));
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handlePost();
        }}
      />
    );

    modalRef.current.open(title, component, "sm");
  };

  const getTotalAmount = () => {
    return items.reduce((acc, e) => acc + ((e.unit_price || 0) * (e.quantity || 0)), 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Paid":
        return "info";
      case "Billed":
        return "purple";
      case "Served":
        return "success";
    }

    return "neutral";
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending":
        return "Not Paid";
    }

    return status;
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Procedure Room" },
        { title: "Procedure Requests" },
        { title: patientId },
      ]}
    >
      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={(responseData) => setPatient(responseData)}
      />

      {loadingPatient ?
        <Skeleton
          variant="rounded"
          height={256}
        />
        : null
      }

      {patient ?
        <Card>
          <PageHeader title="Procedure Request Items"/>
          <Divider />
          <CardContent>
            <Table
              loading={loadingItems}
              columns={[
                {
                  field: "index",
                  headerName: "S/N",
                  valueGetter: (item, index) => (index + 1),
                },
                {
                  field: "item_id",
                  headerName: "Item Name",
                  valueGetter: (item, index) => item.item.name,
                },
                {
                  field: "payment_mode_id",
                  headerName: "Payment Mode",
                  valueGetter: (item, index) => item.payment_mode.name,
                },
                {
                  field: "unit_price",
                  headerName: "Unit Price",
                  valueGetter: (item, index) => numberFormat(item.unit_price || 0),
                },
                {
                  field: "quantity",
                  headerName: "Quantity",
                  valueGetter: (item, index) => numberFormat(item.quantity || 0),
                },
                {
                  field: "total_price",
                  headerName: "Subtotal",
                  valueGetter: (item, index) => numberFormat((item.unit_price || 0) * (item.quantity || 0)),
                },
                {
                  field: "comments",
                  headerName: "Comments",
                  renderCell: (item, index) => (
                    <TextField
                      disabled={item.status === "Served"}
                      fullWidth
                      defaultValue={item.comments}
                      onChange={(value) => {
                        let tmp = items;
                        tmp[index] = { ...item, comments: value };
                        setItems(tmp);
                        setSelectedItems(selectedItems.filter((e,) => e.id !== item.id));
                        autoSave(item, "comments", value);
                      }}
                    />
                  ),
                },
                {
                  field: "status",
                  headerName: "Status",
                  renderCell: (item, index) => (
                    <Chip
                      size="small"
                      color={getStatusColor(item.status)}
                      label={getStatusLabel(item.status)}
                    />
                  ),
                }
              ]}
              items={items}
              hidePaginationFooter
              checkboxSelection={(item, index) => item.status === "Paid" || item.status === "Billed"}
              checked={selectedItems}
              setChecked={setSelectedItems}
              footerItems={[
                [
                  { value: "TOTAL", tableCellProps: { colSpan: 6 }, },
                  { value: numberFormat(getTotalAmount() || 0), }
                ]
              ]}
            />
          </CardContent>
          <Divider />
          {loading && <LinearProgress />}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="flex-end"
            flexWrap="wrap"
            p={2}
          >
            <Button
              disabled={loading}
              variant="contained"
              onClick={() => confirmSubmitComplete("Complete Procedures")}
            >
              Complete Procedures
            </Button>
          </Stack>
        </Card>
        : null
      }
      <Modal ref={modalRef}/>
    </Page>
  );
};

export default ProcedureRequestItems;
