/**
 * Math & Logic Procedural Question Generator — Extended Edition
 * 15+ generator types with randomized values, names, contexts. 100% English.
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
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
function makeChoices(correct, ...wrongs) {
  const all = Array.from(new Set([correct, ...wrongs])).map(v => (typeof v === 'number' ? Math.round(v * 100) / 100 : v));
  const uniq = [...new Set(all)];
  while (uniq.length < 4) uniq.push(correct + randInt(5, 30) * (Math.random() > 0.5 ? 1 : -1));
  const choices = shuffle(uniq.slice(0, 4));
  const answerIndex = choices.indexOf(correct);
  return { choices, answerIndex };
}

const NAMES = ['Alice', 'Bob', 'Carlos', 'Diana', 'Ethan', 'Fiona', 'George', 'Hannah', 'Ivan', 'Julia', 'Kevin', 'Laura', 'Michael', 'Nina', 'Oscar'];
const PRODUCTS = ['laptop', 'smartphone', 'camera', 'jacket', 'pair of shoes', 'bicycle', 'smartwatch', 'tablet', 'headphones', 'gaming console', 'air purifier', 'coffee machine'];
const VEHICLES = ['train', 'car', 'motorbike', 'express bus', 'delivery truck', 'passenger van'];
const PLACES = ['rectangular garden', 'office floor', 'conference room', 'warehouse', 'parking lot', 'rooftop terrace', 'classroom', 'basketball court'];
const JOBS = ['painter', 'bricklayer', 'plumber', 'electrician', 'programmer', 'data analyst', 'carpenter'];

export const mathGenerators = [
  // 1. Discount & Final Price
  {
    level: 'basic',
    generate: () => {
      const product = sample(PRODUCTS);
      const original = randInt(5, 80) * 10;
      const disc = sample([5, 10, 15, 20, 25, 30, 35, 40, 50]);
      const saving = original * disc / 100;
      const final = original - saving;
      const { choices, answerIndex } = makeChoices(final, original - disc, final + saving / 2, final - 10, original * (1 + disc / 100));
      return {
        id: `m_disc_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'basic', topicName: 'Math & Logic',
        question: `A ${product} originally priced at $${original} is on sale with a ${disc}% discount. What is the final price you need to pay?`,
        options: choices.map(c => `$${c}`), answerIndex,
        explanationEn: `Discount amount = $${original} × ${disc}% = $${saving}. Final price = $${original} − $${saving} = $${final}.`,
        explanationVi: `Số tiền giảm = $${original} × ${disc}% = $${saving}. Giá cuối = $${original} − $${saving} = $${final}.`,
        vocabulary: [{ word: 'discount', type: 'n', vi: 'chiết khấu, giảm giá' }, { word: 'on sale', type: 'phrase', vi: 'đang giảm giá' }]
      };
    }
  },

  // 2. Percentage Increase / Tax
  {
    level: 'basic',
    generate: () => {
      const product = sample(PRODUCTS);
      const base = randInt(20, 200) * 5;
      const taxPct = sample([5, 8, 10, 12, 15, 20]);
      const tax = base * taxPct / 100;
      const total = base + tax;
      const { choices, answerIndex } = makeChoices(total, base + taxPct, total - tax / 2, base * 2, total + 10);
      return {
        id: `m_tax_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'basic', topicName: 'Math & Logic',
        question: `The base price of a ${product} is $${base}. A ${taxPct}% sales tax is applied. What is the total amount to be paid?`,
        options: choices.map(c => `$${c}`), answerIndex,
        explanationEn: `Tax = $${base} × ${taxPct}% = $${tax}. Total = $${base} + $${tax} = $${total}.`,
        explanationVi: `Thuế = $${base} × ${taxPct}% = $${tax}. Tổng cộng = $${base} + $${tax} = $${total}.`,
        vocabulary: [{ word: 'sales tax', type: 'n', vi: 'thuế doanh thu' }, { word: 'applied', type: 'adj', vi: 'được áp dụng' }]
      };
    }
  },

  // 3. Profit & Loss
  {
    level: 'basic',
    generate: () => {
      const product = sample(PRODUCTS);
      const cost = randInt(10, 80) * 10;
      const sell = cost + randInt(2, 25) * 5;
      const profit = sell - cost;
      const profitPct = Math.round((profit / cost) * 100);
      const askProfit = Math.random() > 0.5;
      const correct = askProfit ? profit : profitPct;
      const { choices, answerIndex } = makeChoices(correct, correct + 10, correct - 5, correct * 2, correct + cost / 10);
      return {
        id: `m_profit_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'basic', topicName: 'Math & Logic',
        question: askProfit
          ? `A trader buys a ${product} for $${cost} and sells it for $${sell}. What is the profit made?`
          : `A trader buys a ${product} for $${cost} and sells it for $${sell}. What is the profit percentage?`,
        options: askProfit ? choices.map(c => `$${c}`) : choices.map(c => `${c}%`), answerIndex,
        explanationEn: `Profit = $${sell} − $${cost} = $${profit}. Profit% = ($${profit} / $${cost}) × 100 = ${profitPct}%.`,
        explanationVi: `Lợi nhuận = $${sell} − $${cost} = $${profit}. Tỷ lệ lợi nhuận = ($${profit} / $${cost}) × 100 = ${profitPct}%.`,
        vocabulary: [{ word: 'profit', type: 'n', vi: 'lợi nhuận' }, { word: 'trader', type: 'n', vi: 'thương nhân' }]
      };
    }
  },

  // 4. Speed, Distance & Time — asking different unknowns
  {
    level: 'intermediate',
    generate: () => {
      const vehicle = sample(VEHICLES);
      const speed = randInt(4, 14) * 10;
      const time = sample([1, 1.5, 2, 2.5, 3, 3.5, 4, 5]);
      const distance = speed * time;
      const askType = sample(['distance', 'speed', 'time']);
      let question, correct, explanation;
      if (askType === 'distance') {
        correct = distance;
        question = `A ${vehicle} travels at ${speed} km/h for ${time} hours. What is the total distance covered?`;
        explanation = `Distance = Speed × Time = ${speed} × ${time} = ${distance} km.`;
      } else if (askType === 'speed') {
        correct = speed;
        question = `A ${vehicle} covers ${distance} km in ${time} hours at a constant speed. What is its speed?`;
        explanation = `Speed = Distance ÷ Time = ${distance} ÷ ${time} = ${speed} km/h.`;
      } else {
        correct = time;
        question = `A ${vehicle} travelling at ${speed} km/h needs to cover ${distance} km. How many hours will the journey take?`;
        explanation = `Time = Distance ÷ Speed = ${distance} ÷ ${speed} = ${time} hours.`;
      }
      const unit = askType === 'distance' ? 'km' : askType === 'speed' ? 'km/h' : 'hours';
      const { choices, answerIndex } = makeChoices(correct, correct + speed / 2, correct + time, correct * 2, correct - time);
      return {
        id: `m_spd_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'intermediate', topicName: 'Math & Logic',
        question, options: choices.map(c => `${c} ${unit}`), answerIndex,
        explanationEn: explanation,
        explanationVi: `${askType === 'distance' ? 'Quãng đường = Vận tốc × Thời gian' : askType === 'speed' ? 'Vận tốc = Quãng đường ÷ Thời gian' : 'Thời gian = Quãng đường ÷ Vận tốc'} = ${correct} ${unit}.`,
        vocabulary: [{ word: 'constant speed', type: 'n phrase', vi: 'vận tốc không đổi' }, { word: 'cover', type: 'v', vi: 'đi qua, bao phủ' }]
      };
    }
  },

  // 5. Two Vehicles Meeting / Catching Up
  {
    level: 'intermediate',
    generate: () => {
      const s1 = randInt(4, 8) * 10;
      const s2 = randInt(s1 / 10 + 1, 12) * 10;
      const dist = randInt(3, 12) * 50;
      const scenario = Math.random() > 0.5 ? 'towards' : 'catchup';
      let question, correct, explanationEn, explanationVi;
      if (scenario === 'towards') {
        const t = dist / (s1 + s2);
        correct = parseFloat(t.toFixed(2));
        question = `Vehicle A travels at ${s1} km/h and Vehicle B travels at ${s2} km/h towards each other from two points ${dist} km apart. How many hours will it take them to meet?`;
        explanationEn = `They approach at a combined speed of ${s1} + ${s2} = ${s1 + s2} km/h. Time = ${dist} ÷ ${s1 + s2} = ${correct} hours.`;
        explanationVi = `Họ tiến lại nhau với tốc độ tổng hợp = ${s1 + s2} km/h. Thời gian gặp nhau = ${dist} ÷ ${s1 + s2} = ${correct} giờ.`;
      } else {
        const gap = randInt(2, 8) * 10;
        const t = gap / (s2 - s1);
        correct = parseFloat(t.toFixed(2));
        question = `Runner A runs at ${s1} km/h. Runner B starts ${gap} km behind at ${s2} km/h in the same direction. How many hours before B catches A?`;
        explanationEn = `Closing speed = ${s2} − ${s1} = ${s2 - s1} km/h. Time = ${gap} ÷ ${s2 - s1} = ${correct} hours.`;
        explanationVi = `Tốc độ thu ngắn khoảng cách = ${s2} − ${s1} = ${s2 - s1} km/h. Thời gian đuổi kịp = ${gap} ÷ ${s2 - s1} = ${correct} giờ.`;
      }
      const { choices, answerIndex } = makeChoices(correct, correct + 0.5, correct + 1, correct * 2, correct - 0.5);
      return {
        id: `m_meet_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'intermediate', topicName: 'Math & Logic',
        question, options: choices.map(c => `${c} hours`), answerIndex,
        explanationEn, explanationVi,
        vocabulary: [{ word: 'towards each other', type: 'phrase', vi: 'đi về phía nhau' }, { word: 'closing speed', type: 'n', vi: 'tốc độ thu gần' }]
      };
    }
  },

  // 6. Work Rate — two or three workers
  {
    level: 'intermediate',
    generate: () => {
      const n1 = sample(NAMES), n2 = sample(NAMES.filter(n => n !== n1));
      const h1 = randInt(2, 8) * 2;
      const h2 = randInt(2, 8) * 2;
      const combined = (h1 * h2) / (h1 + h2);
      const correct = parseFloat(combined.toFixed(2));
      const { choices, answerIndex } = makeChoices(correct, (h1 + h2) / 2, h1 + h2, Math.min(h1, h2) - 1, correct + 2);
      return {
        id: `m_work_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'intermediate', topicName: 'Math & Logic',
        question: `${n1} can finish a task in ${h1} hours. ${n2} can finish the same task in ${h2} hours. How long will it take if they work together?`,
        options: choices.map(c => `${c} hours`), answerIndex,
        explanationEn: `Combined rate = 1/${h1} + 1/${h2} = ${h1 + h2}/${h1 * h2}. Time together = ${h1 * h2}/${h1 + h2} ≈ ${correct} hours.`,
        explanationVi: `Tốc độ ghép = 1/${h1} + 1/${h2} = ${h1+h2}/${h1*h2}. Thời gian làm chung ≈ ${correct} giờ.`,
        vocabulary: [{ word: 'work together', type: 'phrase', vi: 'làm việc cùng nhau' }, { word: 'rate', type: 'n', vi: 'năng suất' }]
      };
    }
  },

  // 7. Area & Perimeter (multiple shapes)
  {
    level: 'basic',
    generate: () => {
      const place = sample(PLACES);
      const shape = sample(['rectangle', 'square', 'triangle', 'circle']);
      let question, correct, wrong1, wrong2, wrong3, unit, expEn, expVi;
      if (shape === 'square') {
        const s = randInt(5, 20);
        const ask = Math.random() > 0.5 ? 'area' : 'perimeter';
        correct = ask === 'area' ? s * s : 4 * s;
        wrong1 = ask === 'area' ? 4 * s : s * s;
        wrong2 = correct + s;
        wrong3 = correct - s;
        unit = ask === 'area' ? 'm²' : 'm';
        question = `A ${ask === 'area' ? 'square' : 'square'} floor has sides of ${s} m. What is its ${ask}?`;
        expEn = ask === 'area' ? `Area = side² = ${s}² = ${correct} m²` : `Perimeter = 4 × side = 4 × ${s} = ${correct} m`;
        expVi = ask === 'area' ? `Diện tích = cạnh² = ${s}² = ${correct} m²` : `Chu vi = 4 × cạnh = 4 × ${s} = ${correct} m`;
      } else if (shape === 'triangle') {
        const base = randInt(6, 20);
        const height = randInt(4, base);
        correct = (base * height) / 2;
        wrong1 = base * height;
        wrong2 = correct + height;
        wrong3 = base + height;
        unit = 'm²';
        question = `A triangular ${place} has a base of ${base} m and a height of ${height} m. What is its area?`;
        expEn = `Area = ½ × base × height = ½ × ${base} × ${height} = ${correct} m²`;
        expVi = `Diện tích = ½ × đáy × chiều cao = ½ × ${base} × ${height} = ${correct} m²`;
      } else if (shape === 'circle') {
        const r = randInt(3, 12);
        correct = Math.round(Math.PI * r * r * 100) / 100;
        wrong1 = Math.round(2 * Math.PI * r * 100) / 100;
        wrong2 = r * r;
        wrong3 = Math.round(Math.PI * r * 100) / 100;
        unit = 'm²';
        question = `A circular swimming pool has a radius of ${r} m. What is its approximate area? (Use π ≈ 3.14)`;
        expEn = `Area = π × r² = 3.14 × ${r}² ≈ ${correct} m²`;
        expVi = `Diện tích = π × r² = 3.14 × ${r}² ≈ ${correct} m²`;
      } else {
        const l = randInt(6, 25), w = randInt(3, l - 1);
        const ask = Math.random() > 0.5 ? 'area' : 'perimeter';
        correct = ask === 'area' ? l * w : 2 * (l + w);
        wrong1 = ask === 'area' ? 2 * (l + w) : l * w;
        wrong2 = correct + l;
        wrong3 = l + w;
        unit = ask === 'area' ? 'm²' : 'm';
        question = `A rectangular ${place} is ${l} m long and ${w} m wide. What is its ${ask}?`;
        expEn = ask === 'area' ? `Area = ${l} × ${w} = ${correct} m²` : `Perimeter = 2(${l} + ${w}) = ${correct} m`;
        expVi = ask === 'area' ? `Diện tích = ${l} × ${w} = ${correct} m²` : `Chu vi = 2(${l} + ${w}) = ${correct} m`;
      }
      const { choices, answerIndex } = makeChoices(correct, wrong1, wrong2, wrong3);
      return {
        id: `m_area_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'basic', topicName: 'Math & Logic',
        question, options: choices.map(c => `${c} ${unit}`), answerIndex,
        explanationEn: expEn, explanationVi: expVi,
        vocabulary: [{ word: 'perimeter', type: 'n', vi: 'chu vi' }, { word: 'radius', type: 'n', vi: 'bán kính' }, { word: 'approximate', type: 'adj', vi: 'xấp xỉ' }]
      };
    }
  },

  // 8. Ratio & Proportion
  {
    level: 'intermediate',
    generate: () => {
      const n1 = sample(NAMES), n2 = sample(NAMES.filter(n => n !== n1));
      const ratioA = randInt(1, 5), ratioB = randInt(1, 5);
      const totalParts = ratioA + ratioB;
      const total = totalParts * randInt(10, 50);
      const shareA = (total / totalParts) * ratioA;
      const shareB = total - shareA;
      const askA = Math.random() > 0.5;
      const correct = askA ? shareA : shareB;
      const { choices, answerIndex } = makeChoices(correct, correct + 20, total - correct, correct / 2, correct + 50);
      return {
        id: `m_ratio_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'intermediate', topicName: 'Math & Logic',
        question: `${n1} and ${n2} share $${total} in the ratio ${ratioA}:${ratioB}. How much does ${askA ? n1 : n2} receive?`,
        options: choices.map(c => `$${c}`), answerIndex,
        explanationEn: `Total parts = ${ratioA} + ${ratioB} = ${totalParts}. ${n1} gets ${ratioA}/${totalParts} × $${total} = $${shareA}. ${n2} gets $${shareB}.`,
        explanationVi: `Tổng phần = ${totalParts}. ${n1} nhận ${ratioA}/${totalParts} × $${total} = $${shareA}. ${n2} nhận $${shareB}.`,
        vocabulary: [{ word: 'ratio', type: 'n', vi: 'tỷ lệ' }, { word: 'proportion', type: 'n', vi: 'tỷ lệ thuận' }, { word: 'share', type: 'v/n', vi: 'chia sẻ / phần chia' }]
      };
    }
  },

  // 9. Average / Mean
  {
    level: 'basic',
    generate: () => {
      const n = sample(NAMES);
      const subject = sample(['Math', 'English', 'Science', 'History', 'Geography']);
      const count = randInt(3, 6);
      const scores = Array.from({ length: count }, () => randInt(50, 100));
      const sum = scores.reduce((a, b) => a + b, 0);
      const avg = Math.round(sum / count);
      const { choices, answerIndex } = makeChoices(avg, avg + 5, avg - 8, sum, Math.max(...scores));
      return {
        id: `m_avg_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'basic', topicName: 'Math & Logic',
        question: `${n} scored ${scores.join(', ')} in ${count} ${subject} tests. What is the average (mean) score?`,
        options: choices.map(c => `${c} points`), answerIndex,
        explanationEn: `Sum = ${scores.join(' + ')} = ${sum}. Average = ${sum} ÷ ${count} = ${avg}.`,
        explanationVi: `Tổng = ${sum}. Điểm trung bình = ${sum} ÷ ${count} = ${avg}.`,
        vocabulary: [{ word: 'average / mean', type: 'n', vi: 'giá trị trung bình' }, { word: 'scored', type: 'v (past)', vi: 'đạt được điểm' }]
      };
    }
  },

  // 10. Mixture / Concentration
  {
    level: 'intermediate',
    generate: () => {
      const concA = randInt(2, 6) * 5; // 10%-30%
      const concB = randInt(concA / 5 + 2, 10) * 5;
      const volA = randInt(2, 8) * 10;
      const volB = randInt(2, 8) * 10;
      const totalVol = volA + volB;
      const pureA = volA * concA / 100;
      const pureB = volB * concB / 100;
      const resultConc = parseFloat(((pureA + pureB) / totalVol * 100).toFixed(1));
      const { choices, answerIndex } = makeChoices(resultConc, (concA + concB) / 2, resultConc + 5, resultConc - 3, concA);
      return {
        id: `m_mix_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'intermediate', topicName: 'Math & Logic',
        question: `${volA} liters of a ${concA}% acid solution is mixed with ${volB} liters of a ${concB}% acid solution. What is the concentration of the resulting mixture?`,
        options: choices.map(c => `${c}%`), answerIndex,
        explanationEn: `Pure acid = ${volA}×${concA}% + ${volB}×${concB}% = ${pureA} + ${pureB} = ${pureA + pureB} L. Concentration = ${pureA + pureB}/${totalVol} = ${resultConc}%.`,
        explanationVi: `Lượng axit thuần = ${pureA} + ${pureB} = ${pureA + pureB} lít. Nồng độ hỗn hợp = ${pureA + pureB}/${totalVol} = ${resultConc}%.`,
        vocabulary: [{ word: 'concentration', type: 'n', vi: 'nồng độ' }, { word: 'mixture', type: 'n', vi: 'hỗn hợp' }, { word: 'resulting', type: 'adj', vi: 'kết quả' }]
      };
    }
  },

  // 11. Probability — marbles, cards, coins
  {
    level: 'advanced',
    generate: () => {
      const type = sample(['marbles', 'cards', 'coins']);
      let question, correct, w1, w2, w3, explanationEn, explanationVi;
      if (type === 'marbles') {
        const red = randInt(3, 9), blue = randInt(2, 8), green = randInt(1, 6);
        const total = red + blue + green;
        const color = sample(['red', 'blue', 'green']);
        const count = color === 'red' ? red : color === 'blue' ? blue : green;
        correct = `${count}/${total}`;
        w1 = `${total - count}/${total}`;
        w2 = `${count}/${red + blue}`;
        w3 = `1/${total}`;
        question = `A bag contains ${red} red, ${blue} blue, and ${green} green marbles. One marble is drawn at random. What is the probability it is ${color}?`;
        explanationEn = `Total = ${total}. P(${color}) = ${count}/${total}.`;
        explanationVi = `Tổng = ${total}. Xác suất chọn bi ${color} = ${count}/${total}.`;
      } else if (type === 'coins') {
        const n = sample([2, 3]);
        if (n === 2) {
          correct = '1/4'; w1 = '1/2'; w2 = '3/4'; w3 = '2/4';
          question = `Two fair coins are tossed simultaneously. What is the probability of getting exactly two heads?`;
          explanationEn = `Sample space = {HH, HT, TH, TT}. Favourable = {HH}. P = 1/4.`;
          explanationVi = `Không gian mẫu = {HH, HT, TH, TT}. Kết quả thuận lợi = {HH}. P = 1/4.`;
        } else {
          correct = '1/8'; w1 = '3/8'; w2 = '1/4'; w3 = '7/8';
          question = `Three fair coins are tossed. What is the probability that all three land on heads?`;
          explanationEn = `Sample space has 2³ = 8 outcomes. Only 1 outcome is HHH. P = 1/8.`;
          explanationVi = `Không gian mẫu có 2³ = 8 kết quả. Chỉ có 1 kết quả là HHH. P = 1/8.`;
        }
      } else {
        const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King', 'Ace'];
        const special = sample(['hearts', 'spades', 'face cards']);
        if (special === 'face cards') {
          correct = '3/13'; w1 = '4/13'; w2 = '12/52'; w3 = '1/13';
          question = `One card is drawn from a standard 52-card deck. What is the probability it is a face card (Jack, Queen, or King)?`;
          explanationEn = `Face cards = 12 (4 × 3). P = 12/52 = 3/13.`;
          explanationVi = `Bài mặt người = 12 lá. P = 12/52 = 3/13.`;
        } else {
          correct = '1/4'; w1 = '1/13'; w2 = '13/52'; w3 = '1/2';
          question = `One card is drawn from a standard 52-card deck. What is the probability it is a ${special}?`;
          explanationEn = `There are 13 ${special} in a 52-card deck. P = 13/52 = 1/4.`;
          explanationVi = `Có 13 lá ${special} trong bộ 52 lá. P = 13/52 = 1/4.`;
        }
      }
      const choices = shuffle([correct, w1, w2, w3]);
      const answerIndex = choices.indexOf(correct);
      return {
        id: `m_prob_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'advanced', topicName: 'Math & Logic',
        question, options: choices, answerIndex, explanationEn, explanationVi,
        vocabulary: [{ word: 'probability', type: 'n', vi: 'xác suất' }, { word: 'at random', type: 'adv', vi: 'ngẫu nhiên' }, { word: 'favourable outcome', type: 'n', vi: 'kết quả thuận lợi' }]
      };
    }
  },

  // 12. Simple Interest vs Compound Interest
  {
    level: 'advanced',
    generate: () => {
      const principal = randInt(10, 50) * 100;
      const rate = randInt(3, 10);
      const years = randInt(2, 5);
      const isCompound = Math.random() > 0.5;
      let correct, question, expEn, expVi;
      if (isCompound) {
        correct = Math.round(principal * Math.pow(1 + rate / 100, years));
        question = `$${principal} is invested at a compound annual interest rate of ${rate}% for ${years} years. What is the total amount at the end?`;
        expEn = `A = P(1 + r)^t = $${principal} × (1 + ${rate}/100)^${years} ≈ $${correct}`;
        expVi = `A = P(1+r)^t = $${principal} × (1 + ${rate}/100)^${years} ≈ $${correct}`;
      } else {
        const interest = principal * rate * years / 100;
        correct = principal + interest;
        question = `$${principal} is invested at a simple annual interest rate of ${rate}% for ${years} years. What is the total balance at the end?`;
        expEn = `Simple Interest = P × r × t = $${principal} × ${rate}% × ${years} = $${interest}. Total = $${principal} + $${interest} = $${correct}.`;
        expVi = `Lãi đơn = $${principal} × ${rate}% × ${years} = $${interest}. Tổng = $${correct}.`;
      }
      const { choices, answerIndex } = makeChoices(correct, correct + principal * rate / 100, correct - 50, principal + years * rate, correct * 2);
      return {
        id: `m_interest_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'advanced', topicName: 'Math & Logic',
        question, options: choices.map(c => `$${c}`), answerIndex, explanationEn: expEn, explanationVi: expVi,
        vocabulary: [{ word: 'compound interest', type: 'n', vi: 'lãi suất kép' }, { word: 'annual rate', type: 'n', vi: 'lãi suất hàng năm' }, { word: 'invested', type: 'v (past)', vi: 'đầu tư' }]
      };
    }
  },

  // 13. Age Problems
  {
    level: 'intermediate',
    generate: () => {
      const n1 = sample(NAMES), n2 = sample(NAMES.filter(n => n !== n1));
      const age1 = randInt(20, 45);
      const diff = randInt(3, 15);
      const age2 = age1 + diff;
      const yearsLater = randInt(2, 10);
      const askType = sample(['sum_now', 'older_later', 'ratio_later']);
      let question, correct, expEn, expVi;
      if (askType === 'sum_now') {
        correct = age1 + age2;
        question = `${n1} is ${age1} years old and ${n2} is ${age2} years old. What is the sum of their ages?`;
        expEn = `Sum = ${age1} + ${age2} = ${correct}.`;
        expVi = `Tổng tuổi = ${age1} + ${age2} = ${correct}.`;
      } else if (askType === 'older_later') {
        correct = age2 + yearsLater;
        question = `${n2} is currently ${age2} years old. How old will ${n2} be in ${yearsLater} years?`;
        expEn = `${age2} + ${yearsLater} = ${correct}.`;
        expVi = `${age2} + ${yearsLater} = ${correct} tuổi.`;
      } else {
        const sumLater = age1 + age2 + 2 * yearsLater;
        correct = sumLater;
        question = `${n1} is ${age1} and ${n2} is ${age2}. What will be the sum of their ages in ${yearsLater} years?`;
        expEn = `In ${yearsLater} years: ${n1} = ${age1 + yearsLater}, ${n2} = ${age2 + yearsLater}. Sum = ${correct}.`;
        expVi = `Sau ${yearsLater} năm: tổng = (${age1}+${yearsLater}) + (${age2}+${yearsLater}) = ${correct}.`;
      }
      const { choices, answerIndex } = makeChoices(correct, correct + diff, correct - 5, correct + yearsLater, correct * 2);
      return {
        id: `m_age_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'intermediate', topicName: 'Math & Logic',
        question, options: choices.map(c => `${c} years`), answerIndex, explanationEn: expEn, explanationVi: expVi,
        vocabulary: [{ word: 'currently', type: 'adv', vi: 'hiện tại' }, { word: 'sum of ages', type: 'phrase', vi: 'tổng số tuổi' }]
      };
    }
  },

  // 14. Unit Conversion
  {
    level: 'basic',
    generate: () => {
      const conversions = [
        { val: randInt(1, 20), fromU: 'km', toU: 'm', factor: 1000, expEn: `1 km = 1000 m` },
        { val: randInt(1, 50), fromU: 'kg', toU: 'g', factor: 1000, expEn: `1 kg = 1000 g` },
        { val: randInt(1, 10), fromU: 'hours', toU: 'minutes', factor: 60, expEn: `1 hour = 60 minutes` },
        { val: randInt(1, 24), fromU: 'days', toU: 'hours', factor: 24, expEn: `1 day = 24 hours` },
        { val: randInt(100, 5000), fromU: 'm', toU: 'km', factor: 1 / 1000, expEn: `1 m = 0.001 km` },
        { val: randInt(500, 10000), fromU: 'g', toU: 'kg', factor: 1 / 1000, expEn: `1 g = 0.001 kg` }
      ];
      const conv = sample(conversions);
      const correct = parseFloat((conv.val * conv.factor).toFixed(3));
      const { choices, answerIndex } = makeChoices(correct, correct * 10, correct / 10, correct + conv.factor * 100, correct * 100);
      return {
        id: `m_conv_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'basic', topicName: 'Math & Logic',
        question: `How many ${conv.toU} are there in ${conv.val} ${conv.fromU}?`,
        options: choices.map(c => `${c} ${conv.toU}`), answerIndex,
        explanationEn: `${conv.expEn}. So ${conv.val} ${conv.fromU} = ${correct} ${conv.toU}.`,
        explanationVi: `${conv.expEn}. Vậy ${conv.val} ${conv.fromU} = ${correct} ${conv.toU}.`,
        vocabulary: [{ word: 'convert', type: 'v', vi: 'chuyển đổi' }, { word: 'unit', type: 'n', vi: 'đơn vị đo lường' }]
      };
    }
  },

  // 15. Number Sequences & Patterns
  {
    level: 'intermediate',
    generate: () => {
      const type = sample(['arithmetic', 'geometric', 'fibonacci-like', 'squares']);
      let seq, correct, question, expEn, expVi;
      if (type === 'arithmetic') {
        const start = randInt(1, 15);
        const d = randInt(2, 10);
        seq = [start, start + d, start + 2 * d, start + 3 * d, start + 4 * d];
        correct = start + 5 * d;
        question = `What is the next number in this arithmetic sequence? ${seq.join(', ')}, ___`;
        expEn = `Common difference = ${d}. Next term = ${seq[4]} + ${d} = ${correct}.`;
        expVi = `Công sai = ${d}. Số tiếp theo = ${seq[4]} + ${d} = ${correct}.`;
      } else if (type === 'geometric') {
        const start = randInt(1, 5);
        const r = randInt(2, 4);
        seq = [start, start * r, start * r ** 2, start * r ** 3, start * r ** 4];
        correct = start * r ** 5;
        question = `What is the next number in this geometric sequence? ${seq.join(', ')}, ___`;
        expEn = `Common ratio = ${r}. Next = ${seq[4]} × ${r} = ${correct}.`;
        expVi = `Công bội = ${r}. Số tiếp theo = ${seq[4]} × ${r} = ${correct}.`;
      } else if (type === 'squares') {
        const offset = randInt(1, 5);
        seq = [1, 4, 9, 16, 25].map(n => n + offset);
        correct = 36 + offset;
        question = `What is the next number in this pattern? ${seq.join(', ')}, ___ (Hint: related to perfect squares)`;
        expEn = `Pattern: 1²+${offset}, 2²+${offset}, 3²+${offset}... Next = 6² + ${offset} = ${correct}.`;
        expVi = `Dạng số chính phương + ${offset}. Tiếp theo = 6² + ${offset} = ${correct}.`;
      } else {
        const a = randInt(1, 5), b = randInt(a, 8);
        seq = [a, b, a + b, a + 2 * b, 2 * a + 3 * b];
        correct = 3 * a + 5 * b;
        question = `What is the next number in this sequence? ${seq.slice(0, 4).join(', ')}, ___`;
        expEn = `Each term = sum of the two preceding terms. Next = ${seq[3]} + ${seq[4]} = ${correct}.`;
        expVi = `Mỗi số = tổng hai số trước. Tiếp theo = ${seq[3]} + ${seq[4]} = ${correct}.`;
      }
      const { choices, answerIndex } = makeChoices(correct, correct + seq[seq.length - 1] / 2, correct - 5, correct * 2, correct + 3);
      return {
        id: `m_seq_${Date.now()}_${randInt(0,9999)}`, topic: 'math', level: 'intermediate', topicName: 'Math & Logic',
        question, options: choices.map(c => `${c}`), answerIndex, explanationEn: expEn, explanationVi: expVi,
        vocabulary: [{ word: 'sequence', type: 'n', vi: 'dãy số' }, { word: 'common difference', type: 'n', vi: 'công sai' }, { word: 'common ratio', type: 'n', vi: 'công bội' }]
      };
    }
  }
];
