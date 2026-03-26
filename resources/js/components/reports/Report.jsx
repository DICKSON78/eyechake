import React, { useEffect, useState } from "react";

import { Card, CardContent, Divider } from "@mui/material";
import { Header as PageHeader } from "../Page";
import Table from "../Table";
import PDFReport from "./PDFReport";
import SpreadsheetReport from "./SpreadsheetReport";

import { formatError, numberFormat } from "../../helpers";
import { useFetch, useToast } from "../../hooks";

const Report = ({
  title,
  subtitle,
  uri,
  params,
  columns,
  pdfOrientation,
  onFetch,
  headerTrailingContent,
  prependInner,
  nestedObject,
  nestedColumns,
  summationFooterColumns,
}) => {
  columns = Array.isArray(columns) ? columns.filter((e) => typeof e.show === "undefined" || e.show) : [];

  const addToast = useToast();
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const { data, loading, error, handleFetch } = useFetch(
    uri,
    {
      per_page: perPage,
      page,
      ...params,
    },
    true,
    { total: 0, data: [] },
    (response) => {
      const responseData = response.data.data;
      // Preserve totals in the returned data
      if (responseData && responseData.totals) {
        return responseData;
      }
      return responseData;
    }
  );

  useEffect(() => {
    if (typeof onFetch === "function") {
      onFetch(data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const getFooterItems = () => {
    if (!Array.isArray(summationFooterColumns)) return [];

    // Find total number of columns (including S/N added by Report)
    const totalCols = columns.length + 1; // +1 for S/N column

    // Build a map of index -> footer cell
    const footerMap = {};
    summationFooterColumns.forEach((col) => {
      let total = 0;
      let value;

      if (col.totalKey && data && data.totals && typeof data.totals[col.totalKey] !== 'undefined') {
        total = data.totals[col.totalKey];
        const numericTotal = typeof total === 'string' ? parseFloat(total) : total;
        value = numberFormat(typeof numericTotal === 'number' && !isNaN(numericTotal) ? numericTotal : 0);
      } else if (typeof col.reducer === "function") {
        const items = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        total = items.reduce(col.reducer, 0);
        value = numberFormat(total);
      } else if (typeof col.value !== 'undefined') {
        value = col.value;
      } else {
        value = '';
      }

      const result = { ...col, value };
      if (typeof col.span === "number") {
        result.tableCellProps = { colSpan: col.span };
      }

      footerMap[col.index] = result;
    });

    // Build final array - place items at their index positions
    const maxIndex = Math.max(...Object.keys(footerMap).map(Number), totalCols);
    const footerColumns = [];
    let i = 1;
    while (i <= maxIndex) {
      if (footerMap[i]) {
        footerColumns.push(footerMap[i]);
        const span = footerMap[i].tableCellProps?.colSpan || 1;
        i += span;
      } else {
        footerColumns.push({ value: '' });
        i++;
      }
    }

    return footerColumns;
  };

  return (
    <Card>
      <PageHeader
        title={title}
        trailing={
          <React.Fragment>
            {headerTrailingContent}
            <PDFReport
              title={title}
              subtitle={subtitle}
              columns={Array.isArray(columns) ? columns.filter(
                (col) => typeof col.webOnly === "undefined" || !col.webOnly
              ) : []}
              items={Array.isArray(data.data) ? data.data : []}
              orientation={pdfOrientation}
              nestedObject={nestedObject}
              nestedColumns={nestedColumns}
              summationFooterColumns={summationFooterColumns}
            />
            <SpreadsheetReport
              title={title}
              columns={Array.isArray(columns) ? columns.filter(
                (col) => typeof col.webOnly === "undefined" || !col.webOnly
              ) : []}
              items={Array.isArray(data.data) ? data.data : []}
              format="xlsx"
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
              valueGetter: (item, index) => perPage * (page - 1) + index + 1,
            },
            ...(columns || []),
          ]}
          items={Array.isArray(data.data) ? data.data : []}
          itemCount={data.total}
          page={page}
          pageSize={perPage}
          onPageChange={(page) => setPage(page)}
          onPageSizeChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
          renderExpanded={
            nestedObject
              ? (item, index) => (
                <Table
                  columns={[
                    {
                      field: "index",
                      headerName: "S/N",
                      valueGetter: (item, index) => index + 1,
                    },
                    ...(nestedColumns || []),
                  ]}
                  items={
                    Array.isArray(data.data) && data.data[index] ? data.data[index][nestedObject] : []
                  }
                  hidePaginationFooter
                />
              )
              : null
          }
          repeatHead={!!nestedObject}
          footerItems={summationFooterColumns ? [getFooterItems()] : null}
        />
      </CardContent>
    </Card>
  );
};

export default Report;
