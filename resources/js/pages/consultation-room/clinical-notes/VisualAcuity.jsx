import React, { forwardRef, useImperativeHandle, useRef } from "react";

import { Stack, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import TextField from "../../../components/TextField";
import usePatch from "../../../hooks/usePatch";

const VisualAcuity = ({ consultation: { id, status, visual_acuity } }, ref) => {

  const unaidedReVaRef = useRef();
  const unaidedRePhRef = useRef();
  const unaidedIpdRef = useRef();
  const unaidedLeVaRef = useRef();
  const unaidedLePhRef = useRef();
  const aidedReVaRef = useRef();
  const aidedReVaDescriptionRef = useRef();
  const aidedLeVaRef = useRef();
  const aidedLeVaDescriptionRef = useRef();

  const { handlePatch: handleAutoSave } = usePatch();

  const autoSave = (field, value) => {
    if (!visual_acuity || (visual_acuity && value !== visual_acuity[field])) {
      handleAutoSave(`api/consultations/${id}/auto-save-clinical-notes`, { what: "Visual Acuity", [field]: value });
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
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={visual_acuity ? visual_acuity.unaided_re_va : null}
              onChange={(value) => autoSave("unaided_re_va", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={unaidedLeVaRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={visual_acuity ? visual_acuity.unaided_le_va : null}
              onChange={(value) => autoSave("unaided_le_va", value)}
            />
          </TableCell>
          <TableCell>
            <Stack
              direction="row"
              spacing={1}
            >
              <TextField
                ref={aidedReVaRef}
                disabled={status === "Consulted"}
                fullWidth
                defaultValue={visual_acuity ? visual_acuity.aided_re_va : null}
                onChange={(value) => autoSave("aided_re_va", value)}
                containerProps={{
                  width: 72,
                }}
              />
              <TextField
                ref={aidedReVaDescriptionRef}
                disabled={status === "Consulted"}
                placeholder="Enter description"
                fullWidth
                defaultValue={visual_acuity ? visual_acuity.aided_re_va_description : null}
                onChange={(value) => autoSave("aided_re_va_description", value)}
              />
            </Stack>
          </TableCell>
          <TableCell>
            <Stack
              direction="row"
              spacing={1}
            >
              <TextField
                ref={aidedLeVaRef}
                disabled={status === "Consulted"}
                fullWidth
                defaultValue={visual_acuity ? visual_acuity.aided_le_va : null}
                onChange={(value) => autoSave("aided_le_va", value)}
                containerProps={{
                  width: 72,
                }}
              />
              <TextField
                ref={aidedLeVaDescriptionRef}
                disabled={status === "Consulted"}
                placeholder="Enter description"
                fullWidth
                defaultValue={visual_acuity ? visual_acuity.aided_le_va_description : null}
                onChange={(value) => autoSave("aided_le_va_description", value)}
              />
            </Stack>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">PH</TableCell>
          <TableCell>
            <TextField
              ref={unaidedRePhRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={visual_acuity ? visual_acuity.unaided_re_ph : null}
              onChange={(value) => autoSave("unaided_re_ph", value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={unaidedLePhRef}
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={visual_acuity ? visual_acuity.unaided_le_ph : null}
              onChange={(value) => autoSave("unaided_le_ph", value)}
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
              disabled={status === "Consulted"}
              fullWidth
              defaultValue={visual_acuity ? visual_acuity.unaided_ipd : null}
              onChange={(value) => autoSave("unaided_ipd", value)}
            />
          </TableCell>
          <TableCell />
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default forwardRef(VisualAcuity);
