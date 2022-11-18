import React, { useEffect, useRef, useState } from "react";

import { Alert, Button, Card, CardContent, Chip, Divider, IconButton, Stack, Tooltip } from "@mui/material";
import { EditRounded as EditIcon } from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { PageSizeSelect } from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "./Filters";
import CreateExpense from "./CreateExpense";
import EditExpense from "./EditExpense";
import PayExpense from "./PayExpense";

import { useFetch } from "../../../hooks";
import { formatDateForDb, formatError, getNonNull, numberFormat } from "../../../helpers";

const Expenses = ({ module, createdBy }) => {

  const modalRef = useRef();

  const { data: categories } = useFetch("api/expense-categories", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: "Pending",
    category_id: undefined,
    start_date: new Date(),
    end_date: undefined,
    created_by: createdBy,
  });

  const { data, loading, error, handleFetch } = useFetch("api/expenses", {
    ...params,
    start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
    end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
  }, true, {
    data: [],
    total: 0,
    page: 1
  }, (response) => response.data.data);

  useEffect(() => {
    document.title = `Expenses - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    setParams({ ...params, created_by: createdBy });
  }, [createdBy]);

  const openCreateExpenseModal = () => {
    let component = (
      <CreateExpense
        modal={modalRef.current}
        fetchExpenses={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Expense", component);
  };

  const openEditExpenseModal = (item) => {
    let component = (
      <EditExpense
        item={item}
        modal={modalRef.current}
        fetchExpenses={handleFetch}
      />
    );

    modalRef.current.open("Edit Expense", component);
  };

  const openPayExpenseModal = (item) => {
    let component = (
      <PayExpense
        item={item}
        modal={modalRef.current}
        fetchExpenses={handleFetch}
      />
    );

    modalRef.current.open("Pay Expense", component);
  };

  const getStatus = (item) => {
    if (item.paid_amount < item.total_amount) {
      return "Pending"
    }

    if (item.paid_amount >= item.total_amount) {
      return "Paid"
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Paid":
        return "success";
    }

    return "neutral";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: module || "Financial Management" },
        { title: "Expenses" },
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
          title="Expenses"
          trailing={
            <React.Fragment>
              <PageSizeSelect
                pageSize={params.per_page}
                onChange={(value) => setParams({ ...params, per_page: value })}
              />
              <Button
                variant="contained"
                disableElevation
                onClick={openCreateExpenseModal}
              >
                New Expense
              </Button>
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
                field: "category_id",
                headerName: "Category",
                valueGetter: (item, index) => item.category.name,
              },
              {
                field: "total_amount",
                headerName: "Total Amount",
                valueGetter: (item, index) => numberFormat(item.total_amount)
              },
              {
                field: "paid_amount",
                headerName: "Paid Amount",
                valueGetter: (item, index) => numberFormat(item.paid_amount)
              },
              {
                field: "remaining_amount",
                headerName: "Remaining Amount",
                valueGetter: (item, index) => numberFormat(item.total_amount - item.paid_amount)
              },
              {
                field: "description",
                headerName: "Description",
              },
              {
                field: "expense_date",
                headerName: "Expense Date",
              },
              {
                field: "created_by",
                headerName: "Created By",
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
                    color={getStatusColor(getStatus(item))}
                    label={getStatus(item)}
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
                    {item.paid_amount < item.total_amount ?
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => openEditExpenseModal(item)}
                        >
                          <EditIcon fontSize="small"/>
                        </IconButton>
                      </Tooltip>
                      : null
                    }
                    {item.paid_amount < item.total_amount ?
                      <Button
                        variant="contained"
                        disableElevation
                        size="small"
                        onClick={() => openPayExpenseModal(item)}
                      >
                        Pay
                      </Button>
                      : null
                    }
                  </Stack>
                ),
              }
            ]}
            items={data.data}
            itemCount={data.total}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
            footerItems={[
              [
                { value: "TOTAL", tableCellProps: { colSpan: 2 } },
                { value: numberFormat(data.data.reduce((acc, item) => acc + item.total_amount, 0)) },
                { value: numberFormat(data.data.reduce((acc, item) => acc + item.paid_amount, 0)) },
                { value: numberFormat(data.data.reduce((acc, item) => acc + (item.total_amount - item.paid_amount), 0)) },
              ]
            ]}
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef}/>
    </Page>
  );
};

export default Expenses;
