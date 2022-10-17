import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";

import { Skeleton } from "@mui/material";

import Page from "../../components/Page";
import Modal from "../../components/Modal";
import PatientDetails from "../reception/patients/PatientDetails";
import ClinicalNotes from "./clinical-notes/ClinicalNotes";

const PatientRoutes = () => {

  const navigate = useNavigate();
  const { status, patientId, consultationId } = useParams();

  const modalRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();

  useEffect(() => {
    if (!patientId || !consultationId) {
      navigate(`/doctor-works/consultation-patients/${(status || "pending")}`);
    }
  }, []);

  const getFromListTitle = () => {
    if (status === "pending") {
      return "Patients Sent to Doctor";
    }
    if (status === "consulted") {
      return "Consulted Patients";
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Doctor Works" },
        { title: getFromListTitle() },
        { title: patientId },
      ]}
    >
      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={(responseData) => setPatient(responseData)}
      />

      {loadingPatient ?
        <Skeleton
          variant="rounded"
          height={256}
        />
        : null
      }

      {patient ?
        <Routes>
          <Route
            path="/clinical-notes"
            element={(
              <ClinicalNotes
                patientId={patientId}
                consultationId={consultationId}
                status={status}
              />
            )}
          />
        </Routes>
        : null
      }
      <Modal ref={modalRef}/>
    </Page>
  );
};

export default PatientRoutes;
