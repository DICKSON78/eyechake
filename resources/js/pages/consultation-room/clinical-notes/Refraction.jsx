import React, { forwardRef, useImperativeHandle, useRef } from "react";

import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import TextField from "../../../components/TextField";
import usePatch from "../../../hooks/usePatch";

const RefractionDetails = ({ consultation: { id, status, refraction } }, ref) => {

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

  const { handlePatch: handleAutoSave } = usePatch();

  const autoSave = (field, value) => {
    if (!refraction || (refraction && value !== refraction[field])) {
      handleAutoSave(`api/consultations/${id}/auto-save-clinical-notes`, { what: "Refraction", [field]: value });
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
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.ob_re_sph : null}
              onChange={(value) => autoSave("ob_re_sph", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={obLeSphRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.ob_le_sph : null}
              onChange={(value) => autoSave("ob_le_sph", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={subReSphRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.sub_re_sph : null}
              onChange={(value) => autoSave("sub_re_sph", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={subLeSphRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.sub_le_sph : null}
              onChange={(value) => autoSave("sub_le_sph", value)}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">CYL</TableCell>
          <TableCell>
            <TextField
              ref={obReCylRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.ob_re_cyl : null}
              onChange={(value) => autoSave("ob_re_cyl", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={obLeCylRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.ob_le_cyl : null}
              onChange={(value) => autoSave("ob_le_cyl", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={subReCylRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.sub_re_cyl : null}
              onChange={(value) => autoSave("sub_re_cyl", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={subLeCylRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.sub_le_cyl : null}
              onChange={(value) => autoSave("sub_le_cyl", value)}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">AXIS</TableCell>
          <TableCell>
            <TextField
              ref={obReAxisRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.ob_re_axis : null}
              onChange={(value) => autoSave("ob_re_axis", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={obLeAxisRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.ob_le_axis : null}
              onChange={(value) => autoSave("ob_le_axis", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={subReAxisRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.sub_re_axis : null}
              onChange={(value) => autoSave("sub_re_axis", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={subLeAxisRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.sub_le_axis : null}
              onChange={(value) => autoSave("sub_le_axis", value)}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">VA</TableCell>
          <TableCell>
            <TextField
              ref={obReVaRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.ob_re_va : null}
              onChange={(value) => autoSave("ob_re_va", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={obLeVaRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.ob_le_va : null}
              onChange={(value) => autoSave("ob_le_va", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={subReVaRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.sub_re_va : null}
              onChange={(value) => autoSave("sub_re_va", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={subLeVaRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.sub_le_va : null}
              onChange={(value) => autoSave("sub_le_va", value)}
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
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.sub_re_add : null}
              onChange={(value) => autoSave("sub_re_add", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={subLeAddRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.sub_le_add : null}
              onChange={(value) => autoSave("sub_le_add", value)}
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
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.sub_re_add_va : null}
              onChange={(value) => autoSave("sub_re_add_va", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={subLeAddVaRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={refraction ? refraction.sub_le_add_va : null}
              onChange={(value) => autoSave("sub_le_add_va", value)}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default forwardRef(RefractionDetails);
