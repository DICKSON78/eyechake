import React, { useEffect, useRef, useState } from "react";

import { Alert, Card, CardContent, Divider } from "@mui/material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { PageSizeSelect } from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "./Filters";

import { useFetch } from "../../../hooks";
import { formatDateForDb, formatError, getNonNull } from "../../../helpers";

const Messages = () => {

  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    patient_id: undefined,
    patient_name: undefined,
    start_date: null,
    end_date: null,
  });

  const { data, loading, error, handleFetch } = useFetch("api/messages", {
    ...params,
    start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
    end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
  }, true, {
    data: [],
    total: 0,
    page: 1,
  }, (response) => response.data.data);

  useEffect(() => {
    document.title = `Sent Messages - ${window.APP_NAME}`;
  }, []);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Sent Messages" },
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
          title="Sent Messages"
          trailing={(
            <React.Fragment>
              <PageSizeSelect
                pageSize={params.per_page}
                onChange={(value) => setParams({ ...params, per_page: value, page: 1 })}
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
                field: "message",
                headerName: "Message",
              },
              {
                field: "created_at",
                headerName: "Date Sent",
              },
              {
                field: "full_name",
                headerName: "Patient Name",
                valueGetter: (item, index) => getNonNull(item.patient).full_name,
              },
              {
                field: "patient_id",
                headerName: "Patient Number",
                valueGetter: (item, index) => item.patient_id,
              },
              {
                field: "phone",
                headerName: "Phone Number",
                valueGetter: (item, index) => item.phone,
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

export default Messages;
