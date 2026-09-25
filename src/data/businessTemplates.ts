import type { BusinessTemplate } from '../types/business.ts';

export const BUSINESS_TEMPLATES: BusinessTemplate[] = [
  // 1. Vermicompost & Bio-Enriched Organic Fertilizer Unit (Project Cost ~₹48,000)
  {
    id: 'ent_vermicompost',
    name: 'Vermicompost & Bio-Enriched Organic Fertilizer Unit',
    category: 'agro_processing',
    tagline: 'High-grade earthworm casting fertilizer converting cow dung and farm biomass',
    description: 'Low-capex organic fertilizer unit utilizing Australian red wigglers (Eisenia fetida) and local dairy manure to produce odorless vermicompost for nurseries and organic farms.',
    minimumViableScale: '3 HDPE vermi-beds (12x4x2 ft)',
    defaultScale: '5 HDPE commercial beds',
    unit: 'kg / month',
    fixedAssets: {
      equipmentCost: 18000,
      infrastructureCost: 15000,
      preOperativeCost: 3000,
      totalFixedAssets: 36000
    },
    equipment: [
      { name: 'HDPE Vermi-Beds (UV-stabilized)', spec: '12 x 4 x 2 ft with aerators & drainage', approxCost: 9000 },
      { name: 'Earthworm Breeding Colony (Eisenia fetida)', spec: '30 kg seed worm stock', approxCost: 6000 },
      { name: 'Shredding & Sifting Wire Mesh Vibrator', spec: '2mm rotary sieve manual assembly', approxCost: 3000 }
    ],
    infrastructure: {
      spaceRequiredSqFt: 300,
      shedType: 'Green shade net 75% shading on bamboo/iron pole frame',
      powerHpRequired: 0.5,
      waterRequirement: 'Daily misting (approx 80L/day)'
    },
    workingCapital: {
      cycleMonths: 1.5,
      rawMaterialReserve: 8000,
      cashContingency: 4000,
      totalWorkingCapital: 12000
    },
    operatingCosts: {
      rawMaterialsMonthly: 4500, // Cow dung, crop residue, neem cake
      laborAndWagesMonthly: 3500,
      utilitiesAndPowerMonthly: 400,
      repairAndMaintenanceMonthly: 300,
      freightAndLogisticsMonthly: 800,
      totalMonthlyOpex: 9500
    },
    expectedOutputMonthly: 2500, // kg of dried, sifted vermicompost
    priceAssumptions: {
      unitSellingPrice: 8, // ₹8/kg wholesale bag or ₹12/kg retail pack
      unitRawMaterialCost: 1.8
    },
    revenueAssumptions: {
      expectedMonthlyRevenue: 20000,
      capacityUtilizationPercent: 85,
      assumedMarginBasis: 'Wholesale farmgate supply & horticultural retail packs'
    },
    gestationPeriodMonths: 2,
    typicalRiskLevel: 'low',
    keyRawMaterials: ['Decomposed Cow Dung', 'Agricultural Stubble / Bio-waste', 'Eisenia Fetida Worms', 'Printed 25kg HDPE Bags'],
    eligibleSchemes: ['PMEGP', 'MUDRA', 'PKVY (Paramparagat Krishi Vikas Yojana)']
  },

  // 2. Oyster & Button Mushroom Bagging & Fresh Harvest (Project Cost ~₹85,000)
  {
    id: 'ent_mushroom',
    name: 'Oyster Mushroom Bagging & Fresh Harvest Unit',
    category: 'agro_processing',
    tagline: 'Vertical indoor climate-controlled cultivation of high-protein oyster mushrooms',
    description: 'Vertical indoor mushroom cropping using pasteurized wheat/paddy straw and grain spawn. Produces high-value fresh culinary mushrooms and sun-dried powder.',
    minimumViableScale: '300 poly-bags cycle',
    defaultScale: '600 hanging crop bags',
    unit: 'kg / month',
    fixedAssets: {
      equipmentCost: 32000,
      infrastructureCost: 28000,
      preOperativeCost: 5000,
      totalFixedAssets: 65000
    },
    equipment: [
      { name: 'Straw Steaming & Chemical Pasteurization Vat', spec: '200L stainless steel boiler vessel', approxCost: 12000 },
      { name: 'High-Pressure Fogger / Humidifier System', spec: '4-nozzle 85% RH indoor mister', approxCost: 8000 },
      { name: 'Vertical Bamboo/GI Cropping Racks', spec: '5-tier hanging rope and shelf setup', approxCost: 8000 },
      { name: 'Digital Weighing & Heat Sealer', spec: '300mm impulse sealer + 0.1g scale', approxCost: 4000 }
    ],
    infrastructure: {
      spaceRequiredSqFt: 350,
      shedType: 'Darkened thatched/insulated brick room with mesh ventilation',
      powerHpRequired: 1,
      waterRequirement: 'Clean potable misting water (150L/day)'
    },
    workingCapital: {
      cycleMonths: 1.5,
      rawMaterialReserve: 13000,
      cashContingency: 7000,
      totalWorkingCapital: 20000
    },
    operatingCosts: {
      rawMaterialsMonthly: 7200, // Straw, spawn bottles, PP bags, formalin
      laborAndWagesMonthly: 5000,
      utilitiesAndPowerMonthly: 800,
      repairAndMaintenanceMonthly: 500,
      freightAndLogisticsMonthly: 1200,
      totalMonthlyOpex: 14700
    },
    expectedOutputMonthly: 320, // kg fresh mushroom
    priceAssumptions: {
      unitSellingPrice: 110, // ₹110/kg wholesale to vegetable vendors & hotels
      unitRawMaterialCost: 22.5
    },
    revenueAssumptions: {
      expectedMonthlyRevenue: 35200,
      capacityUtilizationPercent: 80,
      assumedMarginBasis: 'Direct daily delivery to city restaurants, weekly mandis & supermarkets'
    },
    gestationPeriodMonths: 2,
    typicalRiskLevel: 'low',
    keyRawMaterials: ['Wheat / Paddy Straw', 'Certified Grain Spawn (Pleurotus)', 'Bavistin / Formalin', 'Perforated PP Grow Bags'],
    eligibleSchemes: ['PMEGP', 'MUDRA', 'NHM (National Horticulture Mission)']
  },

  // 3. Scientific Apiary & Raw Honey Extraction (Project Cost ~₹1,25,000)
  {
    id: 'ent_beekeeping',
    name: 'Scientific Apiary & Raw Filtered Honey Extraction',
    category: 'agro_processing',
    tagline: 'Multi-flora bee colonies for raw honey, beeswax and agricultural crop pollination',
    description: 'Commercial 25-box apiary stationed around mustard, litchi, or sunflower orchards producing unpasteurized pure floral honey and natural beeswax blocks.',
    minimumViableScale: '15 Langstroth beehives',
    defaultScale: '25 ten-frame Langstroth bee boxes with Apis mellifera colonies',
    unit: 'kg / season',
    fixedAssets: {
      equipmentCost: 75000,
      infrastructureCost: 15000,
      preOperativeCost: 8000,
      totalFixedAssets: 98000
    },
    equipment: [
      { name: 'Langstroth Bee Hives with Supers', spec: '25 wooden boxes with wax foundation sheets', approxCost: 52000 },
      { name: 'Centrifugal Honey Extractor (SS 304)', spec: '4-frame manual rotary stainless steel drum', approxCost: 11000 },
      { name: 'Beekeeping Protective Kit & Smokers', spec: 'Bee veils, leather gloves, hive tools, smokers', approxCost: 7000 },
      { name: 'Stainless Steel Double Sieve & Settling Tank', spec: '60 kg capacity honey settling drum', approxCost: 5000 }
    ],
    infrastructure: {
      spaceRequiredSqFt: 400,
      shedType: 'Open orchard/farm field with small 80 sq.ft tool and bottling shed',
      powerHpRequired: 0,
      waterRequirement: 'Minimal (shallow bee drinking water trays)'
    },
    workingCapital: {
      cycleMonths: 2,
      rawMaterialReserve: 17000,
      cashContingency: 10000,
      totalWorkingCapital: 27000
    },
    operatingCosts: {
      rawMaterialsMonthly: 4000, // Sugar syrup (monsoon feed), comb sheets, glass bottles
      laborAndWagesMonthly: 4500,
      utilitiesAndPowerMonthly: 300,
      repairAndMaintenanceMonthly: 600,
      freightAndLogisticsMonthly: 1600, // Hive migration transport
      totalMonthlyOpex: 11000
    },
    expectedOutputMonthly: 125, // kg averaged monthly equivalent
    priceAssumptions: {
      unitSellingPrice: 280, // ₹280/kg wholesale raw honey; up to ₹450 retail
      unitRawMaterialCost: 32
    },
    revenueAssumptions: {
      expectedMonthlyRevenue: 35000,
      capacityUtilizationPercent: 85,
      assumedMarginBasis: 'Premium unheated raw honey sold in 500g glass jars'
    },
    gestationPeriodMonths: 3,
    typicalRiskLevel: 'low',
    keyRawMaterials: ['Apis Mellifera Bee Colonies', 'Comb Foundation Wax Sheets', 'Glass Bottling Jars', 'Tamper Evident Seals'],
    eligibleSchemes: ['PMEGP', 'KVIC Honey Mission', 'MUDRA']
  },

  // 4. Controlled Broiler Poultry Shed (Project Cost ~₹1,95,000)
  {
    id: 'ent_poultry_broiler',
    name: 'Controlled Deep-Litter Broiler Poultry Farm (500 Birds)',
    category: 'dairy_livestock',
    tagline: 'Fast-cycle broiler meat rearing with automated bell drinkers and thermal curtains',
    description: 'High-turnover 40-day batch broiler rearing unit under contract farming or independent mandi supply with sanitary litter management.',
    minimumViableScale: '300 birds per batch',
    defaultScale: '500 birds per 42-day cycle',
    unit: 'birds / cycle',
    fixedAssets: {
      equipmentCost: 48000,
      infrastructureCost: 95000,
      preOperativeCost: 7000,
      totalFixedAssets: 150000
    },
    equipment: [
      { name: 'Automatic Bell Drinkers & Feeder Hoppers', spec: '15 bell drinkers + 20 cylinder feeders', approxCost: 18000 },
      { name: 'Gas / Electric Brooders & Infrared Lamps', spec: '3 heating units with temperature sensors', approxCost: 12000 },
      { name: 'Curtain Winching & Fogger Line', spec: 'HDPE side curtains + misting line for heat stress', approxCost: 11000 },
      { name: 'Litter Rake, Disinfection Spray & Scale', spec: 'Backpack sprayer + 100kg hanging scale', approxCost: 7000 }
    ],
    infrastructure: {
      spaceRequiredSqFt: 600,
      shedType: 'Deep-litter semi-open shed with wire-mesh sides and asbestos/tin roof',
      powerHpRequired: 1.5,
      waterRequirement: 'Borewell continuous supply (approx 200L/day)'
    },
    workingCapital: {
      cycleMonths: 1.5,
      rawMaterialReserve: 32000,
      cashContingency: 13000,
      totalWorkingCapital: 45000
    },
    operatingCosts: {
      rawMaterialsMonthly: 24000, // DOC (Day Old Chicks), commercial mash/pellet feed, vaccines
      laborAndWagesMonthly: 6000,
      utilitiesAndPowerMonthly: 1200,
      repairAndMaintenanceMonthly: 800,
      freightAndLogisticsMonthly: 2000,
      totalMonthlyOpex: 34000
    },
    expectedOutputMonthly: 380, // finished broilers (~2.0 - 2.2 kg live weight)
    priceAssumptions: {
      unitSellingPrice: 125, // ₹125/kg live farmgate rate (approx ₹250 per bird)
      unitRawMaterialCost: 63
    },
    revenueAssumptions: {
      expectedMonthlyRevenue: 47500,
      capacityUtilizationPercent: 90,
      assumedMarginBasis: 'Direct wholesale off-take by live-bird poultry traders'
    },
    gestationPeriodMonths: 2,
    typicalRiskLevel: 'moderate',
    keyRawMaterials: ['Day-Old Chicks (Cobb 400 / Ross 308)', 'Pre-starter & Finisher Feed', 'Vaccines (Ranikhet & Gumboro)', 'Rice Husk Litter'],
    eligibleSchemes: ['PMEGP', 'MUDRA', 'National Livestock Mission (NLM)']
  },

  // 5. Automatic Spice Pulverizing & Pouch Packaging (Project Cost ~₹3,20,000)
  {
    id: 'ent_spices_processing',
    name: 'Automatic Spice Pulverizing & Nitrogen Packaging',
    category: 'agro_processing',
    tagline: 'Clean-room pulverizing and moisture-proof packaging of turmeric, chili, & coriander',
    description: 'High-margin micro food enterprise processing locally harvested raw spices into branded, adulteration-free retail packs and catering bulk supply.',
    minimumViableScale: '80 kg / day',
    defaultScale: '200 kg / day',
    unit: 'kg / month',
    fixedAssets: {
      equipmentCost: 145000,
      infrastructureCost: 85000,
      preOperativeCost: 15000,
      totalFixedAssets: 245000
    },
    equipment: [
      { name: 'Hammer & Micro Pulverizer Machine', spec: '5 HP stainless steel cyclone dust collector', approxCost: 78000 },
      { name: 'Band Sealer & Pneumatic Pouch Packer', spec: 'Nitrogen-flushing continuous band sealer', approxCost: 38000 },
      { name: 'Vibrating Sieve Classifier (Grader)', spec: '3-deck mesh separator with rotary motor', approxCost: 19000 },
      { name: 'Digital Moisture Meter & Precision Scale', spec: 'Halogen moisture analyzer + 30kg bench scale', approxCost: 10000 }
    ],
    infrastructure: {
      spaceRequiredSqFt: 500,
      shedType: 'Dust-free concrete floor room with epoxy wall coating and exhaust',
      powerHpRequired: 7.5,
      waterRequirement: 'Equipment washing only (100L/day)'
    },
    workingCapital: {
      cycleMonths: 1.5,
      rawMaterialReserve: 55000,
      cashContingency: 20000,
      totalWorkingCapital: 75000
    },
    operatingCosts: {
      rawMaterialsMonthly: 48000, // Raw turmeric fingers, dried chili, coriander, laminated pouches
      laborAndWagesMonthly: 12000,
      utilitiesAndPowerMonthly: 3500,
      repairAndMaintenanceMonthly: 1500,
      freightAndLogisticsMonthly: 4000,
      totalMonthlyOpex: 69000
    },
    expectedOutputMonthly: 1800, // kg processed packaged spices
    priceAssumptions: {
      unitSellingPrice: 58, // Average blended price ₹290/kg (unit pack 200g @ ₹58)
      unitRawMaterialCost: 26.5
    },
    revenueAssumptions: {
      expectedMonthlyRevenue: 98000,
      capacityUtilizationPercent: 75,
      assumedMarginBasis: 'Packaged consumer retail packs (100g, 200g, 500g) sold to kirana stores'
    },
    gestationPeriodMonths: 3,
    typicalRiskLevel: 'low',
    keyRawMaterials: ['Dry Whole Red Chili', 'Raw Turmeric Fingers', 'Coriander Seeds', 'Cumin Seeds', 'Multi-layer Printed Pouches'],
    eligibleSchemes: ['PMEGP', 'PMFME', 'MUDRA']
  },

  // 6. Micro Animal Nutrition Pellet & Fodder Block Unit (Project Cost ~₹3,90,000)
  {
    id: 'ent_cattle_feed',
    name: 'Micro Cattle Feed Pelletizing & Fodder Block Unit',
    category: 'agro_processing',
    tagline: 'Balanced animal nutrition pellets using agricultural bran, cakes and molasses',
    description: 'Manufactures high-protein cattle and goat feed pellets using agricultural byproducts, wheat bran, and mineral mixes for local dairy farmers.',
    minimumViableScale: '150 kg / hour',
    defaultScale: '300 kg / hour',
    unit: 'quintals / month',
    fixedAssets: {
      equipmentCost: 195000,
      infrastructureCost: 95000,
      preOperativeCost: 15000,
      totalFixedAssets: 305000
    },
    equipment: [
      { name: 'Flat Die Cattle Feed Pellet Mill', spec: '10 HP motor with 6mm / 8mm die plates', approxCost: 110000 },
      { name: 'Ribbon Batch Mixer with Molasses Inlet', spec: '300 kg batch stainless steel mixer', approxCost: 55000 },
      { name: 'Crusher / Grinder with Cyclone', spec: '5 HP hammer mill for coarse grain sizing', approxCost: 30000 }
    ],
    infrastructure: {
      spaceRequiredSqFt: 700,
      shedType: 'Ventilated tin shed with dry storage area for raw ingredients and finished bags',
      powerHpRequired: 15,
      waterRequirement: 'Moisture conditioning steam / water (approx 150L/day)'
    },
    workingCapital: {
      cycleMonths: 1.5,
      rawMaterialReserve: 60000,
      cashContingency: 25000,
      totalWorkingCapital: 85000
    },
    operatingCosts: {
      rawMaterialsMonthly: 72000, // De-oiled mustard cake, rice bran, maize, molasses, minerals
      laborAndWagesMonthly: 15000,
      utilitiesAndPowerMonthly: 5500,
      repairAndMaintenanceMonthly: 2500,
      freightAndLogisticsMonthly: 5000,
      totalMonthlyOpex: 100000
    },
    expectedOutputMonthly: 85, // quintals (8,500 kg)
    priceAssumptions: {
      unitSellingPrice: 1650, // ₹1,650 per 50kg bag (approx ₹33/kg)
      unitRawMaterialCost: 850
    },
    revenueAssumptions: {
      expectedMonthlyRevenue: 140000,
      capacityUtilizationPercent: 75,
      assumedMarginBasis: 'Direct distribution through milk collection centers and veterinary clinics'
    },
    gestationPeriodMonths: 3,
    typicalRiskLevel: 'low',
    keyRawMaterials: ['Wheat / Rice Bran', 'De-oiled Mustard Cake', 'Maize Grain', 'Molasses', 'Mineral Premixes'],
    eligibleSchemes: ['PMEGP', 'PMFME', 'MUDRA']
  },

  // 7. Cold-Pressed Mustard & Groundnut Oil Expeller (Project Cost ~₹5,80,000)
  {
    id: 'ent_oil_expeller',
    name: 'Cold-Pressed Mustard & Groundnut Oil Expeller',
    category: 'agro_processing',
    tagline: 'Traditional kachi-ghani cold pressed edible oils with zero chemical additives',
    description: 'Establishment of screw press expellers extracting unrefined mustard or groundnut oil, plus high-value protein oil cake byproduct for animal feeds.',
    minimumViableScale: '100 kg seeds / hour',
    defaultScale: '200 kg seeds / hour (6-bolt expeller)',
    unit: 'liters / month',
    fixedAssets: {
      equipmentCost: 290000,
      infrastructureCost: 140000,
      preOperativeCost: 20000,
      totalFixedAssets: 450000
    },
    equipment: [
      { name: 'Heavy Duty 6-Bolt Oil Expeller', spec: '15 HP motor, hardened alloy worms and chamber', approxCost: 175000 },
      { name: 'Filter Press with Plunger Pump', spec: '18 x 18 inch 16-plate cotton filter press', approxCost: 65000 },
      { name: 'Seed Cleaner & Elevator Grader', spec: 'Rotary seed de-stoner and air separator', approxCost: 35000 },
      { name: 'Tin / Bottle Filling & Capping Unit', spec: 'Semi-automatic pneumatic piston filler', approxCost: 15000 }
    ],
    infrastructure: {
      spaceRequiredSqFt: 800,
      shedType: 'Heavy duty concrete floor with oil catch gutters and drainage',
      powerHpRequired: 15,
      waterRequirement: 'Seed moistening & cleaning (200L/day)'
    },
    workingCapital: {
      cycleMonths: 1.5,
      rawMaterialReserve: 95000,
      cashContingency: 35000,
      totalWorkingCapital: 130000
    },
    operatingCosts: {
      rawMaterialsMonthly: 125000, // Oilseeds, bottles, labels
      laborAndWagesMonthly: 18000,
      utilitiesAndPowerMonthly: 8500,
      repairAndMaintenanceMonthly: 3500,
      freightAndLogisticsMonthly: 6000,
      totalMonthlyOpex: 161000
    },
    expectedOutputMonthly: 1400, // Liters pure oil (+ 2,600 kg oil cake)
    priceAssumptions: {
      unitSellingPrice: 165, // ₹165/liter oil + ₹30/kg oil cake = ₹231,000 blended gross
      unitRawMaterialCost: 89
    },
    revenueAssumptions: {
      expectedMonthlyRevenue: 231000,
      capacityUtilizationPercent: 75,
      assumedMarginBasis: 'Dual revenue streams from high-purity edible oil and livestock oil cake'
    },
    gestationPeriodMonths: 4,
    typicalRiskLevel: 'moderate',
    keyRawMaterials: ['High-oil content Mustard Seeds', 'Shelled Groundnuts', 'Food-grade Tin/PET Bottles', 'Filter Cloth'],
    eligibleSchemes: ['PMEGP', 'PMFME', 'AIF']
  },

  // 8. Village Milk Chilling & Artisanal Paneer/Ghee Micro-Dairy (Project Cost ~₹6,50,000)
  {
    id: 'ent_dairy_chilling',
    name: 'Village Bulk Milk Chilling & Artisanal Paneer/Ghee Dairy',
    category: 'dairy_livestock',
    tagline: 'Farmgate milk collection, chilling at 4°C, and artisanal ghee & paneer making',
    description: 'Eliminates milk spoilage, secures fair pricing for village livestock owners, and produces value-added fresh dairy products for town bakeries and hotels.',
    minimumViableScale: '300 L / day',
    defaultScale: '500 L / day',
    unit: 'liters / month',
    fixedAssets: {
      equipmentCost: 340000,
      infrastructureCost: 140000,
      preOperativeCost: 20000,
      totalFixedAssets: 500000
    },
    equipment: [
      { name: 'Bulk Milk Cooler (BMC)', spec: '500 L capacity SS-304 tank with hermetic scroll compressor', approxCost: 195000 },
      { name: 'Steam-Jacketed Ghee & Paneer Vat', spec: '100 L tilting vessel with gas/steam heating', approxCost: 75000 },
      { name: 'Cream Separator Machine', spec: '150 L/hour electric centrifugal cream separator', approxCost: 40000 },
      { name: 'Vacuum Sealer & Pneumatic Paneer Press', spec: 'SS dual-piston press + chamber vacuum sealer', approxCost: 30000 }
    ],
    infrastructure: {
      spaceRequiredSqFt: 650,
      shedType: 'Tiled hygienic clean room with cold storage refrigeration and drainage trap',
      powerHpRequired: 10,
      waterRequirement: 'High-purity hot/cold cleaning water (400L/day)'
    },
    workingCapital: {
      cycleMonths: 1,
      rawMaterialReserve: 110000,
      cashContingency: 40000,
      totalWorkingCapital: 150000
    },
    operatingCosts: {
      rawMaterialsMonthly: 150000, // Raw milk procurement, cultures, packaging
      laborAndWagesMonthly: 20000,
      utilitiesAndPowerMonthly: 9000,
      repairAndMaintenanceMonthly: 3000,
      freightAndLogisticsMonthly: 6000,
      totalMonthlyOpex: 188000
    },
    expectedOutputMonthly: 7500, // liters handled (yielding chilled milk, 450kg paneer, 120kg ghee)
    priceAssumptions: {
      unitSellingPrice: 42, // Average realized value across milk, paneer, and ghee
      unitRawMaterialCost: 28
    },
    revenueAssumptions: {
      expectedMonthlyRevenue: 265000,
      capacityUtilizationPercent: 80,
      assumedMarginBasis: 'Premium artisanal paneer, bilona ghee, and daily morning fresh milk'
    },
    gestationPeriodMonths: 3,
    typicalRiskLevel: 'moderate',
    keyRawMaterials: ['Raw Cow & Buffalo Milk', 'Citric acid / microbial cultures', 'Vacuum pouches', 'Glass ghee jars'],
    eligibleSchemes: ['PMFME', 'PMEGP', 'MUDRA', 'AIF']
  },

  // 9. Mini Pulse De-Husking & Split Dal Processing (Project Cost ~₹8,20,000)
  {
    id: 'ent_dal_mill',
    name: 'Mini Pulse De-Husking & Split Dal Processing Unit',
    category: 'agro_processing',
    tagline: 'De-husking, splitting, polishing and grading of arhar, chana, moong & urad',
    description: 'Decentralized pulse processing solving distress sale by local farmers and generating premium polished pulses for local wholesale and regional retail.',
    minimumViableScale: '200 kg / hour',
    defaultScale: '500 kg / hour',
    unit: 'quintals / month',
    fixedAssets: {
      equipmentCost: 460000,
      infrastructureCost: 160000,
      preOperativeCost: 30000,
      totalFixedAssets: 650000
    },
    equipment: [
      { name: 'Automatic Dal De-husker & Splitter Machine', spec: '7.5 HP carborundum roller unit', approxCost: 210000 },
      { name: 'Water / Oil Conditioning Screw Conveyor', spec: 'Stainless steel moisture mixing auger', approxCost: 85000 },
      { name: 'Rotary Screen Grader & Destoner', spec: '3-stage vibrating sieve with blower', approxCost: 95000 },
      { name: 'Polisher Drum & Bag Stitching Machine', spec: 'Leather belt polisher + portable sewing machine', approxCost: 70000 }
    ],
    infrastructure: {
      spaceRequiredSqFt: 1000,
      shedType: 'Covered industrial pucca shed with sun-drying yard for raw pulse conditioning',
      powerHpRequired: 20,
      waterRequirement: 'Grain soaking & tempering (300L/day)'
    },
    workingCapital: {
      cycleMonths: 1.5,
      rawMaterialReserve: 120000,
      cashContingency: 50000,
      totalWorkingCapital: 170000
    },
    operatingCosts: {
      rawMaterialsMonthly: 190000, // Raw pulses, edible oil for polish, gunny bags
      laborAndWagesMonthly: 24000,
      utilitiesAndPowerMonthly: 12000,
      repairAndMaintenanceMonthly: 4000,
      freightAndLogisticsMonthly: 8000,
      totalMonthlyOpex: 238000
    },
    expectedOutputMonthly: 45, // quintals finished dal (4,500 kg)
    priceAssumptions: {
      unitSellingPrice: 7200, // ₹7,200 per quintal (₹72/kg) + husk sold as cattle feed
      unitRawMaterialCost: 4200
    },
    revenueAssumptions: {
      expectedMonthlyRevenue: 324000,
      capacityUtilizationPercent: 75,
      assumedMarginBasis: 'Clean sorted dal sold to district grocery wholesalers and ration distributors'
    },
    gestationPeriodMonths: 4,
    typicalRiskLevel: 'moderate',
    keyRawMaterials: ['Raw Pulses (Arhar, Chana, Moong)', 'Processing edible oil', 'Poly woven sacks', 'Gunny bags'],
    eligibleSchemes: ['PMEGP', 'PMFME', 'AIF']
  },

  // 10. Semi-Automatic Corrugated Carton & Packaging Unit (Project Cost ~₹12,50,000)
  {
    id: 'ent_corrugated_boxes',
    name: 'Semi-Automatic Corrugated Carton & Box Unit',
    category: 'manufacturing',
    tagline: 'Biodegradable packaging for e-commerce, local food processors and industrial goods',
    description: 'Capitalizes on the statutory ban on single-use plastics and the mushrooming of rural food brands, tailoring custom printed boxes and heavy-duty shipping cartons.',
    minimumViableScale: '1,000 boxes / day',
    defaultScale: '3,000 boxes / day',
    unit: 'boxes / month',
    fixedAssets: {
      equipmentCost: 750000,
      infrastructureCost: 200000,
      preOperativeCost: 50000,
      totalFixedAssets: 1000000
    },
    equipment: [
      { name: 'Single Facer Corrugation Machine', spec: 'Electric heating fluting rolls with variable drive', approxCost: 380000 },
      { name: 'Sheet Pasting & Board Cutting Machine', spec: 'Motorized eccentric slotter and rotary blade cutter', approxCost: 190000 },
      { name: 'Flexographic 2-Color Printing Machine', spec: 'Chain feed carton printing cylinder', approxCost: 120000 },
      { name: 'Heavy-Duty Wire Stitching Machine', spec: 'Angular arm box stapling unit', approxCost: 60000 }
    ],
    infrastructure: {
      spaceRequiredSqFt: 1400,
      shedType: 'Water-proof industrial warehouse with high-bay loading and dry paper roll storage',
      powerHpRequired: 15,
      waterRequirement: 'Starch glue preparation (200L/day)'
    },
    workingCapital: {
      cycleMonths: 1.5,
      rawMaterialReserve: 175000,
      cashContingency: 75000,
      totalWorkingCapital: 250000
    },
    operatingCosts: {
      rawMaterialsMonthly: 210000, // Kraft paper reels, corn starch glue, stitching wire, flexo inks
      laborAndWagesMonthly: 32000,
      utilitiesAndPowerMonthly: 14000,
      repairAndMaintenanceMonthly: 6000,
      freightAndLogisticsMonthly: 12000,
      totalMonthlyOpex: 274000
    },
    expectedOutputMonthly: 40000, // shipping boxes
    priceAssumptions: {
      unitSellingPrice: 9.5, // Average box price ₹9.50
      unitRawMaterialCost: 5.25
    },
    revenueAssumptions: {
      expectedMonthlyRevenue: 380000,
      capacityUtilizationPercent: 80,
      assumedMarginBasis: 'Annual supply contracts with regional agro-exporters, bakeries, and manufacturers'
    },
    gestationPeriodMonths: 4,
    typicalRiskLevel: 'moderate',
    keyRawMaterials: ['Kraft Paper Rolls (120-180 GSM)', 'Corn Starch Glue Powder', 'Copper Coated Stitching Wire', 'Water-based Inks'],
    eligibleSchemes: ['PMEGP', 'STANDUP_INDIA', 'MUDRA']
  },

  // 11. Solar-Powered Thermal Micro Cold Room (Project Cost ~₹15,00,000)
  {
    id: 'ent_solar_cold_storage',
    name: 'Solar-Powered Micro Cold Storage (10MT Farmgate)',
    category: 'renewable_energy',
    tagline: 'Off-grid decentralized temperature-controlled storage for fruits and vegetables',
    description: 'Mitigates post-harvest distress dumping of tomatoes, potatoes, ginger, and fruits by providing local farmers rentable shelf-life extension and commodity trading buffer.',
    minimumViableScale: '5 MT capacity',
    defaultScale: '10 MT dual-zone cold chamber',
    unit: 'crates / month (rental & trading)',
    fixedAssets: {
      equipmentCost: 950000,
      infrastructureCost: 280000,
      preOperativeCost: 70000,
      totalFixedAssets: 1300000
    },
    equipment: [
      { name: 'PUF Insulated Cold Room (100mm)', spec: 'High-density polyurethane panels with cam-locks', approxCost: 380000 },
      { name: 'Rooftop Solar PV Array & Inverter', spec: '10 kW grid-tied / battery backed solar generation', approxCost: 390000 },
      { name: 'Hermetic Scroll Condensing & Evaporator Unit', spec: 'Eco-friendly refrigerant R404a cooling assembly', approxCost: 180000 }
    ],
    infrastructure: {
      spaceRequiredSqFt: 600,
      shedType: 'Shaded concrete plinth with all-weather thermal insulation roof',
      powerHpRequired: 8,
      waterRequirement: 'Condenser coil cleaning (100L/day)'
    },
    workingCapital: {
      cycleMonths: 2,
      rawMaterialReserve: 130000,
      cashContingency: 70000,
      totalWorkingCapital: 200000
    },
    operatingCosts: {
      rawMaterialsMonthly: 28000, // Sanitization, cooling gas top-up, produce crates
      laborAndWagesMonthly: 20000,
      utilitiesAndPowerMonthly: 4000, // Solar power minimizes grid bill
      repairAndMaintenanceMonthly: 4500,
      freightAndLogisticsMonthly: 3500,
      totalMonthlyOpex: 60000
    },
    expectedOutputMonthly: 1200, // rental crates / month + seasonal value arbitrage
    priceAssumptions: {
      unitSellingPrice: 110, // ₹110 / crate / month rental + differential commodity realization
      unitRawMaterialCost: 23
    },
    revenueAssumptions: {
      expectedMonthlyRevenue: 132000,
      capacityUtilizationPercent: 85,
      assumedMarginBasis: 'Per-crate daily storage rental fees paid by local horticulture growers and FPOs'
    },
    gestationPeriodMonths: 4,
    typicalRiskLevel: 'low',
    keyRawMaterials: ['PUF Insulated Wall Panels', 'Solar Photovoltaic Modules', 'Cooling Refrigerant (R404a)', 'Standardized Plastic Crates'],
    eligibleSchemes: ['AIF (Agriculture Infrastructure Fund)', 'PMFME', 'PMEGP']
  },

  // 12. Hydraulic Fly Ash & Concrete Paver Brick Unit (Project Cost ~₹22,00,000)
  {
    id: 'ent_flyash_bricks',
    name: 'Hydraulic Fly Ash & Concrete Paver Brick Unit',
    category: 'manufacturing',
    tagline: 'Eco-friendly green building bricks using thermal plant fly ash, quarry dust & lime',
    description: 'High-volume construction material plant feeding booming rural pucca housing (PMAY), commercial boundary walls, and municipal interlocking paver road projects.',
    minimumViableScale: '3,000 bricks / day',
    defaultScale: '8,000 bricks / day (hydraulic press)',
    unit: 'bricks / month',
    fixedAssets: {
      equipmentCost: 1350000,
      infrastructureCost: 450000,
      preOperativeCost: 100000,
      totalFixedAssets: 1900000
    },
    equipment: [
      { name: 'Heavy-Duty Hydraulic Brick Press Machine', spec: 'Triple-feeder 8-brick per stroke automatic hydraulic station', approxCost: 750000 },
      { name: 'Pan Mixer with Hardened Rollers', spec: '500 kg batch capacity with bottom discharge', approxCost: 260000 },
      { name: 'Belt Conveyor with Magnetic Pulley', spec: '25 ft continuous feeder conveyor', approxCost: 140000 },
      { name: 'Pallet Trucks & Wooden Stacking Boards', spec: 'Hydraulic hand pallet trucks + 1,000 marine ply pallets', approxCost: 200000 }
    ],
    infrastructure: {
      spaceRequiredSqFt: 4500,
      shedType: 'Open 1-acre yard with water curing tank sprayers and 1,000 sq.ft press shed',
      powerHpRequired: 25,
      waterRequirement: 'Brick water curing sprinkler network (1,500L/day)'
    },
    workingCapital: {
      cycleMonths: 1.5,
      rawMaterialReserve: 210000,
      cashContingency: 90000,
      totalWorkingCapital: 300000
    },
    operatingCosts: {
      rawMaterialsMonthly: 310000, // Fly ash, cement (OPC 53), quarry dust, gypsum
      laborAndWagesMonthly: 48000,
      utilitiesAndPowerMonthly: 24000,
      repairAndMaintenanceMonthly: 12000,
      freightAndLogisticsMonthly: 26000,
      totalMonthlyOpex: 420000
    },
    expectedOutputMonthly: 120000, // bricks per month
    priceAssumptions: {
      unitSellingPrice: 4.8, // ₹4.80 / brick delivered
      unitRawMaterialCost: 2.6
    },
    revenueAssumptions: {
      expectedMonthlyRevenue: 576000,
      capacityUtilizationPercent: 75,
      assumedMarginBasis: 'Direct supply to government civil contractors, builders, and rural hardware retailers'
    },
    gestationPeriodMonths: 5,
    typicalRiskLevel: 'low',
    keyRawMaterials: ['Fly Ash (from Thermal Plants)', 'Portland Cement (53 Grade)', 'Stone Quarry Dust / Sand', 'Gypsum / Lime'],
    eligibleSchemes: ['PMEGP', 'STANDUP_INDIA', 'MUDRA']
  },

  // 13. Smallholder Commercial Dairy Farm (Murrah Buffaloes / HF Crossbred Cows) (Project Cost ~₹8,00,000)
  {
    id: 'ent_dairy_cattle',
    name: 'Smallholder Commercial Dairy Farm (Murrah Buffaloes / HF Cows)',
    category: 'dairy_livestock',
    tagline: 'High-yield commercial dairy unit with hygienic milking, chilled storage, and dung biogas',
    description: 'Commercial micro-dairy farm with high-lactation Murrah buffaloes or HF crossbred cows producing fresh whole milk for local co-operatives, sweet artisans, and residential consumers.',
    minimumViableScale: '5 animals',
    defaultScale: '10 animals',
    unit: 'animals',
    fixedAssets: {
      equipmentCost: 550000,
      infrastructureCost: 145000,
      preOperativeCost: 25000,
      totalFixedAssets: 720000
    },
    equipment: [
      { name: 'High-Yield Milch Animals (Murrah Buffaloes / HF Cows)', spec: '10 lactating animals with certified veterinary health and vaccination records', approxCost: 500000 },
      { name: 'Dual-Bucket Portable Milking Machine', spec: 'Oil-lubricated vacuum pump with stainless steel 25L food-grade cans', approxCost: 35000 },
      { name: 'Insulated Milk Cans & Quality Testing Bench', spec: '4 x 40L SS-304 insulated cans + ultrasonic milk fat analyzer', approxCost: 15000 }
    ],
    infrastructure: {
      spaceRequiredSqFt: 1200,
      shedType: 'Well-ventilated pucca shed with non-slip grooved concrete floor, mangers & slurry pit',
      powerHpRequired: 2,
      waterRequirement: 'Borewell water supply (approx 1,000L/day for drinking, cooling mist & washing)'
    },
    workingCapital: {
      cycleMonths: 2,
      rawMaterialReserve: 55000,
      cashContingency: 25000,
      totalWorkingCapital: 80000
    },
    operatingCosts: {
      rawMaterialsMonthly: 38000, // Concentrated cattle feed, dry straw, silage & mineral mix
      laborAndWagesMonthly: 12000,
      utilitiesAndPowerMonthly: 2500,
      repairAndMaintenanceMonthly: 1500,
      freightAndLogisticsMonthly: 2000,
      totalMonthlyOpex: 56000
    },
    expectedOutputMonthly: 3600, // Liters of fresh raw milk
    priceAssumptions: {
      unitSellingPrice: 52, // ₹52 per liter blended co-op & direct retail price
      unitRawMaterialCost: 10.5
    },
    revenueAssumptions: {
      expectedMonthlyRevenue: 75000, // Milk revenue + bio-slurry / dung manure compost sales
      capacityUtilizationPercent: 85,
      assumedMarginBasis: 'Direct co-operative milk society delivery & local retail milk rounds'
    },
    gestationPeriodMonths: 1,
    typicalRiskLevel: 'moderate',
    keyRawMaterials: ['Milch Cows / Buffaloes', 'Cattle Feed Pellets', 'Dry Wheat Straw', 'Green Silage / Napier Grass', 'Veterinary Medicines'],
    eligibleSchemes: ['PMEGP', 'KCC Animal Husbandry', 'National Livestock Mission (NLM)', 'MUDRA']
  }
];
