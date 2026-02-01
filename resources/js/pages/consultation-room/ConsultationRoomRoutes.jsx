import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import ConsultationPatients from "./ConsultationPatients";
import ConsultationPatientRoutes from "./ConsultationPatientRoutes";
import ReportsRoutes from "./reports/ReportsRoutes";
import ClinicalNotesList from "./clinical-notes/ClinicalNotesList";
import EyeExaminations from "./eye-examinations/EyeExaminations";
import Prescriptions from "./prescriptions/Prescriptions";
import PatientsSeen from "./patients-seen/PatientsSeen";
import PatientsWaiting from "./patients-waiting/PatientsWaiting";
import ReferralsToday from "./referrals-today/ReferralsToday";
import Referrals from "./referrals/Referrals";
import ProcedureRequests from "./procedure-requests/ProcedureRequests";
import ProcedureRequestRoutes from "./procedure-requests/ProcedureRequestRoutes";

const ConsultationRoomRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
      <Route
        path="/consultation-patients/:status"
        exact
        element={<ConsultationPatients />}
      />
      <Route
        path="/consultation-patients/:status/:patientId/:consultationId/*"
        element={<ConsultationPatientRoutes />}
      />
      <Route
        path="/reports/*"
        element={<ReportsRoutes />}
      />
      <Route
        path="/clinical-notes"
        element={<ClinicalNotesList />}
      />
      <Route
        path="/eye-examinations"
        element={<EyeExaminations />}
      />
      <Route
        path="/prescriptions"
        element={<Prescriptions />}
      />
      <Route
        path="/patients-seen"
        element={<PatientsSeen />}
      />
      <Route
        path="/patients-waiting"
        element={<PatientsWaiting />}
      />
      <Route
        path="/patients-waiting/:type"
        element={<PatientsWaiting />}
      />
      <Route
        path="/referrals-today"
        element={<ReferralsToday />}
      />
      <Route
        path="/referrals"
        element={<Referrals />}
      />
      <Route
        path="/procedure-requests"
        exact
        element={<ProcedureRequests />}
      />
      <Route
        path="/procedure-requests/:patientId/:paymentCacheId/*"
        element={<ProcedureRequestRoutes />}
      />
    </Routes>
  );
};

export default ConsultationRoomRoutes;
