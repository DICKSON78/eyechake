import React, { useEffect, useRef, useState } from "react";

import { Alert, Button, Card, CardContent, Chip, Divider, IconButton, Stack, Tooltip } from "@mui/material";
import { EditRounded as EditIcon } from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { PageSizeSelect, SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";
import CreateDepartment from "./CreateDepartment";
import EditDepartment from "./EditDepartment";

import { useFetch } from "../../../hooks";
import { formatError } from "../../../helpers";

const Departments = () => {

  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch("api/departments", params, true, {
    data: [],
    total: 0,
    page: 1
  }, (response) => response.data.data);

  useEffect(() => {
    document.title = `Departments - ${window.APP_NAME}`;
  }, []);

  const openCreateDepartmentModal = () => {
    let component = (
      <CreateDepartment
        modal={modalRef.current}
        fetchDepartments={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Department", component);
  };

  const openEditDepartmentModal = (item) => {
    let component = (
      <EditDepartment
        item={item}
        modal={modalRef.current}
        fetchDepartments={handleFetch}
      />
    );

    modalRef.current.open("Edit Department", component);
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
        { title: "Departments" },
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
          title="Departments"
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
                onClick={openCreateDepartmentModal}
              >
                New Department
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
                headerName: "Department Name",
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
                    alignDepartments="center"
                    divider={<Divider orientation="vertical" sx={{ height: 16 }}/>}
                    spacing={1}
                  >
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEditDepartmentModal(item)}
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

export default Departments;
