// ais-data.model.ts
export interface StaticData {
  IMO: string;
  MMSI: string | number;
  NAME: string;
  BUILT: string;
  FLAG: string;
  FLAGNAME: string;
  TYPE: string;
  TYPENAME: string;
  GT: string | number;
  DWT: string | number;
  LOA: string | number;
  BEAM: string | number;
  DRAUGHT: string | number;
  CLASS: string;
  CLASSCODE: string;
}

export interface MovementData {
  sog: number;
  cog: number;
  heading: number | null;
  rot: number;
  navStatus: number;
}

export interface PositionData {
  latitude: number;
  longitude: number;
}

export interface AISData {
  mmsi: string | number;
  timestamp: string | Date;
  position: PositionData;
  movement: MovementData;
  static: StaticData | null;
}
