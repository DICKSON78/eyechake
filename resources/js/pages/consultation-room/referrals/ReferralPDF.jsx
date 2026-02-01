import React, { useCallback, useState } from "react";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/DownloadRounded";
import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import Header from "../../../components/pdf/Header";
import Footer from "../../../components/pdf/Footer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1976d2",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#424242",
  },
  label: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#666",
    marginTop: 8,
    marginBottom: 3,
  },
  value: {
    fontSize: 10,
    color: "#000",
    marginBottom: 5,
    lineHeight: 1.5,
  },
  divider: {
    borderBottom: "1 solid #e0e0e0",
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  col: {
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "#ff9800",
    color: "#fff",
    padding: "5 10",
    borderRadius: 3,
    fontSize: 9,
    fontWeight: "bold",
  },
  statusBadgeSent: {
    backgroundColor: "#2196f3",
  },
  statusBadgeAcknowledged: {
    backgroundColor: "#1976d2",
  },
  statusBadgeCompleted: {
    backgroundColor: "#4caf50",
  },
  notesBox: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
});

const ReferralPDFDocument = ({ referral, patient, clinic }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Sent":
        return styles.statusBadgeSent;
      case "Acknowledged":
        return styles.statusBadgeAcknowledged;
      case "Completed":
        return styles.statusBadgeCompleted;
      default:
        return styles.statusBadge;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header
          title="Referral Letter"
          subtitle={`Patient: ${patient?.full_name || "N/A"}`}
        />

        <View style={styles.section}>
          <Text style={styles.title}>Referral Information</Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Referred To:</Text>
              <Text style={styles.value}>
                {referral.referred_to_name || "N/A"}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>
                {referral.referred_to_type || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Status:</Text>
              <View style={{ marginTop: 3 }}>
                <Text style={[getStatusStyle(referral.status), { width: "auto" }]}>
                  {referral.status || "Pending"}
                </Text>
              </View>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Referral Date:</Text>
              <Text style={styles.value}>
                {referral.referral_date
                  ? new Date(referral.referral_date).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View>

          {referral.appointment_date && (
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Appointment Date:</Text>
                <Text style={styles.value}>
                  {new Date(referral.appointment_date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.subtitle}>Patient Information</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>
                {patient?.full_name || patient?.first_name + " " + patient?.last_name || "N/A"}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Patient ID:</Text>
              <Text style={styles.value}>{patient?.id || "N/A"}</Text>
            </View>
          </View>

          {patient?.date_of_birth && (
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Date of Birth:</Text>
                <Text style={styles.value}>
                  {new Date(patient.date_of_birth).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Gender:</Text>
                <Text style={styles.value}>{patient.gender || "N/A"}</Text>
              </View>
            </View>
          )}

          {patient?.phone && (
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{patient.phone}</Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.subtitle}>Clinical Information</Text>

          {referral.referral_reason && (
            <View style={styles.section}>
              <Text style={styles.label}>Reason for Referral:</Text>
              <Text style={styles.value}>{referral.referral_reason}</Text>
            </View>
          )}

          {referral.clinical_summary && (
            <View style={styles.section}>
              <Text style={styles.label}>Clinical Summary:</Text>
              <Text style={styles.value}>{referral.clinical_summary}</Text>
            </View>
          )}

          {referral.notes && (
            <View style={styles.section}>
              <Text style={styles.label}>Additional Notes:</Text>
              <View style={styles.notesBox}>
                <Text style={styles.value}>{referral.notes}</Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.label}>Referring Clinic:</Text>
            <Text style={styles.value}>
              {clinic?.name || "SIKAF Eye Care"}
            </Text>
            {clinic?.address && (
              <Text style={[styles.value, { fontSize: 9, marginTop: 3 }]}>
                {clinic.address}
              </Text>
            )}
            {clinic?.phone && (
              <Text style={[styles.value, { fontSize: 9 }]}>
                Phone: {clinic.phone}
              </Text>
            )}
          </View>

          <View style={{ marginTop: 20, fontSize: 9, color: "#666" }}>
            <Text>
              Generated on: {new Date().toLocaleDateString()} at{" "}
              {new Date().toLocaleTimeString()}
            </Text>
            {referral.creator && (
              <Text style={{ marginTop: 5 }}>
                Referred by: {referral.creator.full_name || "N/A"}
              </Text>
            )}
          </View>
        </View>

        <Footer />
      </Page>
    </Document>
  );
};

const ReferralPDF = ({ referral, patient, clinic, ...rest }) => {
  const [loading, setLoading] = useState(false);

  const generatePDF = useCallback(async () => {
    if (!referral) {
      alert("No referral data available");
      return;
    }

    setLoading(true);
    try {
      const pdfDocument = (
        <ReferralPDFDocument
          referral={referral}
          patient={patient}
          clinic={clinic || window.user?.clinic}
        />
      );

      const blob = await pdf(pdfDocument).toBlob();

      if (!blob || blob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const patientName = patient?.full_name || patient?.first_name || "patient";
      const referralName = referral.referred_to_name || "referral";
      link.download = `referral-${patientName}-${referralName}-${new Date()
        .toISOString()
        .split("T")[0]}.pdf`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [referral, patient, clinic]);

  return (
    <Button
      disabled={loading || !referral}
      variant="contained"
      color="primary"
      size="small"
      startIcon={<DownloadIcon />}
      onClick={generatePDF}
      {...rest}
    >
      {loading ? "Generating..." : "Referral"}
    </Button>
  );
};

export default ReferralPDF;

