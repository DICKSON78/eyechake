import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

const Descriptions = ({ columns, items, containerStyle, horizontal }) => {

  items = (items || []).filter((e) => !!e.value)
    .reduce((a, e, i) => (i % columns ? a[a.length - 1].push(e) : a.push([e]), a), []);
  columns = columns || 3;

  return (
    <View style={containerStyle}>
      {items.map((e, i) => (
        <View
          key={i}
          style={{
            marginVertical: 2,
            flexDirection: "row",
          }}
        >
          {e.map((f, j) => (
            <View
              key={j}
              style={{
                width: `${100 / columns}%`,
                flexDirection: "row",
                ...(horizontal && {
                  flexDirection: "column",
                }),
              }}
            >
              <Text style={[
                styles.text,
                {
                  flex: 1,
                  fontWeight: "bold",
                }]}
              >
                {f.label}
              </Text>
              <Text style={[
                styles.text,
                {
                  width: "60%",
                  ...(horizontal && {
                    flex: 1,
                  }),
                }]}
              >
                {!horizontal ? ": " : ""}{f.value}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 7,
    fontFamily: "Custom",
  },
});

export default Descriptions;
