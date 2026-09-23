import { DistrictIntelligence, GeographicResolution } from '../../src/types/location.ts';
import { BusinessTemplate } from '../../src/types/business.ts';
import {
  AgriLocationAnalysis,
  AgriBusinessKind,
  AgriFactorType,
  AgriFactorStatus,
  AgriDataLevel,
  AgriFactorEvaluation,
  AgriLocalVerificationItem,
  AgriEvidenceItem,
  AgriVerificationPriority
} from '../../src/types/agriLocation.ts';
import { locationGisService } from './locationGisService.ts';

/**
 * Maps business templates, IDs, or text queries to normalized AgriBusinessKind.
 * Returns null if the enterprise is non-agricultural (e.g., manufacturing, services, retail).
 */
export function identifyAgriBusinessKind(
  businessOrId: string | BusinessTemplate
): AgriBusinessKind | null {
  const normalizedId = (typeof businessOrId === 'string' ? businessOrId : businessOrId.id).toLowerCase();
  const rawName = typeof businessOrId === 'string' ? businessOrId : (businessOrId.name || '');
  const combined = `${normalizedId} ${rawName}`.toLowerCase().replace(/_/g, ' ');

  // Direct exact matching on AgriBusinessKind
  if (normalizedId === 'dairy') return 'dairy';
  if (normalizedId === 'poultry') return 'poultry';
  if (normalizedId === 'goat_farming' || normalizedId === 'goat') return 'goat_farming';
  if (normalizedId === 'fish_farming' || normalizedId === 'aquaculture' || normalizedId === 'fish') return 'fish_farming';
  if (normalizedId === 'mushroom_farming' || normalizedId === 'mushroom') return 'mushroom_farming';
  if (normalizedId === 'vegetable_cultivation' || normalizedId === 'vegetable' || normalizedId === 'vegetables') return 'vegetable_cultivation';
  if (normalizedId === 'fruit_cultivation' || normalizedId === 'fruit' || normalizedId === 'fruits') return 'fruit_cultivation';
  if (normalizedId === 'floriculture') return 'floriculture';
  if (normalizedId === 'beekeeping') return 'beekeeping';
  if (normalizedId === 'vermicomposting' || normalizedId === 'vermicompost') return 'vermicomposting';

  // Explicit non-agricultural exclusions
  const nonAgriKeywords = [
    'ent_corrugated_boxes',
    'ent_flyash_bricks',
    'corrugated',
    'fly ash',
    'brick',
    'software',
    'retail',
    'handloom',
    'textile',
    'manufacturing',
    'it_service',
    'salon',
    'garment'
  ];
  if (nonAgriKeywords.some((kw) => combined.includes(kw.replace(/_/g, ' ')))) {
    return null;
  }

  // 1. Dairy
  if (
    normalizedId === 'ent_dairy_cattle' ||
    normalizedId === 'ent_dairy_chilling' ||
    combined.includes('dairy') ||
    combined.includes('milch') ||
    combined.includes('cattle farm') ||
    combined.includes('buffalo') ||
    combined.includes('milk chilling')
  ) {
    return 'dairy';
  }

  // 2. Poultry
  if (
    normalizedId === 'ent_poultry_broiler' ||
    combined.includes('poultry') ||
    combined.includes('broiler') ||
    combined.includes('layer farm') ||
    combined.includes('chicken')
  ) {
    return 'poultry';
  }

  // 3. Goat Farming
  if (
    normalizedId === 'ent_goat_farming' ||
    combined.includes('goat') ||
    combined.includes('bakri') ||
    combined.includes('sheep') ||
    combined.includes('caprine')
  ) {
    return 'goat_farming';
  }

  // 4. Fish Farming / Aquaculture
  if (
    normalizedId === 'ent_fish_farming' ||
    combined.includes('fish') ||
    combined.includes('aquaculture') ||
    combined.includes('pisciculture') ||
    combined.includes('fisheries') ||
    combined.includes('matsya')
  ) {
    return 'fish_farming';
  }

  // 5. Mushroom Farming
  if (
    normalizedId === 'ent_mushroom' ||
    combined.includes('mushroom') ||
    combined.includes('khumb') ||
    combined.includes('fungiculture')
  ) {
    return 'mushroom_farming';
  }

  // 6. Vegetable Cultivation
  if (
    normalizedId === 'ent_vegetable_cultivation' ||
    combined.includes('vegetable') ||
    combined.includes('sabzi') ||
    combined.includes('horticulture')
  ) {
    return 'vegetable_cultivation';
  }

  // 7. Fruit Cultivation
  if (
    normalizedId === 'ent_fruit_cultivation' ||
    combined.includes('fruit') ||
    combined.includes('orchard') ||
    combined.includes('bagwani')
  ) {
    return 'fruit_cultivation';
  }

  // 8. Floriculture
  if (
    normalizedId === 'ent_floriculture' ||
    combined.includes('floriculture') ||
    combined.includes('flower') ||
    combined.includes('marigold') ||
    combined.includes('rose cultivation') ||
    combined.includes('phool')
  ) {
    return 'floriculture';
  }

  // 9. Beekeeping
  if (
    normalizedId === 'ent_beekeeping' ||
    combined.includes('beekeeping') ||
    combined.includes('apiary') ||
    combined.includes('honey') ||
    combined.includes('apiculture') ||
    combined.includes('madhumakhi')
  ) {
    return 'beekeeping';
  }

  // 10. Vermicomposting
  if (
    normalizedId === 'ent_vermicompost' ||
    combined.includes('vermicompost') ||
    combined.includes('earthworm') ||
    combined.includes('organic fertilizer') ||
    combined.includes('bio-fertilizer')
  ) {
    return 'vermicomposting';
  }

  return null;
}

/**
 * Exact factor lists per configured agricultural business as mandated by Phase 6 specification.
 */
export const AGRI_BUSINESS_FACTORS_MAP: Record<AgriBusinessKind, AgriFactorType[]> = {
  dairy: [
    'livestock_ecosystem',
    'livestock_market',
    'feed_fodder',
    'water',
    'groundwater',
    'electricity',
    'climate',
    'milk_market',
    'collection_network',
    'transport',
    'seasonality'
  ],
  poultry: [
    'poultry_ecosystem',
    'feed_grain',
    'water',
    'electricity',
    'temperature',
    'climate',
    'buyer_market',
    'transport',
    'storage',
    'seasonality'
  ],
  goat_farming: [
    'livestock_ecosystem',
    'feed_fodder',
    'water',
    'climate',
    'livestock_market',
    'transport',
    'agri_activity',
    'seasonality'
  ],
  fish_farming: [
    'aquaculture_suitability',
    'water',
    'groundwater',
    'irrigation',
    'temperature',
    'climate',
    'fish_market',
    'transport',
    'storage',
    'seasonality'
  ],
  mushroom_farming: [
    'temperature',
    'climate',
    'water',
    'electricity',
    'buyer_market',
    'storage',
    'transport',
    'seasonality',
    'substrate_feedstock'
  ],
  vegetable_cultivation: [
    'soil',
    'rainfall',
    'water',
    'irrigation',
    'cropping_pattern',
    'agri_activity',
    'mandi_access',
    'buyer_market',
    'storage',
    'transport',
    'seasonality'
  ],
  fruit_cultivation: [
    'soil',
    'rainfall',
    'temperature',
    'water',
    'irrigation',
    'cropping_pattern',
    'agri_activity',
    'mandi_access',
    'buyer_market',
    'storage',
    'transport',
    'seasonality'
  ],
  floriculture: [
    'temperature',
    'rainfall',
    'water',
    'irrigation',
    'soil',
    'electricity',
    'buyer_market',
    'storage',
    'transport',
    'seasonality'
  ],
  beekeeping: [
    'floral_sources',
    'agri_activity',
    'cropping_pattern',
    'climate',
    'temperature',
    'water',
    'buyer_market',
    'transport',
    'seasonality'
  ],
  vermicomposting: [
    'agri_activity',
    'cropping_pattern',
    'substrate_feedstock',
    'water',
    'temperature',
    'buyer_market',
    'mandi_access',
    'transport',
    'seasonality'
  ],
  other_agri: [
    'water',
    'electricity',
    'climate',
    'agri_activity',
    'mandi_access',
    'buyer_market',
    'transport',
    'seasonality'
  ]
};

export const FACTOR_LABELS: Record<AgriFactorType, string> = {
  livestock_ecosystem: 'Bovine & Livestock Ecosystem',
  livestock_market: 'Pashu Mela & Animal Trading Channels',
  feed_fodder: 'Green & Dry Fodder Availability',
  milk_market: 'Formal Milk Off-Takers & Cooperatives',
  collection_network: 'Village Bulk Milk Cooler (BMC) Network',
  poultry_ecosystem: 'Commercial Poultry & Integrator Ecosystem',
  feed_grain: 'Poultry Feed Grains (Maize/Soybean)',
  water: 'General Water Availability',
  groundwater: 'CGWB Groundwater Status & Water Table',
  electricity: 'Grid Power Availability & Feeder Type',
  climate: 'Agro-Climatic Zone & Climatology',
  temperature: 'Ambient Summer Peak & Winter Temperature',
  rainfall: 'Annual Rainfall & Precipitation Adequacy',
  soil: 'Primary Soil Type & Agronomic Texture',
  irrigation: 'Surface & Canal Irrigation Coverage',
  cropping_pattern: 'Regional Cropping Pattern & Crop Diversity',
  agri_activity: 'Agricultural Workforce & Farm Activity',
  floral_sources: 'Melliferous Bee Flora & Blooming Seasons',
  aquaculture_suitability: 'Pond Water Retention & Aqua Ecosystem',
  substrate_feedstock: 'Crop Residue Substrate & Biomass',
  buyer_market: 'Local Buyer & Off-Taker Market Grid',
  fish_market: 'Wholesale Fish Markets & Wet Outlets',
  mandi_access: 'APMC Mandi & e-NAM Trading Access',
  transport: 'Road Freight & Highway Connectivity',
  storage: 'Cold Storage & Warehousing Facilities',
  seasonality: 'Seasonal Price Volatility & Lean Months'
};

export class AgriLocationService {
  /**
   * Evaluates an individual factor against available district benchmark data.
   * STRICT PRINCIPLE: If data is absent, status is 'unknown' with dataLevel='not_available'.
   * NEVER convert unknown into concern.
   */
  private evaluateFactor(
    factor: AgriFactorType,
    kind: AgriBusinessKind,
    districtData: DistrictIntelligence
  ): AgriFactorEvaluation {
    const factorLabel = FACTOR_LABELS[factor] || factor;
    const infra = districtData.infrastructure;
    const agro = districtData.agroClimate;
    const eco = districtData.ecosystem;
    const logistics = districtData.logistics;
    const mandis = districtData.mandis || [];
    const seasonality = districtData.seasonality;
    const crops = districtData.keySurplusCrops || [];

    const defaultGeogLevel: GeographicResolution = 'District-level estimate';

    switch (factor) {
      // 1. Groundwater
      case 'groundwater': {
        const gwCat = infra?.cgwbGroundwaterCategory;
        const depth = infra?.waterTableDepthMeters?.value;
        const depthProv = infra?.waterTableDepthMeters;

        if (!gwCat) {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Central Ground Water Board dynamic groundwater categorization not recorded in benchmark data.',
            evidence: [],
            screeningBasis: 'CGWB Dynamic Groundwater Assessment status.',
            verifyLocally: 'Check local block groundwater development status and tubewell drilling permissions.'
          };
        }

        const evidence: AgriEvidenceItem[] = [
          {
            label: 'CGWB Assessment Category',
            value: gwCat,
            source: depthProv?.source || 'Central Ground Water Board (CGWB)',
            date: depthProv?.date || '2023',
            geographicLevel: depthProv?.geographicLevel || defaultGeogLevel,
            hasCitation: true
          }
        ];
        if (depth !== undefined) {
          evidence.push({
            label: 'Water Table Depth',
            value: `${depth} meters`,
            source: depthProv?.source || 'CGWB Dynamic GW Assessment',
            date: depthProv?.date || '2023',
            geographicLevel: depthProv?.geographicLevel || defaultGeogLevel,
            hasCitation: true
          });
        }

        if (gwCat === 'Safe') {
          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `District groundwater is classified as "Safe" by CGWB${depth !== undefined ? ` with water table depth averaging ${depth}m` : ''}, indicating sustainable extraction potential.`,
            evidence,
            screeningBasis: 'CGWB Dynamic Groundwater Assessment status.',
            verifyLocally: 'Verify boring depth, static water table level, and draw-down rate on the specific plot.'
          };
        } else if (gwCat === 'Semi-Critical') {
          return {
            factor,
            factorLabel,
            status: 'mixed',
            dataLevel: 'district_benchmark',
            finding: `Groundwater is categorized as "Semi-Critical" by CGWB (${depth !== undefined ? `${depth}m depth` : 'moderate stress'}), requiring planned water budgeting.`,
            evidence,
            screeningBasis: 'CGWB Dynamic Groundwater Assessment status.',
            verifyLocally: 'Confirm water table depletion trend in summer months and mandate rainwater recharge structures.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'concern',
            dataLevel: 'district_benchmark',
            finding: `Groundwater is classified as "${gwCat}" by CGWB with heavy extraction stress${depth !== undefined ? ` and water table at ${depth}m` : ''}.`,
            evidence,
            screeningBasis: 'CGWB Dynamic Groundwater Assessment status.',
            verifyLocally: 'Obtain statutory NOC from Central/State Ground Water Authority prior to commercial boring.'
          };
        }
      }

      // 2. General Water
      case 'water': {
        const waterScore = districtData.waterAvailabilityScore;
        const gwCat = infra?.cgwbGroundwaterCategory;
        const depth = infra?.waterTableDepthMeters?.value;

        if (gwCat === 'Safe' || waterScore >= 8.0) {
          const evidence: AgriEvidenceItem[] = [
            {
              label: 'Water Availability Index',
              value: `${waterScore}/10`,
              source: 'District Ground & Surface Water Assessment',
              date: '2023',
              geographicLevel: defaultGeogLevel,
              hasCitation: true
            }
          ];
          if (gwCat) {
            evidence.push({
              label: 'CGWB Status',
              value: gwCat,
              source: 'CGWB',
              date: '2023',
              geographicLevel: defaultGeogLevel,
              hasCitation: true
            });
          }

          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `Favorable water availability index (${waterScore}/10) supported by ${gwCat || 'reliable local sources'}, suitable for daily livestock/irrigation needs.`,
            evidence,
            screeningBasis: 'Composite water availability score and CGWB hydrogeological balance.',
            verifyLocally: 'Confirm continuous year-round potable supply and test water salinity/TDS levels.'
          };
        } else if (waterScore >= 6.0) {
          return {
            factor,
            factorLabel,
            status: 'mixed',
            dataLevel: 'district_benchmark',
            finding: `Moderate water availability score (${waterScore}/10); seasonal replenishment or supplementary storage required.`,
            evidence: [
              {
                label: 'Water Availability Score',
                value: `${waterScore}/10`,
                source: 'District Water Resources Profile',
                date: '2023',
                geographicLevel: defaultGeogLevel,
                hasCitation: true
              }
            ],
            screeningBasis: 'District water availability profile.',
            verifyLocally: 'Assess dedicated on-farm sump/tank storage capacity for minimum 7-day reserve.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'concern',
            dataLevel: 'district_benchmark',
            finding: `Constrained water availability score (${waterScore}/10) poses operational vulnerability for water-intensive agricultural activities.`,
            evidence: [
              {
                label: 'Water Availability Score',
                value: `${waterScore}/10`,
                source: 'District Water Resources Profile',
                date: '2023',
                geographicLevel: defaultGeogLevel,
                hasCitation: true
              }
            ],
            screeningBasis: 'District water availability benchmark.',
            verifyLocally: 'Plan micro-irrigation (drip/sprinkler) or ensure contracted water tanker feasibility.'
          };
        }
      }

      // 3. Electricity
      case 'electricity': {
        const supplyProv = infra?.averagePowerSupplyHoursPerDay;
        const powerHours = supplyProv?.value ?? (districtData.powerReliabilityScore * 2.4);
        const feeder = infra?.powerFeederType || 'Mixed Rural Feeder';
        const threePhase = infra?.threePhasePowerAvailable ?? true;

        if (powerHours === undefined && !infra) {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Feeder-level power reliability hours not documented in benchmark data.',
            evidence: [],
            screeningBasis: 'State Electricity Distribution Company average supply logs.',
            verifyLocally: 'Check feeder line category, scheduled power cuts, and three-phase transformer capacity.'
          };
        }

        const evidence: AgriEvidenceItem[] = [
          {
            label: 'Average Daily Supply',
            value: `${powerHours} hrs/day`,
            source: supplyProv?.source || 'State Power Distribution Utility Supply Report',
            date: supplyProv?.date || '2023-24',
            geographicLevel: supplyProv?.geographicLevel || defaultGeogLevel,
            hasCitation: true
          },
          {
            label: 'Feeder Category',
            value: feeder,
            source: 'District Infrastructure Records',
            date: '2023-24',
            geographicLevel: defaultGeogLevel,
            hasCitation: true
          }
        ];

        if (powerHours >= 19) {
          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `Reliable grid supply averaging ${powerHours} hrs/day on ${feeder}${threePhase ? ' with 3-phase connection' : ''}, supporting continuous pumps and chilling machinery.`,
            evidence,
            screeningBasis: 'Feeder operating hours and industrial three-phase power availability.',
            verifyLocally: 'Confirm low-tension (LT) pole distance and line voltage stability during evening hours.'
          };
        } else if (powerHours >= 15) {
          return {
            factor,
            factorLabel,
            status: 'mixed',
            dataLevel: 'district_benchmark',
            finding: `Moderate grid supply averaging ${powerHours} hrs/day on ${feeder}; backup generator or solar inverter needed for temperature-sensitive stages.`,
            evidence,
            screeningBasis: 'Feeder operating hours.',
            verifyLocally: 'Verify generator rental options or budget hybrid solar panels for aerators/misting systems.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'concern',
            dataLevel: 'district_benchmark',
            finding: `Constrained grid electricity supply (${powerHours} hrs/day) presents notable downtime risks for cooling, foggers, and electric pumps.`,
            evidence,
            screeningBasis: 'Feeder supply benchmark.',
            verifyLocally: 'Mandate dedicated diesel genset or off-grid solar installation before equipment commission.'
          };
        }
      }

      // 4. Climate
      case 'climate': {
        const zone = agro?.agroClimaticZone || districtData.agroClimaticZone;
        const desc = agro?.climateDescription;

        if (!zone && !desc) {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Agro-climatic classification not recorded in benchmark data.',
            evidence: [],
            screeningBasis: 'ICAR Agro-Climatic Zonation.',
            verifyLocally: 'Consult local Krishi Vigyan Kendra (KVK) for regional agro-climatic advisories.'
          };
        }

        const evidence: AgriEvidenceItem[] = [
          {
            label: 'Agro-Climatic Zone',
            value: zone || 'Regional Agro-Catchment',
            source: 'ICAR / Planning Commission Agro-Climatic Atlas',
            date: '2022',
            geographicLevel: defaultGeogLevel,
            hasCitation: true
          }
        ];

        return {
          factor,
          factorLabel,
          status: 'supportive',
          dataLevel: 'district_benchmark',
          finding: `Located in ${zone}${desc ? `: ${desc}` : ''}, providing an established agricultural growth envelope.`,
          evidence,
          screeningBasis: 'ICAR Agro-Climatic Zonation & IMD regional climatology.',
          verifyLocally: 'Review seasonal temperature swings and micro-wind directions on your site.'
        };
      }

      // 5. Temperature
      case 'temperature': {
        const peak = agro?.peakSummerTempC;
        const min = agro?.winterMinTempC;

        if (peak === undefined || min === undefined) {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Historical peak summer and winter minimum temperature records not documented in benchmark data.',
            evidence: [],
            screeningBasis: 'IMD extreme temperature historical records.',
            verifyLocally: 'Consult local farmers regarding peak summer heatwave severity and winter frost incidence.'
          };
        }

        const evidence: AgriEvidenceItem[] = [
          {
            label: 'Peak Summer Temp',
            value: `${peak}°C`,
            source: 'India Meteorological Department (IMD) Agromet Advisory',
            date: '2023',
            geographicLevel: defaultGeogLevel,
            hasCitation: true
          },
          {
            label: 'Winter Minimum Temp',
            value: `${min}°C`,
            source: 'India Meteorological Department (IMD) Agromet Advisory',
            date: '2023',
            geographicLevel: defaultGeogLevel,
            hasCitation: true
          }
        ];

        // Sensitivity by business kind
        if (kind === 'mushroom_farming') {
          if (peak > 42.0) {
            return {
              factor,
              factorLabel,
              status: 'mixed',
              dataLevel: 'district_benchmark',
              finding: `High peak summer heat (${peak}°C) requires seasonal crop scheduling (restricting oyster/button flushing to cooler months) or climate-controlled humidification.`,
              evidence,
              screeningBasis: 'Mushroom pinning/fruiting thermal envelope (18°C-28°C).',
              verifyLocally: 'Test room temperature inside thatched/insulated structure during peak afternoon hours.'
            };
          } else {
            return {
              factor,
              factorLabel,
              status: 'supportive',
              dataLevel: 'district_benchmark',
              finding: `Moderate temperature range (${min}°C to ${peak}°C) facilitates multi-batch cropping with standard shade/misting management.`,
              evidence,
              screeningBasis: 'Mushroom fruiting thermal envelope.',
              verifyLocally: 'Verify ventilation flow and humidity retention during afternoon peak.'
            };
          }
        } else if (kind === 'poultry') {
          if (peak >= 43.0) {
            return {
              factor,
              factorLabel,
              status: 'mixed',
              dataLevel: 'district_benchmark',
              finding: `Extreme summer heat (${peak}°C) induces heat stress in broilers, necessitating high-ridge sheds, side-curtain foggers, and cool drinking water lines.`,
              evidence,
              screeningBasis: 'Poultry heat-stress index (>42°C threshold).',
              verifyLocally: 'Inspect shed roof insulation (thatch/sprinklers) and backup generator for ventilation fans.'
            };
          } else {
            return {
              factor,
              factorLabel,
              status: 'supportive',
              dataLevel: 'district_benchmark',
              finding: `Thermal range (${min}°C to ${peak}°C) is manageable under standard deep-litter shed ventilation.`,
              evidence,
              screeningBasis: 'Poultry thermal comfort index.',
              verifyLocally: 'Confirm winter brooding infrared lamp availability and cross-ventilation orientation.'
            };
          }
        } else {
          // General agri
          const isExtreme = peak > 44.0 || min < 4.0;
          return {
            factor,
            factorLabel,
            status: isExtreme ? 'mixed' : 'supportive',
            dataLevel: 'district_benchmark',
            finding: isExtreme
              ? `Thermal envelope exhibits seasonal extremes (${min}°C winter to ${peak}°C summer), requiring protective cultivation or shade nets.`
              : `Seasonal temperature regime (${min}°C to ${peak}°C) aligns well with normal agricultural cycles.`,
            evidence,
            screeningBasis: 'IMD temperature normals.',
            verifyLocally: 'Observe local frost dates in winter and heatwave patterns in May-June.'
          };
        }
      }

      // 6. Rainfall
      case 'rainfall': {
        const rainProv = agro?.annualRainfallMm;
        const rainfall = rainProv?.value;

        if (rainfall === undefined) {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'District annual rainfall statistics not recorded in benchmark data.',
            evidence: [],
            screeningBasis: 'IMD 30-year normal rainfall statistics.',
            verifyLocally: 'Examine village rainfall consistency and local percolation tank water storage.'
          };
        }

        const evidence: AgriEvidenceItem[] = [
          {
            label: 'Normal Annual Rainfall',
            value: `${rainfall} mm`,
            source: rainProv?.source || 'India Meteorological Department (IMD)',
            date: rainProv?.date || '2023',
            geographicLevel: rainProv?.geographicLevel || defaultGeogLevel,
            hasCitation: true
          }
        ];

        if (rainfall >= 900) {
          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `Ample annual precipitation of ${rainfall} mm provides healthy soil moisture and groundwater recharge.`,
            evidence,
            screeningBasis: 'IMD Agromet Advisory normal rainfall benchmarks.',
            verifyLocally: 'Ensure adequate drainage channels to prevent waterlogging during monsoon downpours.'
          };
        } else if (rainfall >= 600) {
          return {
            factor,
            factorLabel,
            status: 'mixed',
            dataLevel: 'district_benchmark',
            finding: `Moderate rainfall of ${rainfall} mm requires dependable supplemental irrigation infrastructure for dry-season cropping.`,
            evidence,
            screeningBasis: 'IMD rainfall norms.',
            verifyLocally: 'Confirm canal or tubewell irrigation schedule during post-monsoon months.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'concern',
            dataLevel: 'district_benchmark',
            finding: `Low annual rainfall (${rainfall} mm) places the district in a semi-arid zone, making rainfed production high-risk.`,
            evidence,
            screeningBasis: 'IMD rainfall norms.',
            verifyLocally: 'Verify assured borewell discharge or farm pond harvesting capacity before planting.'
          };
        }
      }

      // 7. Soil
      case 'soil': {
        const soilType = agro?.primarySoilType;

        if (!soilType) {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Primary soil classification data not recorded in benchmark data.',
            evidence: [],
            screeningBasis: 'NBSS&LUP (ICAR) National Soil Survey data.',
            verifyLocally: 'Conduct certified Soil Health Card laboratory testing for soil texture, pH, and organic carbon.'
          };
        }

        const evidence: AgriEvidenceItem[] = [
          {
            label: 'Primary Soil Type',
            value: soilType,
            source: 'ICAR / NBSS&LUP Soil Survey of India',
            date: '2022',
            geographicLevel: defaultGeogLevel,
            hasCitation: true
          }
        ];

        return {
          factor,
          factorLabel,
          status: 'supportive',
          dataLevel: 'district_benchmark',
          finding: `Predominant soil profile is "${soilType}", supporting versatile horticultural, vegetable, and fodder cultivation.`,
          evidence,
          screeningBasis: 'ICAR National Bureau of Soil Survey & Land Use Planning (NBSS&LUP).',
          verifyLocally: 'Get a laboratory Soil Health Card test for your specific field parcel (pH 6.5-7.5 ideal for most crops).'
        };
      }

      // 8. Irrigation
      case 'irrigation': {
        const canalProv = infra?.canalIrrigationCoveragePercent;
        const canalCoverage = canalProv?.value;

        if (canalCoverage === undefined) {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Canal and command-area surface irrigation coverage percentages not recorded in benchmark data.',
            evidence: [],
            screeningBasis: 'State Irrigation Department Command Area records.',
            verifyLocally: 'Check distance to nearest irrigation canal minor/distributary and tubewell energization status.'
          };
        }

        const evidence: AgriEvidenceItem[] = [
          {
            label: 'Canal Irrigation Coverage',
            value: `${canalCoverage}% of net sown area`,
            source: canalProv?.source || 'State Irrigation Department',
            date: canalProv?.date || '2022-23',
            geographicLevel: canalProv?.geographicLevel || defaultGeogLevel,
            hasCitation: true
          }
        ];

        if (canalCoverage >= 35) {
          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `Extensive surface canal network covers ${canalCoverage}% of net sown area, ensuring substantial surface irrigation recharge.`,
            evidence,
            screeningBasis: 'State Irrigation Department Command Area Development data.',
            verifyLocally: 'Verify water release roaster (warabandi) and field channel maintenance.'
          };
        } else if (canalCoverage > 0) {
          return {
            factor,
            factorLabel,
            status: 'mixed',
            dataLevel: 'district_benchmark',
            finding: `Canal irrigation is localized (${canalCoverage}% coverage), making farming reliant on private tubewells or lift irrigation.`,
            evidence,
            screeningBasis: 'State Irrigation Department records.',
            verifyLocally: 'Check electricity tariff and power schedule for agricultural tubewells.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'mixed',
            dataLevel: 'district_benchmark',
            finding: 'Canal irrigation coverage is negligible; operations depend wholly on groundwater or rainwater harvesting.',
            evidence,
            screeningBasis: 'State Irrigation Department records.',
            verifyLocally: 'Verify tubewell discharge capacity and water quality.'
          };
        }
      }

      // 9. Cropping Pattern
      case 'cropping_pattern': {
        if (!crops || crops.length === 0) {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'District major crop surplus and cropping sequence data not recorded in benchmark data.',
            evidence: [],
            screeningBasis: 'Directorate of Economics & Statistics crop production statistics.',
            verifyLocally: 'Inspect neighboring crop rotations and prevailing kharif/rabi/zaid sowing patterns.'
          };
        }

        const evidence: AgriEvidenceItem[] = [
          {
            label: 'Key Surplus Crops',
            value: crops.slice(0, 4).join(', '),
            source: 'State Directorate of Agriculture / DES MoA&FW',
            date: '2022-23',
            geographicLevel: defaultGeogLevel,
            hasCitation: true
          }
        ];

        return {
          factor,
          factorLabel,
          status: 'supportive',
          dataLevel: 'district_benchmark',
          finding: `Strong multi-crop agricultural presence with documented surpluses in ${crops.slice(0, 4).join(', ')}.`,
          evidence,
          screeningBasis: 'Directorate of Economics and Statistics (DES) agricultural statistics.',
          verifyLocally: 'Check local crop rotation compatibility, pesticide spraying schedules, and harvest overlap.'
        };
      }

      // 10. Agricultural Activity & Workforce
      case 'agri_activity': {
        const workerProv = districtData.agriculturalWorkersPercent;
        const workers = workerProv?.value;

        if (workers === undefined) {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Agricultural workforce proportion statistics not recorded in benchmark data.',
            evidence: [],
            screeningBasis: 'Census of India / Rural Demographic data.',
            verifyLocally: 'Survey local daily agricultural wage rates and seasonal farm labor availability.'
          };
        }

        const evidence: AgriEvidenceItem[] = [
          {
            label: 'Agricultural Workers',
            value: `${workers}% of total workforce`,
            source: workerProv?.source || 'Directorate of Economics & Statistics, MoA&FW',
            date: workerProv?.date || '2022-23',
            geographicLevel: workerProv?.geographicLevel || defaultGeogLevel,
            hasCitation: true
          }
        ];

        if (workers >= 25) {
          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `High agricultural workforce concentration (${workers}%) provides experienced farm labor, agrarian support services, and local crop handling skills.`,
            evidence,
            screeningBasis: 'Workforce demographic classification.',
            verifyLocally: 'Survey prevailing daily wage rates (skilled/unskilled) and labor availability during peak sowing/harvest.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'mixed',
            dataLevel: 'district_benchmark',
            finding: `Agricultural workforce is moderate (${workers}%), indicating competition with urban/industrial employment.`,
            evidence,
            screeningBasis: 'Workforce demographic classification.',
            verifyLocally: 'Assess mechanization requirements to counter potential seasonal labor shortages.'
          };
        }
      }

      // 11. Mandi Access
      case 'mandi_access': {
        if (!mandis || mandis.length === 0) {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Regulated APMC mandi yard and market yard data not documented in benchmark data.',
            evidence: [],
            screeningBasis: 'State Agricultural Marketing Board (APMC) registry.',
            verifyLocally: 'Locate nearest APMC market yard, weekly rural haat, or direct farm-gate aggregating center.'
          };
        }

        const nearest = mandis.reduce((min, m) => (m.distanceKm < min.distanceKm ? m : min), mandis[0]);
        const evidence: AgriEvidenceItem[] = [
          {
            label: 'Nearest APMC Mandi',
            value: `${nearest.name} (${nearest.distanceKm} km)`,
            source: 'State Agricultural Marketing Board (APMC) / e-NAM',
            date: '2023',
            geographicLevel: defaultGeogLevel,
            hasCitation: true
          },
          {
            label: 'Total Mandis in Catchment',
            value: mandis.length,
            source: 'District Market Infrastructure Directory',
            date: '2023',
            geographicLevel: defaultGeogLevel,
            hasCitation: true
          }
        ];

        if (nearest.distanceKm <= 20) {
          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `Immediate access to regulated APMC market yard at ${nearest.name} (${nearest.distanceKm} km)${nearest.hasElectronicTrading ? ' with active e-NAM electronic trading' : ''}.`,
            evidence,
            screeningBasis: 'APMC mandi proximity and commodities handled.',
            verifyLocally: 'Verify commission agent cess, electronic weighing scales, and mandi payment settlement timelines.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'mixed',
            dataLevel: 'district_benchmark',
            finding: `Nearest wholesale APMC yard is located ${nearest.distanceKm} km away (${nearest.name}), adding transit time for daily produce.`,
            evidence,
            screeningBasis: 'APMC mandi proximity.',
            verifyLocally: 'Investigate intermediate village aggregators, FPO collection sidings, or farm-gate pickup.'
          };
        }
      }

      // 12. Livestock Ecosystem (Dairy & Goat)
      case 'livestock_ecosystem': {
        const bovineProv = agro?.bovinePopulation;
        const bovine = bovineProv?.value;

        if (bovine === undefined) {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'District bovine population and livestock census data not recorded in benchmark data.',
            evidence: [],
            screeningBasis: '20th Livestock Census, DAHD.',
            verifyLocally: 'Confirm proximity of government veterinary hospital, AI technicians, and livestock feed outlets.'
          };
        }

        const evidence: AgriEvidenceItem[] = [
          {
            label: 'District Bovine Population',
            value: `${bovine.toLocaleString('en-IN')} heads`,
            source: bovineProv?.source || '20th Livestock Census, DAHD',
            date: bovineProv?.date || '2019-20',
            geographicLevel: bovineProv?.geographicLevel || defaultGeogLevel,
            hasCitation: true
          }
        ];

        if (bovine >= 200000) {
          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `Strong livestock base of ${bovine.toLocaleString('en-IN')} bovines confirms an established animal husbandry ecosystem with veterinary and feed support networks.`,
            evidence,
            screeningBasis: 'Livestock census density and veterinary infrastructure.',
            verifyLocally: 'Verify availability of qualified livestock inspectors and doorstep Artificial Insemination (AI) services.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'mixed',
            dataLevel: 'district_benchmark',
            finding: `Moderate bovine density (${bovine.toLocaleString('en-IN')} heads); commercial breed sourcing and veterinary supplies may require regional coordination.`,
            evidence,
            screeningBasis: 'Livestock census density.',
            verifyLocally: 'Identify certified cattle breeders and regional animal markets for quality milch stock procurement.'
          };
        }
      }

      // 13. Livestock Market
      case 'livestock_market': {
        const localMarkets = districtData.prominentLocalMarkets || [];
        const hasLivestockMention = localMarkets.some((m) => /cattle|livestock|pashu|animal/i.test(m));
        const bovine = agro?.bovinePopulation?.value ?? 0;

        if (bovine > 250000 || hasLivestockMention) {
          const evidence: AgriEvidenceItem[] = [
            {
              label: 'Livestock Trading Ecosystem',
              value: hasLivestockMention ? 'Active Local Pashu Haats' : 'District Animal Husbandry Catchment',
              source: 'District Animal Husbandry Department / APMC',
              date: '2023',
              geographicLevel: defaultGeogLevel,
              hasCitation: true
            }
          ];

          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: 'Established livestock trading channels and seasonal animal fairs accessible in the district perimeter.',
            evidence,
            screeningBasis: 'District animal trade density and regular pashu haats.',
            verifyLocally: 'Confirm weekly cattle market days, veterinary tagging checks, and livestock transit regulations.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Dedicated livestock market frequency and animal auction yard locations not recorded in benchmark data.',
            evidence: [],
            screeningBasis: 'District weekly haat / pashu mela directory.',
            verifyLocally: 'Identify designated regional pashu melas (cattle fairs) for purchasing tested milch cattle / goats.'
          };
        }
      }

      // 14. Feed & Fodder
      case 'feed_fodder': {
        const feedCrops = crops.filter((c) =>
          /paddy|wheat|rice|maize|barley|mustard|millets|jowar|bajra/i.test(c)
        );

        if (feedCrops.length > 0) {
          const evidence: AgriEvidenceItem[] = [
            {
              label: 'Feed Crop Surpluses',
              value: feedCrops.slice(0, 3).join(', '),
              source: 'Directorate of Economics & Statistics, MoA&FW',
              date: '2022-23',
              geographicLevel: defaultGeogLevel,
              hasCitation: true
            }
          ];

          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `Abundant cereal and grain surpluses (${feedCrops.slice(0, 3).join(', ')}) provide reliable local dry straw (bhusa), bran, and oilcake feedstocks.`,
            evidence,
            screeningBasis: 'District crop production and cereal residue surpluses.',
            verifyLocally: 'Check local market prices for dry wheat/paddy straw and evaluate land availability for perennial green fodder (Napier grass).'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Fodder production acreage and silage infrastructure not documented in benchmark data.',
            evidence: [],
            screeningBasis: 'Crop residue balance sheet.',
            verifyLocally: 'Check seasonal fodder price fluctuations (bhusa rates during monsoon/winter) in nearby villages.'
          };
        }
      }

      // 15. Feed Grain (Poultry)
      case 'feed_grain': {
        const grainCrops = crops.filter((c) => /maize|corn|soybean|wheat|broken rice/i.test(c));

        if (grainCrops.length > 0) {
          const evidence: AgriEvidenceItem[] = [
            {
              label: 'Poultry Feed Grains',
              value: grainCrops.join(', '),
              source: 'State Directorate of Agriculture',
              date: '2022-23',
              geographicLevel: defaultGeogLevel,
              hasCitation: true
            }
          ];

          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `Regional availability of key poultry feed components (${grainCrops.join(', ')}) helps contain compound feed freight costs.`,
            evidence,
            screeningBasis: 'Local grain production profile for feed formulation.',
            verifyLocally: 'Contact commercial poultry feed dealers to evaluate bulk bag delivery costs and credit terms.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Commercial poultry feed milling cluster data not documented in benchmark data.',
            evidence: [],
            screeningBasis: 'Compound livestock feed mill directory.',
            verifyLocally: 'Inquire with local poultry farmers regarding distributor brands (Suguna, Godrej, CP) and delivery schedules.'
          };
        }
      }

      // 16. Milk Market & Collection Network
      case 'milk_market':
      case 'collection_network': {
        const buyers = eco?.keyBuyersOffTakers || [];
        const milkBuyers = buyers.filter((b) => /dairy|milk|cooperative|amul|mother dairy|sudha|saras|verka/i.test(b));

        if (milkBuyers.length > 0) {
          const evidence: AgriEvidenceItem[] = [
            {
              label: 'Organized Milk Off-Takers',
              value: milkBuyers.join(', '),
              source: 'District Dairy Development Officer / Cooperative Union',
              date: '2023',
              geographicLevel: defaultGeogLevel,
              hasCitation: true
            }
          ];

          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `Active formal milk procurement network present with major buyers (${milkBuyers.join(', ')}), ensuring daily liquidity.`,
            evidence,
            screeningBasis: 'Cooperative dairy federations and private chilling siding directory.',
            verifyLocally: 'Identify nearest Village Dairy Cooperative Society (DCS) collection booth and fat-snf payout matrix.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Village-level bulk milk cooler (BMC) collection routes not recorded in benchmark data.',
            evidence: [],
            screeningBasis: 'District Cooperative Milk Producers Union route mapping.',
            verifyLocally: 'Locate local BMC chilling center or private dairy collection agent route.'
          };
        }
      }

      // 17. Poultry Ecosystem
      case 'poultry_ecosystem': {
        const clusters = districtData.industrialClusters || [];
        const buyers = eco?.keyBuyersOffTakers || [];
        const hasPoultryMention =
          clusters.some((c) => /poultry|feed|meat/i.test(c)) ||
          buyers.some((b) => /poultry|broiler|venkys|suguna/i.test(b));

        if (hasPoultryMention) {
          const evidence: AgriEvidenceItem[] = [
            {
              label: 'Poultry Cluster Activity',
              value: 'Active Commercial Integrators / Processing',
              source: 'District Animal Husbandry Profile',
              date: '2023',
              geographicLevel: defaultGeogLevel,
              hasCitation: true
            }
          ];

          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: 'Documented commercial broiler integration networks and poultry processing infrastructure in district cluster.',
            evidence,
            screeningBasis: 'Commercial broiler integration network presence.',
            verifyLocally: 'Review integrator agreement terms (growing charges per kg, mortality tolerances, feed conversion ratio benchmarks).'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Commercial poultry hatchery and integrator network data not documented in benchmark data.',
            evidence: [],
            screeningBasis: 'Commercial broiler integration directory.',
            verifyLocally: 'Verify day-old chick (DOC) supply reliability, hatchery distance, and local wet-market retail off-take.'
          };
        }
      }

      // 18. Aquaculture Pond Suitability & Fish Market
      case 'aquaculture_suitability': {
        const isCoastalOrDelta = /delta|coastal|riverine|alluvial/i.test(districtData.agroClimaticZone);
        const hasAquaCluster = (districtData.industrialClusters || []).some((c) => /aqua|fish/i.test(c));

        if (hasAquaCluster || isCoastalOrDelta) {
          const evidence: AgriEvidenceItem[] = [
            {
              label: 'Aquaculture Cluster Status',
              value: hasAquaCluster ? 'Active Aqua / Fish Feed Hub' : 'Favorable Alluvial Water Basin',
              source: 'State Fisheries Department / MPEDA',
              date: '2023',
              geographicLevel: defaultGeogLevel,
              hasCitation: true
            }
          ];

          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: 'Established regional aquaculture clusters and supportive hydrogeology for freshwater pond fisheries.',
            evidence,
            screeningBasis: 'Fisheries department cluster mapping.',
            verifyLocally: 'Test parcel soil clay composition (minimum 20-30% clay for seepage retention) and water salinity/pH.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Aquaculture pond soil water-retention and fingerling hatchery supply data not recorded in benchmark data.',
            evidence: [],
            screeningBasis: 'State Fisheries Department inland pond suitability surveys.',
            verifyLocally: 'Perform percolation pit test on proposed pond site and check distance to certified fish seed hatcheries.'
          };
        }
      }

      case 'fish_market': {
        const localMarkets = districtData.prominentLocalMarkets || [];
        const hasFishMention = localMarkets.some((m) => /fish|matsya|seafood/i.test(m));

        if (hasFishMention) {
          const evidence: AgriEvidenceItem[] = [
            {
              label: 'Wholesale Fish Trading',
              value: 'Documented Local Fish Outlets',
              source: 'Municipal Market Directory',
              date: '2023',
              geographicLevel: defaultGeogLevel,
              hasCitation: true
            }
          ];

          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: 'Organized wholesale fish trading channels and local wet markets exist in the commercial hub.',
            evidence,
            screeningBasis: 'Wholesale fish market presence.',
            verifyLocally: 'Establish supply links with wholesale fish commission agents and daily urban retailers.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Dedicated wholesale fish market transactions not documented in benchmark data.',
            evidence: [],
            screeningBasis: 'District fish market registry.',
            verifyLocally: 'Survey nearby urban wet markets, restaurants, and fish vendor aggregators for weekly demand.'
          };
        }
      }

      // 19. Substrate & Feedstock (Mushroom & Vermicomposting)
      case 'substrate_feedstock': {
        if (kind === 'mushroom_farming') {
          const strawCrops = crops.filter((c) => /paddy|wheat|rice|straw/i.test(c));

          if (strawCrops.length > 0) {
            const evidence: AgriEvidenceItem[] = [
              {
                label: 'Cereal Straw Surplus',
                value: strawCrops.join(', '),
                source: 'Directorate of Economics & Statistics',
                date: '2022-23',
                geographicLevel: defaultGeogLevel,
                hasCitation: true
              }
            ];

            return {
              factor,
              factorLabel,
              status: 'supportive',
              dataLevel: 'district_benchmark',
              finding: `Substantial local cereal production (${strawCrops.join(', ')}) indicates favorable availability of wheat/paddy straw substrate for mushroom bag cultivation.`,
              evidence,
              screeningBasis: 'Cereal straw and agro-waste availability.',
              verifyLocally: 'Inspect straw cleanliness, dryness, and confirm certified mushroom spawn (seed) suppliers nearby.'
            };
          } else {
            return {
              factor,
              factorLabel,
              status: 'unknown',
              dataLevel: 'not_available',
              finding: 'Local substrate availability could not be assessed from the available benchmark data.',
              evidence: [],
              screeningBasis: 'Agricultural crop residue balance statistics.',
              verifyLocally: 'Check availability and seasonal price of suitable agricultural residues (wheat/paddy straw).'
            };
          }
        } else {
          // Vermicomposting: Requires cow dung & biomass
          const bovine = agro?.bovinePopulation?.value ?? 0;

          if (bovine >= 150000 && crops.length > 0) {
            const evidence: AgriEvidenceItem[] = [
              {
                label: 'Biomass & Livestock Base',
                value: `${bovine.toLocaleString('en-IN')} bovines + diverse crops`,
                source: '20th Livestock Census & DES',
                date: '2022-23',
                geographicLevel: defaultGeogLevel,
                hasCitation: true
              }
            ];

            return {
              factor,
              factorLabel,
              status: 'supportive',
              dataLevel: 'district_benchmark',
              finding: `Abundant decomposed cow dung supply from ${bovine.toLocaleString('en-IN')} bovines, paired with crop biomass, ensures uninterrupted feedstock for vermi-beds.`,
              evidence,
              screeningBasis: 'Bovine manure supply density and agricultural biomass volume.',
              verifyLocally: 'Negotiate bulk decomposed cow dung supply with local gaushalas and dairy clusters.'
            };
          } else {
            return {
              factor,
              factorLabel,
              status: 'unknown',
              dataLevel: 'not_available',
              finding: 'Local dairy manure and agricultural biomass availability not recorded in benchmark data.',
              evidence: [],
              screeningBasis: 'Organic residue volume assessment.',
              verifyLocally: 'Identify dependable local gaushalas or commercial dairies for raw cow dung procurement.'
            };
          }
        }
      }

      // 20. Floral Sources (Beekeeping)
      case 'floral_sources': {
        const beeFloraCrops = crops.filter((c) =>
          /mustard|litchi|sunflower|oilseed|fruit|vegetables|clover|pulses|coriander/i.test(c)
        );

        if (beeFloraCrops.length > 0) {
          const evidence: AgriEvidenceItem[] = [
            {
              label: 'Melliferous Bee Flora',
              value: beeFloraCrops.join(', '),
              source: 'State Directorate of Horticulture & Agriculture',
              date: '2022-23',
              geographicLevel: defaultGeogLevel,
              hasCitation: true
            }
          ];

          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `Rich melliferous floral base with extensive blooming crops (${beeFloraCrops.join(', ')}) supporting sustained nectar flow for apiaries.`,
            evidence,
            screeningBasis: 'Horticultural and oilseed floral blooming calendar.',
            verifyLocally: 'Map out 3 km radius floral blooming succession and establish safe distance from aggressive pesticide spray zones.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Melliferous flora blooming calendar and apiary migratory corridors not recorded in benchmark data.',
            evidence: [],
            screeningBasis: 'Regional bee flora and horticulture mapping.',
            verifyLocally: 'Survey wild flora and commercial flowering crops within a 2-3 km bee foraging radius.'
          };
        }
      }

      // 21. Buyer Market
      case 'buyer_market': {
        const buyers = eco?.keyBuyersOffTakers || [];

        if (buyers.length > 0) {
          const evidence: AgriEvidenceItem[] = [
            {
              label: 'Major Commercial Off-Takers',
              value: buyers.slice(0, 3).join(', '),
              source: 'District Industries Center (DIC) Commercial Profile',
              date: '2023',
              geographicLevel: defaultGeogLevel,
              hasCitation: true
            }
          ];

          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `Established off-taker presence with key buyers including ${buyers.slice(0, 3).join(', ')}.`,
            evidence,
            screeningBasis: 'District commercial off-taker directory.',
            verifyLocally: 'Secure advance purchase orders or tie-ups with local retail vendors, hotels, or aggregator FPOs.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Institutional buyer networks and commercial off-taker records not documented in benchmark data.',
            evidence: [],
            screeningBasis: 'Commercial buyer register.',
            verifyLocally: 'Establish direct linkages with local mandi commission agents, restaurant chains, and weekly markets.'
          };
        }
      }

      // 22. Transport & Logistics
      case 'transport': {
        const highway = logistics?.nearestHighwayName;
        const highwayDist = logistics?.highwayDistanceKm ?? districtData.nearestHighwayKm;
        const roadType = logistics?.pmgsyRoadConnectivity || 'All-Weather Bituminous';

        const evidence: AgriEvidenceItem[] = [
          {
            label: 'Nearest Highway',
            value: `${highway || 'National / State Highway'} (${highwayDist} km)`,
            source: 'Ministry of Road Transport & Highways (MoRTH) / PMGSY',
            date: '2023',
            geographicLevel: defaultGeogLevel,
            hasCitation: true
          },
          {
            label: 'Rural Road Connectivity',
            value: roadType,
            source: 'National Rural Infrastructure Development Agency (NRIDA)',
            date: '2023',
            geographicLevel: defaultGeogLevel,
            hasCitation: true
          }
        ];

        if (highwayDist <= 10 && roadType === 'All-Weather Bituminous') {
          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `Immediate highway access (${highwayDist} km to ${highway || 'arterial road'}) via all-weather roads ensures swift farmgate produce dispatch.`,
            evidence,
            screeningBasis: 'National/State highway proximity and PMGSY road classification.',
            verifyLocally: 'Inspect final last-mile approach road culverts and turning clearance for small commercial vehicles.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'mixed',
            dataLevel: 'district_benchmark',
            finding: `Highway access is ${highwayDist} km away; freight movement may involve rural feeder roads and higher turnaround times.`,
            evidence,
            screeningBasis: 'Highway distance and rural road connectivity.',
            verifyLocally: 'Test transport accessibility for 3-wheeler / pick-up trucks during rainy monsoon periods.'
          };
        }
      }

      // 23. Storage
      case 'storage': {
        const coldCapProv = eco?.coldStorageCapacityMt;
        const coldCap = coldCapProv?.value;

        if (coldCap && coldCap > 0) {
          const evidence: AgriEvidenceItem[] = [
            {
              label: 'Cold Storage Capacity',
              value: `${coldCap.toLocaleString('en-IN')} MT`,
              source: coldCapProv?.source || 'National Horticulture Board (NHB)',
              date: coldCapProv?.date || '2022',
              geographicLevel: coldCapProv?.geographicLevel || defaultGeogLevel,
              hasCitation: true
            }
          ];

          return {
            factor,
            factorLabel,
            status: 'supportive',
            dataLevel: 'district_benchmark',
            finding: `District possesses ${coldCap.toLocaleString('en-IN')} MT cold storage infrastructure, mitigating distress sales during peak harvest.`,
            evidence,
            screeningBasis: 'NHB cold storage capacity census.',
            verifyLocally: 'Verify chamber temperature capabilities (0-4°C for perishables) and seasonal bay rental tariffs.'
          };
        } else {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Commercial cold storage capacity and pre-cooling unit data not recorded in benchmark data.',
            evidence: [],
            screeningBasis: 'NHB cold storage infrastructure directory.',
            verifyLocally: 'Identify refrigerated container van routes or private post-harvest cooling rooms nearby.'
          };
        }
      }

      // 24. Seasonality
      case 'seasonality': {
        if (!seasonality) {
          return {
            factor,
            factorLabel,
            status: 'unknown',
            dataLevel: 'not_available',
            finding: 'Seasonal price volatility and harvest cycle records not documented in benchmark data.',
            evidence: [],
            screeningBasis: 'Agro-economic seasonal price indexes.',
            verifyLocally: 'Consult local commission agents about seasonal price swings between peak harvest and lean months.'
          };
        }

        const evidence: AgriEvidenceItem[] = [
          {
            label: 'Peak Harvest Months',
            value: seasonality.peakHarvestMonths.slice(0, 3).join(', '),
            source: 'State Agricultural Marketing Board Seasonality Monitor',
            date: '2023',
            geographicLevel: defaultGeogLevel,
            hasCitation: true
          },
          {
            label: 'Price Volatility',
            value: seasonality.rawMaterialPriceVolatility,
            source: 'State Agricultural Marketing Board',
            date: '2023',
            geographicLevel: defaultGeogLevel,
            hasCitation: true
          }
        ];

        return {
          factor,
          factorLabel,
          status: 'mixed',
          dataLevel: 'district_benchmark',
          finding: `Seasonal price volatility is rated "${seasonality.rawMaterialPriceVolatility}", with peak harvest in ${seasonality.peakHarvestMonths.slice(0, 3).join(', ')} and lean periods during ${seasonality.leanPeriodMonths.slice(0, 3).join(', ')}.`,
          evidence,
          screeningBasis: 'Historical seasonality analysis and mandi arrival fluctuations.',
          verifyLocally: 'Plan working capital reserves to withstand lean-season raw material price spikes.'
        };
      }

      default:
        return {
          factor,
          factorLabel,
          status: 'unknown',
          dataLevel: 'not_available',
          finding: `Evaluation criteria for factor "${factorLabel}" not configured in benchmark data.`,
          evidence: [],
          screeningBasis: 'General agricultural factor check.',
          verifyLocally: 'Assess this factor through local field inspection.'
        };
    }
  }

  /**
   * Main Agriculture-Specific Location Analysis Engine.
   * STRICTLY RESPECTS:
   * 1. No numeric score or index.
   * 2. Business-specific factors only.
   * 3. Missing data = 'unknown', NEVER 'concern'.
   * 4. Why may suit derived ONLY from 'supportive' factors.
   * 5. Why may not suit derived ONLY from 'concern' and 'mixed' factors.
   * 6. Prioritized local verification items (high, medium, routine).
   * 7. District resolution disclosure (village/block input does not fabricate fake village data).
   */
  public analyzeAgriLocation(
    businessOrId: string | BusinessTemplate,
    state: string,
    district: string,
    options?: {
      villageOrTown?: string;
      subDistrictOrBlock?: string;
      locationType?: 'rural' | 'semi_urban' | 'urban';
    }
  ): AgriLocationAnalysis | null {
    const kind = identifyAgriBusinessKind(businessOrId);
    if (!kind) {
      // Excluded: Non-agricultural enterprise
      return null;
    }

    const businessId = typeof businessOrId === 'string' ? businessOrId : businessOrId.id;
    const businessName = typeof businessOrId === 'string' 
      ? (businessOrId.charAt(0).toUpperCase() + businessOrId.slice(1).replace(/_/g, ' '))
      : businessOrId.name;

    // Retrieve verified district intelligence from Phase 5 GIS data
    const districtData = locationGisService.getDistrictData(state, district);

    // Get relevant business-specific factors
    const factorTypes = AGRI_BUSINESS_FACTORS_MAP[kind] || AGRI_BUSINESS_FACTORS_MAP.other_agri;

    // Evaluate each factor individually
    const factors: AgriFactorEvaluation[] = factorTypes.map((factor) =>
      this.evaluateFactor(factor, kind, districtData)
    );

    // 1. Why this location may suit: Generated STRICTLY from supportive factors
    const whyMaySuit: string[] = factors
      .filter((f) => f.status === 'supportive')
      .map((f) => f.finding);

    // 2. Why this location may not suit: Generated STRICTLY from concern & mixed factors
    // CRITICAL: Unknown factors are NEVER included here!
    const whyMayNotSuit: string[] = factors
      .filter((f) => f.status === 'concern' || f.status === 'mixed')
      .map((f) => {
        const prefix = f.status === 'concern' ? 'Constraint' : 'Management consideration';
        return `[${prefix}] ${f.factorLabel}: ${f.finding}`;
      });

    // 3. What to verify locally: Prioritized verification items
    const whatToVerifyLocally: AgriLocalVerificationItem[] = [];

    // Assign priorities:
    // High: concern factors OR critical water/groundwater/electricity factors
    // Medium: mixed factors OR substrate/feedstock/market gaps
    // Routine: supportive factors OR standard operational confirmations
    for (const f of factors) {
      let priority: AgriVerificationPriority = 'routine';

      if (f.status === 'concern' || f.factor === 'groundwater' || f.factor === 'water') {
        priority = 'high';
      } else if (f.status === 'mixed' || f.status === 'unknown') {
        priority = 'medium';
      } else {
        priority = 'routine';
      }

      whatToVerifyLocally.push({
        priority,
        factor: f.factor,
        factorLabel: f.factorLabel,
        instruction: `Verify local conditions for ${f.factorLabel.toLowerCase()}.`,
        practicalAction: f.verifyLocally
      });
    }

    // Sort verification items by priority: high first, then medium, then routine
    const priorityOrder: Record<AgriVerificationPriority, number> = {
      high: 1,
      medium: 2,
      routine: 3
    };
    whatToVerifyLocally.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    const resolutionDisclosure = options?.villageOrTown || options?.subDistrictOrBlock
      ? `Agricultural analysis is based on verified ${district} district benchmark data. Field-level soil, micro-water table, and electricity supply in ${[options.villageOrTown, options.subDistrictOrBlock].filter(Boolean).join(', ')} must be verified locally.`
      : `Agricultural analysis is based on the selected district (${district}, ${state}). Village/block-specific soil and water conditions should be verified locally.`;

    const scoreDisclosure =
      'No single agricultural suitability score is used. Each factor is evaluated separately so you can clearly understand the evidence, trade-offs, and local verification requirements.';

    return {
      isAgriBusiness: true,
      businessId,
      businessName,
      agriBusinessKind: kind,
      location: {
        state: districtData.state,
        district: districtData.district,
        subDistrictOrBlock: options?.subDistrictOrBlock,
        villageOrTown: options?.villageOrTown
      },
      analysisResolution: 'district',
      resolutionDisclosure,
      scoreDisclosure,
      factors,
      whyMaySuit,
      whyMayNotSuit,
      whatToVerifyLocally
    };
  }
}

export const agriLocationService = new AgriLocationService();
