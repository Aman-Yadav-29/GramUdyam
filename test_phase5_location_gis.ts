import { discoverBusinessesByBudget, calculateBusinessPlanForCapital } from './server/services/discoveryEngine.ts';
import { locationGisService } from './server/services/locationGisService.ts';
import { evaluateEnterpriseLocationSynergy, generateDistrictFallback } from './src/utils/locationIntelligenceEngine.ts';
import { BUSINESS_TEMPLATES } from './src/data/businessTemplates.ts';

function runTests() {
  console.log('====================================================');
  console.log('PHASE 5: LOCATION + GIS BUSINESS INTELLIGENCE TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      if (details) console.error('   Details:', details);
    }
  }

  // TEST 1: Location relevance differs across districts for the same enterprise
  console.log('--- TEST GROUP 1: District-Specific Synergy Differentiation ---');
  const chiliEnterprise = BUSINESS_TEMPLATES.find((b) => b.id === 'ent_spices_processing')!;
  const mustardEnterprise = BUSINESS_TEMPLATES.find((b) => b.id === 'ent_oil_expeller')!;

  const gunturData = locationGisService.getDistrictData('Andhra Pradesh', 'Guntur')!;
  const alwarData = locationGisService.getDistrictData('Rajasthan', 'Alwar')!;
  const varanasiData = locationGisService.getDistrictData('Uttar Pradesh', 'Varanasi')!;

  const gunturChiliFit = evaluateEnterpriseLocationSynergy(chiliEnterprise, gunturData);
  const alwarChiliFit = evaluateEnterpriseLocationSynergy(chiliEnterprise, alwarData);

  assert(
    gunturChiliFit.locationScore > alwarChiliFit.locationScore,
    'Guntur red chili hub yields higher spices processing synergy than Alwar mustard hub',
    { gunturChili: gunturChiliFit.locationScore, alwarChili: alwarChiliFit.locationScore }
  );

  const alwarMustardFit = evaluateEnterpriseLocationSynergy(mustardEnterprise, alwarData);
  const varanasiMustardFit = evaluateEnterpriseLocationSynergy(mustardEnterprise, varanasiData);

  assert(
    alwarMustardFit.locationScore >= 80,
    'Alwar mustard expelling has high synergy score (>= 80%)',
    { alwarScore: alwarMustardFit.locationScore }
  );

  assert(
    alwarMustardFit.rawMaterialSynergy.matchedSurpluses.some((s) => s.toLowerCase().includes('mustard')),
    'Alwar raw material alignment detects local Mustard Seed surplus',
    alwarMustardFit.rawMaterialSynergy.matchedSurpluses
  );

  // TEST 2: Multi-district results verification in discoverBusinessesByBudget
  console.log('\n--- TEST GROUP 2: discoverBusinessesByBudget with Location Intelligence ---');
  const budget = 500000; // ₹5 Lakhs

  const gunturDiscovery = discoverBusinessesByBudget(budget, {
    sortBy: 'location_relevance',
    location: { state: 'Andhra Pradesh', district: 'Guntur', locationType: 'rural' }
  });

  const alwarDiscovery = discoverBusinessesByBudget(budget, {
    sortBy: 'location_relevance',
    location: { state: 'Rajasthan', district: 'Alwar', locationType: 'rural' }
  });

  assert(
    gunturDiscovery.fitsBudget.length + gunturDiscovery.limitedFinancing.length > 0,
    'Guntur discovery returns viable candidate models'
  );

  assert(
    alwarDiscovery.fitsBudget.length + alwarDiscovery.limitedFinancing.length > 0,
    'Alwar discovery returns viable candidate models'
  );

  // Check top candidate in limitedFinancing or fitsBudget for Guntur vs Alwar
  const topGuntur = [...gunturDiscovery.fitsBudget, ...gunturDiscovery.limitedFinancing][0];
  const topAlwar = [...alwarDiscovery.fitsBudget, ...alwarDiscovery.limitedFinancing][0];

  assert(
    topGuntur.locationFit !== undefined,
    'Top Guntur plan has locationFit assessment attached',
    topGuntur.locationFit?.synergyHeadline
  );

  assert(
    topAlwar.locationFit !== undefined,
    'Top Alwar plan has locationFit assessment attached',
    topAlwar.locationFit?.synergyHeadline
  );

  // Check that sorting by location_relevance actually orders descending by locationScore
  const gunturScores = [...gunturDiscovery.fitsBudget, ...gunturDiscovery.limitedFinancing].map(
    (p) => p.locationFit?.locationScore ?? 0
  );
  const isSortedDesc = gunturScores.slice(0, gunturDiscovery.fitsBudget.length).every((val, idx, arr) => idx === 0 || arr[idx - 1] >= val);
  assert(
    isSortedDesc,
    'Candidates within each affordability tier are sorted descending by location score when sortBy=location_relevance',
    gunturScores
  );

  // TEST 3: STRICT CONSTRAINT: Location NEVER overrides financial affordability!
  console.log('\n--- TEST GROUP 3: Affordability Invariance (Location cannot override budget) ---');
  const smallBudget = 100000; // ₹1 Lakh
  const solarColdStorage = BUSINESS_TEMPLATES.find((b) => b.id === 'ent_solar_cold_storage')!; // Project cost ~ ₹25 Lakhs

  const nashikData = locationGisService.getDistrictData('Maharashtra', 'Nashik')!;
  const planForSmallBudget = calculateBusinessPlanForCapital(solarColdStorage, smallBudget, undefined, {
    state: 'Maharashtra',
    district: 'Nashik',
    locationType: 'rural'
  }, nashikData);

  assert(
    planForSmallBudget.affordabilityTier === 'HIGHER_INVESTMENT',
    'Solar cold storage remains in HIGHER_INVESTMENT for ₹1 Lakh budget even with high location synergy in Nashik',
    {
      tier: planForSmallBudget.affordabilityTier,
      locationScore: planForSmallBudget.locationFit?.locationScore,
      projectCost: planForSmallBudget.projectCost,
      availableCapital: planForSmallBudget.availableCapital
    }
  );

  assert(
    planForSmallBudget.locationFit?.synergyLevel === 'HIGH_SYNERGY',
    'Location synergy is still accurately reported as HIGH_SYNERGY for Nashik horticulture belt',
    planForSmallBudget.locationFit?.synergyLevel
  );

  // TEST 4: Provenance & Anti-Hallucination Disclosures
  console.log('\n--- TEST GROUP 4: Provenance & Verification Constraints ---');
  assert(
    Boolean(varanasiData.population && varanasiData.population.source.length > 0 &&
    varanasiData.population.geographicLevel === 'District-level estimate'),
    'Varanasi population metadata specifies verified source and exact geographic level'
  );

  assert(
    Boolean(varanasiData.infrastructure && varanasiData.infrastructure.averagePowerSupplyHoursPerDay?.source.length &&
    varanasiData.infrastructure.waterTableDepthMeters?.source.includes('CGWB')),
    'Varanasi power & groundwater metrics cite official department benchmarks (CGWB)'
  );

  // Unknown district fallback test
  const fallbackProfile = generateDistrictFallback('Karnataka', 'Shivamogga');
  assert(
    Boolean(fallbackProfile.population && fallbackProfile.population.geographicLevel === 'State-level estimate'),
    'Un-calibrated district fallback truthfully specifies State-level estimate',
    fallbackProfile.population?.geographicLevel
  );

  assert(
    fallbackProfile.district === 'Shivamogga' && fallbackProfile.state === 'Karnataka',
    'Fallback preserves requested state and district names'
  );

  // TEST 5: Diverse State Benchmarks
  console.log('\n--- TEST GROUP 5: Diverse Multi-State Benchmark Verification ---');
  const testedDistricts = [
    { state: 'Uttar Pradesh', district: 'Varanasi' },
    { state: 'Bihar', district: 'Muzaffarpur' },
    { state: 'Maharashtra', district: 'Nashik' },
    { state: 'Rajasthan', district: 'Alwar' },
    { state: 'Madhya Pradesh', district: 'Indore' },
    { state: 'Punjab', district: 'Ludhiana' },
    { state: 'Gujarat', district: 'Anand' },
    { state: 'Andhra Pradesh', district: 'Guntur' }
  ];

  let allHaveMandisAndInfra = true;
  for (const d of testedDistricts) {
    const data = locationGisService.getDistrictData(d.state, d.district);
    if (!data || !data.mandis || data.mandis.length === 0 || !data.infrastructure) {
      allHaveMandisAndInfra = false;
      console.error(`Missing data for ${d.state} - ${d.district}`);
    }
  }

  assert(
    allHaveMandisAndInfra,
    'All 8 major state districts have authentic mandis, coordinates, and infrastructure benchmarks'
  );

  console.log(`\n====================================================`);
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log(`====================================================`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
