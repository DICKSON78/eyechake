import React from "react";
import { Image, Text, View } from "@react-pdf/renderer";

import logo from "../../../images/logo.png";

const Header = ({ fixed, title, subtitle, textStyle }) => {
  return (
    <View
      fixed={fixed}
      style={{
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 8,
        borderBottom: "1pt solid grey",
        marginBottom: 16,
      }}
    >
      <View style={{ width: 112 }}>
        <Image
          src={logo}
          style={{
            width: 32,
            height: "auto",
          }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            textStyle,
            {
              fontSize: 12,
              fontWeight: "bold",
              textTransform: "uppercase",
              textAlign: "center",
            },
          ]}
        >
          {title}
        </Text>
        {subtitle ?
          <Text
            style={[
              textStyle,
              {
                fontSize: 10,
                fontWeight: "bold",
                textTransform: "uppercase",
                textAlign: "center",
              },
            ]}
          >
            {subtitle}
          </Text>
          : null
        }
      </View>
      <View style={{ width: 112 }}>
        <Text
          style={[
            textStyle,
            {
              fontSize: 7,
              fontStyle: "italic",
            },
          ]}
        >
          {`EyeCare\nP. O. Box 6857, Dar es Salaam\nPhone: 0768347657\nEmail: 0768347657`}
        </Text>
      </View>
    </View>
  );
};

export default Header;
