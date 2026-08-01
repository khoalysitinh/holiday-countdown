/**
 * History Procedural Question Generator — Extended Edition
 * Vietnam + World History — 100% English questions. ~15 generator types.
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
  const pool = shuffle([...new Set([correct, ...wrongs])]).slice(0, 4);
  if (!pool.includes(correct)) pool[0] = correct;
  const choices = shuffle(pool);
  return { choices, answerIndex: choices.indexOf(correct) };
}

export const historyGenerators = [
  // 1. Bach Dang River Battles
  {
    level: 'basic',
    generate: () => {
      const battles = [
        { general: 'Ngo Quyen', year: '938', enemy: 'Southern Han', detail: 'using iron-tipped wooden stakes planted underwater to destroy enemy ships at low tide' },
        { general: 'Tran Hung Dao', year: '1288', enemy: 'Mongol-Yuan', detail: 'using the same stake tactic to decisively defeat the Mongol naval fleet' }
      ];
      const b = sample(battles);
      const askType = sample(['general', 'year', 'enemy', 'tactic']);
      let question, correct, distractors;
      if (askType === 'general') {
        question = `Which Vietnamese general defeated the ${b.enemy} fleet at the Battle of Bach Dang River in ${b.year}?`;
        correct = b.general;
        distractors = ['Ly Thuong Kiet', 'Le Loi', 'Nguyen Hue (Quang Trung)', 'Dinh Bo Linh'];
      } else if (askType === 'year') {
        question = `In which year did General ${b.general} defeat the ${b.enemy} invaders at the Battle of Bach Dang River?`;
        correct = b.year;
        distractors = ['905', '1010', '1076', '1427'];
      } else if (askType === 'enemy') {
        question = `General ${b.general} won the famous Battle of Bach Dang River in ${b.year} against which invading force?`;
        correct = b.enemy;
        distractors = ['Tang Dynasty', 'French Army', 'Cham Kingdom', 'Ming Dynasty'];
      } else {
        question = `What key military tactic did ${b.general} use to defeat the ${b.enemy} at the Bach Dang River in ${b.year}?`;
        correct = 'Iron-tipped wooden stakes hidden underwater';
        distractors = ['Guerrilla ambushes in forests', 'Fire ships to burn enemy fleet', 'Elephant cavalry charge', 'Poisoned arrows from riverbanks'];
      }
      const { choices, answerIndex } = makeChoices4(correct, ...distractors.filter(d => d !== correct));
      return {
        id: `h_bd_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'history', level: 'basic', topicName: 'History',
        question, options: choices, answerIndex,
        explanationEn: `General ${b.general} won the Battle of Bach Dang River in ${b.year}, ${b.detail}. This victory repelled the ${b.enemy} invasion and is one of Vietnam's most celebrated military triumphs.`,
        explanationVi: `Tướng ${b.general} chiến thắng trận Bạch Đằng năm ${b.year} bằng cách ${b.detail}. Đây là một trong những chiến thắng quân sự vĩ đại nhất lịch sử Việt Nam.`,
        vocabulary: [{ word: 'naval battle', type: 'n', vi: 'trận chiến trên sông/biển' }, { word: 'repelled', type: 'v (past)', vi: 'đẩy lùi' }, { word: 'invaders', type: 'n', vi: 'quân xâm lược' }]
      };
    }
  },

  // 2. Vietnam's Declaration of Independence
  {
    level: 'basic',
    generate: () => {
      const questions = [
        { q: `On which date did President Ho Chi Minh read the Declaration of Independence, establishing the Democratic Republic of Vietnam?`, correct: 'September 2, 1945', dist: ['August 19, 1945', 'April 30, 1975', 'July 2, 1976', 'March 8, 1965'] },
        { q: `Where did Ho Chi Minh formally read the Declaration of Independence of Vietnam on September 2, 1945?`, correct: 'Ba Dinh Square, Hanoi', dist: ['Hoan Kiem Lake', 'Reunification Palace, Saigon', 'Ho Chi Minh Mausoleum', 'Thang Long Citadel'] },
        { q: `What did the Declaration of Independence on September 2, 1945 officially establish?`, correct: 'The Democratic Republic of Vietnam', dist: ['The French Indochina Federation', 'The Socialist Republic of Vietnam', 'The Kingdom of Vietnam', 'The Republic of South Vietnam'] }
      ];
      const sel = sample(questions);
      const { choices, answerIndex } = makeChoices4(sel.correct, ...sel.dist);
      return {
        id: `h_indep_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'history', level: 'basic', topicName: 'History',
        question: sel.q, options: choices, answerIndex,
        explanationEn: `On September 2, 1945, President Ho Chi Minh delivered the Declaration of Independence at Ba Dinh Square in Hanoi, founding the Democratic Republic of Vietnam and ending French colonial rule.`,
        explanationVi: `Ngày 2 tháng 9 năm 1945, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình, Hà Nội, thành lập nước Việt Nam Dân chủ Cộng hòa.`,
        vocabulary: [{ word: 'Declaration of Independence', type: 'n', vi: 'Tuyên ngôn Độc lập' }, { word: 'colonial rule', type: 'n', vi: 'ách đô hộ thực dân' }]
      };
    }
  },

  // 3. Battle of Dien Bien Phu
  {
    level: 'intermediate',
    generate: () => {
      const qs = [
        { q: `In which year did the Battle of Dien Bien Phu take place, marking the end of French colonial rule in Indochina?`, correct: '1954', dist: ['1945', '1968', '1975', '1950'] },
        { q: `The Battle of Dien Bien Phu in 1954 resulted in a decisive victory for which armed force?`, correct: `The Viet Minh (People's Army of Vietnam)`, dist: ['The French Expeditionary Corps', 'US Armed Forces', 'The Viet Cong (NLF)', 'Chinese PLA troops'] },
        { q: `Which Vietnamese military commander masterminded the siege strategy at the Battle of Dien Bien Phu (1954)?`, correct: 'General Vo Nguyen Giap', dist: ['Ho Chi Minh', 'Le Duan', 'Tran Hung Dao', 'Nguyen Chi Thanh'] },
        { q: `The 1954 Geneva Accords, which followed the Battle of Dien Bien Phu, temporarily divided Vietnam at which latitude?`, correct: 'The 17th Parallel', dist: ['The 38th Parallel', 'The 22nd Parallel', 'The 10th Parallel', 'The Mekong River boundary'] }
      ];
      const sel = sample(qs);
      const { choices, answerIndex } = makeChoices4(sel.correct, ...sel.dist);
      return {
        id: `h_dbp_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'history', level: 'intermediate', topicName: 'History',
        question: sel.q, options: choices, answerIndex,
        explanationEn: `The Battle of Dien Bien Phu (March–May 1954) was a decisive battle in which General Vo Nguyen Giap's Viet Minh forces besieged and defeated the French garrison, ending the First Indochina War.`,
        explanationVi: `Chiến dịch Điện Biên Phủ (tháng 3–5/1954) do Đại tướng Võ Nguyên Giáp chỉ huy, đánh bại thực dân Pháp, chấm dứt cuộc chiến tranh Đông Dương lần thứ nhất.`,
        vocabulary: [{ word: 'siege', type: 'n/v', vi: 'vây hãm, bao vây' }, { word: 'decisive', type: 'adj', vi: 'quyết định, quan trọng' }, { word: 'mastermind', type: 'v', vi: 'lên kế hoạch chủ chốt' }]
      };
    }
  },

  // 4. Ho Chi Minh Trail
  {
    level: 'intermediate',
    generate: () => {
      const qs = [
        { q: `The "Ho Chi Minh Trail" during the Vietnam War was primarily used for what purpose?`, correct: `Supplying North Vietnamese troops and weapons to southern battlefields`, dist: ['Evacuating civilians from combat zones', 'Transporting US military equipment to northern bases', 'Providing a trade route for rice and goods', 'A communication cable network'] },
        { q: `Which neighbouring countries did the Ho Chi Minh Trail pass through, besides Vietnam?`, correct: 'Laos and Cambodia', dist: ['Thailand and Myanmar', 'China and Thailand', 'Cambodia and Thailand', 'Laos and China'] }
      ];
      const sel = sample(qs);
      const { choices, answerIndex } = makeChoices4(sel.correct, ...sel.dist);
      return {
        id: `h_hcmt_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'history', level: 'intermediate', topicName: 'History',
        question: sel.q, options: choices, answerIndex,
        explanationEn: `The Ho Chi Minh Trail was a vast network of jungle roads and paths running through Laos and Cambodia used by North Vietnam to supply weapons and troops to the south during the Vietnam War.`,
        explanationVi: `Đường mòn Hồ Chí Minh là mạng lưới đường rừng chạy qua Lào và Campuchia, được Bắc Việt Nam sử dụng để vận chuyển vũ khí và binh sĩ vào chiến trường miền Nam.`,
        vocabulary: [{ word: 'supply route', type: 'n', vi: 'tuyến đường tiếp tế' }, { word: 'combat zone', type: 'n', vi: 'vùng chiến sự' }]
      };
    }
  },

  // 5. Ancient Civilizations
  {
    level: 'intermediate',
    generate: () => {
      const civs = [
        { name: 'Ancient Egypt', wonders: 'the Great Pyramid of Giza and the Sphinx', river: 'the Nile', writing: 'hieroglyphics', period: 'around 3100 BCE' },
        { name: 'Ancient Mesopotamia', wonders: 'the Hanging Gardens of Babylon and Hammurabi\'s Code', river: 'the Tigris and Euphrates', writing: 'cuneiform', period: 'around 3500 BCE' },
        { name: 'Ancient Greece', wonders: 'the Parthenon and the Olympic Games', river: 'the Aegean Sea coastline', writing: 'the Greek alphabet', period: 'around 800 BCE' },
        { name: 'The Indus Valley Civilization', wonders: 'the cities of Mohenjo-Daro and Harappa', river: 'the Indus River', writing: 'Indus script', period: 'around 2600 BCE' },
        { name: 'Ancient Rome', wonders: 'the Colosseum and the Roman road network', river: 'the Tiber', writing: 'Latin', period: 'around 753 BCE' }
      ];
      const civ = sample(civs);
      const askType = sample(['wonder', 'river', 'writing', 'period', 'name']);
      let q, correct, dist;
      if (askType === 'wonder') {
        q = `Which ancient civilization is credited with creating ${civ.wonders}?`;
        correct = civ.name;
        dist = civs.filter(c => c.name !== civ.name).map(c => c.name);
      } else if (askType === 'river') {
        q = `${civ.name} flourished along which body of water?`;
        correct = civ.river;
        dist = civs.filter(c => c.name !== civ.name).map(c => c.river);
      } else if (askType === 'writing') {
        q = `Which writing system was developed by ${civ.name}?`;
        correct = civ.writing;
        dist = civs.filter(c => c.name !== civ.name).map(c => c.writing);
      } else if (askType === 'period') {
        q = `${civ.name} is believed to have emerged ${civ.period}. What other civilisation emerged in a similar era, known for ${civs.find(c=>c.name!==civ.name)?.wonders}?`;
        const other = civs.find(c => c.name !== civ.name);
        correct = other.name;
        dist = civs.filter(c => c.name !== other.name).map(c => c.name);
      } else {
        q = `Which civilisation, famous for ${civ.wonders}, thrived ${civ.period} along ${civ.river}?`;
        correct = civ.name;
        dist = civs.filter(c => c.name !== civ.name).map(c => c.name);
      }
      const { choices, answerIndex } = makeChoices4(correct, ...dist.slice(0, 3));
      return {
        id: `h_civ_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'history', level: 'intermediate', topicName: 'History',
        question: q, options: choices, answerIndex,
        explanationEn: `${civ.name} emerged ${civ.period}, situated along ${civ.river}. It is known for ${civ.wonders} and used ${civ.writing} as its writing system.`,
        explanationVi: `${civ.name} nổi lên vào ${civ.period}, định cư dọc theo ${civ.river}, nổi tiếng với ${civ.wonders} và hệ thống chữ viết ${civ.writing}.`,
        vocabulary: [{ word: 'civilization', type: 'n', vi: 'nền văn minh' }, { word: 'flourished', type: 'v (past)', vi: 'phát triển rực rỡ' }, { word: 'credited with', type: 'phrase', vi: 'được ghi nhận về' }]
      };
    }
  },

  // 6. Industrial Revolution & Key Inventions
  {
    level: 'intermediate',
    generate: () => {
      const inventions = [
        { inv: 'movable-type printing press', inventor: 'Johannes Gutenberg', year: 'c. 1440', impact: 'making books affordable and spreading literacy across Europe' },
        { inv: 'improved steam engine', inventor: 'James Watt', year: '1769', impact: 'powering factories, mills, and locomotives during the Industrial Revolution' },
        { inv: 'incandescent light bulb', inventor: 'Thomas Edison', year: '1879', impact: 'revolutionizing indoor lighting and extending productive hours beyond sunset' },
        { inv: 'telephone', inventor: 'Alexander Graham Bell', year: '1876', impact: 'enabling real-time voice communication over long distances' },
        { inv: 'penicillin', inventor: 'Alexander Fleming', year: '1928', impact: 'ushering in the antibiotic era and saving millions of lives from bacterial infections' },
        { inv: 'transistor', inventor: 'Bardeen, Brattain & Shockley (Bell Labs)', year: '1947', impact: 'being the fundamental building block of all modern electronic devices' }
      ];
      const item = sample(inventions);
      const askType = sample(['inventor', 'invention', 'year', 'impact']);
      let q, correct, dist;
      if (askType === 'inventor') {
        q = `Who invented the ${item.inv} in ${item.year}, ${item.impact}?`;
        correct = item.inventor;
        dist = inventions.filter(i => i.inv !== item.inv).map(i => i.inventor);
      } else if (askType === 'invention') {
        q = `The ________, invented by ${item.inventor} in ${item.year}, is credited with ${item.impact}.`;
        correct = item.inv;
        dist = inventions.filter(i => i.inv !== item.inv).map(i => i.inv);
      } else if (askType === 'year') {
        q = `In approximately which year did ${item.inventor} introduce the ${item.inv}?`;
        correct = item.year;
        dist = inventions.filter(i => i.inv !== item.inv).map(i => i.year);
      } else {
        q = `What was the most significant impact of ${item.inventor}'s invention of the ${item.inv}?`;
        correct = `It transformed society by ${item.impact}`;
        dist = inventions.filter(i => i.inv !== item.inv).map(i => `It transformed society by ${i.impact}`);
      }
      const { choices, answerIndex } = makeChoices4(correct, ...dist.slice(0, 3));
      return {
        id: `h_inv_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'history', level: 'intermediate', topicName: 'History',
        question: q, options: choices, answerIndex,
        explanationEn: `${item.inventor} invented the ${item.inv} in ${item.year}, ${item.impact}.`,
        explanationVi: `${item.inventor} phát minh ra ${item.inv} vào ${item.year}, ${item.impact}.`,
        vocabulary: [{ word: 'revolutionizing', type: 'v (pres. part)', vi: 'cách mạng hóa' }, { word: 'ushering in', type: 'phrase', vi: 'mở ra kỷ nguyên mới' }, { word: 'fundamental', type: 'adj', vi: 'căn bản, nền tảng' }]
      };
    }
  },

  // 7. World Wars
  {
    level: 'advanced',
    generate: () => {
      const events = [
        { war: 'World War I', start: '1914', end: '1918', trigger: 'assassination of Archduke Franz Ferdinand in Sarajevo', treaty: 'Treaty of Versailles (1919)', alliance1: 'Triple Entente (UK, France, Russia)', alliance2: 'Triple Alliance (Germany, Austria-Hungary, Italy)' },
        { war: 'World War II', start: '1939', end: '1945', trigger: "Nazi Germany's invasion of Poland on September 1, 1939", treaty: 'German Instrument of Surrender (May 1945) & Japanese Surrender (Sep 1945)', alliance1: 'Allied Powers (US, UK, USSR, France)', alliance2: 'Axis Powers (Germany, Italy, Japan)' }
      ];
      const ev = sample(events);
      const askType = sample(['start', 'end', 'trigger', 'treaty', 'alliance']);
      let q, correct, dist;
      if (askType === 'start') {
        q = `In which year did ${ev.war} officially begin?`;
        correct = ev.start;
        dist = [ev.end, events.find(e => e.war !== ev.war)?.start, '1900', '1917'];
      } else if (askType === 'end') {
        q = `In which year did ${ev.war} officially come to an end?`;
        correct = ev.end;
        dist = [ev.start, events.find(e => e.war !== ev.war)?.end, '1950', '1943'];
      } else if (askType === 'trigger') {
        q = `What event directly triggered the outbreak of ${ev.war}?`;
        correct = ev.trigger;
        dist = [events.find(e => e.war !== ev.war)?.trigger, 'The sinking of the Lusitania cruise liner', 'The signing of the Molotov-Ribbentrop Pact', 'The Battle of Stalingrad'];
      } else if (askType === 'treaty') {
        q = `Which peace agreement formally ended ${ev.war}?`;
        correct = ev.treaty;
        dist = [events.find(e => e.war !== ev.war)?.treaty, 'Geneva Convention (1949)', 'Congress of Vienna (1815)', 'Treaty of Westphalia (1648)'];
      } else {
        q = `Which opposing alliances fought in ${ev.war}?`;
        correct = `${ev.alliance1} vs. ${ev.alliance2}`;
        dist = [`NATO vs. Warsaw Pact`, `${events.find(e => e.war !== ev.war)?.alliance1} vs. ${events.find(e => e.war !== ev.war)?.alliance2}`, `Ottoman Empire vs. British Empire`, `French Empire vs. Austro-Hungarian Empire`];
      }
      const { choices, answerIndex } = makeChoices4(correct, ...dist.filter(Boolean).slice(0, 3));
      return {
        id: `h_ww_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'history', level: 'advanced', topicName: 'History',
        question: q, options: choices, answerIndex,
        explanationEn: `${ev.war} began in ${ev.start} and ended in ${ev.end}. It was triggered by ${ev.trigger}. It concluded with ${ev.treaty}.`,
        explanationVi: `${ev.war} bắt đầu năm ${ev.start} và kết thúc năm ${ev.end}. Nguyên nhân châm ngòi: ${ev.trigger}. Kết thúc bằng: ${ev.treaty}.`,
        vocabulary: [{ word: 'outbreak', type: 'n', vi: 'sự bùng nổ (chiến tranh)' }, { word: 'allied powers', type: 'n', vi: 'phe Đồng minh' }, { word: 'surrender', type: 'n/v', vi: 'sự đầu hàng' }]
      };
    }
  },

  // 8. Cold War & Decolonization
  {
    level: 'advanced',
    generate: () => {
      const events = [
        { name: 'Berlin Wall', year: '1961 (built) / 1989 (fell)', significance: 'symbolized the Iron Curtain dividing communist East and democratic West Germany', askYear: '1989', dist: ['1968', '1975', '1991', '1962'] },
        { name: 'Cuban Missile Crisis', year: '1962', significance: 'brought the US and USSR to the brink of nuclear war over Soviet missiles deployed in Cuba', askYear: '1962', dist: ['1959', '1965', '1968', '1972'] },
        { name: 'Moon Landing (Apollo 11)', year: '1969', significance: 'marked the first time humans walked on the moon — astronaut Neil Armstrong being the first', askYear: '1969', dist: ['1965', '1972', '1961', '1968'] },
        { name: 'Dissolution of the Soviet Union', year: '1991', significance: 'ended the Cold War and led to the independence of 15 former Soviet republics', askYear: '1991', dist: ['1989', '1985', '1979', '1993'] }
      ];
      const ev = sample(events);
      const askType = sample(['year', 'significance', 'name']);
      let q, correct, dist;
      if (askType === 'year') {
        q = `In which year did the key event involving the ${ev.name} occur (the defining moment)?`;
        correct = ev.askYear;
        dist = ev.dist;
      } else if (askType === 'significance') {
        q = `What was the historical significance of the ${ev.name} in ${ev.askYear}?`;
        correct = `It ${ev.significance}`;
        dist = events.filter(e => e.name !== ev.name).map(e => `It ${e.significance}`);
      } else {
        q = `Which major Cold War event occurred in ${ev.askYear}, known for ${ev.significance.substring(0, 50)}...?`;
        correct = ev.name;
        dist = events.filter(e => e.name !== ev.name).map(e => e.name);
      }
      const { choices, answerIndex } = makeChoices4(correct, ...dist.slice(0, 3));
      return {
        id: `h_cw_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'history', level: 'advanced', topicName: 'History',
        question: q, options: choices, answerIndex,
        explanationEn: `The ${ev.name} (${ev.year}) was significant because it ${ev.significance}.`,
        explanationVi: `${ev.name} (${ev.year}) có ý nghĩa lịch sử quan trọng: ${ev.significance}.`,
        vocabulary: [{ word: 'Iron Curtain', type: 'n', vi: 'Bức màn Sắt (phân chia Đông-Tây trong Chiến tranh Lạnh)' }, { word: 'brink of', type: 'phrase', vi: 'bờ vực của' }, { word: 'dissolution', type: 'n', vi: 'sự tan rã, giải thể' }]
      };
    }
  },

  // 9. Vietnamese Dynasties
  {
    level: 'intermediate',
    generate: () => {
      const dynasties = [
        { name: 'Ly Dynasty', period: '1009–1225', capital: 'Thang Long (Hanoi)', achievement: 'establishing the first long-lasting independent Vietnamese state and building the Temple of Literature' },
        { name: 'Tran Dynasty', period: '1225–1400', capital: 'Thang Long', achievement: 'defeating the Mongol invasions three times and developing the nom script' },
        { name: 'Le Dynasty', period: '1428–1789', capital: 'Thang Long', achievement: 'liberating Vietnam from Ming Chinese rule and promulgating the Hong Duc Law Code' },
        { name: 'Nguyen Dynasty', period: '1802–1945', capital: 'Hue', achievement: 'being the last imperial dynasty of Vietnam before independence was declared in 1945' }
      ];
      const d = sample(dynasties);
      const askType = sample(['period', 'capital', 'achievement', 'name']);
      let q, correct, dist;
      if (askType === 'name') {
        q = `Which Vietnamese dynasty is known for ${d.achievement}, ruling from ${d.period}?`;
        correct = d.name;
        dist = dynasties.filter(x => x.name !== d.name).map(x => x.name);
      } else if (askType === 'period') {
        q = `During which historical period did the ${d.name} rule Vietnam?`;
        correct = d.period;
        dist = dynasties.filter(x => x.name !== d.name).map(x => x.period);
      } else if (askType === 'capital') {
        q = `What was the capital city during the ${d.name}?`;
        correct = d.capital;
        dist = dynasties.filter(x => x.name !== d.name).map(x => x.capital);
        dist.push('Saigon', 'Da Nang');
      } else {
        q = `The ${d.name} (${d.period}) is most celebrated for which accomplishment?`;
        correct = d.achievement;
        dist = dynasties.filter(x => x.name !== d.name).map(x => x.achievement);
      }
      const { choices, answerIndex } = makeChoices4(correct, ...dist.slice(0, 3));
      return {
        id: `h_vnd_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'history', level: 'intermediate', topicName: 'History',
        question: q, options: choices, answerIndex,
        explanationEn: `The ${d.name} ruled Vietnam from ${d.period} with ${d.capital} as the capital, notable for ${d.achievement}.`,
        explanationVi: `Triều đại ${d.name} cai trị Việt Nam từ ${d.period}, kinh đô là ${d.capital}, nổi bật vì ${d.achievement}.`,
        vocabulary: [{ word: 'dynasty', type: 'n', vi: 'triều đại' }, { word: 'promulgating', type: 'v', vi: 'ban hành (pháp luật)' }, { word: 'nom script', type: 'n', vi: 'chữ Nôm' }]
      };
    }
  },

  // 10. Great Explorers & Age of Discovery
  {
    level: 'advanced',
    generate: () => {
      const explorers = [
        { name: 'Christopher Columbus', year: '1492', achievement: 'reaching the Americas (Caribbean) while searching for a western route to Asia', nationality: 'Italian (sailed for Spain)' },
        { name: 'Ferdinand Magellan', year: '1519–1522', achievement: 'leading the first expedition to circumnavigate the globe', nationality: 'Portuguese (sailed for Spain)' },
        { name: 'Vasco da Gama', year: '1497–1498', achievement: 'discovering the sea route from Europe to India via the Cape of Good Hope', nationality: 'Portuguese' },
        { name: 'Marco Polo', year: '1271–1295', achievement: 'travelling the Silk Road to China and documenting Asian cultures in "The Travels of Marco Polo"', nationality: 'Italian (Venetian)' }
      ];
      const e = sample(explorers);
      const askType = sample(['name', 'year', 'achievement', 'nationality']);
      let q, correct, dist;
      if (askType === 'name') {
        q = `Which famous explorer, ${e.nationality}, is known for ${e.achievement}?`;
        correct = e.name;
        dist = explorers.filter(x => x.name !== e.name).map(x => x.name);
      } else if (askType === 'achievement') {
        q = `${e.name} (${e.year}) is primarily remembered for which historic achievement?`;
        correct = e.achievement;
        dist = explorers.filter(x => x.name !== e.name).map(x => x.achievement);
      } else {
        q = `What was the nationality of the explorer ${e.name}?`;
        correct = e.nationality;
        dist = explorers.filter(x => x.name !== e.name).map(x => x.nationality);
      }
      const { choices, answerIndex } = makeChoices4(correct, ...dist.slice(0, 3));
      return {
        id: `h_expl_${Date.now()}_${Math.floor(Math.random()*9999)}`, topic: 'history', level: 'advanced', topicName: 'History',
        question: q, options: choices, answerIndex,
        explanationEn: `${e.name} (${e.nationality}) is remembered for ${e.achievement} in ${e.year}.`,
        explanationVi: `${e.name} (${e.nationality}) được nhớ đến vì ${e.achievement} vào năm ${e.year}.`,
        vocabulary: [{ word: 'circumnavigate', type: 'v', vi: 'đi vòng quanh (thế giới)' }, { word: 'expedition', type: 'n', vi: 'đoàn thám hiểm, cuộc hành trình' }, { word: 'Silk Road', type: 'n', vi: 'Con đường Tơ lụa' }]
      };
    }
  }
];
