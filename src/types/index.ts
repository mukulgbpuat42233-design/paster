export interface SectionConfig {
  name: string;
  startRow: number;
  dateCol: number;
  plantCol: number | null;
  dataStartCol: number;
  outDateCol: number;
  outPlantCol: number | null;
  outDataStartCol: number;
}

export interface PlantCheck {
  plant: string;
  GS_Stations: number;
  SRAS: number;
  Act_Inj_Gen_Stations: number;
  Frequency: number;
  Reference_Rate: number;
  Deviation_Charges?: number;
}

export interface VerificationResult {
  data: Record<string, string[][]>;
  dates: string[];
  checks: PlantCheck[];
  isoWeek: {
    year: number;
    week: number;
  };
}

export interface TemplateMappingItem {
  section: string;
  source: string;
  rows: string;
  note?: string;
}
