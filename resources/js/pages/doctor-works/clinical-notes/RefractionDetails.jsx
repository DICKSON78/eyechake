import React, { useRef, useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import { getValidationRules } from "../../../helpers";

const validationRules = getValidationRules();

const RefractionDetails = ({ patientId, consultationId }) => {

  const formRef = useRef();
  const obReSphRef = useRef();
  const obReCylRef = useRef();
  const obReAxisRef = useRef();
  const obReVaRef = useRef();
  const obLeSphRef = useRef();
  const obLeCylRef = useRef();
  const obLeAxisRef = useRef();
  const obLeVaRef = useRef();
  const subReSphRef = useRef();
  const subReCylRef = useRef();
  const subReAxisRef = useRef();
  const subReVaRef = useRef();
  const subReAddRef = useRef();
  const subReAddVaRef = useRef();
  const subLeSphRef = useRef();
  const subLeCylRef = useRef();
  const subLeAxisRef = useRef();
  const subLeVaRef = useRef();
  const subLeAddRef = useRef();
  const subLeAddVaRef = useRef();

  const [formData, setFormData] = useState({
    ob_re_sph: undefined,
    ob_re_cyl: undefined,
    ob_re_axis: undefined,
    ob_re_va: undefined,
    ob_le_sph: undefined,
    ob_le_cyl: undefined,
    ob_le_axis: undefined,
    ob_le_va: undefined,
    sub_re_sph: undefined,
    sub_re_cyl: undefined,
    sub_re_axis: undefined,
    sub_re_va: undefined,
    sub_re_add: undefined,
    sub_re_add_va: undefined,
    sub_le_sph: undefined,
    sub_le_cyl: undefined,
    sub_le_axis: undefined,
    sub_le_va: undefined,
    sub_le_add: undefined,
    sub_le_add_va: undefined,
  });

  return (
    <Form ref={formRef}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell colSpan={2}>Objective Refraction</TableCell>
            <TableCell colSpan={2}>Subjective Refraction</TableCell>
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
            <TableCell component="th">SPH</TableCell>
            <TableCell>
              <TextField
                ref={obReSphRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, ob_re_sph: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={obLeSphRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, ob_le_sph: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subReSphRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, sub_re_sph: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subLeSphRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, sub_le_sph: value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th">CYL</TableCell>
            <TableCell>
              <TextField
                ref={obReCylRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, ob_re_cyl: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={obLeCylRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, ob_le_cyl: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subReCylRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, sub_re_cyl: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subLeCylRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, sub_le_cyl: value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th">AXIS</TableCell>
            <TableCell>
              <TextField
                ref={obReAxisRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, ob_re_axis: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={obLeAxisRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, ob_le_axis: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subReAxisRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, sub_re_axis: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subLeAxisRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, sub_le_axis: value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th">VA</TableCell>
            <TableCell>
              <TextField
                ref={obReVaRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, ob_re_va: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={obLeVaRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, ob_le_va: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subReVaRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, sub_re_va: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subLeVaRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, sub_le_va: value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th">ADD</TableCell>
            <TableCell />
            <TableCell />
            <TableCell>
              <TextField
                ref={subReAddRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, sub_re_add: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subLeAddRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, sub_le_add: value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th">VA</TableCell>
            <TableCell />
            <TableCell />
            <TableCell>
              <TextField
                ref={subReAddVaRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, sub_re_add_va: value })}
              />
            </TableCell>
            <TableCell>
              <TextField
                ref={subLeAddVaRef}
                fullWidth
                onChange={(value) => setFormData({ ...formData, sub_le_add_va: value })}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Form>
  );
};

export default RefractionDetails;
