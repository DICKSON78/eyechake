import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Alert, Button, Card, CardContent, Checkbox, Divider, FormControlLabel, Stack } from "@mui/material";
import Page, { Header as PageHeader } from "../../components/Page";
import Table, { PageSizeSelect } from "../../components/Table";
import Modal from "../../components/Modal";
import Filters from "./PatientFilters";

import { useFetch } from "../../hooks";
import { capitalize, formatDateForDb, formatError, getAge, getNonNull } from "../../helpers";

const ConsultationPatients = () => {

  const navigate = useNavigate();
  const modalRef = useRef();

  const { status } = useParams();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    consultant: "Doctor",
    status: capitalize(status),
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    item_payment_mode_id: undefined,
    start_date: new Date(),
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch("api/consultations", {
    ...params,
    start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
    end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
  }, true, {
    data: [],
    total: 0,
    page: 1,
  }, (response) => response.data.data);

  useEffect(() => {
    document.title = `${getTitle()} - ${window.APP_NAME}`;
    setParams({ ...params, status: capitalize(status) });
  }, [status]);

  const getTitle = () => {
    if (status === "pending") {
      return "Patients Sent to Doctor";
    }
    if (status === "consulted") {
      return "Consulted Patients";
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Consultation Room" },
        { title: getTitle() },
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
          title={getTitle()}
          trailing={(
            <React.Fragment>
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={!!params.consultant_id}
                    onChange={(event) => setParams({
                      ...params,
                      consultant_id: event.target.checked ? window.user.id : undefined
                    })}
                  />
                )}
                label="My Patients Only"
              />
              <PageSizeSelect
                pageSize={params.per_page}
                onChange={(value) => setParams({ ...params, per_page: value })}
              />
            </React.Fragment>
          )}
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
                valueGetter: (item, index) => ((params.per_page * (params.page - 1)) + index + 1),
              },
              {
                field: "full_name",
                headerName: "Patient Name",
                valueGetter: (item, index) => item.payment_cache_item.payment_cache.check_in.patient.full_name,
              },
              {
                field: "patient_id",
                headerName: "Patient Number",
                valueGetter: (item, index) => item.payment_cache_item.payment_cache.check_in.patient_id,
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item, index) => getAge(item.payment_cache_item.payment_cache.check_in.patient.date_of_birth),
              },
              {
                field: "gender",
                headerName: "Gender",
                valueGetter: (item, index) => item.payment_cache_item.payment_cache.check_in.patient.gender,
              },
              {
                field: "phone",
                headerName: "Phone Number",
                valueGetter: (item, index) => item.payment_cache_item.payment_cache.check_in.patient.phone,
              },
              {
                field: "created_by",
                headerName: "Sent By",
                valueGetter: (item, index) => getNonNull(item.creator).full_name,
                show: status === "pending"
              },
              {
                field: "consultant",
                headerName: "Consultant",
                valueGetter: (item, index) => getNonNull(item.payment_cache_item.consultant).full_name,
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
                      onClick={() => navigate(`/consultation-room/consultation-patients/${status}/${item.payment_cache_item.payment_cache.check_in.patient_id}/${item.id}/clinical-notes`)}
                    >
                      {status === "pending" ? "Manage" : "View"}
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

export default ConsultationPatients;
