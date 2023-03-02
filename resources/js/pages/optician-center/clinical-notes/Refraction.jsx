import React, { forwardRef, useImperativeHandle } from "react";

import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

const RefractionDetails = ({ consultation: { refraction } }, ref) => {

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
          <TableCell colSpan={2}>Subjective Refraction</TableCell>
        </TableRow>
        <TableRow>
          <TableCell/>
          <TableCell>RE</TableCell>
          <TableCell>LE</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell component="th">SPH</TableCell>
          <TableCell>{refraction ? refraction.sub_re_sph : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_le_sph : null}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">CYL</TableCell>
          <TableCell>{refraction ? refraction.sub_re_cyl : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_le_cyl : null}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">AXIS</TableCell>
          <TableCell>{refraction ? refraction.sub_re_axis : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_le_axis : null}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">VA</TableCell>
          <TableCell>{refraction ? refraction.sub_re_va : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_le_va : null}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">ADD</TableCell>
          <TableCell>{refraction ? refraction.sub_re_add : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_le_add : null}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">VA</TableCell>
          <TableCell>{refraction ? refraction.sub_re_add_va : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_le_add_va : null}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default forwardRef(RefractionDetails);
