import React, { useEffect, useState } from "react";
import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import Filters from "../expenses/Filters";
import {
  formatDateForDb,
  getDateRangeTitle,
  numberFormat,
} from "../../../helpers";

const Expenses = ({ module, createdBy }) => {
  const [params, setParams] = useState({
    status: undefined,
    category_id: undefined,
    payment_channel_id: undefined,
    start_date: new Date(),
    end_date: new Date(),
    created_by: createdBy,
  });

  useEffect(() => {
    document.title = `Expenses Report - ${window.APP_NAME}`;
  }, []);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: module || "Financial Management" },
        { title: "Reports" },
        { title: "Expenses Report" },
      ]}
    >
      <Report
        title="Expenses Report"
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/reports/payment-center/expenses"
        params={{
          ...params,
          start_date: params.start_date
            ? formatDateForDb(params.start_date)
            : undefined,
          end_date: params.end_date
            ? formatDateForDb(params.end_date)
            : undefined,
        }}
        prependInner={
          <Filters
            params={params}
            setParams={setParams}
            sx={{ mb: 2 }}
          />
        }
        columns={[
          {
            field: "expense_date",
            headerName: "Expense Date",
          },
          {
            field: "category_id",
            headerName: "Category",
            valueGetter: (item, index) => item.expense?.category?.name,
          },
          {
            field: "description",
            headerName: "Description",
          },
          {
            field: "amount",
            headerName: "Amount",
            valueGetter: (item, index) => numberFormat(item.amount),
          },
          {
            field: "channel",
            headerName: "Payment Channel",
            valueGetter: (item) => item.channel?.name,
          },
          {
            field: "created_by",
            headerName: "Created By",
            valueGetter: (item, index) => item.creator?.full_name,
          },
          {
            field: "created_at",
            headerName: "Date Paid",
          },
        ]}
        summationFooterColumns={[
          { value: "TOTAL", span: 3, index: 1 },
          {
            reducer: (acc, item, index) => acc + (parseFloat(item.amount) || 0),
            index: 4,
          },
        ]}
      />
    </Page>
  );
};

export default Expenses;
