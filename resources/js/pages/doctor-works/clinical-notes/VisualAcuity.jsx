import React, { useRef, useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import { getValidationRules } from "../../../helpers";

const validationRules = getValidationRules();

const VisualAcuity = ({ patientId, consultationId }) => {

  const formRef = useRef();
  const unaidedReVaRef = useRef();
  const unaidedRePhRef = useRef();
  const unaidedIpdRef = useRef();
  const unaidedLeVaRef = useRef();
  const unaidedLePhRef = useRef();
  const aidedReVaRef = useRef();
  const aidedLeVaRef = useRef();

  const [formData, setFormData] = useState({
    unaided_re_va: undefined,
    unaided_re_ph: undefined,
    unaided_ipd: undefined,
    unaided_le_va: undefined,
    unaided_le_ph: undefined,
    aided_re_va: undefined,
    aided_le_va: undefined,
  });

  return (
    <Form ref={formRef}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell/>
            <TableCell colSpan={2}>Unaided</TableCell>
            <TableCell colSpan={2}>Aided</TableCell>
          </TableRow>
          <TableRow>
            <TableCell/>
            <TableCell>RE</TableCell>
            <TableCell>LE</TableCell>
            <TableCell>RE</TableCell>
            <TableCell>LE</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell component="th">VA</TableCell>
            <TableCell>
              <TextField
                ref={unaidedReVaRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, unaided_re_va: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={unaidedLeVaRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, unaided_le_va: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={aidedReVaRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, aided_re_va: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={aidedLeVaRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, aided_le_va: value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th">PH</TableCell>
            <TableCell>
              <TextField
                ref={unaidedRePhRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, unaided_re_ph: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={unaidedLePhRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, unaided_le_ph: value })}
              />
            </TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
          <TableRow>
            <TableCell component="th">IPD</TableCell>
            <TableCell colSpan={2}>
              <TextField
                ref={unaidedIpdRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, unaided_ipd: value })}
              />
            </TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </Form>
  );
};

export default VisualAcuity;
