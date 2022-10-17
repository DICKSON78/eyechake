import React, { useRef, useState } from "react";

import { Grid, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import { getValidationRules } from "../../../helpers";

const validationRules = getValidationRules();

const ExternalExamination = ({ patientId, consultationId }) => {

  const formRef = useRef();
  const reLidRef = useRef();
  const reScleraRef = useRef();
  const reCorneaRef = useRef();
  const reConjuctivaRef = useRef();
  const reIrisRef = useRef();
  const rePupilRef = useRef();
  const reLensRef = useRef();
  const reIopRef = useRef();
  const leLidRef = useRef();
  const leScleraRef = useRef();
  const leCorneaRef = useRef();
  const leConjuctivaRef = useRef();
  const leIrisRef = useRef();
  const lePupilRef = useRef();
  const leLensRef = useRef();
  const leIopRef = useRef();

  const [formData, setFormData] = useState({
    re_lid: undefined,
    re_sclera: undefined,
    re_cornea: undefined,
    re_conjuctiva: undefined,
    re_iris: undefined,
    re_pupil: undefined,
    re_lens: undefined,
    re_iop: undefined,
    le_lid: undefined,
    le_sclera: undefined,
    le_cornea: undefined,
    le_conjuctiva: undefined,
    le_iris: undefined,
    le_pupil: undefined,
    le_lens: undefined,
    le_iop: undefined,
  });

  return (
    <Form ref={formRef}>
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
            <TableCell component="th">LID</TableCell>
            <TableCell>
              <TextField
                ref={reLidRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, re_lid: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={leLidRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, le_lid: value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th">SCRELA</TableCell>
            <TableCell>
              <TextField
                ref={reScleraRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, re_sclera: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={leScleraRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, le_sclera: value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th">CORNEA</TableCell>
            <TableCell>
              <TextField
                ref={reCorneaRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, re_cornea: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={leCorneaRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, le_cornea: value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th">CONJUCTIVA</TableCell>
            <TableCell>
              <TextField
                ref={reConjuctivaRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, re_conjuctiva: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={leConjuctivaRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, le_conjuctiva: value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th">IRIS</TableCell>
            <TableCell>
              <TextField
                ref={reIrisRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, re_iris: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={leIrisRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, le_iris: value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th">PUPIL</TableCell>
            <TableCell>
              <TextField
                ref={rePupilRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, re_pupil: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={lePupilRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, le_pupil: value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th">LENS</TableCell>
            <TableCell>
              <TextField
                ref={reLensRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, re_lens: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={leLensRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, le_lens: value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th">IOP</TableCell>
            <TableCell>
              <TextField
                ref={reIopRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, re_iop: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={leIopRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, le_iop: value })}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Form>
  );
};

export default ExternalExamination;
