import type { GovernmentScheme } from '../types/schemes.ts';

export const GOVERNMENT_SCHEMES: GovernmentScheme[] = [
  {
    id: 'scheme_pmegp',
    code: 'PMEGP',
    name: 'Prime Minister’s Employment Generation Programme',
    ministry: 'Ministry of MSME, Govt. of India',
    schemeLevel: 'central',
    maxProjectCost: 5000000, // 50 Lakhs for Manufacturing, 20 Lakhs for Service
    maxSubsidyAmount: 1750000, // Up to 35% in rural special category
    subsidyPercentGeneralRural: 25,
    subsidyPercentGeneralUrban: 15,
    subsidyPercentSpecialRural: 35,
    subsidyPercentSpecialUrban: 25,
    beneficiaryContributionPercentGeneral: 10,
    beneficiaryContributionPercentSpecial: 5,
    eligibleActivities: [
      'Agro & Food Processing',
      'Forest Based Products',
      'Handmade Paper & Fibre',
      'Mineral & Chemical Products',
      'Rural Engineering & Tech',
      'Service Sector Enterprises'
    ],
    ineligibleActivities: [
      'Meat & Slaughter houses',
      'Tobacco and intoxicant production',
      'Polythene bags below 50 microns',
      'Rural transport vehicles over 30 seats'
    ],
    keyEligibilityCriteria: [
      'Age 18 years and above',
      'Minimum 8th pass for projects over ₹10 Lakhs (Mfg) or ₹5 Lakhs (Service)',
      'Only one person per family eligible',
      'New projects only (no expansion of existing units)'
    ],
    portalUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
    nodalAgency: 'Khadi and Village Industries Commission (KVIC) & DIC',
    description: 'A flagship credit-linked subsidy programme aimed at generating self-employment opportunities through establishment of micro-enterprises in non-farm sector.'
  },
  {
    id: 'scheme_pmfme',
    code: 'PMFME',
    name: 'PM Formalisation of Micro Food Processing Enterprises Scheme',
    ministry: 'Ministry of Food Processing Industries (MoFPI)',
    schemeLevel: 'central',
    maxProjectCost: 3000000,
    maxSubsidyAmount: 1000000, // 35% credit-linked capital subsidy capped at ₹10 Lakhs
    subsidyPercentGeneralRural: 35,
    subsidyPercentGeneralUrban: 35,
    subsidyPercentSpecialRural: 35,
    subsidyPercentSpecialUrban: 35,
    beneficiaryContributionPercentGeneral: 10,
    beneficiaryContributionPercentSpecial: 10,
    eligibleActivities: [
      'Food Grain Processing (Dal, Flour, Poha)',
      'Oil Extraction & Processing',
      'Fruit & Vegetable Preservation (Jams, Pickles, Puree)',
      'Dairy & Bakery products',
      'Spices & Condiments Grinding',
      'One District One Product (ODOP) prioritized processing'
    ],
    ineligibleActivities: [
      'Non-food manufacturing',
      'Alcohol and aerated soft drinks'
    ],
    keyEligibilityCriteria: [
      'Existing or new micro food processing enterprises',
      'Individual entrepreneurs, SHGs, FPOs, and Producer Cooperatives',
      'Capital subsidy of 35% of eligible project cost with a ceiling of ₹10 lakh'
    ],
    portalUrl: 'https://pmfme.mofpi.gov.in/',
    nodalAgency: 'National Institute of Food Technology Entrepreneurship and Management (NIFTEM)',
    description: 'Provides financial, technical, and business support for the upgradation and establishment of micro food processing enterprises across India.'
  },
  {
    id: 'scheme_mudra',
    code: 'MUDRA',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    ministry: 'Department of Financial Services, Ministry of Finance',
    schemeLevel: 'central',
    maxProjectCost: 2000000, // Shishu (up to ₹50k), Kishore (₹50k-₹5L), Tarun (₹5L-₹10L), Tarun Plus (₹10L-₹20L)
    maxSubsidyAmount: 0, // No direct capital subsidy; offers collateral-free credit with guarantee coverage
    subsidyPercentGeneralRural: 0,
    subsidyPercentGeneralUrban: 0,
    subsidyPercentSpecialRural: 0,
    subsidyPercentSpecialUrban: 0,
    beneficiaryContributionPercentGeneral: 15,
    beneficiaryContributionPercentSpecial: 10,
    eligibleActivities: [
      'Small manufacturing enterprises',
      'Shopkeepers, fruits & vegetable vendors',
      'Artisans and handicraft units',
      'Transport vehicles for commercial use',
      'Allied agricultural activities (Poultry, Dairy, Fishery, Beekeeping)'
    ],
    ineligibleActivities: [
      'Pure crop cultivation (covered under regular KCC)'
    ],
    keyEligibilityCriteria: [
      'Any Indian citizen with non-farm income-generating business plan',
      'No collateral requirement',
      'Credit guarantee under CGFMU'
    ],
    portalUrl: 'https://www.mudra.org.in/',
    nodalAgency: 'Micro Units Development & Refinance Agency Ltd.',
    description: 'Enables micro enterprises to access collateral-free institutional credit up to ₹20 Lakhs across Shishu, Kishore, and Tarun tiers.'
  },
  {
    id: 'scheme_standup',
    code: 'STANDUP_INDIA',
    name: 'Stand-Up India Scheme',
    ministry: 'Department of Financial Services, Ministry of Finance',
    schemeLevel: 'central',
    maxProjectCost: 10000000, // ₹10 Lakhs to ₹1 Crore
    maxSubsidyAmount: 0, // Composite loan with margin money support
    subsidyPercentGeneralRural: 0,
    subsidyPercentGeneralUrban: 0,
    subsidyPercentSpecialRural: 0,
    subsidyPercentSpecialUrban: 0,
    beneficiaryContributionPercentGeneral: 15,
    beneficiaryContributionPercentSpecial: 15,
    eligibleActivities: [
      'Greenfield manufacturing units',
      'Services sector enterprises',
      'Trading sector',
      'Allied agricultural activities'
    ],
    ineligibleActivities: [
      'Brownfield / existing expansion units'
    ],
    keyEligibilityCriteria: [
      'SC / ST and/or Women entrepreneurs',
      'Greenfield enterprise only',
      'In non-individual enterprises, 51% shareholding & controlling stake must be held by SC/ST and/or Women'
    ],
    portalUrl: 'https://www.standupmitra.in/',
    nodalAgency: 'SIDBI',
    description: 'Facilitates bank loans between ₹10 lakh and ₹1 crore to at least one SC or ST borrower and at least one woman borrower per bank branch.'
  },
  {
    id: 'scheme_aif',
    code: 'AIF',
    name: 'Agriculture Infrastructure Fund',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    schemeLevel: 'central',
    maxProjectCost: 20000000,
    maxSubsidyAmount: 3000000, // 3% p.a. interest subvention up to ₹2 Crore for 7 years
    subsidyPercentGeneralRural: 15,
    subsidyPercentGeneralUrban: 10,
    subsidyPercentSpecialRural: 20,
    subsidyPercentSpecialUrban: 15,
    beneficiaryContributionPercentGeneral: 10,
    beneficiaryContributionPercentSpecial: 10,
    eligibleActivities: [
      'Cold stores and cold chains',
      'Warehouses and silos',
      'Assaying and sorting/grading units',
      'Primary processing centers',
      'Ripening chambers',
      'Farm aggregation infrastructure'
    ],
    ineligibleActivities: [
      'Non-agricultural commercial activities'
    ],
    keyEligibilityCriteria: [
      'Agri-entrepreneurs, Startups, FPOs, PACS, SHGs',
      'Interest subvention of 3% per annum up to limit of ₹2 Crore',
      'CGTMSE fee coverage paid by Government'
    ],
    portalUrl: 'https://agriinfra.dac.gov.in/',
    nodalAgency: 'National Bank for Agriculture and Rural Development (NABARD)',
    description: 'Medium-long term debt financing facility for investment in viable projects for post-harvest management infrastructure and community farming assets.'
  }
];
