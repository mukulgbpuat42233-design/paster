# THDCIL NRPC DSM – Uniform Weekwise 3-Plant Generator (React)

A React + TypeScript application for generating verified, uniform weekly NRPC Excel inputs from raw workbooks for THDCIL power stations.

## Features

- **Local In-Browser Processing**: Processes raw weekly NRPC workbooks entirely in the browser using JSZip.
- **Verification Engine**: Validates completeness of 7-day data windows across required sheets (`GS_Stations`, `SRAS`, `Act_Inj_Gen_Stations`, `Frequency`, `Reference_Rate`, `Deviation_Charges`) for the three fixed THDCIL plants:
  - **TEHRI HEP**
  - **KOTESHWAR**
  - **TEHRI PSP**
- **Uniform Data Normalization**: Normalizes all parameter tables to exactly **7 data rows** (Project Name → Date → 96 block values across 98 columns, D1–D96).
- **Template Preservation**: Utilizes the attached master template to preserve row and column dimensions, fonts, borders, merged cells, and dynamic calculation formulas for Total Scheduled Gen, Absolute Deviation, and Deviation Charges.
- **Standardized Downloads**: Generates and downloads separate Excel workbooks named by ISO week and plant (e.g., `THDCIL_Week_XX_YYYY_<PLANT>_LU_DSM.xlsx`).

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- JSZip for OpenXML / XLSX parsing and generation

## Development

```bash
npm run dev
```

Server runs on `http://0.0.0.0:3000`.

## Production Build

```bash
npm run build
```
