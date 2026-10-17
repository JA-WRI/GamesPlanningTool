// 10% of the code was AI generated:
// - css converted to tailwind

'use client';

import { useState } from 'react';
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
} from '@mui/material';

type OccupancyType = 'Single' | 'Double';

type Hotel = {
  name: string;
  singlePrice: number;
  doublePrice: number;
};

const HOTELS: Hotel[] = [
  {
    name: 'Milano - UNA Mediterraneo',
    singlePrice: 750,
    doublePrice: 375,
  },
  {
    name: 'Milano - NH Milano Congress Centre',
    singlePrice: 750,
    doublePrice: 375,
  },
  {
    name: 'Milano - NH Milano Fiera',
    singlePrice: 750,
    doublePrice: 375,
  },
  {
    name: 'Cortina - Appartamenti da Nica e Diego',
    singlePrice: 525,
    doublePrice: 262.5,
  },
  {
    name: 'Anterselva - Villa Adele',
    singlePrice: 780,
    doublePrice: 390,
  },
  {
    name: 'Predazzo - Hotel Liz',
    singlePrice: 495,
    doublePrice: 172.5,
  },
  {
    name: 'Livigno - Hotel Alba',
    singlePrice: 720,
    doublePrice: 360,
  },
  {
    name: 'Livigno - Hotel Margherita',
    singlePrice: 480,
    doublePrice: 240,
  },
  {
    name: 'Bormio - Hotel Larice Bianco',
    singlePrice: 420,
    doublePrice: 210,
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
}

export default function HotelDetails() {
  const [selectedHotel, setSelectedHotel] = useState('');
  const [occupancyType, setOccupancyType] = useState<OccupancyType | ''>('');

  const hotel = HOTELS.find((item) => item.name === selectedHotel);

  const price =
    hotel && occupancyType
      ? occupancyType === 'Single'
        ? hotel.singlePrice
        : hotel.doublePrice
      : 0;

  const handleHotelChange = (hotelName: string) => {
    setSelectedHotel(hotelName);
    setOccupancyType('');
  };

  return (
    <Paper
      className="mt-10 overflow-hidden rounded-[4px] border-2 border-[#ab4c277a] bg-white shadow-none!"
      variant="outlined"
    >
      <Box className="border-b-2 border-[#ab4c277a] px-4 py-[14px] [&_.MuiTypography-root]:text-[18px] [&_.MuiTypography-root]:leading-[1.35] [&_.MuiTypography-root]:font-bold [&_.MuiTypography-root]:text-[#111]">
        <Typography>Hotel Details</Typography>
      </Box>

      <TableContainer>
        <Table className="w-full table-fixed max-[768px]:min-w-[700px] [&_.MuiTableCell-head]:border-b [&_.MuiTableCell-head]:border-[#ab4c277a] [&_.MuiTableCell-head]:bg-[#fff9f3] [&_.MuiTableCell-head]:px-[18px] [&_.MuiTableCell-head]:py-[14px] [&_.MuiTableCell-head]:text-[16px] [&_.MuiTableCell-head]:font-semibold [&_.MuiTableCell-head]:text-[#111] [&_.MuiTableCell-body]:h-[62px] [&_.MuiTableCell-body]:border-b-0 [&_.MuiTableCell-body]:px-[18px] [&_.MuiTableCell-body]:py-[10px] [&_.MuiTableCell-body]:text-[16px] [&_.MuiTableCell-body]:text-[#222] [&_.MuiTableCell-root:nth-child(1)]:w-[45%] [&_.MuiTableCell-root:nth-child(2)]:w-[30%] [&_.MuiTableCell-root:nth-child(3)]:w-[25%]">
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
                  className="[&_.MuiInputBase-root]:text-[16px] [&_.MuiInputBase-root]:text-[#222] [&_.MuiSelect-select]:py-2 [&_.MuiSelect-select]:text-[16px] [&_.MuiInput-underline:before]:border-b [&_.MuiInput-underline:before]:border-[#ab4c277a] [&_.MuiInput-underline:hover:not(.Mui-disabled):before]:border-[#ab4c277a] [&_.MuiInput-underline:after]:border-b-2 [&_.MuiInput-underline:after]:border-[#f84d09] [&_.MuiInputBase-root.Mui-disabled]:text-[#9e9e9e] [&_.MuiInputBase-root.Mui-disabled:before]:border-[#e0e0e0]"
                  variant="standard"
                  fullWidth
                >
                  <Select
                    value={selectedHotel}
                    displayEmpty
                    onChange={(event) => handleHotelChange(event.target.value)}
                    inputProps={{
                      'aria-label': 'Hotel',
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
                  className="[&_.MuiInputBase-root]:text-[16px] [&_.MuiInputBase-root]:text-[#222] [&_.MuiSelect-select]:py-2 [&_.MuiSelect-select]:text-[16px] [&_.MuiInput-underline:before]:border-b [&_.MuiInput-underline:before]:border-[#ab4c277a] [&_.MuiInput-underline:hover:not(.Mui-disabled):before]:border-[#ab4c277a] [&_.MuiInput-underline:after]:border-b-2 [&_.MuiInput-underline:after]:border-[#f84d09] [&_.MuiInputBase-root.Mui-disabled]:text-[#9e9e9e] [&_.MuiInputBase-root.Mui-disabled:before]:border-[#e0e0e0]"
                  variant="standard"
                  fullWidth
                  disabled={!selectedHotel}
                >
                  <Select
                    value={occupancyType}
                    displayEmpty
                    onChange={(event) =>
                      setOccupancyType(event.target.value as OccupancyType)
                    }
                    inputProps={{
                      'aria-label': 'Occupancy type',
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
                <Typography className="text-[16px] font-medium text-[#222]">
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
