import React, { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import Skeleton from "@mui/material/Skeleton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import Page from "../../../components/Page";
import Modal from "../../../components/Modal";
import PatientDetails from "./PatientDetails";
import PatientFile from "../../patient-records/patient-file/PatientFile";
import PatientPaymentHistory from "../../patient-records/PatientPaymentHistory";
import PatientAttachments from "../../patient-records/patient-attachments/PatientAttachments";

const PatientRecords = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId } = useParams();

  const modalRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (!patientId) {
      return navigate("/reception/patients");
    }

    document.title = `Patient Records - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (!patientId) {
      return;
    }
    
    // Set initial tab based on URL - use the base path for records
    const basePath = `/reception/patients/${patientId}/records`;
    const currentPath = location.pathname;
    
    // Normalize the path by removing any duplicate segments
    const normalizedPath = currentPath.replace(/\/patient-file\/+/g, '/patient-file').replace(/\/payment-history\/+/g, '/payment-history').replace(/\/attachments\/+/g, '/attachments');
    
    // Ensure we're on the correct base path
    if (!normalizedPath.startsWith(basePath)) {
      // If we're on the base path without /records, redirect
      if (normalizedPath === `/reception/patients/${patientId}`) {
        navigate(`${basePath}/patient-file`, { replace: true });
      }
      return;
    }
    
    // Extract the sub-path after /records/
    const subPath = normalizedPath.replace(basePath, '').replace(/^\//, '');
    
    if (subPath.includes("payment-history")) {
      setSelectedTab(1);
      // Clean up the URL if it's malformed
      if (normalizedPath !== `${basePath}/payment-history`) {
        navigate(`${basePath}/payment-history`, { replace: true });
      }
    } else if (subPath.includes("attachments")) {
      setSelectedTab(2);
      // Clean up the URL if it's malformed
      if (normalizedPath !== `${basePath}/attachments`) {
        navigate(`${basePath}/attachments`, { replace: true });
      }
    } else {
      // Default to patient-file (tab 0)
      setSelectedTab(0);
      // Clean up the URL if it's malformed
      if (normalizedPath !== `${basePath}/patient-file` && normalizedPath !== basePath) {
        navigate(`${basePath}/patient-file`, { replace: true });
      } else if (normalizedPath === basePath) {
        navigate(`${basePath}/patient-file`, { replace: true });
      }
    }
  }, [location.pathname, navigate, patientId]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Client Lists" },
        { title: patientId },
      ]}
    >
      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={(responseData) => setPatient(responseData)}
      />

      {loadingPatient ? (
        <Skeleton
          variant="rounded"
          height={256}
        />
      ) : null}

      {patient ? (
        <React.Fragment>
          <Tabs
            value={selectedTab}
            onChange={(event, newValue) => {
              const basePath = `/reception/patients/${patientId}/records`;
              setSelectedTab(newValue);
              if (newValue === 0) {
                navigate(`${basePath}/patient-file`, { replace: true });
              } else if (newValue === 1) {
                navigate(`${basePath}/payment-history`, { replace: true });
              } else if (newValue === 2) {
                navigate(`${basePath}/attachments`, { replace: true });
              }
            }}
            sx={{ mt: 2 }}
          >
            <Tab label="Patient File" />
            <Tab label="Payment History" />
            <Tab label="Attachments" />
          </Tabs>
          <Box sx={{ display: selectedTab === 0 ? 'block' : 'none' }}>
            <PatientFile patient={patient} key={`patient-file-${patient.id}`} />
          </Box>
          <Box sx={{ display: selectedTab === 1 ? 'block' : 'none' }}>
            <PatientPaymentHistory patient={patient} key={`payment-history-${patient.id}`} />
          </Box>
          <Box sx={{ display: selectedTab === 2 ? 'block' : 'none' }}>
            <PatientAttachments patient={patient} key={`attachments-${patient.id}`} />
          </Box>
        </React.Fragment>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default PatientRecords;
