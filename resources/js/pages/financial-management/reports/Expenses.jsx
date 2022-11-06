import React, { useEffect, useState } from "react";
import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import Filters from "../expenses/Filters";

import { useFetch } from "../../../hooks";
import { formatDateForDb, getDateRangeTitle, getNonNull, numberFormat } from "../../../helpers";

const Expenses = () => {

  const { data: categories } = useFetch("api/expense-categories", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    category_id: undefined,
    start_date: new Date(),
    end_date: undefined,
  });

  useEffect(() => {
    document.title = `Expenses Report - ${window.APP_NAME}`;
  }, []);


  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Financial Management" },
        { title: "Reports" },
        { title: "Expenses Report" },
      ]}
    >
      <Report
        title="Expenses Report"
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/expenses"
        params={{
          ...params,
          start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
          end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
        }}
        prependInner={(
          <Filters
            params={params}
            setParams={setParams}
            sx={{
              mb: 2,
            }}
          />
        )}
        columns={[
          {
            field: "category_id",
            headerName: "Category",
            valueGetter: (item, index) => item.category.name,
          },
          {
            field: "amount",
            headerName: "Amount",
            valueGetter: (item, index) => numberFormat(item.amount)
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
        ]}
        summationFooterColumns={[
          { value: "TOTAL", span: 2, index: 1 },
          { reducer: (acc, item, index) => acc + item.amount, index: 2 },
        ]}
      />
    </Page>
  );
};

export default Expenses;
