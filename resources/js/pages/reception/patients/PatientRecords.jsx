import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Skeleton } from "@mui/material";

import Page from "../../../components/Page";
import Modal from "../../../components/Modal";
import PatientDetails from "./PatientDetails";
import PatientFile from "../../patient-records/patient-file/PatientFile";

const PatientRecords = () => {

  const navigate = useNavigate();
  const { patientId } = useParams();

  const modalRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();

  useEffect(() => {
    if (!patientId) {
      navigate("/reception/patients");
    }
  }, []);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Patients/Customers" },
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
        <PatientFile patient={patient}/>
        : null
      }
      <Modal ref={modalRef}/>
    </Page>
  );
};

export default PatientRecords;
