import React, { useCallback } from "react";
import { utils, writeFile } from "xlsx";
import { Button } from "@mui/material";

const SpreadsheetReport = ({ title, format, columns, items }) => {

  const generate = useCallback(() => {
    // Flatten objects
    const rows = items.map(
      (r) => {
        let e = {};
        columns.forEach((c) => {
          e[c.field] = c.valueGetter ? c.valueGetter(r) : r[c.field];
        });

        return e;
      },
      [items]
    );

    // Generate worksheet and workbook
    const worksheet = utils.json_to_sheet(rows);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Sheet 1");

    // Fix headers
    utils.sheet_add_aoa(worksheet, [columns.map((c) => c.headerName)], {
      origin: "A1",
    });

    /* Create a file */
    writeFile(workbook, `${title}.${format}`);
  }, [title, format, columns, items]);

  return (
    <Button
      variant="contained"
      color="info"
      disableElevation
      onClick={generate}
    >
      {format === "csv" ? "CSV" : "Excel"}
    </Button>
  );
};

export default SpreadsheetReport;
