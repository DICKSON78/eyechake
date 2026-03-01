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
import { formatError, numberFormat } from "../../../helpers";

const HighValuePatients = () => {
  const addToast = useToast();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    high_value: "500000-1000000",
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/marketing/high-value-patients",
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
    document.title = `High Value Patients - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing Management" },
        { title: "High Value Patients" },
      ]}
    >
      <Card>
        <PageHeader
          title="High Value Patients"
          subtitle={
            params.high_value === '1000000+'
              ? 'Patients who paid 1,000,000+ TZS'
              : params.high_value === '500000-1000000'
                ? 'Patients who paid 500,000 - 1,000,000 TZS'
                : 'High Value Patients'
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
                headerName: "Patient Name",
              },
              {
                field: "phone",
                headerName: "Phone",
              },
              {
                field: "email",
                headerName: "Email",
              },
              {
                field: "total_payments",
                headerName: "Total Payments (TZS)",
                valueGetter: (item) => numberFormat(item.total_payments),
              },
              {
                field: "patient_class",
                headerName: "Class",
                renderCell: (item) => (
                    <Chip
                        label={item.patient_class}
                        color={item.patient_class === 'Class 2' ? 'secondary' : 'primary'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                    />
                ),
              },
              {
                field: "region",
                headerName: "Region",
              },
              {
                field: "district",
                headerName: "District",
              },
              {
                field: "is_vip",
                headerName: "VIP",
                renderCell: (item) =>
                  item.is_vip ? (
                    <Chip label="VIP" size="small" color="primary" />
                  ) : (
                    "-"
                  ),
              },
              {
                field: "is_businessperson",
                headerName: "Business",
                renderCell: (item) =>
                  item.is_businessperson ? (
                    <Chip label="Business" size="small" color="warning" />
                  ) : (
                    "-"
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
    </Page>
  );
};

export default HighValuePatients;

