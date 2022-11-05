import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";

import { Skeleton } from "@mui/material";

import Page from "../../components/Page";
import Modal from "../../components/Modal";
import PatientDetails from "../reception/patients/PatientDetails";

const PatientRoutes = () => {

  const navigate = useNavigate();
  const { patientId } = useParams();

  const modalRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();

  useEffect(() => {
    if (!patientId) {
      navigate("/patient-records/patients");
    }
  }, []);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Patient Records" },
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
              <div/>
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
