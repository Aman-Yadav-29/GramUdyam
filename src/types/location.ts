export interface DistrictIntelligence {
  state: string;
  district: string;
  agroClimaticZone: string;
  keySurplusCrops: string[];
  industrialClusters: string[];
  powerReliabilityScore: number; // 1 to 10
  waterAvailabilityScore: number; // 1 to 10
  nearestHighwayKm: number;
  nearestRailwayStationKm: number;
  prominentLocalMarkets: string[];
  recommendedRuralEnterprises: string[];
  districtIndustryCenterAddress: string;
  leadBankName: string;
}

export interface GisLocationQuery {
  state: string;
  district: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}
