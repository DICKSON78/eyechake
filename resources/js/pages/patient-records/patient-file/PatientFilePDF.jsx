import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Document, Font, Page, pdf, StyleSheet, Text, View } from "@react-pdf/renderer";

import fontRegular from "../../../../fonts/Custom-Regular.ttf";
import fontItalic from "../../../../fonts/Custom-Italic.ttf";
import fontBold from "../../../../fonts/Custom-Bold.ttf";

import Header from "../../../components/pdf/Header";
import Footer from "../../../components/pdf/Footer";
import Descriptions from "../../../components/pdf/Descriptions";
import Table, { styles as tableStyles } from "../../../components/pdf/Table";

import { getAge, getNonNull } from "../../../helpers";
import useFetch from "../../../hooks/useFetch";

Font.register({
  family: "Custom",
  fonts: [
    { src: fontRegular },
    { src: fontItalic, fontStyle: "italic" },
    { src: fontBold, fontWeight: 700 },
  ],
});

const Subheader = ({ title, style }) => {
  return (
    <Text
      style={[styles.text,
        {
          fontSize: 10,
          paddingVertical: 4,
          paddingHorizontal: 12,
          color: "#fff",
          backgroundColor: "#039be5",
          borderRadius: 5,
          ...(style || {})
        }
      ]}
    >
      {title}
    </Text>
  );
};

const DiagnosisCard = ({ title, diagnosisType, items }) => {
  return (
    <Table
      caption={title}
      columns={[
        {
          field: "index",
          headerName: "S/N",
          valueGetter: (item, index) => (index + 1),
          flex: 0.25,
        },
        {
          field: "disease_name",
          headerName: "Disease Name",
          valueGetter: (item, index) => getNonNull(item.disease).name,
        },
        {
          field: "disease_code",
          headerName: "Disease Code",
          valueGetter: (item, index) => getNonNull(item.disease).code,
        },
      ]}
      items={items.filter((e) => e.diagnosis_type === diagnosisType)}
    />
  );
};

const ConsultationItemsCard = ({ title, consultationType, items }) => {

  const getStatusLabel = (status) => {
    if (status === "Pending") {
      return "Not Paid";
    }

    if (consultationType === "Pharmacy" || consultationType === "Glass") {
      if (status === "Served") {
        return "Dispensed";
      }
    }

    return status;
  };

  return (
    <Table
      caption={title}
      columns={[
        {
          field: "index",
          headerName: "S/N",
          valueGetter: (item, index) => (index + 1),
          flex: 0.25,
        },
        {
          field: "item_name",
          headerName: "Item Name",
          valueGetter: (item, index) => item.item.name,
        },
        {
          field: "dosage",
          headerName: "Dosage",
          show: consultationType === "Pharmacy",
        },
        {
          field: "comments",
          headerName: "Comments",
          show: consultationType !== "Pharmacy",
        },
        {
          field: "status",
          headerName: "Status",
          valueGetter: (item, index) => getStatusLabel(item.status),
        }
      ]}
      items={items.filter((e) => e.consultation_type.name === consultationType)}
    />
  );
};

const PDFReportDocument = ({ consultation, patient }) => {

  return (
    <Document
      title="Patient File"
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
        orientation="portrait"
      >
        <Header
          title="Patient File"
          subtitle={patient.full_name}
        />

        <Descriptions
          columns={3}
          items={[
            { label: "Patient Name", value: patient.full_name },
            { label: "Patient Number", value: patient.id },
            { label: "Age", value: getAge(patient.date_of_birth) },
            { label: "Gender", value: patient.gender },
            { label: "Phone Number", value: patient.phone },
            { label: "Region", value: getNonNull(patient.region).name },
            { label: "District", value: getNonNull(patient.district).name },
            { label: "Ward", value: getNonNull(patient.ward).name },
            { label: "Payment Mode", value: consultation.payment_cache_item.payment_mode.name },
            { label: "Consultant", value: getNonNull(consultation.payment_cache_item.consultant).full_name },
            { label: "Consultation Date", value: consultation.created_at },
          ]}
          containerStyle={{
            marginBottom: 4
          }}
        />

        {consultation.patient_direction === "Direct to Doctor" ?
          <React.Fragment>
            <Subheader
              title="History Taking"
              style={{ marginBottom: 4 }}
            />

            <Table
              containerStyle={{ marginBottom: 4 }}
              columns={[
                {
                  field: "chief_complaint",
                  headerName: "C/C",
                },
                {
                  field: "history_present_illness",
                  headerName: "H/I",
                },
                {
                  field: "family_history",
                  headerName: "F/H",
                }
              ]}
              items={[
                {
                  chief_complaint: consultation.chief_complaint,
                  history_present_illness: consultation.history_present_illness,
                  family_history: consultation.family_history
                },
              ]}
            />
          </React.Fragment>
          : null
        }

        {consultation.visual_acuity ?
          <React.Fragment>
            <Subheader
              title="Visual Acuity (VA)"
              style={{ marginBottom: 4 }}
            />

            <View style={[tableStyles.table, { marginBottom: 4 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <View style={[tableStyles.tableCellNoFlex, { width: 64 }]}/>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>Unaided</Text>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>Aided</Text>
              </View>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <View style={[tableStyles.tableCellNoFlex, { width: 64 }]}/>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>RE</Text>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>LE</Text>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>RE</Text>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>LE</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCellNoFlex, { width: 64 }]}>VA</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.visual_acuity.unaided_re_va}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.visual_acuity.unaided_le_va}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.visual_acuity.aided_re_va}{" "}{consultation.visual_acuity.aided_re_va_description}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.visual_acuity.aided_le_va}{" "}{consultation.visual_acuity.aided_le_va_description}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCellNoFlex, { width: 64 }]}>PH</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.visual_acuity.unaided_re_ph}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.visual_acuity.unaided_le_ph}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}/>
                <Text style={[styles.text, tableStyles.tableCell]}/>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCellNoFlex, { width: 64 }]}>IPD</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.visual_acuity.unaided_ipd}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}/>
                <Text style={[styles.text, tableStyles.tableCell]}/>
                <Text style={[styles.text, tableStyles.tableCell]}/>
              </View>
            </View>
          </React.Fragment>
          : null
        }

        {consultation.external_examination ?
          <React.Fragment>
            <Subheader
              title="External Examination"
              style={{ marginBottom: 4 }}
            />

            <View style={[tableStyles.table, { marginBottom: 4 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <View style={[tableStyles.tableCell, { flex: 0.25 }]}/>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>RE</Text>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>LE</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}>LID</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.re_lid}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.le_lid}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}>SCRELA</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.re_sclera}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.le_sclera}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}>CORNEA</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.re_cornea}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.le_cornea}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}>CONJUCTIVA</Text>
                <Text
                  style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.re_conjuctiva}</Text>
                <Text
                  style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.le_conjuctiva}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}>IRIS</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.re_iris}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.le_iris}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}>PUPIL</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.re_pupil}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.le_pupil}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}>LENS</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.re_lens}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.le_lens}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}>IOP</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.re_iop}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.external_examination.le_iop}</Text>
              </View>
            </View>
          </React.Fragment>
          : null
        }

        {consultation.functional_tests ?
          <React.Fragment>
            <Subheader
              title="Functional Tests"
              style={{ marginBottom: 4 }}
            />

            <View style={[tableStyles.table, { marginBottom: 4 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <View style={[tableStyles.tableCell, { flex: 0.3 }]}/>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>RE</Text>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>LE</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell, { flex: 0.3 }]}>NPC</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.functional_tests.re_npc}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.functional_tests.le_npc}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell, { flex: 0.3 }]}>NPA</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.functional_tests.re_npa}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.functional_tests.le_npa}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell, { flex: 0.3 }]}>CONFRONTATION</Text>
                <Text
                  style={[styles.text, tableStyles.tableCell]}>{consultation.functional_tests.re_confrontation}</Text>
                <Text
                  style={[styles.text, tableStyles.tableCell]}>{consultation.functional_tests.le_confrontation}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell, { flex: 0.3 }]}>COVER TEST</Text>
                <Text
                  style={[styles.text, tableStyles.tableCell]}>{consultation.functional_tests.re_cover_test}</Text>
                <Text
                  style={[styles.text, tableStyles.tableCell]}>{consultation.functional_tests.le_cover_test}</Text>
              </View>
            </View>
          </React.Fragment>
          : null
        }

        {consultation.refraction ?
          <React.Fragment>
            <Subheader
              title="Refraction Details"
              style={{ marginBottom: 4 }}
            />

            <View style={[tableStyles.table, { marginBottom: 4 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <View style={[tableStyles.tableCellNoFlex, { width: 64 }]}/>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>Objective Refraction</Text>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>Subjective Refraction</Text>
              </View>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <View style={[tableStyles.tableCellNoFlex, { width: 64 }]}/>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>RE</Text>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>LE</Text>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>RE</Text>
                <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>LE</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCellNoFlex, { width: 64 }]}>SPH</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.ob_re_sph}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.ob_le_sph}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.sub_re_sph}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.sub_le_sph}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCellNoFlex, { width: 64 }]}>CYL</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.ob_re_cyl}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.ob_le_cyl}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.sub_re_cyl}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.sub_le_cyl}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCellNoFlex, { width: 64 }]}>AXIS</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.ob_re_axis}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.ob_le_axis}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.sub_re_axis}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.sub_le_axis}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCellNoFlex, { width: 64 }]}>VA</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.ob_re_va}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.ob_le_va}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.sub_re_va}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.sub_le_va}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCellNoFlex, { width: 64 }]}>ADD</Text>
                <Text style={[styles.text, tableStyles.tableCell]}/>
                <Text style={[styles.text, tableStyles.tableCell]}/>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.sub_re_add}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.sub_le_add}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCellNoFlex, { width: 64 }]}>VA</Text>
                <Text style={[styles.text, tableStyles.tableCell]}/>
                <Text style={[styles.text, tableStyles.tableCell]}/>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.sub_re_add_va}</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.refraction.sub_le_add_va}</Text>
              </View>
            </View>
          </React.Fragment>
          : null
        }

        {consultation.fundoscopy ?
          <React.Fragment>
            <Subheader
              title="Fundoscopy"
              style={{ marginBottom: 4 }}
            />

            <Table
              containerStyle={{ marginBottom: 4 }}
              columns={[
                {
                  field: "re",
                  headerName: "RE",
                },
                {
                  field: "le",
                  headerName: "LE",
                },
              ]}
              items={[
                {
                  re: consultation.fundoscopy.re,
                  le: consultation.fundoscopy.le,
                },
              ]}
            />
          </React.Fragment>
          : null
        }

        <Subheader
          title={consultation.patient_direction === "Direct to Doctor" ? "Diagnosis & Management" : "Management" }
          style={{ marginBottom: 4 }}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {consultation.patient_direction === "Direct to Doctor" ?
            <View style={{ width: "50%", paddingRight: 4, marginBottom: 4 }}>
              <DiagnosisCard
                title="Diagnosis"
                diagnosisType="Final"
                items={consultation.diagnoses}
              />
            </View>
            : null
          }
          <View
            style={{
              width: "50%",
              paddingLeft: consultation.patient_direction === "Direct to Doctor" ? 4 : 0,
              paddingRight: consultation.patient_direction === "Direct to Doctor" ? 0 : 4,
              marginBottom: 4
            }}
          >
            <ConsultationItemsCard
              title="Medicine"
              consultationType="Pharmacy"
              items={consultation.items}
            />
          </View>
          <View
            style={{
              width: "50%",
              paddingLeft: consultation.patient_direction === "Direct to Doctor" ? 0 : 4,
              paddingRight: consultation.patient_direction === "Direct to Doctor" ? 4 : 0,
              marginBottom: 4
            }}
          >
            <ConsultationItemsCard
              title="Procedure"
              consultationType="Procedure"
              items={consultation.items}
            />
          </View>
          <View
            style={{
              width: "50%",
              paddingLeft: consultation.patient_direction === "Direct to Doctor" ? 4 : 0,
              paddingRight: consultation.patient_direction === "Direct to Doctor" ? 0 : 4,
              marginBottom: 4
            }}
          >
            <ConsultationItemsCard
              title="Glass"
              consultationType="Glass"
              items={consultation.items}
            />
          </View>
          <View
            style={{
              width: "50%",
              paddingLeft: consultation.patient_direction === "Direct to Doctor" ? 0 : 4,
              paddingRight: consultation.patient_direction === "Direct to Doctor" ? 4 : 0,
              marginBottom: 4
            }}
          >
            <ConsultationItemsCard
              title="Others"
              consultationType="Others"
              items={consultation.items}
            />
          </View>
        </View>

        {consultation.status === "Consulted" ?
          <React.Fragment>
            <Subheader
              title="Remarks"
              style={{ marginBottom: 4 }}
            />

            <Descriptions
              columns={1}
              items={[
                {
                  label: "Patient to Return",
                  value: consultation.patient_direction === "Direct to Doctor" ? consultation.patient_to_return : null
                },
                { label: "Return Date", value: consultation.to_return_date },
                { label: "Remarks", value: consultation.remarks },
              ]}
              containerStyle={{
                marginBottom: 4,
              }}
              valueStyle={{
                width: "80%",
              }}
            />
          </React.Fragment>
          : null
        }

        <Footer render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}/>
      </Page>
    </Document>
  );
};

const PDFReport = ({ consultationId, patient, ...rest }) => {
  const [loading, setLoading] = useState(false);

  const { data: consultation, loading: loadingConsultation, handleFetch } = useFetch(`api/consultations/${consultationId}`, {
    with_diagnoses: true,
    with_items: true
  }, false, null, (response) => response.data.data);

  useEffect(() => {
    if (consultation) {
      generatePdfDocument();
    }
  }, [consultation]);

  const generatePdfDocument = useCallback(async () => {
    if (consultation) {
      setLoading(true);
      const blob = await pdf(
        <PDFReportDocument
          consultation={consultation}
          patient={patient}
        />
      ).toBlob();
      setLoading(false);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  }, [consultation]);

  return (
    <Button
      disabled={loading}
      variant="contained"
      color="secondary"
      disableElevation
      onClick={handleFetch}
      {...rest}
    >
      {loadingConsultation || loading ? "Generating PDF..." : "PDF"}
    </Button>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 8,
    fontFamily: "Custom",
  },
});

export default PDFReport;
