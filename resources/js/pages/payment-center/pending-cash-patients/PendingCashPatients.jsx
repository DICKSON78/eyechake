import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert, Button, Card, CardContent, Divider, Stack } from "@mui/material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { PageSizeSelect } from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filter from "./Filter";

import { useFetch } from "../../../hooks";
import { formatError, getNonNull } from "../../../helpers";

const PendingCashPayments = () => {

  const navigate = useNavigate();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    patient_name: undefined,
    item_status: "Pending",
    item_payment_mode_type: "Cash",
  });

  const { data, loading, error, handleFetch } = useFetch("api/patient-payment-cache", params, true, {
    data: [],
    total: 0,
    page: 1,
  }, (response) => response.data.data);

  useEffect(() => {
    document.title = `Patients Sent to Cashier - ${window.APP_NAME}`;
  }, []);

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

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: "Patients Sent to Cashier" },
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
        <PageHeader
          title="Patients Sent to Cashier"
          trailing={
            <React.Fragment>
              <PageSizeSelect
                pageSize={params.per_page}
                onChange={(value) => setParams({ ...params, per_page: value })}
              />
              <Button
                variant="contained"
                color="secondary"
                disableElevation
                onClick={openFilterModal}
              >
                Filter
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
                valueGetter: (item, index) => ((params.per_page * (params.page - 1)) + index + 1),
              },
              {
                field: "full_name",
                headerName: "Patient Name",
                valueGetter: (item, index) => getNonNull(item.check_in).patient.full_name,
              },
              {
                field: "patient_id",
                headerName: "Patient Number",
                valueGetter: (item, index) => getNonNull(item.check_in).patient_id,
              },
              {
                field: "date_of_birth",
                headerName: "Date of Birth",
                valueGetter: (item, index) => getNonNull(item.check_in).patient.date_of_birth,
              },
              {
                field: "gender",
                headerName: "Gender",
                valueGetter: (item, index) => getNonNull(item.check_in).patient.gender,
              },
              {
                field: "phone",
                headerName: "Phone Number",
                valueGetter: (item, index) => getNonNull(item.check_in).patient.phone,
              },
              {
                field: "created_by",
                headerName: "Sent By",
                valueGetter: (item, index) => getNonNull(item.creator).full_name,
              },
              {
                field: "created_at",
                headerName: "Date",
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    divider={<Divider orientation="vertical" sx={{ height: 16 }}/>}
                    spacing={1}
                  >
                    <Button
                      variant="contained"
                      disableElevation
                      size="small"
                      onClick={() => navigate(`/payment-center/pending-cash-payments/${getNonNull(item.check_in).patient_id}/${item.id}`)}
                    >
                      Manage
                    </Button>
                  </Stack>
                ),
              }
            ]}
            items={data.data}
            itemCount={data.total}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef}/>
    </Page>
  );
};

export default PendingCashPayments;
