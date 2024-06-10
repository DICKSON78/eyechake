import React from "react";
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";

import logo from "../../../images/logo.png";

const Header = ({ fixed, title, subtitle, dense }) => {
  const getAddressLine = () => {
    let contacts = [window.user.clinic.name];

    if (window.user.clinic.address) {
      contacts.push(window.user.clinic.address);
    }
    if (window.user.clinic.phone) {
      contacts.push("Phone: " + window.user.clinic.phone);
    }
    if (window.user.clinic.email) {
      contacts.push("Email: " + window.user.clinic.email);
    }

    return contacts.join("\n");
  };

  return (
    <View
      fixed={fixed}
      style={{
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
        borderTop: "1pt solid #00225f",
        borderBottom: "1pt solid #d71a20",
        marginBottom: 16,
        ...(dense && {
          flexDirection: "column",
          marginBottom: 8,
        }),
      }}
    >
      <View style={{ width: 112 }}>
        <Image
          src={logo}
          style={{
            width: 80,
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
        {subtitle ? (
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
        ) : null}
      </View>
      {!dense ? (
        <View style={{ width: 112 }}>
          <Text
            style={[
              styles.text,
              {
                fontStyle: "italic",
              },
            ]}
          >
            {`${getAddressLine()}`}
          </Text>
        </View>
      ) : null}
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
