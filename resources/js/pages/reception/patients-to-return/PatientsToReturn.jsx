import React, { useEffect, useRef, useState } from "react";

import { Alert, Card, CardContent, Divider } from "@mui/material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { PageSizeSelect } from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "./Filters";

import { useFetch } from "../../../hooks";
import { formatDateForDb, formatError, getNonNull } from "../../../helpers";

const PatientsToReturn = () => {

  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: "Consulted",
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    patient_to_return: "Yes",
    to_return_date: null,
  });

  const { data, loading, error, handleFetch } = useFetch("api/consultations", {
    ...params,
    to_return_date: params.to_return_date ? formatDateForDb(params.to_return_date) : undefined,
  }, true, {
    data: [],
    total: 0,
    page: 1,
  }, (response) => response.data.data);

  useEffect(() => {
    document.title = `Patients to Return - ${window.APP_NAME}`;
  }, []);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Patients to Return" },
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
          title="Patients to Return"
          trailing={
            <React.Fragment>
              <PageSizeSelect
                pageSize={params.per_page}
                onChange={(value) => setParams({ ...params, per_page: value })}
              />
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
                headerName: "Date of Birth",
                valueGetter: (item, index) => item.payment_cache_item.payment_cache.check_in.patient.date_of_birth,
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
                field: "consultant",
                headerName: "Consultant",
                valueGetter: (item, index) => getNonNull(item.payment_cache_item.consultant).full_name,
              },
              {
                field: "to_return_date",
                headerName: "Return Date",
              },
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

export default PatientsToReturn;
