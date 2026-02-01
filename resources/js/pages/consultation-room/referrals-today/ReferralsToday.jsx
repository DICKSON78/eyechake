import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Card, CardContent, Divider, Stack } from "@mui/material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";

import { useFetch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getAge } from "../../../helpers";

const ReferralsToday = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    start_date: new Date(),
    end_date: new Date(),
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
  });

  const { data, loading, error } = useFetch(
    "api/patients",
    {
      ...params,
      start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
      info_source_name: 'Referral', // Filter by referral source
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Referrals Made Today - ${window.APP_NAME}`;
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
        { title: "Consultation Room" },
        { title: "Referrals Made Today" },
      ]}
    >
      <Card>
        <PageHeader
          title="Referrals Made Today"
          subtitle={`${(data && typeof data.total === 'number') ? data.total : 0} referrals`}
        />
        <Divider />
        <CardContent>
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
                valueGetter: (item, index) => item.full_name,
              },
              {
                field: "patient_id",
                headerName: "Patient Number",
                valueGetter: (item, index) => item.id,
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item, index) =>
                  item.date_of_birth ? getAge(item.date_of_birth) : 'N/A',
              },
              {
                field: "gender",
                headerName: "Gender",
                valueGetter: (item, index) => item.gender || 'N/A',
              },
              {
                field: "phone",
                headerName: "Phone Number",
                valueGetter: (item, index) => item.phone || 'N/A',
              },
              {
                field: "information_source",
                headerName: "Referral Source",
                valueGetter: (item, index) => item.information_source?.name || 'N/A',
              },
              {
                field: "created_at",
                headerName: "Date Created",
                valueGetter: (item) => item.created_at,
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    divider={
                      <Divider
                        orientation="vertical"
                        sx={{ height: 16 }}
                      />
                    }
                    spacing={1}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        navigate(`/reception/patients/${item.id}`);
                      }}
                    >
                      View
                    </Button>
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
    </Page>
  );
};

export default ReferralsToday;

