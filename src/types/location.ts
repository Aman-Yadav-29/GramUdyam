export type GeographicResolution = 
  | 'District-level estimate'
  | 'State-level estimate'
  | 'Block/Taluk-level report'
  | 'Sub-district estimate';

export interface DataProvenance<T = string | number> {
  value: T;
  source: string;
  date: string;
  geographicLevel: GeographicResolution;
}

export interface MandiInfo {
  name: string;
  type: 'APMC Principal Market' | 'APMC Sub-Market Yard' | 'Private Wholesale Mandi' | 'Weekly Rural Haat';
  distanceKm: number;
  majorCommodities: string[];
  hasElectronicTrading?: boolean; // e-NAM integrated
}

export interface LogisticsInfo {
  nearestHighwayName: string;
  highwayDistanceKm: number;
  nearestRailwayStation: string;
  railwayDistanceKm: number;
  hasGoodsFreightTerminal: boolean;
  pmgsyRoadConnectivity: 'All-Weather Bituminous' | 'Fair-Weather / Semi-Metalled';
  nearestCommercialHub: string;
  commercialHubDistanceKm: number;
}

export interface UtilityInfrastructureInfo {
  powerFeederType: 'Dedicated Industrial Feeder' | 'Mixed Rural Feeder' | 'Agricultural Feeder';
  averagePowerSupplyHoursPerDay: DataProvenance<number>;
  threePhasePowerAvailable: boolean;
  cgwbGroundwaterCategory: 'Safe' | 'Semi-Critical' | 'Critical' | 'Over-Exploited';
  waterTableDepthMeters: DataProvenance<number>;
  canalIrrigationCoveragePercent?: DataProvenance<number>;
  industrialEstateCluster?: string;
}

export interface AgroClimateInfo {
  agroClimaticZone: string;
  annualRainfallMm: DataProvenance<number>;
  climateDescription: string;
  peakSummerTempC: number;
  winterMinTempC: number;
  primarySoilType: string;
  majorSurplusCrops: Array<{ crop: string; annualSurplusMt?: number; seasonality: string }>;
  bovinePopulation?: DataProvenance<number>;
}

export interface LocalEcosystemInfo {
  equipmentFabricatorsNearby: string[];
  packagingMaterialSuppliers: string[];
  keyBuyersOffTakers: string[];
  fpoClustersCount?: DataProvenance<number>;
  coldStorageCapacityMt?: DataProvenance<number>;
  prominentLocalIndustries: string[];
}

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

  // Rich GIS & Statistical Demographics with Mandatory Provenance
  population?: DataProvenance<number>;
  ruralPopulationPercent?: DataProvenance<number>;
  agriculturalWorkersPercent?: DataProvenance<number>;
  mandis?: MandiInfo[];
  logistics?: LogisticsInfo;
  infrastructure?: UtilityInfrastructureInfo;
  agroClimate?: AgroClimateInfo;
  ecosystem?: LocalEcosystemInfo;
  seasonality?: {
    peakHarvestMonths: string[];
    leanPeriodMonths: string[];
    rawMaterialPriceVolatility: 'Low' | 'Moderate' | 'High';
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface LocationFitAssessment {
  state: string;
  district: string;
  subDistrictOrBlock?: string;
  villageOrTown?: string;
  locationType: 'rural' | 'semi_urban' | 'urban';
  
  // Composite Location Relevance Score (0 to 100)
  locationScore: number;
  synergyLevel: 'HIGH_SYNERGY' | 'MODERATE_SYNERGY' | 'LOW_SYNERGY';
  synergyHeadline: string;

  rawMaterialSynergy: {
    score: number; // 0 to 100
    status: 'Local Surplus Available' | 'Regional Procurement Required' | 'Import / Out-of-District Sourcing';
    matchedSurpluses: string[];
    nearestMandi: string;
    mandiDistanceKm: number;
    provenance: DataProvenance<string>;
  };

  infrastructureFit: {
    score: number; // 0 to 100
    powerFeasibility: 'Optimal' | 'Manageable with DG / Solar' | 'Power Constrained';
    waterFeasibility: 'Abundant' | 'Moderate / Permitted' | 'Water Constrained / CGWB Restriction';
    logisticsFeasibility: 'Immediate Highway Access' | 'Regional Road Access' | 'Remote / Higher Freight';
    provenance: DataProvenance<string>;
  };

  marketDemandFit: {
    score: number; // 0 to 100
    targetBuyers: string[];
    primaryMarketChannels: string[];
    nearbyMandisCount: number;
    provenance: DataProvenance<string>;
  };

  climateSuitability: {
    score: number; // 0 to 100
    isSuitable: boolean;
    notes: string;
    provenance: DataProvenance<string>;
  };

  locationSpecificAdvisory: {
    advantages: string[];
    keyRisksAndMitigations: string[];
    waterNotice?: string;
    powerNotice?: string;
  };

  provenanceItems: Array<{
    metric: string;
    value: string | number;
    source: string;
    date: string;
    geographicLevel: GeographicResolution;
  }>;
}

export interface GisLocationQuery {
  state: string;
  district: string;
  subDistrictOrBlock?: string;
  villageOrTown?: string;
  locationType?: 'rural' | 'semi_urban' | 'urban';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

