import React, { useEffect, useState } from "react";

import { Alert, Card, CardContent, Divider } from "@mui/material";
import { Header as PageHeader } from "../Page";
import Table, { PageSizeSelect } from "../Table";
import PDFReport from "./PDFReport";
import SpreadsheetReport from "./SpreadsheetReport";

import { formatError } from "../../helpers";
import { useFetch } from "../../hooks";

const Report = ({ title, subtitle, uri, params, columns, onFetch, headerTrailingContent, prependInner }) => {
  columns = columns.filter((e) => typeof e.show === "undefined" || e.show);

  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const { data, loading, error, handleFetch } = useFetch(uri, {
    per_page: perPage.value,
    page,
    ...(params || {})
  }, true, { total: 0, data: [], }, (response) => response.data.data);

  useEffect(() => {
    if (typeof onFetch === "function") {
      onFetch(data);
    }
  }, [data]);

  return (
    <React.Fragment>
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
          title={title}
          trailing={
            <React.Fragment>
              {headerTrailingContent}
              <PDFReport
                title={title}
                subtitle={subtitle}
                columns={columns}
                items={data.data}
              />
              <SpreadsheetReport
                title={title}
                columns={columns}
                items={data.data}
                format="xlsx"
              />
              <PageSizeSelect
                pageSize={perPage}
                onChange={(value) => setPerPage(value)}
              />
            </React.Fragment>
          }
        />
        <Divider />
        <CardContent>
          {prependInner}
          <Table
            loading={loading}
            columns={[
              {
                field: "index",
                headerName: "S/N",
                valueGetter: (item, index) => ((perPage * (page - 1)) + index + 1),
              },
              ...(columns || {})
            ]}
            items={data.data}
            itemCount={data.total}
            page={page}
            pageSize={perPage}
            onPageChange={(page) => setPage(page)}
          />
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

export default Report;
