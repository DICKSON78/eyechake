import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Filters from "./Filters";
import { useFetch, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const UnreachableNumbers = () => {
  const addToast = useToast();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    source: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/marketing/unreachable-numbers",
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
    document.title = `Unreachable Numbers - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const getSourceColor = (source) => {
    return source === "sms" ? "info" : "warning";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing Management" },
        { title: "Unreachable Numbers" },
      ]}
    >
      <Card>
        <PageHeader
          title="Unreachable Numbers"
          subtitle="List of phone numbers that are unreachable"
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
                field: "patient_name",
                headerName: "Patient Name",
              },
              {
                field: "phone_number",
                headerName: "Phone Number",
              },
              {
                field: "source",
                headerName: "Source",
                renderCell: (item) => (
                  <Chip
                    label={item.source.toUpperCase()}
                    size="small"
                    color={getSourceColor(item.source)}
                    variant="outlined"
                  />
                ),
              },
              {
                field: "campaign_title",
                headerName: "Campaign/Context",
              },
              {
                field: "error_message",
                headerName: "Error Message",
              },
              {
                field: "created_at",
                headerName: "Date",
                valueGetter: (item) =>
                  item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : "N/A",
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
    </Page>
  );
};

export default UnreachableNumbers;

