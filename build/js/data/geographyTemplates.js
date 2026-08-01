/**
 * Geography Procedural Question Generator — Extended Edition
 * World Geography, Vietnam Geography, Climate, Capitals — 100% English.
 */

function sample(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function makeChoices4(correct, ...wrongs) {
  const pool = [...new Set([correct, ...wrongs])].slice(0, 8);
  const choices = shuffle([correct, ...shuffle(pool.filter(p => p !== correct)).slice(0, 3)]);
  return { choices, answerIndex: choices.indexOf(correct) };
}

const WORLD_CAPITALS = [
  { country: 'Australia', capital: 'Canberra', trap: 'Sydney' },
  { country: 'Canada', capital: 'Ottawa', trap: 'Toronto' },
  { country: 'Brazil', capital: 'Brasília', trap: 'Rio de Janeiro' },
  { country: 'Japan', capital: 'Tokyo', trap: 'Osaka' },
  { country: 'Vietnam', capital: 'Hanoi', trap: 'Ho Chi Minh City' },
  { country: 'Turkey', capital: 'Ankara', trap: 'Istanbul' },
  { country: 'Switzerland', capital: 'Bern', trap: 'Zurich' },
  { country: 'Egypt', capital: 'Cairo', trap: 'Alexandria' },
  { country: 'Germany', capital: 'Berlin', trap: 'Munich' },
  { country: 'South Korea', capital: 'Seoul', trap: 'Busan' },
  { country: 'New Zealand', capital: 'Wellington', trap: 'Auckland' },
  { country: 'India', capital: 'New Delhi', trap: 'Mumbai' },
  { country: 'Pakistan', capital: 'Islamabad', trap: 'Karachi' },
  { country: 'South Africa', capital: 'Pretoria', trap: 'Cape Town' },
  { country: 'Kazakhstan', capital: 'Astana', trap: 'Almaty' },
  { country: 'Malaysia', capital: 'Kuala Lumpur', trap: 'Penang' },
  { country: 'Indonesia', capital: 'Jakarta', trap: 'Bali' },
  { country: 'Thailand', capital: 'Bangkok', trap: 'Chiang Mai' },
  { country: 'Argentina', capital: 'Buenos Aires', trap: 'Córdoba' },
  { country: 'Netherlands', capital: 'Amsterdam', trap: 'Rotterdam' }
];

export const geographyGenerators = [
  // 1. World Capitals — with trap answers (largest city ≠ capital)
  {
    level: 'basic',
    generate: () => {
      const item = sample(WORLD_CAPITALS);
      const distractor = WORLD_CAPITALS.filter(c => c.capital !== item.capital).map(c => sample([c.capital, c.trap]));
      const { choices, answerIndex } = makeChoices4(item.capital, item.trap, ...distractor);
      return {
        id: `g_cap_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'geography', level: 'basic', topicName: 'Geography',
        question: `What is the official capital city of ${item.country}?`,
        options: choices, answerIndex,
        explanationEn: `The capital of ${item.country} is ${item.capital}. Many people confuse it with ${item.trap}, which is the largest / most famous city, but NOT the official capital.`,
        explanationVi: `Thủ đô chính thức của ${item.country} là ${item.capital}. Nhiều người nhầm với ${item.trap} (thành phố lớn hơn / nổi tiếng hơn) nhưng không phải thủ đô.`,
        vocabulary: [{ word: 'official capital', type: 'n phrase', vi: 'thủ đô chính thức' }, { word: 'confuse with', type: 'phrase', vi: 'nhầm với' }]
      };
    }
  },

  // 2. Country-by-Capital (reverse lookup)
  {
    level: 'basic',
    generate: () => {
      const item = sample(WORLD_CAPITALS);
      const dist = WORLD_CAPITALS.filter(c => c.country !== item.country).map(c => c.country);
      const { choices, answerIndex } = makeChoices4(item.country, ...dist);
      return {
        id: `g_rev_cap_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'geography', level: 'basic', topicName: 'Geography',
        question: `${item.capital} is the capital city of which country?`,
        options: choices, answerIndex,
        explanationEn: `${item.capital} is the official capital of ${item.country}. A common distractor is ${item.trap}, which is a major city in the same country but not the capital.`,
        explanationVi: `${item.capital} là thủ đô của ${item.country}. ${item.trap} là thành phố lớn hơn nhưng không phải thủ đô.`,
        vocabulary: [{ word: 'capital city', type: 'n', vi: 'thủ đô' }, { word: 'major city', type: 'n', vi: 'thành phố lớn' }]
      };
    }
  },

  // 3. World's Oceans, Rivers & Mountains
  {
    level: 'intermediate',
    generate: () => {
      const features = [
        { name: 'The Pacific Ocean', type: 'ocean', fact: 'the largest and deepest ocean on Earth, covering more than 165 million km²', superlative: 'largest and deepest' },
        { name: 'The Nile River', type: 'river', fact: 'traditionally recognized as the longest river in the world at approximately 6,650 km', superlative: 'traditionally the longest' },
        { name: 'The Amazon River', type: 'river', fact: 'the river carrying the greatest volume of water of any river on Earth, flowing through South America', superlative: 'greatest discharge volume' },
        { name: 'Mount Everest', type: 'mountain', fact: 'the highest mountain peak on Earth at 8,848.86 m above sea level, located in the Himalayas on the Nepal-China border', superlative: 'highest above sea level' },
        { name: 'The Sahara Desert', type: 'desert', fact: 'the largest hot desert in the world, spanning approximately 9.2 million km² across North Africa', superlative: 'largest hot desert' },
        { name: 'The Mariana Trench', type: 'ocean trench', fact: 'the deepest point on Earth at approximately 11,000 m below sea level, located in the western Pacific Ocean', superlative: 'deepest point on Earth' },
        { name: 'Lake Baikal', type: 'lake', fact: 'the world\'s deepest and oldest freshwater lake, located in Siberia, Russia, containing about 20% of the world\'s unfrozen surface fresh water', superlative: 'deepest and oldest freshwater lake' },
        { name: 'The Antarctic Ice Sheet', type: 'ice sheet', fact: 'the largest single mass of ice on Earth, covering approximately 98% of Antarctica and containing 61% of all fresh water on Earth', superlative: 'largest mass of ice on Earth' }
      ];
      const f = sample(features);
      const askType = sample(['identify', 'fact', 'superlative']);
      let q, correct, dist;
      if (askType === 'identify') {
        q = `Which geographical feature is described as: "${f.fact}"?`;
        correct = f.name;
        dist = features.filter(x => x.name !== f.name).map(x => x.name);
      } else if (askType === 'superlative') {
        q = `Which geographical feature holds the record for being the "${f.superlative}"?`;
        correct = f.name;
        dist = features.filter(x => x.name !== f.name).map(x => x.name);
      } else {
        q = `Which statement correctly describes ${f.name}?`;
        correct = f.fact;
        dist = features.filter(x => x.name !== f.name).map(x => x.fact);
      }
      const { choices, answerIndex } = makeChoices4(correct, ...dist.slice(0, 3));
      return {
        id: `g_feat_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'geography', level: 'intermediate', topicName: 'Geography',
        question: q, options: choices, answerIndex,
        explanationEn: `${f.name} is ${f.fact}. It is notable for being the ${f.superlative}.`,
        explanationVi: `${f.name} là ${f.fact}. Đây là địa danh nổi tiếng nhất vì là ${f.superlative}.`,
        vocabulary: [{ word: 'discharge volume', type: 'n', vi: 'lưu lượng nước' }, { word: 'trench', type: 'n', vi: 'rãnh đại dương' }, { word: 'freshwater', type: 'adj/n', vi: 'nước ngọt' }]
      };
    }
  },

  // 4. Climate Zones
  {
    level: 'intermediate',
    generate: () => {
      const climates = [
        { zone: 'Tropical Monsoon', regions: 'Southeast Asia, southern India, and parts of West Africa', chars: 'high year-round temperatures, a distinct wet season with heavy rainfall, and high humidity' },
        { zone: 'Arid / Desert', regions: 'the Sahara, Arabian Peninsula, and Atacama Desert', chars: 'extremely low annual rainfall (< 250 mm), high daytime temperatures, and large diurnal temperature ranges' },
        { zone: 'Mediterranean', regions: 'southern Europe, California, and parts of southwestern Australia', chars: 'dry, hot summers and mild, wet winters with moderate rainfall' },
        { zone: 'Tundra', regions: 'northern Canada, Siberia, and Greenland', chars: 'permanently frozen subsoil (permafrost), very short summers, and treeless landscapes' },
        { zone: 'Temperate Oceanic', regions: 'western Europe and New Zealand', chars: 'mild temperatures year-round, frequent rainfall, and no extreme seasons' },
        { zone: 'Subarctic (Boreal)', regions: 'Canada and Russia', chars: 'very long, cold winters and short, warm summers with coniferous forest (taiga)' }
      ];
      const c = sample(climates);
      const askType = sample(['zone_by_chars', 'chars_by_zone', 'region_by_zone']);
      let q, correct, dist;
      if (askType === 'zone_by_chars') {
        q = `Which climate zone is characterized by ${c.chars}?`;
        correct = c.zone;
        dist = climates.filter(x => x.zone !== c.zone).map(x => x.zone);
      } else if (askType === 'chars_by_zone') {
        q = `The ${c.zone} climate zone is best described as having which of the following characteristics?`;
        correct = c.chars;
        dist = climates.filter(x => x.zone !== c.zone).map(x => x.chars);
      } else {
        q = `The ${c.zone} climate is typically found in which of the following regions?`;
        correct = c.regions;
        dist = climates.filter(x => x.zone !== c.zone).map(x => x.regions);
      }
      const { choices, answerIndex } = makeChoices4(correct, ...dist.slice(0, 3));
      return {
        id: `g_clim_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'geography', level: 'intermediate', topicName: 'Geography',
        question: q, options: choices, answerIndex,
        explanationEn: `The ${c.zone} climate is found in ${c.regions}. Its key characteristics include: ${c.chars}.`,
        explanationVi: `Khí hậu ${c.zone} thường gặp tại ${c.regions}. Đặc điểm chính: ${c.chars}.`,
        vocabulary: [{ word: 'permafrost', type: 'n', vi: 'tầng đất đóng băng vĩnh cửu' }, { word: 'diurnal range', type: 'n', vi: 'biên độ nhiệt ngày đêm' }, { word: 'coniferous', type: 'adj', vi: 'thuộc cây lá kim' }]
      };
    }
  },

  // 5. Continents — facts & demographics
  {
    level: 'intermediate',
    generate: () => {
      const continents = [
        { name: 'Asia', area: '44.6 million km²', population: 'over 4.7 billion', largest: 'Russia (partially)', feat: 'the largest and most populous continent on Earth' },
        { name: 'Africa', area: '30.4 million km²', population: 'about 1.4 billion', largest: 'Algeria', feat: 'the continent with the most sovereign nations (54) and the second largest by area' },
        { name: 'North America', area: '24.7 million km²', population: 'about 600 million', largest: 'Canada', feat: 'the third largest continent, home to the world\'s largest freshwater system (Great Lakes)' },
        { name: 'South America', area: '17.8 million km²', population: 'about 430 million', largest: 'Brazil', feat: 'the continent containing the Amazon Rainforest, the world\'s largest tropical rainforest' },
        { name: 'Europe', area: '10.5 million km²', population: 'about 750 million', largest: 'Russia (partially)', feat: 'the continent that gave rise to the Industrial Revolution and modern democracy' },
        { name: 'Australia (Oceania)', area: '7.7 million km²', population: 'about 44 million', largest: 'Australia', feat: 'the smallest continent by land area, entirely surrounded by ocean' },
        { name: 'Antarctica', area: '14 million km²', population: 'no permanent population', largest: 'N/A', feat: 'the coldest, windiest, and driest continent, containing 90% of the world\'s ice' }
      ];
      const c = sample(continents);
      const askType = sample(['name', 'fact', 'largest', 'area']);
      let q, correct, dist;
      if (askType === 'name') {
        q = `Which continent is described as "${c.feat}"?`;
        correct = c.name;
        dist = continents.filter(x => x.name !== c.name).map(x => x.name);
      } else if (askType === 'fact') {
        q = `Which of the following statements correctly describes ${c.name}?`;
        correct = c.feat;
        dist = continents.filter(x => x.name !== c.name).map(x => x.feat);
      } else if (askType === 'largest') {
        q = `What is the largest country (by area) located in ${c.name}?`;
        correct = c.largest;
        dist = continents.filter(x => x.name !== c.name && x.largest !== 'N/A').map(x => x.largest);
      } else {
        q = `Approximately what is the total land area of ${c.name}?`;
        correct = c.area;
        dist = continents.filter(x => x.name !== c.name).map(x => x.area);
      }
      const { choices, answerIndex } = makeChoices4(correct, ...dist.slice(0, 3));
      return {
        id: `g_cont_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'geography', level: 'intermediate', topicName: 'Geography',
        question: q, options: choices, answerIndex,
        explanationEn: `${c.name} covers an area of ${c.area} and has a population of ${c.population}. It is notable as ${c.feat}.`,
        explanationVi: `${c.name} có diện tích ${c.area} và dân số ${c.population}. Nổi bật: ${c.feat}.`,
        vocabulary: [{ word: 'sovereign nations', type: 'n', vi: 'các quốc gia có chủ quyền' }, { word: 'populous', type: 'adj', vi: 'đông dân' }, { word: 'tropical rainforest', type: 'n', vi: 'rừng nhiệt đới' }]
      };
    }
  },

  // 6. Vietnam's Geography
  {
    level: 'basic',
    generate: () => {
      const facts = [
        { q: `Which is the longest river entirely within Vietnam?`, correct: 'The Dong Nai River', dist: ['The Red River', 'The Mekong River', 'The Perfume River', 'The Ma River'] },
        { q: `What is the highest mountain peak in Vietnam and Indochina?`, correct: 'Fansipan (3,147 m) in Lao Cai Province', dist: ['Bach Ma Mountain', 'Ngoc Linh Peak (2,598 m)', 'Lang Biang Mountain', 'Pu Luong Peak'] },
        { q: `The Mekong Delta in southern Vietnam is primarily known for producing which agricultural product?`, correct: 'Rice (Vietnam is one of the world\'s top rice exporters)', dist: ['Coffee (the Central Highlands produce the most coffee)', 'Sugarcane', 'Rubber', 'Cotton'] },
        { q: `Which UNESCO World Natural Heritage Site in Vietnam is famous for its thousands of limestone karst islands?`, correct: 'Ha Long Bay', dist: ['Phong Nha-Ke Bang National Park', 'Cuc Phuong National Park', 'Cat Tien National Park', 'Bach Ma National Park'] },
        { q: `Vietnam shares its longest land border with which neighboring country?`, correct: 'China (border length: ~1,281 km)', dist: ['Laos (~2,130 km)', 'Cambodia (~1,270 km)', 'Thailand', 'Myanmar'] },
        { q: `How many provinces and municipalities does Vietnam officially have as of 2024?`, correct: '63 provinces and municipalities', dist: ['54 provinces', '71 provinces', '58 provinces', '50 provinces'] },
        { q: `The Central Highlands (Tay Nguyen) of Vietnam is a major producer of which globally traded commodity?`, correct: 'Coffee (Vietnam is the world\'s 2nd largest coffee exporter)', dist: ['Tin ore', 'Coal', 'Rubber only', 'Tropical fruits only'] }
      ];
      const sel = sample(facts);
      const { choices, answerIndex } = makeChoices4(sel.correct, ...sel.dist.slice(0, 3));
      return {
        id: `g_vnm_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'geography', level: 'basic', topicName: 'Geography',
        question: sel.q, options: choices, answerIndex,
        explanationEn: `Answer: ${sel.correct}. This is an important fact about Vietnam's physical and economic geography.`,
        explanationVi: `Đáp án: ${sel.correct}. Đây là một thông tin quan trọng về địa lý Việt Nam.`,
        vocabulary: [{ word: 'karst', type: 'n/adj', vi: 'địa hình đá vôi' }, { word: 'exporter', type: 'n', vi: 'nước xuất khẩu' }, { word: 'heritage site', type: 'n', vi: 'di sản thế giới' }]
      };
    }
  },

  // 7. Wonders of the World
  {
    level: 'intermediate',
    generate: () => {
      const wonders = [
        { name: 'The Great Wall of China', country: 'China', built: '7th century BCE – 17th century CE', fact: 'stretching over 21,000 km, it was built to protect Chinese states from nomadic invasions' },
        { name: 'Machu Picchu', country: 'Peru', built: '15th century CE', fact: 'an Inca citadel set high in the Andes Mountains, abandoned during the Spanish Conquest and rediscovered in 1911' },
        { name: 'The Taj Mahal', country: 'India', built: '1632–1653', fact: 'a white marble mausoleum built by Mughal Emperor Shah Jahan for his wife Mumtaz Mahal' },
        { name: 'Chichen Itza', country: 'Mexico', built: '600–900 CE', fact: 'an ancient Mayan city featuring the famous El Castillo pyramid, aligned with the summer solstice' },
        { name: 'The Colosseum', country: 'Italy', built: '72–80 CE', fact: 'an ancient amphitheater in Rome that could hold 50,000–80,000 spectators for gladiatorial contests' },
        { name: 'Petra', country: 'Jordan', built: 'from 4th century BCE', fact: 'an ancient city famous for its rock-cut architecture, particularly the Treasury (Al-Khazneh)' },
        { name: 'Christ the Redeemer', country: 'Brazil', built: '1922–1931', fact: 'a colossal Art Deco statue of Jesus Christ standing 30 meters tall atop Corcovado Mountain in Rio de Janeiro' }
      ];
      const w = sample(wonders);
      const askType = sample(['country', 'name', 'fact']);
      let q, correct, dist;
      if (askType === 'country') {
        q = `In which country can you find the Wonder of the World "${w.name}"?`;
        correct = w.country;
        dist = wonders.filter(x => x.name !== w.name).map(x => x.country);
      } else if (askType === 'fact') {
        q = `Which of the Seven Wonders of the World is described as: "${w.fact}"?`;
        correct = w.name;
        dist = wonders.filter(x => x.name !== w.name).map(x => x.name);
      } else {
        q = `Which remarkable landmark in ${w.country}, built around ${w.built}, is famous for: ${w.fact.substring(0, 60)}...?`;
        correct = w.name;
        dist = wonders.filter(x => x.name !== w.name).map(x => x.name);
      }
      const { choices, answerIndex } = makeChoices4(correct, ...dist.slice(0, 3));
      return {
        id: `g_wow_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'geography', level: 'intermediate', topicName: 'Geography',
        question: q, options: choices, answerIndex,
        explanationEn: `${w.name} is located in ${w.country}, built around ${w.built}. ${w.fact}.`,
        explanationVi: `${w.name} nằm ở ${w.country}, được xây dựng vào khoảng ${w.built}. ${w.fact}.`,
        vocabulary: [{ word: 'mausoleum', type: 'n', vi: 'lăng mộ' }, { word: 'citadel', type: 'n', vi: 'pháo đài, thành trì' }, { word: 'nomadic', type: 'adj', vi: 'du mục' }]
      };
    }
  },

  // 8. Natural Disasters & Earth Science
  {
    level: 'advanced',
    generate: () => {
      const topics = [
        { q: `Which layer of the Earth's structure is responsible for generating the planet's magnetic field?`, correct: 'The outer core (liquid iron and nickel)', dist: ['The inner core', 'The mantle', 'The crust', 'The asthenosphere'] },
        { q: `What geological process causes the continents to slowly drift across Earth's surface over millions of years?`, correct: 'Tectonic plate movement (Continental Drift)', dist: ['Volcanic eruptions', 'Oceanic tidal forces', 'Earth\'s axial rotation', 'Solar wind pressure'] },
        { q: `The "Ring of Fire" in the Pacific Ocean is notable for which geographical characteristic?`, correct: 'It hosts approximately 90% of the world\'s earthquakes and 75% of its volcanoes', dist: ['It is the deepest part of any ocean', 'It contains the world\'s strongest ocean currents', 'It is a belt of coral reefs', 'It is a zone of highest tsunami frequency only'] },
        { q: `Which scale is used to measure the moment magnitude of earthquakes?`, correct: 'Richter Scale / Moment Magnitude Scale (Mw)', dist: ['The Beaufort Scale', 'The Saffir-Simpson Scale', 'The Fujita Scale', 'The Mercalli Intensity Scale'] },
        { q: `What causes a tsunami?`, correct: 'Undersea earthquakes, volcanic eruptions, or landslides that displace large volumes of ocean water', dist: ['Extremely powerful ocean storms (hurricanes)', 'High tides caused by the moon\'s gravitational pull', 'Strong underwater ocean currents', 'Rapid changes in ocean surface temperature'] }
      ];
      const sel = sample(topics);
      const { choices, answerIndex } = makeChoices4(sel.correct, ...sel.dist.slice(0, 3));
      return {
        id: `g_earth_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'geography', level: 'advanced', topicName: 'Geography',
        question: sel.q, options: choices, answerIndex,
        explanationEn: `Correct: ${sel.correct}.`,
        explanationVi: `Đáp án: ${sel.correct}.`,
        vocabulary: [{ word: 'tectonic plates', type: 'n', vi: 'mảng kiến tạo địa tầng' }, { word: 'magnitude', type: 'n', vi: 'cường độ (động đất)' }, { word: 'displace', type: 'v', vi: 'dịch chuyển, đẩy ra khỏi chỗ' }]
      };
    }
  }
];
