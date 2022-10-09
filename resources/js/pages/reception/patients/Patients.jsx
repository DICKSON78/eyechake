import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert, Button, Card, CardContent, Divider, IconButton, Stack, Tooltip } from "@mui/material";
import { EditRounded as EditIcon } from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { PageSizeSelect, SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filter from "./Filter";
import EditPatient from "./EditPatient";

import { useFetch } from "../../../hooks";
import { formatError, getNonNull } from "../../../helpers";

const Patients = () => {

  const navigate = useNavigate();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    q: "",
  });

  const columns = useMemo(() => [
    {
      field: "index",
      headerName: "S/N",
      sortable: false,
      valueGetter: (item, index) => ((params.per_page * (params.page - 1)) + index + 1),
    },
    {
      field: "full_name",
      headerName: "Patient Name",
    },
    {
      field: "id",
      headerName: "Patient Number",
    },
    {
      field: "date_of_birth",
      headerName: "Date of Birth",
    },
    {
      field: "gender",
      headerName: "Gender",
    },
    {
      field: "phone",
      headerName: "Phone Number",
    },
    {
      field: "region_id",
      headerName: "Region",
      valueGetter: (item, index) => getNonNull(item.region).name,
    },
    {
      field: "district_id",
      headerName: "District",
      valueGetter: (item, index) => getNonNull(item.district).name,
    },
    // {
    //   field: "ward_id",
    //   headerName: "Ward",
    //   valueGetter: (item, index) => getNonNull(item.ward).name,
    // },
    {
      field: "created_by",
      headerName: "Registered By",
      valueGetter: (item, index) => getNonNull(item.creator).full_name,
    },
    {
      field: "created_at",
      headerName: "Date",
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      renderCell: (item) => (
        <Stack
          direction="row"
          alignItems="center"
          divider={<Divider orientation="vertical" sx={{ height: 16 }}/>}
          spacing={1}
        >
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => openEditPatientModal(item)}
            >
              <EditIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            disableElevation
            size="small"
            onClick={() => navigate(`/reception/patients/${item.id}/check-in`)}
          >
            Check-In
          </Button>
        </Stack>
      ),
    }
  ], [params]);

  const { data, loading, error, handleFetch } = useFetch("api/patients", params, true, {
    data: [],
    total: 0,
    page: 1
  }, (response) => response.data.data);

  useEffect(() => {
    document.title = `Patients - ${window.APP_NAME}`;
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


  const openEditPatientModal = (item) => {
    let component = (
      <EditPatient
        item={item}
        modal={modalRef.current}
        fetchPatients={handleFetch}
      />
    );

    modalRef.current.open("Edit Patient", component);
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Patients/Customers" },
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
          title="List of Registered Patients"
          trailing={
            <React.Fragment>
              <PageSizeSelect
                pageSize={params.per_page}
                onChange={(value) => setParams({ ...params, per_page: value })}
              />
              <SearchTextField onChange={(value) => setParams({ ...params, q: value })}/>
              <Button
                variant="contained"
                color="secondary"
                disableElevation
                onClick={openFilterModal}
              >
                Filter
              </Button>
              <Button
                variant="contained"
                disableElevation
                onClick={() => navigate("/reception/patients/new")}
              >
                New Patient
              </Button>
            </React.Fragment>
          }
        />
        <CardContent>
          <Table
            loading={loading}
            columns={columns}
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

export default Patients;
