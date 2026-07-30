/**
 * Geography Procedural Question Generator
 * Generates dynamic geography, capitals, physical geography, and natural wonders questions in English.
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const geographyGenerators = [
  // 1. World Capitals (Basic)
  {
    level: 'basic',
    generate: () => {
      const countries = [
        { country: 'Australia', capital: 'Canberra', trick: 'Sydney' },
        { country: 'Canada', capital: 'Ottawa', trick: 'Toronto' },
        { country: 'Brazil', capital: 'Brasília', trick: 'Rio de Janeiro' },
        { country: 'Japan', capital: 'Tokyo', trick: 'Kyoto' },
        { country: 'Vietnam', capital: 'Hanoi', trick: 'Ho Chi Minh City' },
        { country: 'Turkey', capital: 'Ankara', trick: 'Istanbul' },
        { country: 'Switzerland', capital: 'Bern', trick: 'Zurich' },
        { country: 'Egypt', capital: 'Cairo', trick: 'Alexandria' },
        { country: 'Germany', capital: 'Berlin', trick: 'Munich' },
        { country: 'South Korea', capital: 'Seoul', trick: 'Busan' }
      ];

      const item = sample(countries);
      const questionText = `What is the official capital city of ${item.country}?`;

      const correctAns = item.capital;
      const distractors = [item.trick];
      
      countries.forEach(c => {
        if (c.capital !== item.capital && !distractors.includes(c.capital)) {
          distractors.push(c.capital);
        }
      });

      const choices = shuffle([correctAns, ...shuffle(distractors.filter(d => d !== correctAns)).slice(0, 3)]);
      const answerIndex = choices.indexOf(correctAns);

      return {
        id: `geo_cap_${Date.now()}_${randInt(100, 999)}`,
        topic: 'geography',
        level: 'basic',
        topicName: 'Địa lý (Geography)',
        question: questionText,
        options: choices,
        answerIndex,
        explanationEn: `The official capital of ${item.country} is ${item.capital}. Note that many people confuse it with ${item.trick}, which is its largest/most famous economic center.`,
        explanationVi: `Thủ đô chính thức của ${item.country} là ${item.capital}. Lưu ý nhiều người hay nhầm với ${item.trick} (thành phố đông dân/nổi tiếng hơn).`,
        vocabulary: [
          { word: 'official capital', type: 'noun phrase', vi: 'thủ đô chính thức' },
          { word: 'economic center', type: 'noun phrase', vi: 'trung tâm kinh tế' }
        ]
      };
    }
  },

  // 2. Physical Geography & Earth Features (Basic - Intermediate)
  {
    level: 'intermediate',
    generate: () => {
      const physicalFeatures = [
        { feature: 'The Amazon River', category: 'river', detail: 'located in South America, carrying the largest volume of water of any river on Earth' },
        { feature: 'The Nile River', category: 'river', detail: 'traditionally recognized as the longest river in the world, flowing through northeastern Africa' },
        { feature: 'Mount Everest', category: 'mountain peak', detail: 'located in the Himalayas on the border between Nepal and China, measuring 8,848 meters above sea level' },
        { feature: 'The Pacific Ocean', category: 'ocean', detail: 'the largest and deepest ocean on Earth, covering more area than all landmasses combined' },
        { feature: 'The Sahara Desert', category: 'desert', detail: 'the largest hot desert in the world, spanning across North Africa' },
        { feature: 'Ha Long Bay', category: 'UNESCO bay', detail: 'famous for its thousands of towering limestone karst islands in northern Vietnam' }
      ];

      const item = sample(physicalFeatures);
      const qText = `Which global geographical feature is ${item.detail}?`;

      const correctAns = item.feature;
      const distractors = physicalFeatures.map(f => f.feature).filter(f => f !== correctAns);
      distractors.push('The Atlantic Ocean', 'The Grand Canyon', 'K2 Mountain');

      const choices = shuffle([correctAns, ...shuffle(distractors.filter(d => d !== correctAns)).slice(0, 3)]);
      const answerIndex = choices.indexOf(correctAns);

      return {
        id: `geo_phys_${Date.now()}_${randInt(100, 999)}`,
        topic: 'geography',
        level: 'intermediate',
        topicName: 'Địa lý (Geography)',
        question: qText,
        options: choices,
        answerIndex,
        explanationEn: `${item.feature} is ${item.detail}.`,
        explanationVi: `${item.feature} là địa danh ${item.detail}.`,
        vocabulary: [
          { word: 'landmasses', type: 'noun', vi: 'các khối lục địa/vùng đất' },
          { word: 'limestone karst', type: 'noun phrase', vi: 'núi đá vôi' },
          { word: 'towering', type: 'adjective', vi: 'cao sừng sững' }
        ]
      };
    }
  },

  // 3. Climate Zones & Meteorology (Intermediate - Advanced)
  {
    level: 'intermediate',
    generate: () => {
      const climates = [
        { zone: 'Tropical Monsoon', desc: 'characterized by high temperatures, heavy seasonal rainfall, and high humidity, typical of Southeast Asia' },
        { zone: 'Arid / Desert', desc: 'defined by extremely low precipitation, high daily temperature fluctuations, and sparse vegetation' },
        { zone: 'Mediterranean', desc: 'features dry, hot summers and mild, wet winters, prevalent around Southern Europe' },
        { zone: 'Tundra', desc: 'characterized by permanently frozen subsoil (permafrost) and cold, tree-less landscapes near polar regions' }
      ];

      const item = sample(climates);
      const qText = `The climate zone ________ is ${item.desc}.`;

      const correctAns = item.zone;
      const distractors = climates.map(c => c.zone).filter(z => z !== correctAns);
      distractors.push('Subtropical Oceanic', 'Subarctic Continental');

      const choices = shuffle([correctAns, ...shuffle(distractors.filter(d => d !== correctAns)).slice(0, 3)]);
      const answerIndex = choices.indexOf(correctAns);

      return {
        id: `geo_clim_${Date.now()}_${randInt(100, 999)}`,
        topic: 'geography',
        level: 'intermediate',
        topicName: 'Địa lý (Geography)',
        question: qText,
        options: choices,
        answerIndex,
        explanationEn: `The ${item.zone} climate zone is ${item.desc}.`,
        explanationVi: `Vùng khí hậu ${item.zone} là kiểu khí hậu ${item.desc}.`,
        vocabulary: [
          { word: 'precipitation', type: 'noun', vi: 'lượng mưa / sa lắng khí hậu' },
          { word: 'permafrost', type: 'noun', vi: 'tầng đất đóng băng vĩnh cửu' },
          { word: 'sparse vegetation', type: 'noun phrase', vi: 'thảm thực vật thưa thớt' }
        ]
      };
    }
  },

  // 4. Continents & Demographics (Advanced)
  {
    level: 'advanced',
    generate: () => {
      const stats = [
        { fact: 'Asia', aspect: 'the largest continent by both total land area and population (housing over 60% of world human population)' },
        { fact: 'Antarctica', aspect: 'the coldest, windiest, and driest continent, containing 90% of the Earth’s fresh water ice' },
        { fact: 'Africa', aspect: 'the second-largest continent and home to the highest number of sovereign nations (54 countries)' },
        { fact: 'Australia (Oceania)', aspect: 'the smallest continent by land area, completely surrounded by the Indian and Pacific Oceans' }
      ];

      const item = sample(stats);
      const qText = `Which continent is recognized as ${item.aspect}?`;

      const correctAns = item.fact;
      const distractors = ['Asia', 'Europe', 'Africa', 'North America', 'South America', 'Antarctica', 'Australia (Oceania)'].filter(c => c !== correctAns);

      const choices = shuffle([correctAns, ...shuffle(distractors).slice(0, 3)]);
      const answerIndex = choices.indexOf(correctAns);

      return {
        id: `geo_demo_${Date.now()}_${randInt(100, 999)}`,
        topic: 'geography',
        level: 'advanced',
        topicName: 'Địa lý (Geography)',
        question: qText,
        options: choices,
        answerIndex,
        explanationEn: `${item.fact} is ${item.aspect}.`,
        explanationVi: `${item.fact} là châu lục ${item.aspect}.`,
        vocabulary: [
          { word: 'sovereign nations', type: 'noun phrase', vi: 'các quốc gia có chủ quyền' },
          { word: 'fresh water ice', type: 'noun phrase', vi: 'băng nước ngọt' },
          { word: 'surrounded by', type: 'phrase', vi: 'được bao quanh bởi' }
        ]
      };
    }
  }
];
