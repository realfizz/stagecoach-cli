export type Bearing = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | '';

export interface NaptanStop {
  AtcoCode: string;
  NaptanCode: string;
  CommonName: string;
  Street: string;
  Indicator: string;
  Bearing: Bearing;
  LocalityName: string;
  ParentLocalityName: string;
  Town: string;
  Longitude: number | null;
  Latitude: number | null;
  StopType: string;
  BusStopType: string;
  TimingStatus: string;
  Status: string;
  AdministrativeAreaCode: string;
}

export interface FareDataset {
  id: number;
  operatorName: string;
  description: string;
  noc: string[];
  status: string;
}

export interface VehicleLocation {
  vehicleRef: string;
  lineRef: string;
  publishedLineName: string;
  operatorRef: string;
  originRef: string;
  originName: string;
  destinationRef: string;
  destinationName: string;
  latitude: number;
  longitude: number;
  bearing: number;
  monitored: boolean;
  recordedAt: string;
}

export interface Operator {
  name: string;
  nocCode: string;
  datasetsCount: number;
  description: string;
}

export interface BodsDataset {
  id: number;
  operatorName: string;
  description: string;
  lines: string[];
  adminAreas: Array<{ name: string }>;
  noc: string[];
}

export interface RouteInfo {
  operatorName: string;
  description: string;
  lines: string[];
  adminAreas: string[];
  datasetId: number;
}
