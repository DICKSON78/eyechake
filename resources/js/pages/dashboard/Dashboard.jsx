import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "@mui/material";

import Page from "../../components/Page";
import Modal from "../../components/Modal";
import LoadingSkeleton from "./LoadingSkeleton";

import { useTheme } from "@mui/material/styles";
import { formatError } from "../../helpers";

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
