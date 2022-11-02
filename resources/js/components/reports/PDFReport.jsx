import React, { useCallback, useState } from "react";
import { Button } from "@mui/material";
import { Document, Font, Page, pdf, StyleSheet, Text, View } from "@react-pdf/renderer";

import fontRegular from "../../../fonts/Custom-Regular.ttf";
import fontItalic from "../../../fonts/Custom-Italic.ttf";
import fontBold from "../../../fonts/Custom-Bold.ttf";

import Header from "../pdf/Header";
import Footer from "../pdf/Footer";

Font.register({
  family: "Custom",
  fonts: [
    { src: fontRegular },
    { src: fontItalic, fontStyle: "italic" },
    { src: fontBold, fontWeight: 700 },
  ],
});

const PDFReportDocument = ({ title, subtitle, orientation, columns, items }) => {
  return (
    <Document
      title={title}
      creator={window.APP_NAME}
      producer={window.APP_NAME}
    >
      <Page
        size="A4"
        style={{
          width: "100%",
          backgroundColor: "white",
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 35,
        }}
        orientation={orientation || "portrait"}
      >
        <Header
          title={title}
          subtitle={subtitle}
          textStyle={styles.text}
        />

        <View style={[styles.table, { marginBottom: 16 }]}>
          <View style={[styles.tableRow, styles.lightGrey]}>
            <Text
              style={[
                styles.text,
                styles.tableCell,
                { fontWeight: "bold", flex: 0.5 },
              ]}
            >
              S/N
            </Text>
            {columns.map((e) => (
              <Text
                key={e.field}
                style={[
                  styles.text,
                  styles.tableCell,
                  {
                    fontWeight: "bold",
                    flex: e.flex || 1,
                    textAlign: e.pdfTextAlignment || "left",
                  },
                ]}
              >
                {e.headerName}
              </Text>
            ))}
          </View>
          {items.map((e, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.text, styles.tableCell, { flex: 0.5 }]}>
                {i + 1}
              </Text>
              {columns.map((f) => (
                <Text
                  key={f.field}
                  style={[
                    styles.text,
                    styles.tableCell,
                    {
                      flex: f.flex || 1,
                      textAlign: f.pdfTextAlignment || "left",
                    },
                  ]}
                >
                  {f.valueGetter ? f.valueGetter(e) : e[f.field]}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <Footer
          textStyle={styles.text}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </Page>
    </Document>
  );
};

const PDFReport = ({ title, columns, items, ...rest }) => {
  const [loading, setLoading] = useState(false);

  const generatePdfDocument = useCallback(async () => {
    setLoading(true);
    const blob = await pdf(
      <PDFReportDocument
        title={title}
        columns={columns}
        items={items}
        {...rest}
      />
    ).toBlob();
    setLoading(false);
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
  }, [title, columns, items]);

  return (
    <Button
      disabled={loading}
      variant="contained"
      color="secondary"
      disableElevation
      onClick={generatePdfDocument}
    >
      {loading ? "Generating PDF..." : "PDF"}
    </Button>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 8,
    fontFamily: "Custom",
  },
  lightGrey: {
    backgroundColor: "#F5F5F5",
  },
  table: {
    border: "1pt solid #666666",
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    border: "1pt solid #666666",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    padding: 4,
    flex: 1,
    fontSize: 8,
  },
});

export default PDFReport;
