import React, { forwardRef, useImperativeHandle, useRef } from "react";

import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import TextField from "../../../components/TextField";
import usePatch from "../../../hooks/usePatch";

const FunctionalTests = ({ consultation: { id, functional_tests, status } }, ref) => {

  const reNpcRef = useRef();
  const reNpaRef = useRef();
  const reConfrontationRef = useRef();
  const reCoverTestRef = useRef();
  const leNpcRef = useRef();
  const leNpaRef = useRef();
  const leConfrontationRef = useRef();
  const leCoverTestRef = useRef();

  const { handlePatch: handleAutoSave } = usePatch();

  const autoSave = (field, value) => {
    if (!functional_tests || (functional_tests && value !== functional_tests[field])) {
      handleAutoSave(`api/consultations/${id}/auto-save-clinical-notes`, {
        what: "Functional Test",
        [field]: value
      });
    }
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      return true;
    }
  }));

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell/>
          <TableCell>RE</TableCell>
          <TableCell>LE</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell component="th">NPC</TableCell>
          <TableCell>
            <TextField
              ref={reNpcRef}
              fullWidth
              defaultValue={functional_tests ? functional_tests.re_npc : null}
              onChange={(value) => autoSave("re_npc", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={leNpcRef}
              fullWidth
              defaultValue={functional_tests ? functional_tests.le_npc : null}
              onChange={(value) => autoSave("le_npc", value)}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">NPA</TableCell>
          <TableCell>
            <TextField
              ref={reNpaRef}
              fullWidth
              defaultValue={functional_tests ? functional_tests.re_npa : null}
              onChange={(value) => autoSave("re_npa", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={leNpaRef}
              fullWidth
              defaultValue={functional_tests ? functional_tests.le_npa : null}
              onChange={(value) => autoSave("le_npa", value)}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">CONFRONTATION</TableCell>
          <TableCell>
            <TextField
              ref={reConfrontationRef}
              fullWidth
              defaultValue={functional_tests ? functional_tests.re_confrontation : null}
              onChange={(value) => autoSave("re_confrontation", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={leConfrontationRef}
              fullWidth
              defaultValue={functional_tests ? functional_tests.le_confrontation : null}
              onChange={(value) => autoSave("le_confrontation", value)}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">COVER TEST</TableCell>
          <TableCell>
            <TextField
              ref={reCoverTestRef}
              fullWidth
              defaultValue={functional_tests ? functional_tests.re_cover_test : null}
              onChange={(value) => autoSave("re_cover_test", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={leCoverTestRef}
              fullWidth
              defaultValue={functional_tests ? functional_tests.le_cover_test : null}
              onChange={(value) => autoSave("le_cover_test", value)}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default forwardRef(FunctionalTests);
