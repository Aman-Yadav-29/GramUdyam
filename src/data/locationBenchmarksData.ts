import type { DistrictIntelligence } from '../types/location.ts';

export const DISTRICT_BENCHMARKS: DistrictIntelligence[] = [
  {
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    agroClimaticZone: 'Middle Gangetic Plains (Alluvial)',
    keySurplusCrops: ['Rice / Paddy', 'Vegetables (Chili, Tomato, Green Pea)', 'Mango (Langra)', 'Mustard', 'Barley'],
    industrialClusters: ['Handloom & Silk Weaving', 'Agro & Vegetable Processing', 'Paper & Corrugated Packaging', 'Metal Handicrafts'],
    powerReliabilityScore: 8.5,
    waterAvailabilityScore: 9.0,
    nearestHighwayKm: 4,
    nearestRailwayStationKm: 6,
    prominentLocalMarkets: ['Chandpur Industrial Area', 'Varanasi Grain Mandi', 'Raja Talab Vegetable APMC Mandi'],
    recommendedRuralEnterprises: ['ent_spices_processing', 'ent_dairy_chilling', 'ent_corrugated_boxes', 'ent_solar_cold_storage', 'ent_dairy_cattle'],
    districtIndustryCenterAddress: 'District Industries Center, Chandpur Industrial Estate, Varanasi, UP - 221106',
    leadBankName: 'Union Bank of India',

    population: {
      value: 3676841,
      source: 'Census of India / MoRD Demographic Projections',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    ruralPopulationPercent: {
      value: 56.6,
      source: 'Census of India / MoRD Rural Statistics',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    agriculturalWorkersPercent: {
      value: 34.2,
      source: 'Directorate of Economics & Statistics, MoA&FW',
      date: '2022-23',
      geographicLevel: 'District-level estimate'
    },
    mandis: [
      {
        name: 'Raja Talab APMC Mandi',
        type: 'APMC Principal Market',
        distanceKm: 12,
        majorCommodities: ['Green Chili', 'Tomato', 'Green Peas', 'Cauliflower'],
        hasElectronicTrading: true
      },
      {
        name: 'Varanasi Vishwavidyalaya Grain Mandi',
        type: 'APMC Principal Market',
        distanceKm: 8,
        majorCommodities: ['Paddy', 'Wheat', 'Mustard Seed'],
        hasElectronicTrading: true
      },
      {
        name: 'Chandpur Wholesale Yard',
        type: 'APMC Sub-Market Yard',
        distanceKm: 4,
        majorCommodities: ['Potato', 'Onion', 'Seasonal Vegetables'],
        hasElectronicTrading: false
      }
    ],
    logistics: {
      nearestHighwayName: 'NH-19 (Golden Quadrilateral / Delhi-Kolkata) & NH-31',
      highwayDistanceKm: 4,
      nearestRailwayStation: 'Varanasi Junction (BSB) / Pt. Deen Dayal Upadhyaya Goods Yard',
      railwayDistanceKm: 6,
      hasGoodsFreightTerminal: true,
      pmgsyRoadConnectivity: 'All-Weather Bituminous',
      nearestCommercialHub: 'Varanasi City Center & Ramnagar Industrial Area',
      commercialHubDistanceKm: 7
    },
    infrastructure: {
      powerFeederType: 'Dedicated Industrial Feeder',
      averagePowerSupplyHoursPerDay: {
        value: 20.5,
        source: 'UPPCL District Supply Monitoring Report',
        date: '2023-24',
        geographicLevel: 'District-level estimate'
      },
      threePhasePowerAvailable: true,
      cgwbGroundwaterCategory: 'Safe',
      waterTableDepthMeters: {
        value: 12.4,
        source: 'Central Ground Water Board (CGWB) Dynamic GW Assessment',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      canalIrrigationCoveragePercent: {
        value: 41.0,
        source: 'UP State Irrigation Department',
        date: '2022-23',
        geographicLevel: 'District-level estimate'
      },
      industrialEstateCluster: 'UPSIDA Chandpur & Ramnagar Industrial Area'
    },
    agroClimate: {
      agroClimaticZone: 'Zone IV - Middle Gangetic Plain',
      annualRainfallMm: {
        value: 1025,
        source: 'India Meteorological Department (IMD) Agromet Advisory',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      climateDescription: 'Subtropical monsoon with hot summers and fertile alluvial Gangetic silt.',
      peakSummerTempC: 43.5,
      winterMinTempC: 8.0,
      primarySoilType: 'Deep Alluvial Sandy Loam',
      majorSurplusCrops: [
        { crop: 'Vegetables (Chili, Tomato, Pea)', annualSurplusMt: 420000, seasonality: 'October to March' },
        { crop: 'Paddy / Rice', annualSurplusMt: 310000, seasonality: 'November to January' },
        { crop: 'Mango', annualSurplusMt: 65000, seasonality: 'May to July' }
      ],
      bovinePopulation: {
        value: 485000,
        source: '20th Livestock Census, DAHD',
        date: '2019-20',
        geographicLevel: 'District-level estimate'
      }
    },
    ecosystem: {
      equipmentFabricatorsNearby: ['Ramnagar Industrial Fabrication Hub', 'Kanpur Machinery Dealers (180 km)'],
      packagingMaterialSuppliers: ['Chandpur Corrugated Box Makers', 'Varanasi Printing & Packaging Cluster'],
      keyBuyersOffTakers: ['Banashankari Agro FPO', 'Mother Dairy Chilling Siding', 'Varanasi Fresh Retail Grid'],
      fpoClustersCount: {
        value: 14,
        source: 'SFAC & NABARD Registered FPOs',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      coldStorageCapacityMt: {
        value: 185000,
        source: 'National Horticulture Board (NHB)',
        date: '2022',
        geographicLevel: 'District-level estimate'
      },
      prominentLocalIndustries: ['Handloom & Textiles', 'Agro-processing', 'Electrical Goods']
    },
    seasonality: {
      peakHarvestMonths: ['November', 'December', 'January', 'February', 'March'],
      leanPeriodMonths: ['May', 'June', 'July'],
      rawMaterialPriceVolatility: 'Moderate'
    },
    coordinates: {
      lat: 25.3176,
      lng: 82.9739
    }
  },
  {
    state: 'Bihar',
    district: 'Muzaffarpur',
    agroClimaticZone: 'Middle Gangetic Plain (North Bihar Sandy Loam)',
    keySurplusCrops: ['Maize (Corn)', 'Shahi Litchi', 'Makhana (Foxnut)', 'Paddy / Rice', 'Vegetables'],
    industrialClusters: ['Textile & Bag Cluster Bela', 'Food Processing (Litchi/Maize)', 'Cold Chain Logistics', 'Cattle Feed Formulation'],
    powerReliabilityScore: 7.5,
    waterAvailabilityScore: 9.5,
    nearestHighwayKm: 2,
    nearestRailwayStationKm: 5,
    prominentLocalMarkets: ['Bela Industrial Area', 'Muzaffarpur Fruit & Grain Mandi', 'Ahiyapur Bazar Samiti'],
    recommendedRuralEnterprises: ['ent_solar_cold_storage', 'ent_cattle_feed', 'ent_dal_mill', 'ent_spices_processing', 'ent_poultry_broiler'],
    districtIndustryCenterAddress: 'District Industries Center, Bela Phase II, Muzaffarpur, Bihar - 842005',
    leadBankName: 'Bank of Baroda',

    population: {
      value: 4801062,
      source: 'Census of India / MoRD Demographic Projections',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    ruralPopulationPercent: {
      value: 90.4,
      source: 'Census of India / MoRD Rural Statistics',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    agriculturalWorkersPercent: {
      value: 68.5,
      source: 'Directorate of Economics & Statistics, MoA&FW',
      date: '2022-23',
      geographicLevel: 'District-level estimate'
    },
    mandis: [
      {
        name: 'Ahiyapur Bazar Samiti Mandi',
        type: 'APMC Principal Market',
        distanceKm: 5,
        majorCommodities: ['Maize', 'Paddy', 'Wheat', 'Green Chili'],
        hasElectronicTrading: true
      },
      {
        name: 'Muzaffarpur Fruit Terminal (Kanti Road)',
        type: 'APMC Principal Market',
        distanceKm: 7,
        majorCommodities: ['Shahi Litchi', 'Mango', 'Banana'],
        hasElectronicTrading: false
      },
      {
        name: 'Sakra Rural Haat',
        type: 'Weekly Rural Haat',
        distanceKm: 18,
        majorCommodities: ['Vegetables', 'Local Grains', 'Spices'],
        hasElectronicTrading: false
      }
    ],
    logistics: {
      nearestHighwayName: 'NH-27 (East-West Corridor) & NH-22 (Patna-Muzaffarpur Highway)',
      highwayDistanceKm: 2,
      nearestRailwayStation: 'Muzaffarpur Junction (MFP) Goods Yard',
      railwayDistanceKm: 5,
      hasGoodsFreightTerminal: true,
      pmgsyRoadConnectivity: 'All-Weather Bituminous',
      nearestCommercialHub: 'Bela Industrial Area & Motijheel Commercial Area',
      commercialHubDistanceKm: 4
    },
    infrastructure: {
      powerFeederType: 'Mixed Rural Feeder',
      averagePowerSupplyHoursPerDay: {
        value: 18.0,
        source: 'NBPDCL Feeder Operations Status',
        date: '2023-24',
        geographicLevel: 'District-level estimate'
      },
      threePhasePowerAvailable: true,
      cgwbGroundwaterCategory: 'Safe',
      waterTableDepthMeters: {
        value: 6.8,
        source: 'Central Ground Water Board (CGWB) Dynamic GW Assessment',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      canalIrrigationCoveragePercent: {
        value: 32.0,
        source: 'Water Resources Dept, Govt of Bihar',
        date: '2022-23',
        geographicLevel: 'District-level estimate'
      },
      industrialEstateCluster: 'BIADA Bela Industrial Estate (Phase I & II)'
    },
    agroClimate: {
      agroClimaticZone: 'Zone I - North West Alluvial Plain',
      annualRainfallMm: {
        value: 1210,
        source: 'IMD Agromet Advisory Service',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      climateDescription: 'Humid subtropical with fertile Gandak river basin silt and abundant water.',
      peakSummerTempC: 41.0,
      winterMinTempC: 7.5,
      primarySoilType: 'Calcareous Silt Loam',
      majorSurplusCrops: [
        { crop: 'Maize (Corn)', annualSurplusMt: 520000, seasonality: 'March to May (Rabi) & Oct to Nov (Kharif)' },
        { crop: 'Shahi Litchi', annualSurplusMt: 95000, seasonality: 'May to June' },
        { crop: 'Paddy', annualSurplusMt: 280000, seasonality: 'November to January' }
      ],
      bovinePopulation: {
        value: 620000,
        source: '20th Livestock Census, DAHD',
        date: '2019-20',
        geographicLevel: 'District-level estimate'
      }
    },
    ecosystem: {
      equipmentFabricatorsNearby: ['Patna Agricultural Machinery Hub (70 km)', 'Local Bela Fabricators'],
      packagingMaterialSuppliers: ['Bela Textile & Bag Cluster', 'Muzaffarpur Corrugators'],
      keyBuyersOffTakers: ['Kisan Dairy Cooperative (Sudha)', 'Poultry Feed Mill Aggregators', 'Metro Food Retailers'],
      fpoClustersCount: {
        value: 19,
        source: 'NABARD & Bihar Rural Livelihoods Promotion Society (JEEViKA)',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      coldStorageCapacityMt: {
        value: 142000,
        source: 'National Horticulture Board (NHB)',
        date: '2022',
        geographicLevel: 'District-level estimate'
      },
      prominentLocalIndustries: ['Maize processing', 'Textiles', 'Jute & Packaging']
    },
    seasonality: {
      peakHarvestMonths: ['April', 'May', 'June', 'November', 'December'],
      leanPeriodMonths: ['July', 'August', 'September'],
      rawMaterialPriceVolatility: 'High'
    },
    coordinates: {
      lat: 26.1209,
      lng: 85.3647
    }
  },
  {
    state: 'Maharashtra',
    district: 'Nashik',
    agroClimaticZone: 'Western Plateau and Hills (Semi-Arid & Sub-Humid)',
    keySurplusCrops: ['Red Onion', 'Table Grapes', 'Tomato', 'Pomegranate', 'Soybean', 'Maize'],
    industrialClusters: ['Wine & Agro-Processing', 'MIDC Ambad & Satpur Engineering', 'Cold Storage Chains & Corrugated Packaging'],
    powerReliabilityScore: 9.0,
    waterAvailabilityScore: 8.0,
    nearestHighwayKm: 3,
    nearestRailwayStationKm: 8,
    prominentLocalMarkets: ['Lasalgaon Onion APMC Mandi', 'Pimpalgaon Baswant APMC', 'Satpur MIDC Trade Yard'],
    recommendedRuralEnterprises: ['ent_solar_cold_storage', 'ent_corrugated_boxes', 'ent_oil_expeller', 'ent_spices_processing', 'ent_cattle_feed'],
    districtIndustryCenterAddress: 'DIC Nashik, Trimbak Road, Near Old Agra Naka, Nashik, Maharashtra - 422002',
    leadBankName: 'Bank of Maharashtra',

    population: {
      value: 6107187,
      source: 'Census of India / MoRD Demographic Projections',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    ruralPopulationPercent: {
      value: 57.5,
      source: 'Census of India / MoRD Rural Statistics',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    agriculturalWorkersPercent: {
      value: 48.0,
      source: 'Directorate of Economics & Statistics, MoA&FW',
      date: '2022-23',
      geographicLevel: 'District-level estimate'
    },
    mandis: [
      {
        name: 'Lasalgaon APMC Mandi (Largest Onion Market in Asia)',
        type: 'APMC Principal Market',
        distanceKm: 38,
        majorCommodities: ['Red Onion', 'Garlic', 'Soybean'],
        hasElectronicTrading: true
      },
      {
        name: 'Pimpalgaon Baswant APMC',
        type: 'APMC Principal Market',
        distanceKm: 24,
        majorCommodities: ['Table Grapes', 'Tomato', 'Capsicum', 'Onion'],
        hasElectronicTrading: true
      },
      {
        name: 'Nashik Dindori Road APMC',
        type: 'APMC Principal Market',
        distanceKm: 12,
        majorCommodities: ['Vegetables', 'Pomegranate', 'Grains'],
        hasElectronicTrading: true
      }
    ],
    logistics: {
      nearestHighwayName: 'NH-60 (Nashik-Pune) & NH-848 / Mumbai-Agra Highway',
      highwayDistanceKm: 3,
      nearestRailwayStation: 'Nashik Road Railway Station (NK) & Ozar Airport Cargo Terminal',
      railwayDistanceKm: 8,
      hasGoodsFreightTerminal: true,
      pmgsyRoadConnectivity: 'All-Weather Bituminous',
      nearestCommercialHub: 'Satpur & Ambad MIDC Complex',
      commercialHubDistanceKm: 6
    },
    infrastructure: {
      powerFeederType: 'Dedicated Industrial Feeder',
      averagePowerSupplyHoursPerDay: {
        value: 22.0,
        source: 'MSEDCL Industrial Reliability Audit',
        date: '2023-24',
        geographicLevel: 'District-level estimate'
      },
      threePhasePowerAvailable: true,
      cgwbGroundwaterCategory: 'Safe',
      waterTableDepthMeters: {
        value: 9.5,
        source: 'Central Ground Water Board (CGWB) Dynamic GW Assessment',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      canalIrrigationCoveragePercent: {
        value: 38.5,
        source: 'Maharashtra Water Resources Department',
        date: '2022-23',
        geographicLevel: 'District-level estimate'
      },
      industrialEstateCluster: 'MIDC Ambad, Satpur & Sinnar Industrial Estates'
    },
    agroClimate: {
      agroClimaticZone: 'Zone IX - Western Plateau and Hills',
      annualRainfallMm: {
        value: 780,
        source: 'IMD Agromet Advisory',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      climateDescription: 'Semi-arid plateau with cool nights, warm dry days; ideal for viticulture & horticulture.',
      peakSummerTempC: 40.5,
      winterMinTempC: 9.0,
      primarySoilType: 'Black Cotton Basaltic Soil & Red Sandy Loam',
      majorSurplusCrops: [
        { crop: 'Red Onion', annualSurplusMt: 1850000, seasonality: 'November to May' },
        { crop: 'Table Grapes', annualSurplusMt: 450000, seasonality: 'January to April' },
        { crop: 'Tomato', annualSurplusMt: 320000, seasonality: 'August to December' }
      ],
      bovinePopulation: {
        value: 710000,
        source: '20th Livestock Census, DAHD',
        date: '2019-20',
        geographicLevel: 'District-level estimate'
      }
    },
    ecosystem: {
      equipmentFabricatorsNearby: ['Ambad MIDC Engineering Fabricators', 'Nashik Food Machine Specialists'],
      packagingMaterialSuppliers: ['Satpur Corrugators & Box Manufacturers', 'Dindori Packaging Units'],
      keyBuyersOffTakers: ['APEDA Grape Exporters Association', 'Safal FPO Federation', 'Reliance Retail Agri Hub'],
      fpoClustersCount: {
        value: 28,
        source: 'MahaFPC / NABARD Maharashtra',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      coldStorageCapacityMt: {
        value: 410000,
        source: 'National Horticulture Board (NHB)',
        date: '2022',
        geographicLevel: 'District-level estimate'
      },
      prominentLocalIndustries: ['Wine Making', 'Automobile Ancillary', 'Packaging & Paper', 'Horticulture Export']
    },
    seasonality: {
      peakHarvestMonths: ['January', 'February', 'March', 'April', 'November', 'December'],
      leanPeriodMonths: ['June', 'July', 'August'],
      rawMaterialPriceVolatility: 'High'
    },
    coordinates: {
      lat: 19.9975,
      lng: 73.7898
    }
  },
  {
    state: 'Rajasthan',
    district: 'Alwar',
    agroClimaticZone: 'Trans-Gangetic Plains & Semi-Arid Aravali Zone',
    keySurplusCrops: ['Mustard Seed', 'Wheat', 'Pearl Millet (Bajra)', 'Guar', 'Barley', 'Dairy Milk Surplus'],
    industrialClusters: ['MIA Alwar Oil Mills & Feed', 'Automotive Hub Bhiwadi', 'Ceramics & Fly Ash Paver Units'],
    powerReliabilityScore: 8.0,
    waterAvailabilityScore: 6.5,
    nearestHighwayKm: 5,
    nearestRailwayStationKm: 7,
    prominentLocalMarkets: ['Matsya Industrial Area (MIA)', 'Alwar Krishi Upaj Mandi', 'Bhiwadi Industrial Estate'],
    recommendedRuralEnterprises: ['ent_oil_expeller', 'ent_cattle_feed', 'ent_flyash_bricks', 'ent_dairy_chilling', 'ent_dairy_cattle'],
    districtIndustryCenterAddress: 'DIC Alwar, Near Collectorate, Alwar, Rajasthan - 301001',
    leadBankName: 'Punjab National Bank',

    population: {
      value: 3674179,
      source: 'Census of India / MoRD Demographic Projections',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    ruralPopulationPercent: {
      value: 82.2,
      source: 'Census of India / MoRD Rural Statistics',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    agriculturalWorkersPercent: {
      value: 61.4,
      source: 'Directorate of Economics & Statistics, MoA&FW',
      date: '2022-23',
      geographicLevel: 'District-level estimate'
    },
    mandis: [
      {
        name: 'Alwar Krishi Upaj Mandi Samiti (Kherli / Alwar)',
        type: 'APMC Principal Market',
        distanceKm: 6,
        majorCommodities: ['Mustard Seed', 'Wheat', 'Bajra', 'Barley'],
        hasElectronicTrading: true
      },
      {
        name: 'Khairthal Grain Mandi',
        type: 'APMC Sub-Market Yard',
        distanceKm: 28,
        majorCommodities: ['Mustard Seed', 'Paddy / Basmati', 'Guar'],
        hasElectronicTrading: true
      },
      {
        name: 'Bhiwadi Industrial Supply Market',
        type: 'Private Wholesale Mandi',
        distanceKm: 52,
        majorCommodities: ['Industrial Goods', 'Packaging Paper', 'Fly Ash Raw'],
        hasElectronicTrading: false
      }
    ],
    logistics: {
      nearestHighwayName: 'Delhi-Mumbai Expressway (NE-4) & NH-248A',
      highwayDistanceKm: 5,
      nearestRailwayStation: 'Alwar Junction (AWR) Container Depot',
      railwayDistanceKm: 7,
      hasGoodsFreightTerminal: true,
      pmgsyRoadConnectivity: 'All-Weather Bituminous',
      nearestCommercialHub: 'Matsya Industrial Area (MIA) & Bhiwadi Hub',
      commercialHubDistanceKm: 8
    },
    infrastructure: {
      powerFeederType: 'Dedicated Industrial Feeder',
      averagePowerSupplyHoursPerDay: {
        value: 19.5,
        source: 'JVVNL District Distribution Review',
        date: '2023-24',
        geographicLevel: 'District-level estimate'
      },
      threePhasePowerAvailable: true,
      cgwbGroundwaterCategory: 'Critical',
      waterTableDepthMeters: {
        value: 28.5,
        source: 'Central Ground Water Board (CGWB) Dynamic GW Assessment',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      canalIrrigationCoveragePercent: {
        value: 12.0,
        source: 'Rajasthan Ground Water Department',
        date: '2022-23',
        geographicLevel: 'District-level estimate'
      },
      industrialEstateCluster: 'RIICO Matsya Industrial Area (MIA) & Neemrana Industrial Zone'
    },
    agroClimate: {
      agroClimaticZone: 'Zone III-B - Flood Prone Eastern Plains / Aravali Semi-Arid',
      annualRainfallMm: {
        value: 620,
        source: 'IMD Agromet Advisory',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      climateDescription: 'Dry semi-arid with scorching summers; optimal for drought-hardy mustard and bajra.',
      peakSummerTempC: 45.0,
      winterMinTempC: 5.0,
      primarySoilType: 'Sandy Loam & Alluvial Calcified Silt',
      majorSurplusCrops: [
        { crop: 'Mustard Seed (Rape/Mustard)', annualSurplusMt: 410000, seasonality: 'February to April' },
        { crop: 'Pearl Millet (Bajra)', annualSurplusMt: 285000, seasonality: 'September to November' },
        { crop: 'Wheat', annualSurplusMt: 320000, seasonality: 'March to May' }
      ],
      bovinePopulation: {
        value: 940000,
        source: '20th Livestock Census, DAHD (Murrah Buffalo Hub)',
        date: '2019-20',
        geographicLevel: 'District-level estimate'
      }
    },
    ecosystem: {
      equipmentFabricatorsNearby: ['Jaipur Machine & Expeller Manufacturers (140 km)', 'MIA Alwar Workshop Hub'],
      packagingMaterialSuppliers: ['Bhiwadi Corrugated Cartons & Tin Plate Containers'],
      keyBuyersOffTakers: ['Alwar Zila Dugdh Utpadak Sahakari Sangh (Saras Dairy)', 'Adani Wilmar Mustard Hub', 'Delhi NCR Wholesale Grids'],
      fpoClustersCount: {
        value: 16,
        source: 'NABARD Rajasthan & SFAC',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      coldStorageCapacityMt: {
        value: 95000,
        source: 'National Horticulture Board (NHB)',
        date: '2022',
        geographicLevel: 'District-level estimate'
      },
      prominentLocalIndustries: ['Mustard Oil Mills', 'Automotive Components', 'Dairy Processing', 'Fly Ash & Building Materials']
    },
    seasonality: {
      peakHarvestMonths: ['February', 'March', 'April', 'October', 'November'],
      leanPeriodMonths: ['June', 'July', 'August'],
      rawMaterialPriceVolatility: 'Moderate'
    },
    coordinates: {
      lat: 27.5530,
      lng: 76.6346
    }
  },
  {
    state: 'Madhya Pradesh',
    district: 'Indore',
    agroClimaticZone: 'Malwa Plateau & Central Narmada Valley',
    keySurplusCrops: ['Soybean', 'Wheat (Sharbati & Durum)', 'Gram / Chana (Pulses)', 'Garlic', 'Potato', 'Onion'],
    industrialClusters: ['Sanwer Road Agro & Food Processing', 'Pithampur SEZ & Logistics', 'Confectionery & Spices Clusters'],
    powerReliabilityScore: 9.0,
    waterAvailabilityScore: 8.0,
    nearestHighwayKm: 3,
    nearestRailwayStationKm: 5,
    prominentLocalMarkets: ['Choithram APMC Mandi', 'Sanwer Road Industrial Area', 'Laxmibai Nagar Mandi'],
    recommendedRuralEnterprises: ['ent_dal_mill', 'ent_oil_expeller', 'ent_spices_processing', 'ent_corrugated_boxes', 'ent_cattle_feed'],
    districtIndustryCenterAddress: 'District Industries Center, Pologround Industrial Estate, Indore, MP - 452015',
    leadBankName: 'State Bank of India',

    population: {
      value: 3276697,
      source: 'Census of India / MoRD Demographic Projections',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    ruralPopulationPercent: {
      value: 25.9,
      source: 'Census of India / MoRD Rural Statistics',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    agriculturalWorkersPercent: {
      value: 28.5,
      source: 'Directorate of Economics & Statistics, MoA&FW',
      date: '2022-23',
      geographicLevel: 'District-level estimate'
    },
    mandis: [
      {
        name: 'Choithram APMC Mandi (Largest Fruit & Veg Hub in MP)',
        type: 'APMC Principal Market',
        distanceKm: 4,
        majorCommodities: ['Potato', 'Onion', 'Garlic', 'Vegetables'],
        hasElectronicTrading: true
      },
      {
        name: 'Laxmibai Nagar Grain Mandi',
        type: 'APMC Principal Market',
        distanceKm: 6,
        majorCommodities: ['Soybean', 'Wheat', 'Gram / Chana'],
        hasElectronicTrading: true
      },
      {
        name: 'Sanwer APMC Sub-Yard',
        type: 'APMC Sub-Market Yard',
        distanceKm: 26,
        majorCommodities: ['Soybean', 'Chana', 'Corn'],
        hasElectronicTrading: true
      }
    ],
    logistics: {
      nearestHighwayName: 'NH-52 (Jaipur-Jabalpur) & Agra-Bombay Road (NH-3 bypass)',
      highwayDistanceKm: 3,
      nearestRailwayStation: 'Indore Junction (INDB) & Tihi Multi-Modal Logistics Inland Container Depot',
      railwayDistanceKm: 5,
      hasGoodsFreightTerminal: true,
      pmgsyRoadConnectivity: 'All-Weather Bituminous',
      nearestCommercialHub: 'Sanwer Road & Pithampur Industrial Corridor',
      commercialHubDistanceKm: 5
    },
    infrastructure: {
      powerFeederType: 'Dedicated Industrial Feeder',
      averagePowerSupplyHoursPerDay: {
        value: 23.0,
        source: 'MPPKVVCL Distribution Audit',
        date: '2023-24',
        geographicLevel: 'District-level estimate'
      },
      threePhasePowerAvailable: true,
      cgwbGroundwaterCategory: 'Safe',
      waterTableDepthMeters: {
        value: 14.2,
        source: 'Central Ground Water Board (CGWB) Dynamic GW Assessment',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      canalIrrigationCoveragePercent: {
        value: 44.0,
        source: 'Narmada Valley Development Authority',
        date: '2022-23',
        geographicLevel: 'District-level estimate'
      },
      industrialEstateCluster: 'MPIDC Sanwer Road, Pologround & Pithampur Sector 1-3'
    },
    agroClimate: {
      agroClimaticZone: 'Zone X - Central Plateau and Hills (Malwa Region)',
      annualRainfallMm: {
        value: 950,
        source: 'IMD Agromet Advisory',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      climateDescription: 'Temperate plateau climate with rich black cotton soil of high organic fertility.',
      peakSummerTempC: 41.5,
      winterMinTempC: 10.0,
      primarySoilType: 'Deep Black Cotton Basaltic Soil',
      majorSurplusCrops: [
        { crop: 'Soybean', annualSurplusMt: 480000, seasonality: 'October to December' },
        { crop: 'Wheat (Sharbati)', annualSurplusMt: 510000, seasonality: 'March to May' },
        { crop: 'Gram / Chana (Pulses)', annualSurplusMt: 190000, seasonality: 'February to April' }
      ],
      bovinePopulation: {
        value: 490000,
        source: '20th Livestock Census, DAHD',
        date: '2019-20',
        geographicLevel: 'District-level estimate'
      }
    },
    ecosystem: {
      equipmentFabricatorsNearby: ['Pithampur Auto & Agro Fabricators', 'Sanwer Road Dal Mill Machine Manufacturers'],
      packagingMaterialSuppliers: ['Indore Corrugated Box & Flexible Packaging Hub', 'Pithampur Plastic & Laminates'],
      keyBuyersOffTakers: ['Ruchi Soya / Patanjali Foods', 'ITC Choupal Sagar Aggregation Hub', 'Indore Confectionery Cluster'],
      fpoClustersCount: {
        value: 22,
        source: 'NABARD MP & SFAC',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      coldStorageCapacityMt: {
        value: 380000,
        source: 'National Horticulture Board (NHB)',
        date: '2022',
        geographicLevel: 'District-level estimate'
      },
      prominentLocalIndustries: ['Soybean Oil Extraction', 'Dal Milling', 'Confectionery & Namkeen', 'Pharmaceuticals']
    },
    seasonality: {
      peakHarvestMonths: ['March', 'April', 'October', 'November', 'December'],
      leanPeriodMonths: ['June', 'July', 'August'],
      rawMaterialPriceVolatility: 'Moderate'
    },
    coordinates: {
      lat: 22.7196,
      lng: 75.8577
    }
  },
  {
    state: 'Punjab',
    district: 'Ludhiana',
    agroClimaticZone: 'Trans-Gangetic Plains (Central Punjab)',
    keySurplusCrops: ['Wheat', 'Paddy / Basmati Rice', 'Silage / Maize', 'Mustard', 'Dairy Milk Surplus (HF / Jersey)'],
    industrialClusters: ['Agricultural Machinery Fabricators', 'Hosiery & Knitwear', 'Cattle Feed Formulation & Dairy Logistics'],
    powerReliabilityScore: 9.5,
    waterAvailabilityScore: 7.0,
    nearestHighwayKm: 3,
    nearestRailwayStationKm: 5,
    prominentLocalMarkets: ['Ludhiana Dana Mandi (Gill Road)', 'Khanna Grain APMC (Largest in Asia)', 'Jagraon Mandi'],
    recommendedRuralEnterprises: ['ent_dairy_cattle', 'ent_cattle_feed', 'ent_corrugated_boxes', 'ent_solar_cold_storage'],
    districtIndustryCenterAddress: 'District Industries Center, Industrial Area A, Ludhiana, Punjab - 141003',
    leadBankName: 'Punjab National Bank',

    population: {
      value: 3498739,
      source: 'Census of India / MoRD Demographic Projections',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    ruralPopulationPercent: {
      value: 40.8,
      source: 'Census of India / MoRD Rural Statistics',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    agriculturalWorkersPercent: {
      value: 24.6,
      source: 'Directorate of Economics & Statistics, MoA&FW',
      date: '2022-23',
      geographicLevel: 'District-level estimate'
    },
    mandis: [
      {
        name: 'Khanna Grain APMC Mandi (Asia Largest Grain Yard)',
        type: 'APMC Principal Market',
        distanceKm: 42,
        majorCommodities: ['Wheat', 'Paddy', 'Basmati Rice', 'Maize'],
        hasElectronicTrading: true
      },
      {
        name: 'Ludhiana Dana Mandi (Gill Road)',
        type: 'APMC Principal Market',
        distanceKm: 5,
        majorCommodities: ['Wheat', 'Paddy', 'Mustard', 'Feed Grains'],
        hasElectronicTrading: true
      },
      {
        name: 'Jagraon Mandi',
        type: 'APMC Sub-Market Yard',
        distanceKm: 35,
        majorCommodities: ['Paddy', 'Wheat', 'Silage'],
        hasElectronicTrading: true
      }
    ],
    logistics: {
      nearestHighwayName: 'NH-44 (Grand Trunk Road / Delhi-Amritsar) & NH-5',
      highwayDistanceKm: 3,
      nearestRailwayStation: 'Ludhiana Junction (LDH) & Kila Raipur Multi-Modal Logistics Park',
      railwayDistanceKm: 5,
      hasGoodsFreightTerminal: true,
      pmgsyRoadConnectivity: 'All-Weather Bituminous',
      nearestCommercialHub: 'Focal Point Industrial Zone & Dhandari Kalan Freight Park',
      commercialHubDistanceKm: 6
    },
    infrastructure: {
      powerFeederType: 'Dedicated Industrial Feeder',
      averagePowerSupplyHoursPerDay: {
        value: 23.5,
        source: 'PSPCL Distribution Performance Index',
        date: '2023-24',
        geographicLevel: 'District-level estimate'
      },
      threePhasePowerAvailable: true,
      cgwbGroundwaterCategory: 'Over-Exploited',
      waterTableDepthMeters: {
        value: 34.0,
        source: 'Central Ground Water Board (CGWB) Dynamic GW Assessment',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      canalIrrigationCoveragePercent: {
        value: 48.0,
        source: 'Punjab Irrigation Dept',
        date: '2022-23',
        geographicLevel: 'District-level estimate'
      },
      industrialEstateCluster: 'PSIEC Focal Point Phase I-VIII'
    },
    agroClimate: {
      agroClimaticZone: 'Zone VI - Trans-Gangetic Plains',
      annualRainfallMm: {
        value: 680,
        source: 'IMD Agromet Advisory',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      climateDescription: 'Semi-arid continental climate with intensive tubewell & canal irrigation network.',
      peakSummerTempC: 44.0,
      winterMinTempC: 4.0,
      primarySoilType: 'Deep Alluvial Coarse Loam',
      majorSurplusCrops: [
        { crop: 'Wheat', annualSurplusMt: 980000, seasonality: 'April to May' },
        { crop: 'Paddy / Basmati', annualSurplusMt: 890000, seasonality: 'October to November' },
        { crop: 'Silage / Fodder', annualSurplusMt: 640000, seasonality: 'Round the year' }
      ],
      bovinePopulation: {
        value: 680000,
        source: '20th Livestock Census, DAHD (High genetic merit HF/Murrah)',
        date: '2019-20',
        geographicLevel: 'District-level estimate'
      }
    },
    ecosystem: {
      equipmentFabricatorsNearby: ['Ludhiana Agricultural Implement Manufacturers Hub', 'Gill Road Machinery Foundries'],
      packagingMaterialSuppliers: ['Ludhiana Corrugated Board Manufacturers', 'Focal Point Carton Units'],
      keyBuyersOffTakers: ['Verka (Punjab Milk Union)', 'Nestlé Moga Chilling Center', 'Adani Agri Logistics Silo Khanna'],
      fpoClustersCount: {
        value: 15,
        source: 'NABARD Punjab & Dept of Agriculture Punjab',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      coldStorageCapacityMt: {
        value: 290000,
        source: 'National Horticulture Board (NHB)',
        date: '2022',
        geographicLevel: 'District-level estimate'
      },
      prominentLocalIndustries: ['Farm Machinery', 'Textiles & Hosiery', 'Auto Parts', 'Dairy Products']
    },
    seasonality: {
      peakHarvestMonths: ['April', 'May', 'October', 'November'],
      leanPeriodMonths: ['July', 'August'],
      rawMaterialPriceVolatility: 'Low'
    },
    coordinates: {
      lat: 30.9010,
      lng: 75.8573
    }
  },
  {
    state: 'Gujarat',
    district: 'Anand',
    agroClimaticZone: 'Gujarat Plains and Hills (Middle Gujarat)',
    keySurplusCrops: ['Dairy Milk Surplus (Amul Heartland)', 'Banana', 'Tobacco', 'Paddy / Rice', 'Vegetables'],
    industrialClusters: ['Cooperative Dairy & Food Processing', 'Vitthal Udyognagar GIDC', 'Cold Chain Infrastructure'],
    powerReliabilityScore: 9.5,
    waterAvailabilityScore: 8.5,
    nearestHighwayKm: 2,
    nearestRailwayStationKm: 4,
    prominentLocalMarkets: ['Anand APMC Mandi', 'Borsad Agricultural Yard', 'Vitthal Udyognagar Trade Hub'],
    recommendedRuralEnterprises: ['ent_dairy_cattle', 'ent_dairy_chilling', 'ent_cattle_feed', 'ent_solar_cold_storage', 'ent_corrugated_boxes'],
    districtIndustryCenterAddress: 'District Industries Center, Jilla Seva Sadan, Anand, Gujarat - 388001',
    leadBankName: 'Bank of Baroda',

    population: {
      value: 2092745,
      source: 'Census of India / MoRD Demographic Projections',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    ruralPopulationPercent: {
      value: 69.7,
      source: 'Census of India / MoRD Rural Statistics',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    agriculturalWorkersPercent: {
      value: 52.3,
      source: 'Directorate of Economics & Statistics, MoA&FW',
      date: '2022-23',
      geographicLevel: 'District-level estimate'
    },
    mandis: [
      {
        name: 'Anand APMC Mandi',
        type: 'APMC Principal Market',
        distanceKm: 3,
        majorCommodities: ['Paddy', 'Vegetables', 'Banana', 'Tobacco'],
        hasElectronicTrading: true
      },
      {
        name: 'Borsad APMC Market',
        type: 'APMC Sub-Market Yard',
        distanceKm: 18,
        majorCommodities: ['Paddy', 'Wheat', 'Vegetables'],
        hasElectronicTrading: true
      },
      {
        name: 'Khambhat Coastal Trade Yard',
        type: 'APMC Sub-Market Yard',
        distanceKm: 32,
        majorCommodities: ['Salt', 'Fish', 'Grains'],
        hasElectronicTrading: false
      }
    ],
    logistics: {
      nearestHighwayName: 'NE-1 (Ahmedabad-Vadodara Expressway) & NH-48',
      highwayDistanceKm: 2,
      nearestRailwayStation: 'Anand Junction (ANND) on Mumbai-Delhi Main Trunk',
      railwayDistanceKm: 4,
      hasGoodsFreightTerminal: true,
      pmgsyRoadConnectivity: 'All-Weather Bituminous',
      nearestCommercialHub: 'Vitthal Udyognagar GIDC & Anand Town',
      commercialHubDistanceKm: 3
    },
    infrastructure: {
      powerFeederType: 'Dedicated Industrial Feeder',
      averagePowerSupplyHoursPerDay: {
        value: 23.8,
        source: 'MGVCL Gujarat Distribution Benchmark',
        date: '2023-24',
        geographicLevel: 'District-level estimate'
      },
      threePhasePowerAvailable: true,
      cgwbGroundwaterCategory: 'Safe',
      waterTableDepthMeters: {
        value: 15.0,
        source: 'Central Ground Water Board (CGWB) Dynamic GW Assessment',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      canalIrrigationCoveragePercent: {
        value: 56.0,
        source: 'Mahi Canal Project & Sardar Sarovar Grid',
        date: '2022-23',
        geographicLevel: 'District-level estimate'
      },
      industrialEstateCluster: 'GIDC Vitthal Udyognagar & Mogar Food Park'
    },
    agroClimate: {
      agroClimaticZone: 'Zone XIII - Gujarat Plains and Hills',
      annualRainfallMm: {
        value: 860,
        source: 'IMD Agromet Advisory',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      climateDescription: 'Tropical wet-and-dry with fertile Goradu (sandy loam) soils and assured canal irrigation.',
      peakSummerTempC: 42.0,
      winterMinTempC: 11.5,
      primarySoilType: 'Goradu Sandy Loam & Medium Black Soil',
      majorSurplusCrops: [
        { crop: 'Dairy Milk', annualSurplusMt: 780000, seasonality: 'Round the year (Peak Winter flush)' },
        { crop: 'Banana', annualSurplusMt: 260000, seasonality: 'September to March' },
        { crop: 'Paddy', annualSurplusMt: 210000, seasonality: 'October to December' }
      ],
      bovinePopulation: {
        value: 575000,
        source: '20th Livestock Census, DAHD (Amul Kaira Union network)',
        date: '2019-20',
        geographicLevel: 'District-level estimate'
      }
    },
    ecosystem: {
      equipmentFabricatorsNearby: ['Vitthal Udyognagar Dairy Equipment Manufacturers', 'Ahmedabad Food Machinery Cluster (65 km)'],
      packagingMaterialSuppliers: ['Anand Packaging Units', 'Vadodara Paper & Board Mills (45 km)'],
      keyBuyersOffTakers: ['Kaira District Co-operative Milk Producers Union (AMUL)', 'Mother Dairy Fruit & Veg Unit Mogar', 'Vadodara Food Brands'],
      fpoClustersCount: {
        value: 20,
        source: 'NABARD Gujarat & Gujarat State Cooperative Union',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      coldStorageCapacityMt: {
        value: 175000,
        source: 'National Horticulture Board (NHB)',
        date: '2022',
        geographicLevel: 'District-level estimate'
      },
      prominentLocalIndustries: ['Dairy & Milk Products', 'Engineering Fabrication', 'Chemicals', 'Food Processing']
    },
    seasonality: {
      peakHarvestMonths: ['November', 'December', 'January', 'February'],
      leanPeriodMonths: ['May', 'June'],
      rawMaterialPriceVolatility: 'Low'
    },
    coordinates: {
      lat: 22.5645,
      lng: 72.9289
    }
  },
  {
    state: 'Andhra Pradesh',
    district: 'Guntur',
    agroClimaticZone: 'Southern Plateau and Hills (Krishna-Godavari Delta)',
    keySurplusCrops: ['Dry Red Chili (Guntur Sannam)', 'Cotton', 'Turmeric', 'Black Gram (Urad)', 'Paddy'],
    industrialClusters: ['Asia Largest Chili Trading Hub', 'Spices Grinding & Oleoresin Extraction', 'Cotton Ginning & Spinning Clusters'],
    powerReliabilityScore: 9.0,
    waterAvailabilityScore: 8.5,
    nearestHighwayKm: 3,
    nearestRailwayStationKm: 4,
    prominentLocalMarkets: ['Guntur Mirchi Yard (Largest in Asia)', 'Tenali APMC Market', 'Piduguralla Lime & Stone Yard'],
    recommendedRuralEnterprises: ['ent_spices_processing', 'ent_dal_mill', 'ent_corrugated_boxes', 'ent_solar_cold_storage'],
    districtIndustryCenterAddress: 'District Industries Center, Collectorate Compound, Guntur, AP - 522004',
    leadBankName: 'Union Bank of India',

    population: {
      value: 4887813,
      source: 'Census of India / MoRD Demographic Projections',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    ruralPopulationPercent: {
      value: 66.2,
      source: 'Census of India / MoRD Rural Statistics',
      date: '2021',
      geographicLevel: 'District-level estimate'
    },
    agriculturalWorkersPercent: {
      value: 58.7,
      source: 'Directorate of Economics & Statistics, MoA&FW',
      date: '2022-23',
      geographicLevel: 'District-level estimate'
    },
    mandis: [
      {
        name: 'Guntur Mirchi Yard (Asia Largest Red Chili APMC)',
        type: 'APMC Principal Market',
        distanceKm: 3,
        majorCommodities: ['Dry Red Chili', 'Turmeric', 'Coriander', 'Cotton'],
        hasElectronicTrading: true
      },
      {
        name: 'Tenali Grain & Pulse APMC',
        type: 'APMC Principal Market',
        distanceKm: 26,
        majorCommodities: ['Black Gram (Urad)', 'Paddy', 'Green Gram (Moong)'],
        hasElectronicTrading: true
      },
      {
        name: 'Narasaraopet Agro Mandi',
        type: 'APMC Sub-Market Yard',
        distanceKm: 48,
        majorCommodities: ['Cotton', 'Chili', 'Millets'],
        hasElectronicTrading: true
      }
    ],
    logistics: {
      nearestHighwayName: 'NH-16 (Chennai-Kolkata East Coast Corridor) & NH-544D',
      highwayDistanceKm: 3,
      nearestRailwayStation: 'Guntur Junction (GNT) Spices Freight Depot',
      railwayDistanceKm: 4,
      hasGoodsFreightTerminal: true,
      pmgsyRoadConnectivity: 'All-Weather Bituminous',
      nearestCommercialHub: 'Autonagar Industrial Area & Guntur Spices Complex',
      commercialHubDistanceKm: 4
    },
    infrastructure: {
      powerFeederType: 'Dedicated Industrial Feeder',
      averagePowerSupplyHoursPerDay: {
        value: 22.0,
        source: 'APCPDCL District Supply Statistics',
        date: '2023-24',
        geographicLevel: 'District-level estimate'
      },
      threePhasePowerAvailable: true,
      cgwbGroundwaterCategory: 'Safe',
      waterTableDepthMeters: {
        value: 10.5,
        source: 'Central Ground Water Board (CGWB) Dynamic GW Assessment',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      canalIrrigationCoveragePercent: {
        value: 62.0,
        source: 'Nagarjuna Sagar Right Canal System',
        date: '2022-23',
        geographicLevel: 'District-level estimate'
      },
      industrialEstateCluster: 'APIIC Autonagar Guntur & Spices Export Park'
    },
    agroClimate: {
      agroClimaticZone: 'Zone X - Southern Plateau & Krishna Delta',
      annualRainfallMm: {
        value: 890,
        source: 'IMD Agromet Advisory',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      climateDescription: 'Tropical maritime with warm humid conditions, suited for hot pepper & cotton cultivation.',
      peakSummerTempC: 44.5,
      winterMinTempC: 16.0,
      primarySoilType: 'Deep Black Regur Soil & Delta Alluvial Loam',
      majorSurplusCrops: [
        { crop: 'Dry Red Chili (Guntur Sannam)', annualSurplusMt: 490000, seasonality: 'January to April' },
        { crop: 'Cotton', annualSurplusMt: 320000, seasonality: 'October to February' },
        { crop: 'Black Gram / Urad', annualSurplusMt: 165000, seasonality: 'December to March' }
      ],
      bovinePopulation: {
        value: 590000,
        source: '20th Livestock Census, DAHD',
        date: '2019-20',
        geographicLevel: 'District-level estimate'
      }
    },
    ecosystem: {
      equipmentFabricatorsNearby: ['Guntur Spices Pulverizer Fabricators', 'Vijayawada Engineering Hub (35 km)'],
      packagingMaterialSuppliers: ['Guntur Corrugated Box Manufacturers', 'Laminated Pouch Printers Autonagar'],
      keyBuyersOffTakers: ['Spices Board India Registered Exporters', 'Everest & MDH Procurement Agents', 'APEDA Chili Cluster Exporters'],
      fpoClustersCount: {
        value: 24,
        source: 'NABARD AP & SERP Andhra Pradesh',
        date: '2023',
        geographicLevel: 'District-level estimate'
      },
      coldStorageCapacityMt: {
        value: 520000,
        source: 'National Horticulture Board (NHB) - High Density Chili Cold Stores',
        date: '2022',
        geographicLevel: 'District-level estimate'
      },
      prominentLocalIndustries: ['Spices Processing & Export', 'Cotton Ginning', 'Cold Chain Warehousing', 'Tobacco Processing']
    },
    seasonality: {
      peakHarvestMonths: ['January', 'February', 'March', 'April'],
      leanPeriodMonths: ['June', 'July', 'August'],
      rawMaterialPriceVolatility: 'High'
    },
    coordinates: {
      lat: 16.3067,
      lng: 80.4365
    }
  }
];

export const POPULAR_INDIAN_STATES = [
  'Uttar Pradesh',
  'Bihar',
  'Maharashtra',
  'Rajasthan',
  'Madhya Pradesh',
  'Punjab',
  'Gujarat',
  'Andhra Pradesh',
  'Karnataka',
  'Tamil Nadu',
  'West Bengal',
  'Haryana',
  'Odisha',
  'Assam'
];

export const STATE_DISTRICTS_MAP: Record<string, string[]> = {
  'Uttar Pradesh': ['Varanasi', 'Gorakhpur', 'Prayagraj', 'Kanpur Nagar', 'Lucknow', 'Ayodhya', 'Bareilly', 'Mirzapur'],
  'Bihar': ['Muzaffarpur', 'Patna', 'Bhagalpur', 'Gaya', 'Darbhanga', 'Samastipur', 'Begusarai', 'Purnia'],
  'Maharashtra': ['Nashik', 'Pune', 'Nagpur', 'Aurangabad (Chhatrapati Sambhajinagar)', 'Ahmednagar', 'Solapur', 'Kolhapur', 'Jalgaon'],
  'Rajasthan': ['Alwar', 'Jaipur', 'Jodhpur', 'Kota', 'Bharatpur', 'Bikaner', 'Udaipur', 'Sikar'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Hoshangabad (Narmadapuram)'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur', 'Sangrur', 'Moga'],
  'Gujarat': ['Anand', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Mehsana', 'Kheda'],
  'Andhra Pradesh': ['Guntur', 'Krishna (Vijayawada)', 'Visakhapatnam', 'East Godavari', 'Chittoor', 'Kurnool', 'Prakasam'],
  'Karnataka': ['Shivamogga', 'Bengaluru Rural', 'Mysuru', 'Belagavi', 'Tumakuru', 'Davanagere', 'Dharwad', 'Hassan'],
  'Tamil Nadu': ['Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Erode', 'Tirunelveli', 'Thanjavur', 'Dindigul'],
  'West Bengal': ['Hooghly', 'Burdwan (Purba Bardhaman)', 'Nadia', 'Murshidabad', 'North 24 Parganas', 'Malda', 'Bankura'],
  'Haryana': ['Karnal', 'Hisar', 'Ambala', 'Kurukshetra', 'Rohtak', 'Panipat', 'Sirsa', 'Sonipat'],
  'Odisha': ['Sambalpur', 'Cuttack', 'Baleswar', 'Ganjam', 'Khordha', 'Bargarh', 'Angul'],
  'Assam': ['Kamrup Rural', 'Nagaon', 'Sonitpur', 'Dibrugarh', 'Cachar', 'Barpeta', 'Jorhat']
};
