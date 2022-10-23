import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Page from "../../components/Page";
import Modal from "../../components/Modal";

import { useTheme } from "@mui/material/styles";

const Dashboard = () => {

  const theme = useTheme();
  const navigate = useNavigate();

  const modalRef = useRef();

  useEffect(() => {
    document.title = `Dashboard - ${window.APP_NAME}`;
  }, []);

  return (
    <Page
      title="Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Dashboard" },
      ]}
    >
      {/*{error ?*/}
      {/*<Alert*/}
      {/*sx={{ mb: 2 }}*/}
      {/*severity="error"*/}
      {/*>*/}
      {/*{formatError(error)}*/}
      {/*</Alert>*/}
      {/*: null*/}
      {/*}*/}
      {/*{loading && <LoadingSkeleton />}*/}

      <Modal ref={modalRef}/>
    </Page>
  );
};

export default Dashboard;
