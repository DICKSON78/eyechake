import React from "react";
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";

import logo from "../../../images/logo.png";

const Header = ({ fixed, title, subtitle, dense }) => {
  return (
    <View
      fixed={fixed}
      style={{
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderTop: "1pt solid #00225f",
        borderBottom: "1pt solid #d71a20",
        marginBottom: 16,
        ...(dense && {
          flexDirection: "column",
          alignItems: "center",
          paddingVertical: 4,
          marginBottom: 8,
        }),
      }}
    >
      <View
        style={{ width: 112 }}>
        <Image
          src={logo}
          style={{
            width: 32,
            height: "auto",
            ...(dense && {
              margin: "0 auto",
            }),
          }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.text,
            {
              fontSize: 12,
              fontWeight: "bold",
              textTransform: "uppercase",
              textAlign: "center",
              ...(dense && {
                fontSize: 8,
              }),
            },
          ]}
        >
          {title}
        </Text>
        {subtitle ?
          <Text
            style={[
              styles.text,
              {
                fontSize: 10,
                fontWeight: "bold",
                textTransform: "uppercase",
                textAlign: "center",
                ...(dense && {
                  fontSize: 7,
                  paddingVertical: 4,
                }),
              },
            ]}
          >
            {subtitle}
          </Text>
          : null
        }
      </View>
      {!dense ?
        <View style={{ width: 112 }}>
          <Text
            style={[
              styles.text,
              {
                fontStyle: "italic",
              },
            ]}
          >
            {`EyeCare\nP. O. Box 6857, Dar es Salaam\nPhone: 0768347657\nEmail: 0768347657`}
          </Text>
        </View>
        : null
      }
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 7,
    fontFamily: "Custom",
  },
});

export default Header;
