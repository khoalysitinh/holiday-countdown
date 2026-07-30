/**
 * History Procedural Question Generator
 * Generates dynamic World and Vietnam History questions in English with randomized distractor choices and grammar structures.
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

export const historyGenerators = [
  // 1. Battle of Bach Dang (Basic)
  {
    level: 'basic',
    generate: () => {
      const leaders = [
        { name: 'Ngo Quyen', year: 938, enemy: 'Southern Han navy' },
        { name: 'Tran Hung Dao', year: 1288, enemy: 'Mongol Yuan fleet' }
      ];
      const selected = sample(leaders);

      const questionTemplates = [
        `In ${selected.year}, General ${selected.name} decisively defeated the invading ${selected.enemy} on which historic river in Vietnam?`,
        `Which legendary Vietnamese commander defeated the ${selected.enemy} in ${selected.year} by using wooden stakes hidden underwater?`
      ];

      const questionText = sample(questionTemplates);
      const isCommanderQuestion = questionText.includes('Which legendary Vietnamese commander');

      const correctAns = isCommanderQuestion ? selected.name : 'Bach Dang River';
      const distractors = isCommanderQuestion
        ? ['Ly Thuong Kiet', 'Le Loi', 'Quang Trung', 'Tran Quan Cong']
        : ['Red River', 'Mekong River', 'Perfume River', 'Gianh River'];

      const filteredDistractors = distractors.filter(d => d !== correctAns);
      const choices = shuffle([correctAns, ...shuffle(filteredDistractors).slice(0, 3)]);
      const answerIndex = choices.indexOf(correctAns);

      return {
        id: `hist_bd_${Date.now()}_${randInt(100, 999)}`,
        topic: 'history',
        level: 'basic',
        topicName: 'Lịch sử (History)',
        question: questionText,
        options: choices,
        answerIndex,
        explanationEn: `General ${selected.name} commanded the historic Battle of Bach Dang River in ${selected.year}, placing iron-tipped wooden stakes under water to destroy enemy ships during high-tide traps.`,
        explanationVi: `Tướng ${selected.name} đã chỉ huy trận chiến sông Bạch Đằng lịch sử năm ${selected.year}, cắm cọc gỗ đầu bọc sắt dưới lòng sông để tiêu diệt chiến thuyền địch khi thủy triều rút.`,
        vocabulary: [
          { word: 'decisively defeated', type: 'verb phrase', vi: 'đánh bại hoàn toàn/quyết định' },
          { word: 'invading', type: 'adjective', vi: 'xâm lược' },
          { word: 'wooden stakes', type: 'noun phrase', vi: 'cọc gỗ' },
          { word: 'underwater', type: 'adverb', vi: 'dưới nước' }
        ]
      };
    }
  },

  // 2. Declaration of Independence 1945 (Basic)
  {
    level: 'basic',
    generate: () => {
      const dates = [
        { date: 'September 2, 1945', location: 'Ba Dinh Square', leader: 'President Ho Chi Minh', doc: 'Declaration of Independence' }
      ];
      const item = dates[0];
      const qTypes = [
        {
          q: `On ${item.date}, ${item.leader} read the famous ________ of Vietnam at ${item.location}.`,
          correct: 'Declaration of Independence',
          options: ['Declaration of Independence', 'Treaty of Versailles', 'Emancipation Proclamation', 'Magna Carta']
        },
        {
          q: `Where did ${item.leader} read the Declaration of Independence of the Democratic Republic of Vietnam on ${item.date}?`,
          correct: 'Ba Dinh Square',
          options: ['Ba Dinh Square', 'Hoan Kiem Lake', 'Reunification Palace', 'Hanoi Citadel']
        }
      ];

      const sel = sample(qTypes);
      const choices = shuffle(sel.options);
      const answerIndex = choices.indexOf(sel.correct);

      return {
        id: `hist_indep_${Date.now()}_${randInt(100, 999)}`,
        topic: 'history',
        level: 'basic',
        topicName: 'Lịch sử (History)',
        question: sel.q,
        options: choices,
        answerIndex,
        explanationEn: `On September 2, 1945, President Ho Chi Minh read the Declaration of Independence at Ba Dinh Square, establishing the Democratic Republic of Vietnam.`,
        explanationVi: `Vào ngày 2 tháng 9 năm 1945, Chủ tịch Hồ Chí Minh đã đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình, khai sinh nước Việt Nam Dân chủ Cộng hòa.`,
        vocabulary: [
          { word: 'Declaration of Independence', type: 'noun phrase', vi: 'Tuyên ngôn Độc lập' },
          { word: 'establishing', type: 'verb (participle)', vi: 'thành lập, khởi đầu' }
        ]
      };
    }
  },

  // 3. Ancient Civilizations & Wonders (Intermediate)
  {
    level: 'intermediate',
    generate: () => {
      const civs = [
        { civ: 'Ancient Egypt', wonder: 'The Great Pyramid of Giza', detail: 'built as pharaoh tombs along the Nile River' },
        { civ: 'Ancient Rome', wonder: 'The Colosseum', detail: 'used for gladiatorial contests and public spectacles' },
        { civ: 'Mesopotamia', wonder: 'The Hanging Gardens of Babylon', detail: 'considered one of the Seven Wonders of the Ancient World' },
        { civ: 'Ancient Greece', wonder: 'The Parthenon', detail: 'built on the Acropolis dedicated to the goddess Athena' }
      ];

      const item = sample(civs);
      const askCiv = Math.random() > 0.5;

      const questionText = askCiv
        ? `Which ancient civilization constructed ${item.wonder}, which was ${item.detail}?`
        : `Which monumental structure was created by ${item.civ} and ${item.detail}?`;

      const correctAns = askCiv ? item.civ : item.wonder;
      const distractors = askCiv
        ? ['Ancient Egypt', 'Ancient Rome', 'Mesopotamia', 'Ancient Greece', 'Mayan Empire', 'Inca Empire']
        : ['The Great Pyramid of Giza', 'The Colosseum', 'The Hanging Gardens of Babylon', 'The Parthenon', 'Taj Mahal'];

      const choices = shuffle([correctAns, ...shuffle(distractors.filter(d => d !== correctAns)).slice(0, 3)]);
      const answerIndex = choices.indexOf(correctAns);

      return {
        id: `hist_civ_${Date.now()}_${randInt(100, 999)}`,
        topic: 'history',
        level: 'intermediate',
        topicName: 'Lịch sử (History)',
        question: questionText,
        options: choices,
        answerIndex,
        explanationEn: `${item.wonder} was created by ${item.civ}. Key historical fact: ${item.detail}.`,
        explanationVi: `${item.wonder} được xây dựng bởi ${item.civ}. Thông tin lịch sử chốt: ${item.detail}.`,
        vocabulary: [
          { word: 'civilization', type: 'noun', vi: 'nền văn minh' },
          { word: 'monumental', type: 'adjective', vi: 'vĩ đại, thuộc monument' },
          { word: 'dedicated to', type: 'phrase', vi: 'dành riêng/dâng tặng cho' }
        ]
      };
    }
  },

  // 4. Industrial Revolution & Inventions (Intermediate - Advanced)
  {
    level: 'intermediate',
    generate: () => {
      const inventions = [
        { inventor: 'Johannes Gutenberg', invention: 'movable type printing press', century: '15th century (c. 1440)', impact: 'revolutionized the spread of literacy and knowledge across Europe' },
        { inventor: 'James Watt', invention: 'improved steam engine', century: '18th century (1776)', impact: 'powered the First Industrial Revolution and modernized factory transportation' },
        { inventor: 'Thomas Edison', invention: 'commercially practical incandescent light bulb', century: '19th century (1879)', impact: 'transformed indoor lighting and global industry' },
        { inventor: 'Alexander Graham Bell', invention: 'telephone', century: '19th century (1876)', impact: 'revolutionized long-distance telecommunications' }
      ];

      const item = sample(inventions);
      const qText = `The ________, invented by ${item.inventor} in the ${item.century}, ${item.impact}.`;

      const correctAns = item.invention;
      const allInventions = inventions.map(i => i.invention);
      allInventions.push('telegraph machine', 'cotton gin', 'internal combustion engine');

      const choices = shuffle([correctAns, ...shuffle(allInventions.filter(i => i !== correctAns)).slice(0, 3)]);
      const answerIndex = choices.indexOf(correctAns);

      return {
        id: `hist_inv_${Date.now()}_${randInt(100, 999)}`,
        topic: 'history',
        level: 'intermediate',
        topicName: 'Lịch sử (History)',
        question: qText,
        options: choices,
        answerIndex,
        explanationEn: `${item.inventor} invented the ${item.invention} in the ${item.century}, which ${item.impact}.`,
        explanationVi: `${item.inventor} đã phát minh ra ${item.invention} vào ${item.century}, điều này đã ${item.impact}.`,
        vocabulary: [
          { word: 'revolutionized', type: 'verb', vi: 'cách mạng hóa' },
          { word: 'spread of literacy', type: 'noun phrase', vi: 'sự lan rộng của tri thức / biết chữ' },
          { word: 'incandescent', type: 'adjective', vi: 'phát sáng, sợi đốt' }
        ]
      };
    }
  },

  // 5. World War II & Modern History (Advanced)
  {
    level: 'advanced',
    generate: () => {
      const events = [
        { year: '1945', event: 'End of World War II', detail: 'marked by the official surrender of Axis powers and the creation of the United Nations' },
        { year: '1969', event: 'Apollo 11 Moon Landing', detail: 'when astronaut Neil Armstrong became the first human to walk on the lunar surface' },
        { year: '1989', event: 'Fall of the Berlin Wall', detail: 'symbolizing the decline of the Cold War division in Europe' },
        { year: '1954', event: 'Battle of Dien Bien Phu', detail: 'ending French colonial rule in Indochina' }
      ];

      const item = sample(events);
      const askYear = Math.random() > 0.5;

      const questionText = askYear
        ? `In which historic year did the ${item.event} take place, ${item.detail}?`
        : `Which significant historical event occurred in ${item.year}, ${item.detail}?`;

      const correctAns = askYear ? item.year : item.event;

      let distractors = [];
      if (askYear) {
        const y = parseInt(item.year);
        distractors = [`${y - 5}`, `${y + 4}`, `${y - 10}`, `${y + 12}`];
      } else {
        distractors = events.filter(e => e.event !== item.event).map(e => e.event);
        distractors.push('Signing of the Treaty of Versailles', 'Cuban Missile Crisis');
      }

      const choices = shuffle([correctAns, ...shuffle(distractors.filter(d => d !== correctAns)).slice(0, 3)]);
      const answerIndex = choices.indexOf(correctAns);

      return {
        id: `hist_ww2_${Date.now()}_${randInt(100, 999)}`,
        topic: 'history',
        level: 'advanced',
        topicName: 'Lịch sử (History)',
        question: questionText,
        options: choices,
        answerIndex,
        explanationEn: `The ${item.event} occurred in ${item.year}. Detail: ${item.detail}.`,
        explanationVi: `Sự kiện ${item.event} diễn ra vào năm ${item.year}. Chi tiết: ${item.detail}.`,
        vocabulary: [
          { word: 'official surrender', type: 'noun phrase', vi: 'sự đầu hàng chính thức' },
          { word: 'colonial rule', type: 'noun phrase', vi: 'ách thống trị thực dân' },
          { word: 'symbolizing', type: 'verb (participle)', vi: 'tượng trưng cho' }
        ]
      };
    }
  }
];
