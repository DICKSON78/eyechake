import React from "react";
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";

// Resolve logo source for PDF (prefer clinic-uploaded logo; fallback to public logo)
const getLogoSrc = () => {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const clinicLogo = window?.user?.clinic?.logo;
    if (clinicLogo && typeof clinicLogo === 'string') {
      // Accept absolute URLs or relative paths stored in DB
      return clinicLogo.startsWith('http') ? clinicLogo : `${origin}${clinicLogo}`;
    }
    return `${origin}/logo.png`;
  } catch (_) {
    return '/images/logo.png';
  }
};

const Header = ({ fixed, title, subtitle, dense }) => {
  const getAddressLine = () => {
    try {
      const clinic = window?.user?.clinic;
      if (!clinic) {
        return window?.APP_NAME || 'Clinic Information';
      }

      let contacts = [clinic.name || window?.APP_NAME || 'Clinic'];

      if (clinic.address) {
        contacts.push(clinic.address);
      }
      if (clinic.phone) {
        contacts.push("Phone: " + clinic.phone);
      }
      if (clinic.email) {
        contacts.push("Email: " + clinic.email);
      }

      return contacts.join("\n");
    } catch (error) {
      console.warn('Error getting clinic address line:', error);
      return window?.APP_NAME || 'Clinic Information';
    }
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
          src={getLogoSrc()}
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
        {dense ? (
          <Text
            style={[
              styles.text,
              {
                marginTop: 4,
                textAlign: "center",
              },
            ]}
          >
            {`${getAddressLine()}`}
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
