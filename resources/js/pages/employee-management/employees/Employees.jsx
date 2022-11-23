import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip
} from "@mui/material";
import { EditRounded as EditIcon, MoreVert as MoreIcon } from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { PageSizeSelect } from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "./Filters";
import EditEmployee from "./EditEmployee";
import EditEmployeeAccessDetails from "./EditEmployeeAccessDetails";

import { useFetch } from "../../../hooks";
import { formatError, getNonNull } from "../../../helpers";

const Employees = () => {

  const navigate = useNavigate();
  const modalRef = useRef();

  const [item, setItem] = useState();
  const [anchorEl, setAnchorEl] = useState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    employee_number: undefined,
    name: undefined,
    gender: undefined,
    department_id: undefined,
    job_title_id: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch("api/users", params, true, {
    data: [],
    total: 0,
    page: 1
  }, (response) => response.data.data);

  useEffect(() => {
    document.title = `Employees - ${window.APP_NAME}`;
  }, []);

  const openEditEmployeeModal = (item) => {
    let component = (
      <EditEmployee
        item={item}
        modal={modalRef.current}
        fetchEmployees={handleFetch}
      />
    );

    modalRef.current.open("Edit Employee", component, "md");
  };

  const openEditEmployeeAccessDetailsModal = () => {
    let component = (
      <EditEmployeeAccessDetails
        item={item}
        modal={modalRef.current}
        fetchEmployees={handleFetch}
      />
    );

    modalRef.current.open("Edit Employee Access Details", component, "sm", item.full_name);
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.target);
    setIsMenuOpen(true);
    setItem(item);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setAnchorEl(null);
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
        { title: "Employee Management" },
        { title: "Employees" },
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
          title="Employees"
          trailing={(
            <React.Fragment>
              <PageSizeSelect
                pageSize={params.per_page}
                onChange={(value) => setParams({ ...params, per_page: value })}
              />
              <Button
                variant="contained"
                disableElevation
                onClick={() => navigate("/employee-management/employees/new")}
              >
                New Employee
              </Button>
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
                headerName: "Employee Name",
              },
              {
                field: "employee_number",
                headerName: "Employee Number",
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
                field: "department_id",
                headerName: "Department",
                valueGetter: (item, index) => getNonNull(item.department).name,
              },
              {
                field: "job_title_id",
                headerName: "Job Title",
                valueGetter: (item, index) => getNonNull(item.job_title).name,
              },
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
                    alignItems="center"
                    divider={<Divider orientation="vertical" sx={{ height: 16 }}/>}
                    spacing={1}
                  >
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEditEmployeeModal(item)}
                      >
                        <EditIcon fontSize="small"/>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More">
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuOpen(event, item)}
                      >
                        <MoreIcon fontSize="small"/>
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
      {item ?
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              openEditEmployeeAccessDetailsModal();
              handleMenuClose();
            }}
          >
            Edit Access Details
          </MenuItem>
        </Menu>
        : null
      }
      <Modal ref={modalRef}/>
    </Page>
  );
};

export default Employees;
