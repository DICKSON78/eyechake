import React, { useState, useEffect } from "react";
import { TextField, Button, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { useFetch } from "../../hooks";
import { numberFormat } from "../../helpers";

const LensStock = () => {
  // Add dynamic search handling
  const [searchParams, setSearchParams] = useState({ sph: '', cyl: '' });

  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const { data, error, loading } = useFetch('api/lens-types', { status: "Active" });

  useEffect(() => {
    // Fetch lens stock to reflect any registration changes
    fetch('api/lens-stock', searchParams);
  }, [searchParams]);

  // Render search and lens data
  return (
    <div>
      <TextField
        label="Sphere"
        name="sph"
        value={searchParams.sph}
        onChange={handleSearchChange}
      />
      <TextField
        label="Cylinder"
        name="cyl"
        value={searchParams.cyl}
        onChange={handleSearchChange}
      />
      <Button variant="contained" onClick={() => useFetch('api/lens-stock', searchParams)}>Search</Button>

      {error && <div>Error loading lens stock</div>}
      {loading && <div>Loading...</div>}
      {!loading && data && (
        <Table>
          <TableBody>
            {data.lenses.map((lens) => (
              <TableRow key={lens.id}>
                <TableCell>{lens.name}</TableCell>
                <TableCell>{numberFormat(lens.sph)}</TableCell>
                <TableCell>{numberFormat(lens.cyl)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default LensStock;
