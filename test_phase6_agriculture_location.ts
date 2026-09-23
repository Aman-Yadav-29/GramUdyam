/**
 * Phase 6 Agriculture-Specific Location Analysis Comprehensive Verification Suite
 *
 * Strictly tests:
 * 1. Dairy business returns all mandated factors
 * 2. Mushroom farming returns all mandated factors including substrate_feedstock
 * 3. Fish farming returns aquaculture_suitability, water, etc.
 * 4. Vegetable cultivation returns soil, rainfall, water, irrigation, cropping_pattern, etc.
 * 5. Missing data returns 'unknown' and dataLevel='not_available', NEVER 'concern'
 * 6. Village/Block input preserves analysisResolution = 'district' and does not fabricate village data
 * 7. District differentiation: differing underlying data yields different factor findings/statuses
 * 8. Non-agricultural businesses (flyash bricks, corrugated boxes, etc.) return null / isAgriBusiness=false
 * 9. NO numeric score exists (agricultureScore, agriScore, suitabilityScore, agriIndex, etc.)
 * 10. Financial independence: financial plan (project cost, gap, EMI, DSCR) is completely unaffected
 * 11. Data provenance: every evidence item contains label, value, source, date, geographicLevel
 * 12. Cross-business factor coverage for Goat farming, Fruit, Floriculture, Beekeeping, Vermicompost
 */

import {
  agriLocationService,
  identifyAgriBusinessKind,
  AGRI_BUSINESS_FACTORS_MAP
} from './server/services/agriLocationService.ts';
import { calculateBusinessPlanForCapital } from './server/services/discoveryEngine.ts';
import { locationGisService } from './server/services/locationGisService.ts';
import { BUSINESS_TEMPLATES } from './src/data/businessTemplates.ts';

console.log('================================================================');
console.log('🌾 GRAMUDYAM PHASE 6: AGRICULTURE-SPECIFIC LOCATION SUITE');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
    failedTests++;
  }
}

// -----------------------------------------------------------------------------
// TEST SUITE 1: DAIRY BUSINESS ANALYSIS (FACTORS CHECK)
// -----------------------------------------------------------------------------
console.log('📋 Test Suite 1: Dairy Business Analysis Factors');

const dairyAnalysis = agriLocationService.analyzeAgriLocation(
  'ent_dairy_cattle',
  'Uttar Pradesh',
  'Varanasi'
);

assert(dairyAnalysis !== null, 'Dairy analysis generated successfully');
assert(dairyAnalysis?.isAgriBusiness === true, 'isAgriBusiness is true for dairy');
assert(dairyAnalysis?.agriBusinessKind === 'dairy', 'agriBusinessKind is "dairy"');

const dairyFactorKeys = dairyAnalysis?.factors.map((f) => f.factor) || [];
const mandatedDairyFactors = [
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
];

for (const factor of mandatedDairyFactors) {
  assert(dairyFactorKeys.includes(factor as any), `Dairy analysis includes mandated factor "${factor}"`);
}

// -----------------------------------------------------------------------------
// TEST SUITE 2: MUSHROOM FARMING ANALYSIS (FACTORS & SUBSTRATE CHECK)
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 2: Mushroom Farming Analysis Factors');

const mushroomAnalysis = agriLocationService.analyzeAgriLocation(
  'ent_mushroom',
  'Rajasthan',
  'Alwar'
);

assert(mushroomAnalysis !== null, 'Mushroom analysis generated successfully');
assert(mushroomAnalysis?.agriBusinessKind === 'mushroom_farming', 'agriBusinessKind is "mushroom_farming"');

const mushroomFactorKeys = mushroomAnalysis?.factors.map((f) => f.factor) || [];
const mandatedMushroomFactors = [
  'temperature',
  'climate',
  'water',
  'electricity',
  'buyer_market',
  'storage',
  'transport',
  'seasonality',
  'substrate_feedstock'
];

for (const factor of mandatedMushroomFactors) {
  assert(mushroomFactorKeys.includes(factor as any), `Mushroom analysis includes mandated factor "${factor}"`);
}

// Check substrate finding
const substrateFactor = mushroomAnalysis?.factors.find((f) => f.factor === 'substrate_feedstock');
assert(substrateFactor !== undefined, 'Substrate feedstock factor exists');
assert(
  substrateFactor?.status === 'supportive' || substrateFactor?.status === 'unknown',
  `Substrate factor status is valid (${substrateFactor?.status})`
);
assert(
  substrateFactor?.verifyLocally.length! > 0,
  'Substrate factor includes practical local verification instructions'
);

// -----------------------------------------------------------------------------
// TEST SUITE 3: FISH FARMING / AQUACULTURE ANALYSIS
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 3: Fish Farming Analysis Factors');

const fishAnalysis = agriLocationService.analyzeAgriLocation(
  'fish_farming',
  'Andhra Pradesh',
  'Guntur'
);

assert(fishAnalysis !== null, 'Fish farming analysis generated successfully');
assert(fishAnalysis?.agriBusinessKind === 'fish_farming', 'agriBusinessKind is "fish_farming"');

const fishFactorKeys = fishAnalysis?.factors.map((f) => f.factor) || [];
const mandatedFishFactors = [
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
];

for (const factor of mandatedFishFactors) {
  assert(fishFactorKeys.includes(factor as any), `Fish farming includes mandated factor "${factor}"`);
}

// -----------------------------------------------------------------------------
// TEST SUITE 4: VEGETABLE CULTIVATION ANALYSIS
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 4: Vegetable Cultivation Analysis Factors');

const vegAnalysis = agriLocationService.analyzeAgriLocation(
  'vegetable_cultivation',
  'Maharashtra',
  'Nashik'
);

assert(vegAnalysis !== null, 'Vegetable cultivation analysis generated successfully');
assert(vegAnalysis?.agriBusinessKind === 'vegetable_cultivation', 'agriBusinessKind is "vegetable_cultivation"');

const vegFactorKeys = vegAnalysis?.factors.map((f) => f.factor) || [];
const mandatedVegFactors = [
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
];

for (const factor of mandatedVegFactors) {
  assert(vegFactorKeys.includes(factor as any), `Vegetable cultivation includes mandated factor "${factor}"`);
}

// -----------------------------------------------------------------------------
// TEST SUITE 5: MISSING DATA BEHAVIOR (UNKNOWN !== CONCERN)
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 5: Missing Data Returns "unknown", NEVER "concern"');

// In an inland district like Ludhiana without aquaculture benchmark:
const inlandFishAnalysis = agriLocationService.analyzeAgriLocation(
  'fish_farming',
  'Punjab',
  'Ludhiana'
);

const aquaFactor = inlandFishAnalysis?.factors.find((f) => f.factor === 'aquaculture_suitability');
assert(aquaFactor !== undefined, 'Aqua suitability factor exists in Ludhiana test');
assert(aquaFactor?.status === 'unknown', `Missing aqua data yields status "unknown" (got "${aquaFactor?.status}")`);
assert(aquaFactor?.dataLevel === 'not_available', `Missing aqua data yields dataLevel "not_available" (got "${aquaFactor?.dataLevel}")`);
assert(aquaFactor?.status !== 'concern', 'CRITICAL RULE: Missing data is NOT treated as concern');

// Verify that unknown factor does NOT appear in whyMayNotSuit
const inWhyNotSuit = inlandFishAnalysis?.whyMayNotSuit.some((reason) =>
  reason.includes('Pond Water Retention') || reason.includes('aquaculture_suitability')
);
assert(!inWhyNotSuit, 'CRITICAL RULE: Unknown factors do NOT appear in whyMayNotSuit list');

// -----------------------------------------------------------------------------
// TEST SUITE 6: RESOLUTION DISCLOSURE & VILLAGE FALLBACK
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 6: District-Level Resolution Disclosure & No Fake Village Data');

const villageAnalysis = agriLocationService.analyzeAgriLocation(
  'ent_dairy_cattle',
  'Uttar Pradesh',
  'Varanasi',
  {
    villageOrTown: 'Raja Talab',
    subDistrictOrBlock: 'Arajiline'
  }
);

assert(villageAnalysis !== null, 'Village-level query handled');
assert(villageAnalysis?.analysisResolution === 'district', 'analysisResolution is strictly "district"');
assert(
  Boolean(
    villageAnalysis?.resolutionDisclosure.includes('Varanasi') &&
    villageAnalysis?.resolutionDisclosure.includes('Raja Talab')
  ),
  'Resolution disclosure transparently states analysis is district-level benchmark and mandates local village checks'
);

// -----------------------------------------------------------------------------
// TEST SUITE 7: DISTRICT DIFFERENTIATION
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 7: District Differentiation (Differing Ground Realities)');

const alwarDairy = agriLocationService.analyzeAgriLocation('ent_dairy_cattle', 'Rajasthan', 'Alwar');
const varanasiDairy = agriLocationService.analyzeAgriLocation('ent_dairy_cattle', 'Uttar Pradesh', 'Varanasi');

// Alwar has Over-Exploited / deep groundwater vs Varanasi Safe groundwater
const alwarGw = alwarDairy?.factors.find((f) => f.factor === 'groundwater');
const varanasiGw = varanasiDairy?.factors.find((f) => f.factor === 'groundwater');

assert(alwarGw?.status === 'concern', `Alwar groundwater identified as "concern" (over-exploited): ${alwarGw?.status}`);
assert(varanasiGw?.status === 'supportive', `Varanasi groundwater identified as "supportive" (safe): ${varanasiGw?.status}`);
assert(alwarGw?.status !== varanasiGw?.status, 'Different districts produce distinct factual statuses reflecting real hydrogeology');

// -----------------------------------------------------------------------------
// TEST SUITE 8: NON-AGRICULTURAL BUSINESSES EXCLUDED
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 8: Non-Agricultural Businesses Excluded');

const corrugated = agriLocationService.analyzeAgriLocation(
  'ent_corrugated_boxes',
  'Uttar Pradesh',
  'Varanasi'
);
assert(corrugated === null, 'Corrugated box manufacturing returns null for agriculture analysis');

const flyash = agriLocationService.analyzeAgriLocation(
  'ent_flyash_bricks',
  'Bihar',
  'Muzaffarpur'
);
assert(flyash === null, 'Fly ash bricks manufacturing returns null for agriculture analysis');

const software = identifyAgriBusinessKind('custom_software_solutions');
assert(software === null, 'Software business returns null for AgriBusinessKind');

const retail = identifyAgriBusinessKind('retail_grocery_store');
assert(retail === null, 'Retail store returns null for AgriBusinessKind');

// -----------------------------------------------------------------------------
// TEST SUITE 9: STRICT PROHIBITION OF NUMERIC AGGREGATE SCORES
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 9: Prohibition of Aggregate Agricultural Scores');

const allObjKeys = Object.keys(dairyAnalysis || {});
assert(!allObjKeys.includes('agricultureScore'), 'NO "agricultureScore" property');
assert(!allObjKeys.includes('agriScore'), 'NO "agriScore" property');
assert(!allObjKeys.includes('suitabilityScore'), 'NO "suitabilityScore" property');
assert(!allObjKeys.includes('agriIndex'), 'NO "agriIndex" property');
assert(!allObjKeys.includes('locationSuitabilityIndex'), 'NO "locationSuitabilityIndex" property');
assert(!allObjKeys.includes('overallAgricultureRating'), 'NO "overallAgricultureRating" property');

assert(
  Boolean(dairyAnalysis?.scoreDisclosure.includes('No single agricultural suitability score is used')),
  'scoreDisclosure explicitly informs user that no single aggregate score is computed'
);

// -----------------------------------------------------------------------------
// TEST SUITE 10: FINANCIAL INDEPENDENCE (NO MIXING WITH FINANCIAL ENGINE)
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 10: Financial Calculation Independence');

const dairyTemplate = BUSINESS_TEMPLATES.find((b) => b.id === 'ent_dairy_cattle')!;
const districtIntel = locationGisService.getDistrictData('Rajasthan', 'Alwar');

// Plan without location
const planBase = calculateBusinessPlanForCapital(dairyTemplate, 200000);

// Plan with location (which attaches agriLocationAnalysis)
const planWithAgri = calculateBusinessPlanForCapital(
  dairyTemplate,
  200000,
  undefined,
  districtIntel
);

assert(planWithAgri.agriLocationAnalysis !== undefined, 'agriLocationAnalysis attached to plan');
assert(planWithAgri.projectCost === planBase.projectCost, `Project cost identical: ₹${planWithAgri.projectCost}`);
assert(planWithAgri.financingGap === planBase.financingGap, `Financing gap identical: ₹${planWithAgri.financingGap}`);
assert(planWithAgri.monthlyEmi === planBase.monthlyEmi, `Monthly EMI identical: ₹${planWithAgri.monthlyEmi}`);
assert(planWithAgri.dscr === planBase.dscr, `DSCR identical: ${planWithAgri.dscr}`);
assert(planWithAgri.affordabilityTier === planBase.affordabilityTier, 'Affordability tier identical');

// -----------------------------------------------------------------------------
// TEST SUITE 11: DATA PROVENANCE ON EVIDENCE ITEMS
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 11: Data Provenance on Evidence Items');

const testEvidenceItem = varanasiDairy?.factors
  .find((f) => f.factor === 'groundwater')
  ?.evidence[0];

assert(testEvidenceItem !== undefined, 'Evidence item exists for Varanasi groundwater');
assert(typeof testEvidenceItem?.label === 'string', 'Evidence has label');
assert(testEvidenceItem?.value !== undefined, 'Evidence has value');
assert(typeof testEvidenceItem?.source === 'string', `Evidence has source: "${testEvidenceItem?.source}"`);
assert(typeof testEvidenceItem?.date === 'string', `Evidence has date: "${testEvidenceItem?.date}"`);
assert(testEvidenceItem?.geographicLevel === 'District-level estimate', 'Evidence has geographicLevel');
assert(testEvidenceItem?.hasCitation === true, 'Evidence has citation flag');

// -----------------------------------------------------------------------------
// TEST SUITE 12: OTHER CONFIGURED AGRI BUSINESS KINDS
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 12: Broad Agricultural Business Kind Coverage');

const agriKindsToTest = [
  { input: 'goat_farming', expectedKind: 'goat_farming' },
  { input: 'fruit_cultivation', expectedKind: 'fruit_cultivation' },
  { input: 'floriculture', expectedKind: 'floriculture' },
  { input: 'ent_beekeeping', expectedKind: 'beekeeping' },
  { input: 'ent_vermicompost', expectedKind: 'vermicomposting' }
];

for (const { input, expectedKind } of agriKindsToTest) {
  const result = agriLocationService.analyzeAgriLocation(input, 'Maharashtra', 'Nashik');
  assert(result !== null, `Analyzed ${input}`);
  assert(result?.agriBusinessKind === expectedKind, `Mapped ${input} to kind "${expectedKind}"`);
  assert(result?.factors.length! >= 6, `${expectedKind} has comprehensive factor evaluation`);
  assert(result?.whatToVerifyLocally.length! > 0, `${expectedKind} includes prioritized verification steps`);
}

// -----------------------------------------------------------------------------
// TEST SUITE 13: LOCATION VARIATIONS & FALLBACK AUDIT
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 13: Location Variations & Fallback Audit');

// Supported district
const suppDist = agriLocationService.analyzeAgriLocation('ent_dairy_cattle', 'Punjab', 'Ludhiana');
assert(suppDist !== null, 'Supported district (Punjab/Ludhiana) succeeds');
assert(suppDist?.location.district === 'Ludhiana', 'Supported district correctly retained');

// Unsupported district with supported state
const unsuppDist = agriLocationService.analyzeAgriLocation('ent_dairy_cattle', 'Punjab', 'Fazilka');
assert(unsuppDist !== null, 'Unsupported district with supported state (Punjab/Fazilka) handled safely via fallback');
assert(unsuppDist?.location.state === 'Punjab', 'State retained in fallback');
assert(unsuppDist?.location.district === 'Fazilka', 'District retained in fallback');
assert(unsuppDist?.analysisResolution === 'district', 'Resolution strictly district');

// Unsupported state
const unsuppState = agriLocationService.analyzeAgriLocation('ent_dairy_cattle', 'UnknownState', 'RandomDistrict');
assert(unsuppState !== null, 'Unsupported state handled gracefully without crash');
assert(unsuppState?.location.state === 'UnknownState', 'Unsupported state preserved in fallback structure');
assert(unsuppState?.location.district === 'RandomDistrict', 'Unsupported district preserved in fallback structure');

// Village supplied with district data
const villageCheck = agriLocationService.analyzeAgriLocation('ent_mushroom', 'Uttar Pradesh', 'Varanasi', {
  villageOrTown: 'Shivpur',
  subDistrictOrBlock: 'Pindra'
});
assert(villageCheck !== null, 'Village-level query returns valid analysis');
assert(villageCheck?.location.villageOrTown === 'Shivpur', 'Village name passed in location');
assert(villageCheck?.location.subDistrictOrBlock === 'Pindra', 'Sub-district/block passed in location');
assert(villageCheck?.analysisResolution === 'district', 'Resolution remains strictly district (no fake village metrics)');
assert(
  Boolean(villageCheck?.resolutionDisclosure.includes('Varanasi') && villageCheck?.resolutionDisclosure.includes('Shivpur')),
  'Disclosure mandates field-level verification in Shivpur'
);

// -----------------------------------------------------------------------------
// TEST SUITE 14: EVIDENCE STATUS & PROVENANCE INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 14: Evidence Status & Provenance Integrity');

const alwarDairyEval = agriLocationService.analyzeAgriLocation('ent_dairy_cattle', 'Rajasthan', 'Alwar')!;

// 1. Supportive factor
const supportiveFactor = alwarDairyEval.factors.find((f) => f.status === 'supportive');
assert(supportiveFactor !== undefined, 'Supportive factor exists in evaluation');
assert(supportiveFactor?.evidence.length! > 0, 'Supportive factor includes concrete evidence items');
assert(alwarDairyEval.whyMaySuit.includes(supportiveFactor!.finding), 'Supportive factor finding appears in whyMaySuit');

// 2. Concern factor
const concernFactor = alwarDairyEval.factors.find((f) => f.status === 'concern');
assert(concernFactor !== undefined, 'Concern factor exists in evaluation (Alwar groundwater)');
assert(concernFactor?.evidence.length! > 0, 'Concern factor includes concrete evidence items');
assert(
  alwarDairyEval.whyMayNotSuit.some((s) => s.includes(concernFactor!.factorLabel)),
  'Concern factor appears in whyMayNotSuit'
);

// 3. Mixed factor
const mixedFactor = alwarDairyEval.factors.find((f) => f.status === 'mixed');
assert(mixedFactor !== undefined, 'Mixed factor exists in evaluation');
assert(
  alwarDairyEval.whyMayNotSuit.some((s) => s.includes(mixedFactor!.factorLabel)),
  'Mixed factor appears in whyMayNotSuit management considerations'
);

// 4. Unknown factor
const ludhianaFish = agriLocationService.analyzeAgriLocation('fish_farming', 'Punjab', 'Ludhiana')!;
const unknownFactor = ludhianaFish.factors.find((f) => f.status === 'unknown');
assert(unknownFactor !== undefined, 'Unknown factor exists where data is not recorded');
assert(unknownFactor?.dataLevel === 'not_available', 'Unknown factor has dataLevel="not_available"');
assert(unknownFactor?.evidence.length === 0, 'Unknown factor has empty evidence array');
assert(
  !ludhianaFish.whyMaySuit.includes(unknownFactor!.finding),
  'CRITICAL: Unknown factor does not appear in whyMaySuit'
);
assert(
  !ludhianaFish.whyMayNotSuit.some((s) => s.includes(unknownFactor!.factorLabel)),
  'CRITICAL: Unknown factor does not appear in whyMayNotSuit'
);

// -----------------------------------------------------------------------------
// TEST SUITE 15: BUSINESS CLASSIFICATION AUDIT
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 15: Business Classification & Exclusion Audit');

// Non-agricultural businesses return null
assert(identifyAgriBusinessKind('ent_corrugated_boxes') === null, 'Corrugated box identified as non-agri (null)');
assert(identifyAgriBusinessKind('ent_flyash_bricks') === null, 'Fly ash bricks identified as non-agri (null)');
assert(identifyAgriBusinessKind('ent_dal_mill') === null, 'Dal mill manufacturing excluded from agri farming (null)');
assert(identifyAgriBusinessKind('ent_spices_processing') === null, 'Spice processing manufacturing excluded from agri farming (null)');
assert(identifyAgriBusinessKind('software_consulting') === null, 'Software business returns null');
assert(identifyAgriBusinessKind('grocery_retail_store') === null, 'Retail store returns null');
assert(identifyAgriBusinessKind('unknown_bogus_id_999') === null, 'Unknown business ID returns null');

// Valid agricultural businesses return respective kind
assert(identifyAgriBusinessKind('dairy') === 'dairy', 'Raw string "dairy" maps to dairy');
assert(identifyAgriBusinessKind('poultry') === 'poultry', 'Raw string "poultry" maps to poultry');
assert(identifyAgriBusinessKind('goat_farming') === 'goat_farming', 'Raw string "goat_farming" maps to goat_farming');
assert(identifyAgriBusinessKind('fish_farming') === 'fish_farming', 'Raw string "fish_farming" maps to fish_farming');
assert(identifyAgriBusinessKind('mushroom_farming') === 'mushroom_farming', 'Raw string "mushroom_farming" maps to mushroom_farming');
assert(identifyAgriBusinessKind('vegetable_cultivation') === 'vegetable_cultivation', 'Raw string "vegetable_cultivation" maps to vegetable_cultivation');
assert(identifyAgriBusinessKind('fruit_cultivation') === 'fruit_cultivation', 'Raw string "fruit_cultivation" maps to fruit_cultivation');
assert(identifyAgriBusinessKind('floriculture') === 'floriculture', 'Raw string "floriculture" maps to floriculture');
assert(identifyAgriBusinessKind('beekeeping') === 'beekeeping', 'Raw string "beekeeping" maps to beekeeping');
assert(identifyAgriBusinessKind('vermicomposting') === 'vermicomposting', 'Raw string "vermicomposting" maps to vermicomposting');

// -----------------------------------------------------------------------------
// TEST SUITE 16: FINANCIAL ENGINE ZERO-DISTORTION AUDIT
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 16: Financial Engine Zero-Distortion Invariance');

const mushroomTemplate = BUSINESS_TEMPLATES.find((b) => b.id === 'ent_mushroom')!;
const gunturIntel = locationGisService.getDistrictData('Andhra Pradesh', 'Guntur');

// Test multiple capital levels
const testCapitals = [50000, 100000, 250000, 500000];

for (const cap of testCapitals) {
  const planWithoutGis = calculateBusinessPlanForCapital(mushroomTemplate, cap);
  const planWithGis = calculateBusinessPlanForCapital(mushroomTemplate, cap, undefined, gunturIntel);

  assert(
    planWithoutGis.projectCost === planWithGis.projectCost,
    `Capital ₹${cap}: Project cost invariant (₹${planWithoutGis.projectCost} === ₹${planWithGis.projectCost})`
  );
  assert(
    planWithoutGis.workingCapital === planWithGis.workingCapital,
    `Capital ₹${cap}: Working capital invariant`
  );
  assert(
    planWithoutGis.financingGap === planWithGis.financingGap,
    `Capital ₹${cap}: Financing gap invariant (₹${planWithoutGis.financingGap})`
  );
  assert(
    planWithoutGis.monthlyRevenue === planWithGis.monthlyRevenue,
    `Capital ₹${cap}: Monthly revenue invariant (₹${planWithoutGis.monthlyRevenue})`
  );
  assert(
    planWithoutGis.monthlyOpex === planWithGis.monthlyOpex,
    `Capital ₹${cap}: Monthly OPEX invariant (₹${planWithoutGis.monthlyOpex})`
  );
  assert(
    planWithoutGis.monthlyNetProfit === planWithGis.monthlyNetProfit,
    `Capital ₹${cap}: Monthly net profit invariant (₹${planWithoutGis.monthlyNetProfit})`
  );
  assert(
    planWithoutGis.monthlyEmi === planWithGis.monthlyEmi,
    `Capital ₹${cap}: Monthly EMI invariant (₹${planWithoutGis.monthlyEmi})`
  );
  assert(
    planWithoutGis.dscr === planWithGis.dscr,
    `Capital ₹${cap}: DSCR invariant (${planWithoutGis.dscr})`
  );
  assert(
    planWithoutGis.affordabilityTier === planWithGis.affordabilityTier,
    `Capital ₹${cap}: Affordability tier invariant (${planWithoutGis.affordabilityTier})`
  );
}

// -----------------------------------------------------------------------------
// FINAL SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`🏁 PHASE 6 VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
if (failedTests > 0) {
  console.error(`💥 ${failedTests} TESTS FAILED`);
  process.exit(1);
} else {
  console.log('🎉 ALL PHASE 6 PRODUCTION & ARCHITECTURAL REQUIREMENTS VERIFIED!');
  console.log('================================================================\n');
}
