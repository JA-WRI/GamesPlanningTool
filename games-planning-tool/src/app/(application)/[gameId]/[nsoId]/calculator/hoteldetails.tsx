"use client";

import { useState } from "react";
import {
  Box,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import "./hoteldetails.css";

type OccupancyType = "Single" | "Double";

type Hotel = {
  name: string;
  singlePrice: number;
  doublePrice: number;
};

const HOTELS: Hotel[] = [
  {
    name: "Milano - UNA Mediterraneo",
    singlePrice: 750,
    doublePrice: 375,
  },
  {
    name: "Milano - NH Milano Congress Centre",
    singlePrice: 750,
    doublePrice: 375,
  },
  {
    name: "Milano - NH Milano Fiera",
    singlePrice: 750,
    doublePrice: 375,
  },
  {
    name: "Cortina - Appartamenti da Nica e Diego",
    singlePrice: 525,
    doublePrice: 262.5,
  },
  {
    name: "Anterselva - Villa Adele",
    singlePrice: 780,
    doublePrice: 390,
  },
  {
    name: "Predazzo - Hotel Liz",
    singlePrice: 495,
    doublePrice: 172.5,
  },
  {
    name: "Livigno - Hotel Alba",
    singlePrice: 720,
    doublePrice: 360,
  },
  {
    name: "Livigno - Hotel Margherita",
    singlePrice: 480,
    doublePrice: 240,
  },
  {
    name: "Bormio - Hotel Larice Bianco",
    singlePrice: 420,
    doublePrice: 210,
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

export default function HotelDetails() {
  const [selectedHotel, setSelectedHotel] = useState("");
  const [occupancyType, setOccupancyType] = useState<OccupancyType | "">("");

  const hotel = HOTELS.find((item) => item.name === selectedHotel);

  const price =
    hotel && occupancyType
      ? occupancyType === "Single"
        ? hotel.singlePrice
        : hotel.doublePrice
      : 0;

  const handleHotelChange = (hotelName: string) => {
    setSelectedHotel(hotelName);
    setOccupancyType("");
  };

  return (
    <Paper className="hotel-details" variant="outlined">
      <Box className="hotel-details-heading">
        <Typography>Hotel Details</Typography>
      </Box>

      <TableContainer>
        <Table className="hotel-details-table">
          <TableHead>
            <TableRow>
              <TableCell>Property Cluster and Name</TableCell>
              <TableCell>Occupancy Type</TableCell>
              <TableCell>NSO Cost Bed/Night (CAD)</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow>
              <TableCell>
                <FormControl
                  className="hotel-details-select"
                  variant="standard"
                  fullWidth
                >
                  <Select
                    value={selectedHotel}
                    displayEmpty
                    onChange={(event) =>
                      handleHotelChange(event.target.value)
                    }
                    inputProps={{
                      "aria-label": "Hotel",
                    }}
                  >
                    <MenuItem value="" disabled>
                      Select Hotel
                    </MenuItem>

                    {HOTELS.map((item) => (
                      <MenuItem key={item.name} value={item.name}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>

              <TableCell>
                <FormControl
                  className="hotel-details-select"
                  variant="standard"
                  fullWidth
                  disabled={!selectedHotel}
                >
                  <Select
                    value={occupancyType}
                    displayEmpty
                    onChange={(event) =>
                      setOccupancyType(
                        event.target.value as OccupancyType
                      )
                    }
                    inputProps={{
                      "aria-label": "Occupancy type",
                    }}
                  >
                    <MenuItem value="" disabled>
                      Select Occupancy
                    </MenuItem>

                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Double">Double</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>

              <TableCell>
                <Typography className="hotel-details-price">
                  {formatCurrency(price)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}