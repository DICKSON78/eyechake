import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

const Table = ({ containerStyle, columns, items, footerItems, renderExpanded, repeatHead }) => {

  columns = columns.filter((col) => (typeof col.show === "undefined") || col.show);

  const renderTableHeadRow = () => {
    return (
      <View style={[styles.tableRow, styles.lightGrey]}>
        {columns.map((col) => (
          <Text
            key={col.field}
            style={[
              styles.text,
              styles.tableCell,
              {
                fontWeight: "bold",
                flex: col.flex || 1,
                ...(col.style || {}),
              },
            ]}
          >
            {col.headerName}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.table, { ...(containerStyle || {}) }]}>
      {renderTableHeadRow()}
      {items.map((item, index, array) => (
        <React.Fragment key={index}>
          <View style={styles.tableRow}>
            {columns.map((col) => (
              <Text
                key={col.field}
                style={[
                  styles.text,
                  styles.tableCell,
                  {
                    flex: col.flex || 1,
                    ...(col.style || {}),
                  },
                ]}
              >
                {col.valueGetter ? col.valueGetter(item, index) : item[col.field]}
              </Text>
            ))}
          </View>
          {renderExpanded ?
            <View style={[styles.tableRow, { backgroundColor: "rgba(3, 155, 229, 0.12)" }]}>
              <View style={styles.tableCell}>
                {renderExpanded(item, index, array)}
              </View>
            </View>
            : null
          }
          {repeatHead && index < array.length - 1 ?
            <React.Fragment>
              {renderTableHeadRow()}
            </React.Fragment>
            : null
          }
        </React.Fragment>
      ))}
      {footerItems ?
        <View>
          {footerItems.map((itemColumns, index, array) => (
            <View
              key={index}
              style={[styles.tableRow, styles.lightGrey]}
            >
              {itemColumns.map((col, colIndex) => (
                <Text
                  key={colIndex}
                  style={[
                    styles.text,
                    styles.tableCell,
                    {
                      fontWeight: "bold",
                      ...(col.style || {}),
                    }
                  ]}
                >
                  {col.value}
                </Text>
              ))}
            </View>
          ))}
        </View>
        : null
      }
    </View>
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
    fontSize: 7,
  },
});

export default Table;
