import { SectionConfig, TemplateMappingItem } from '../types';

export const PLANTS = ["TEHRI HEP", "KOTESHWAR", "TEHRI PSP"] as const;

export const NEED = [
  "GS_Stations",
  "SRAS",
  "Act_Inj_Gen_Stations",
  "Frequency",
  "Reference_Rate",
  "Deviation_Charges"
] as const;

export const SECTIONS: SectionConfig[] = [
  {
    name: "GS_Stations",
    startRow: 3,
    dateCol: 1,
    plantCol: 0,
    dataStartCol: 2,
    outDateCol: 1,
    outPlantCol: 0,
    outDataStartCol: 2
  },
  {
    name: "SRAS",
    startRow: 14,
    dateCol: 1,
    plantCol: 0,
    dataStartCol: 2,
    outDateCol: 1,
    outPlantCol: 0,
    outDataStartCol: 2
  },
  {
    name: "Act_Inj_Gen_Stations",
    startRow: 36,
    dateCol: 1,
    plantCol: 0,
    dataStartCol: 2,
    outDateCol: 1,
    outPlantCol: 0,
    outDataStartCol: 2
  },
  {
    name: "Frequency",
    startRow: 58,
    dateCol: 0,
    plantCol: null,
    dataStartCol: 1,
    outDateCol: 0,
    outPlantCol: null,
    outDataStartCol: 1
  },
  {
    name: "Reference_Rate",
    startRow: 69,
    dateCol: 0,
    plantCol: 1,
    dataStartCol: 2,
    outDateCol: 0,
    outPlantCol: 1,
    outDataStartCol: 2
  },
  {
    name: "Deviation_Charges",
    startRow: 80,
    dateCol: 1,
    plantCol: 0,
    dataStartCol: 2,
    outDateCol: 1,
    outPlantCol: 0,
    outDataStartCol: 2
  }
];

export const TEMPLATE_MAPPING: TemplateMappingItem[] = [
  { section: "Schedule Generation in LU", source: "GS_Stations", rows: "3–9" },
  { section: "AGC SRAS in LU", source: "SRAS", rows: "14–20" },
  { section: "Total Scheduled Gen in LU", source: "Template formulas preserved", rows: "25–31" },
  { section: "Actual Injection in LU", source: "Act_Inj_Gen_Stations", rows: "36–42" },
  { section: "Absolute Deviation in LU", source: "Template formulas preserved", rows: "47–53" },
  { section: "Grid Frequency in Hz", source: "Frequency", rows: "58–64" },
  { section: "Reference Rate Rs./kWh", source: "Reference_Rate", rows: "69–75" },
  { section: "Deviation Charges in ₹", source: "Template formulas preserved", rows: "80–86" },
];
