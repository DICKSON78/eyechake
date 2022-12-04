import React, { useEffect, useRef, useState } from "react";

import { Alert, Button, Card, CardContent, Chip, Divider, IconButton, Stack, Tooltip } from "@mui/material";
import { EditRounded as EditIcon } from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { PageSizeSelect, SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";
import CreateJobTitle from "./CreateJobTitle";
import EditJobTitle from "./EditJobTitle";

import { useFetch } from "../../../hooks";
import { formatError } from "../../../helpers";

const JobTitles = () => {

  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch("api/job-titles", params, true, {
    data: [],
    total: 0,
    page: 1
  }, (response) => response.data.data);

  useEffect(() => {
    document.title = `Job Titles - ${window.APP_NAME}`;
  }, []);

  const openCreateJobTitleModal = () => {
    let component = (
      <CreateJobTitle
        modal={modalRef.current}
        fetchJobTitles={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Job Title", component);
  };

  const openEditJobTitleModal = (item) => {
    let component = (
      <EditJobTitle
        item={item}
        modal={modalRef.current}
        fetchJobTitles={handleFetch}
      />
    );

    modalRef.current.open("Edit Job Title", component);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
    }

    return "neutral";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Settings" },
        { title: "Job Titles" },
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
          title="Job Titles"
          trailing={(
            <React.Fragment>
              <PageSizeSelect
                pageSize={params.per_page}
                onChange={(value) => setParams({ ...params, per_page: value, page: 1 })}
              />
              <SearchTextField onChange={(value) => setParams({ ...params, q: value })}/>
              <Button
                variant="contained"
                disableElevation
                onClick={openCreateJobTitleModal}
              >
                New Job Title
              </Button>
            </React.Fragment>
          )}
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
                field: "name",
                headerName: "Job Title",
              },
              {
                field: "description",
                headerName: "Description",
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  <Chip
                    size="small"
                    color={getStatusColor(item.status)}
                    label={item.status}
                  />
                ),
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack
                    direction="row"
                    alignJobTitles="center"
                    divider={<Divider orientation="vertical" sx={{ height: 16 }}/>}
                    spacing={1}
                  >
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEditJobTitleModal(item)}
                      >
                        <EditIcon fontSize="small"/>
                      </IconButton>
                    </Tooltip>
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

export default JobTitles;
