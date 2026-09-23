import { DistrictIntelligence } from '../types/location.ts';

export const DISTRICT_BENCHMARKS: DistrictIntelligence[] = [
  {
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    agroClimaticZone: 'Middle Gangetic Plains (Alluvial)',
    keySurplusCrops: ['Rice / Paddy', 'Vegetables (Chili, Tomato, Green Pea)', 'Mango', 'Mustard', 'Barley'],
    industrialClusters: ['Handloom & Silk Weaving', 'Agro-processing', 'Packaging', 'Metal Handicrafts'],
    powerReliabilityScore: 8.5,
    waterAvailabilityScore: 9.0,
    nearestHighwayKm: 4,
    nearestRailwayStationKm: 6,
    prominentLocalMarkets: ['Chandpur Industrial Area', 'Varanasi Grain Mandi', 'Raja Talab Vegetable Market'],
    recommendedRuralEnterprises: ['ent_spices_processing', 'ent_dairy_chilling', 'ent_paper_packaging', 'ent_solar_cold_storage'],
    districtIndustryCenterAddress: 'District Industries Center, Chandpur Industrial Estate, Varanasi, UP - 221106',
    leadBankName: 'Union Bank of India'
  },
  {
    state: 'Bihar',
    district: 'Muzaffarpur',
    agroClimaticZone: 'Middle Gangetic Plain (North Bihar Sandy Loam)',
    keySurplusCrops: ['Shahi Litchi', 'Mango', 'Maize (Corn)', 'Makhana (Foxnut)', 'Paddy'],
    industrialClusters: ['Textile & Bag Cluster Bela', 'Food Processing (Litchi/Maize)', 'Cold Chain Logistics'],
    powerReliabilityScore: 7.5,
    waterAvailabilityScore: 9.5,
    nearestHighwayKm: 2,
    nearestRailwayStationKm: 5,
    prominentLocalMarkets: ['Bela Industrial Area', 'Muzaffarpur Fruit & Grain Mandi', 'Ahiyapur Bazar Samiti'],
    recommendedRuralEnterprises: ['ent_solar_cold_storage', 'ent_cattle_feed', 'ent_dal_mill', 'ent_spices_processing'],
    districtIndustryCenterAddress: 'District Industries Center, Bela Phase II, Muzaffarpur, Bihar - 842005',
    leadBankName: 'Bank of Baroda'
  },
  {
    state: 'Maharashtra',
    district: 'Nashik',
    agroClimaticZone: 'Western Plateau and Hills (Semi-Arid & Sub-Humid)',
    keySurplusCrops: ['Table Grapes', 'Red Onion', 'Tomato', 'Pomegranate', 'Soybean'],
    industrialClusters: ['Wine & Agro-Processing', 'Electrical Engineering (Ambad/Satpur)', 'Cold Storage Chains'],
    powerReliabilityScore: 9.0,
    waterAvailabilityScore: 8.0,
    nearestHighwayKm: 3,
    nearestRailwayStationKm: 8,
    prominentLocalMarkets: ['Lasalgaon Onion APMC Mandi', 'Pimpalgaon APMC', 'Satpur MIDC'],
    recommendedRuralEnterprises: ['ent_solar_cold_storage', 'ent_oil_expeller', 'ent_paper_packaging', 'ent_spices_processing'],
    districtIndustryCenterAddress: 'DIC Nashik, Trimbak Road, Near Old Agra Naka, Nashik, Maharashtra - 422002',
    leadBankName: 'Bank of Maharashtra'
  },
  {
    state: 'Rajasthan',
    district: 'Alwar',
    agroClimaticZone: 'Trans-Gangetic Plains & Semi-Arid Aravali Zone',
    keySurplusCrops: ['Mustard Seed', 'Wheat', 'Guar', 'Barley', 'Dairy Milk Surplus'],
    industrialClusters: ['MIA Alwar Oil Mills', 'Automotive Hub Bhiwadi', 'Ceramics & Lime Units'],
    powerReliabilityScore: 8.0,
    waterAvailabilityScore: 6.5,
    nearestHighwayKm: 5,
    nearestRailwayStationKm: 7,
    prominentLocalMarkets: ['Matsya Industrial Area (MIA)', 'Alwar Krishi Upaj Mandi', 'Bhiwadi Industrial Estate'],
    recommendedRuralEnterprises: ['ent_oil_expeller', 'ent_cattle_feed', 'ent_flyash_bricks', 'ent_dairy_chilling'],
    districtIndustryCenterAddress: 'DIC Alwar, Near Collectorate, Alwar, Rajasthan - 301001',
    leadBankName: 'Punjab National Bank'
  },
  {
    state: 'Madhya Pradesh',
    district: 'Indore',
    agroClimaticZone: 'Malwa Plateau & Central Narmada Valley',
    keySurplusCrops: ['Soybean', 'Wheat (Sharbati)', 'Gram (Chana)', 'Garlic', 'Potato'],
    industrialClusters: ['Sanwer Road Industrial Area', 'Pithampur SEZ', 'Agro-processing Clusters'],
    powerReliabilityScore: 9.0,
    waterAvailabilityScore: 8.0,
    nearestHighwayKm: 3,
    nearestRailwayStationKm: 5,
    prominentLocalMarkets: ['Choithram APMC Mandi', 'Sanwer Road Industrial Area', 'Laxmibai Nagar Mandi'],
    recommendedRuralEnterprises: ['ent_dal_mill', 'ent_oil_expeller', 'ent_spices_processing', 'ent_paper_packaging'],
    districtIndustryCenterAddress: 'District Industries Center, Pologround Industrial Estate, Indore, MP - 452015',
    leadBankName: 'State Bank of India'
  }
];

export const POPULAR_INDIAN_STATES = [
  'Uttar Pradesh',
  'Bihar',
  'Maharashtra',
  'Rajasthan',
  'Madhya Pradesh',
  'Gujarat',
  'Karnataka',
  'Tamil Nadu',
  'Andhra Pradesh',
  'West Bengal',
  'Punjab',
  'Haryana',
  'Odisha',
  'Assam'
];
