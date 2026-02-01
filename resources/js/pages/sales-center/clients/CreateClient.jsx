import React from "react";
import CreatePatient from "../../reception/patients/CreatePatient";

const CreateClient = ({ modal, fetchClients }) => {
  return <CreatePatient modal={modal} fetchPatients={fetchClients} />;
};

export default CreateClient;

