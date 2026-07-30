/**
 * Math & Logic Procedural Question Generator
 * Generates dynamic math word problems in English with randomized values and distractors.
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

export const mathGenerators = [
  // 1. Discount & Percentage (Basic - Intermediate)
  {
    level: 'basic',
    generate: () => {
      const items = ['laptop', 'smartphone', 'pair of shoes', 'jacket', 'bicycle', 'watch', 'camera'];
      const item = sample(items);
      const originalPrice = randInt(5, 50) * 10; // $50 - $500
      const discount = sample([10, 15, 20, 25, 30, 40, 50]);
      const discountAmount = (originalPrice * discount) / 100;
      const finalPrice = originalPrice - discountAmount;

      const wrong1 = finalPrice + discountAmount / 2;
      const wrong2 = originalPrice - discount;
      const wrong3 = finalPrice + 20;

      const choices = Array.from(new Set([finalPrice, wrong1, wrong2, wrong3]))
        .map(v => Math.round(v))
        .slice(0, 4);

      while (choices.length < 4) {
        const extra = finalPrice + randInt(5, 45);
        if (!choices.includes(extra)) choices.push(extra);
      }

      const shuffledChoices = shuffle(choices);
      const answerIndex = shuffledChoices.indexOf(finalPrice);

      return {
        id: `math_pct_${Date.now()}_${randInt(100, 999)}`,
        topic: 'math',
        level: 'basic',
        topicName: 'Toán & Logic (Math)',
        question: `A store is offering a ${discount}% discount on a ${item} that originally costs $${originalPrice}. What is the final price after the discount?`,
        options: shuffledChoices.map(c => `$${c}`),
        answerIndex,
        explanationEn: `Calculate the discount amount: $${originalPrice} × ${discount}% = $${discountAmount}. Subtract from the original price: $${originalPrice} - $${discountAmount} = $${finalPrice}.`,
        explanationVi: `Tính số tiền được giảm: $${originalPrice} × ${discount}% = $${discountAmount}. Giá sau khi giảm: $${originalPrice} - $${discountAmount} = $${finalPrice}.`,
        vocabulary: [
          { word: 'discount', type: 'noun', vi: 'chiết khấu, giảm giá' },
          { word: 'originally', type: 'adverb', vi: 'ban đầu' },
          { word: 'final price', type: 'noun phrase', vi: 'giá cuối cùng' }
        ]
      };
    }
  },

  // 2. Speed, Distance & Time (Intermediate)
  {
    level: 'intermediate',
    generate: () => {
      const vehicles = [
        { name: 'train', speedMin: 60, speedMax: 120, unit: 'km/h' },
        { name: 'car', speedMin: 50, speedMax: 100, unit: 'km/h' },
        { name: 'cyclist', speedMin: 15, speedMax: 30, unit: 'km/h' },
        { name: 'express bus', speedMin: 40, speedMax: 80, unit: 'km/h' }
      ];
      const v = sample(vehicles);
      const speed = randInt(v.speedMin / 10, v.speedMax / 10) * 10;
      const timeHours = sample([1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]);
      const distance = speed * timeHours;

      const wrong1 = distance + speed / 2;
      const wrong2 = speed * (timeHours + 1);
      const wrong3 = distance - 15;

      const choices = shuffle(Array.from(new Set([distance, wrong1, wrong2, wrong3])).slice(0, 4));
      const answerIndex = choices.indexOf(distance);

      return {
        id: `math_speed_${Date.now()}_${randInt(100, 999)}`,
        topic: 'math',
        level: 'intermediate',
        topicName: 'Toán & Logic (Math)',
        question: `If a ${v.name} travels at a constant speed of ${speed} ${v.unit} for ${timeHours} hours, how far does it travel in total?`,
        options: choices.map(c => `${c} km`),
        answerIndex,
        explanationEn: `Distance = Speed × Time. Distance = ${speed} km/h × ${timeHours} hours = ${distance} km.`,
        explanationVi: `Công thức: Quãng đường = Vận tốc × Thời gian. Quãng đường = ${speed} × ${timeHours} = ${distance} km.`,
        vocabulary: [
          { word: 'constant speed', type: 'noun phrase', vi: 'vận tốc không đổi' },
          { word: 'travel', type: 'verb', vi: 'di chuyển, đi' },
          { word: 'in total', type: 'phrase', vi: 'tổng cộng' }
        ]
      };
    }
  },

  // 3. Work Rate & Time (Intermediate - Advanced)
  {
    level: 'intermediate',
    generate: () => {
      const names = ['Anna', 'David', 'Sophia', 'James', 'Emily', 'Alexander', 'Olivia'];
      const p1 = sample(names);
      let p2 = sample(names);
      while (p2 === p1) p2 = sample(names);

      const hours1 = randInt(2, 6) * 2; // 4, 6, 8, 10, 12
      const hours2 = randInt(2, 6) * 2;
      
      const combinedTime = (hours1 * hours2) / (hours1 + hours2);
      const combinedFormatted = Number(combinedTime.toFixed(1));

      const wrong1 = Number(((hours1 + hours2) / 2).toFixed(1));
      const wrong2 = Number((hours1 + hours2).toFixed(1));
      const wrong3 = Number((Math.abs(hours1 - hours2) + 1).toFixed(1));

      const choices = shuffle(Array.from(new Set([combinedFormatted, wrong1, wrong2, wrong3])).slice(0, 4));
      const answerIndex = choices.indexOf(combinedFormatted);

      return {
        id: `math_work_${Date.now()}_${randInt(100, 999)}`,
        topic: 'math',
        level: 'intermediate',
        topicName: 'Toán & Logic (Math)',
        question: `${p1} can complete a project in ${hours1} hours, while ${p2} can complete the same project in ${hours2} hours. How many hours will it take them to complete the project together?`,
        options: choices.map(c => `${c} hours`),
        answerIndex,
        explanationEn: `${p1}'s rate = 1/${hours1} per hour. ${p2}'s rate = 1/${hours2} per hour. Combined rate = 1/${hours1} + 1/${hours2}. Combined time = ${hours1 * hours2}/${hours1 + hours2} ≈ ${combinedFormatted} hours.`,
        explanationVi: `Năng suất ${p1} = 1/${hours1} công việc/giờ. Năng suất ${p2} = 1/${hours2} công việc/giờ. Năng suất chung = 1/${hours1} + 1/${hours2}. Thời gian hoàn thành chung ≈ ${combinedFormatted} giờ.`,
        vocabulary: [
          { word: 'complete', type: 'verb', vi: 'hoàn thành' },
          { word: 'rate', type: 'noun', vi: 'năng suất, tốc độ' },
          { word: 'together', type: 'adverb', vi: 'cùng nhau' }
        ]
      };
    }
  },

  // 4. Area & Geometry (Basic)
  {
    level: 'basic',
    generate: () => {
      const places = ['rectangular garden', 'office floor', 'swimming pool', 'conference room', 'soccer field'];
      const place = sample(places);
      const length = randInt(6, 25);
      const width = randInt(4, length - 1);
      const area = length * width;
      const perimeter = 2 * (length + width);

      const wrong1 = perimeter;
      const wrong2 = length + width;
      const wrong3 = area + randInt(10, 30);

      const choices = shuffle(Array.from(new Set([area, wrong1, wrong2, wrong3])).slice(0, 4));
      const answerIndex = choices.indexOf(area);

      return {
        id: `math_geo_${Date.now()}_${randInt(100, 999)}`,
        topic: 'math',
        level: 'basic',
        topicName: 'Toán & Logic (Math)',
        question: `A ${place} measures ${length} meters in length and ${width} meters in width. What is the total area of the ${place}?`,
        options: choices.map(c => `${c} m²`),
        answerIndex,
        explanationEn: `Area of a rectangle = Length × Width = ${length} m × ${width} m = ${area} m².`,
        explanationVi: `Diện tích hình chữ nhật = Chiều dài × Chiều rộng = ${length} × ${width} = ${area} m².`,
        vocabulary: [
          { word: 'measure', type: 'verb', vi: 'có kích thước, đo được' },
          { word: 'length', type: 'noun', vi: 'chiều dài' },
          { word: 'width', type: 'noun', vi: 'chiều rộng' },
          { word: 'area', type: 'noun', vi: 'diện tích' }
        ]
      };
    }
  },

  // 5. Probability (Advanced)
  {
    level: 'advanced',
    generate: () => {
      const red = randInt(3, 8);
      const blue = randInt(4, 10);
      const green = randInt(2, 6);
      const total = red + blue + green;
      const colorPicked = sample(['red', 'blue', 'green']);
      let countPicked = red;
      if (colorPicked === 'blue') countPicked = blue;
      if (colorPicked === 'green') countPicked = green;

      const probStr = `${countPicked}/${total}`;
      const wrong1 = `${countPicked}/${red + blue}`;
      const wrong2 = `${total - countPicked}/${total}`;
      const wrong3 = `${1}/${total}`;

      const choices = shuffle(Array.from(new Set([probStr, wrong1, wrong2, wrong3])).slice(0, 4));
      const answerIndex = choices.indexOf(probStr);

      return {
        id: `math_prob_${Date.now()}_${randInt(100, 999)}`,
        topic: 'math',
        level: 'advanced',
        topicName: 'Toán & Logic (Math)',
        question: `A box contains ${red} red marbles, ${blue} blue marbles, and ${green} green marbles. If one marble is drawn at random, what is the probability that it is ${colorPicked}?`,
        options: choices,
        answerIndex,
        explanationEn: `Total marbles = ${red} + ${blue} + ${green} = ${total}. Number of ${colorPicked} marbles = ${countPicked}. Probability = ${countPicked}/${total}.`,
        explanationVi: `Tổng số viên bi = ${red} + ${blue} + ${green} = ${total}. Số bi màu ${colorPicked} = ${countPicked}. Xác suất chọn được bi ${colorPicked} = ${countPicked}/${total}.`,
        vocabulary: [
          { word: 'drawn at random', type: 'phrase', vi: 'được rút ngẫu nhiên' },
          { word: 'probability', type: 'noun', vi: 'xác suất' },
          { word: 'contains', type: 'verb', vi: 'chứa, bao gồm' }
        ]
      };
    }
  },

  // 6. Simple Interest & Finance (Advanced)
  {
    level: 'advanced',
    generate: () => {
      const principal = randInt(10, 100) * 100; // $1000 - $10000
      const rate = randInt(3, 8); // 3% - 8%
      const years = randInt(2, 5); // 2 - 5 years
      const interest = (principal * rate * years) / 100;
      const totalAmount = principal + interest;

      const askTotal = Math.random() > 0.5;
      const targetVal = askTotal ? totalAmount : interest;

      const wrong1 = askTotal ? principal + (principal * rate) / 100 : interest / 2;
      const wrong2 = askTotal ? totalAmount + 200 : interest + (principal * rate) / 100;
      const wrong3 = askTotal ? principal * rate : interest + 150;

      const choices = shuffle(Array.from(new Set([targetVal, wrong1, wrong2, wrong3])).slice(0, 4));
      const answerIndex = choices.indexOf(targetVal);

      const qText = askTotal
        ? `An investor deposits $${principal} into a bank account with a simple annual interest rate of ${rate}%. What will be the TOTAL balance in the account after ${years} years?`
        : `An investor deposits $${principal} into a bank account with a simple annual interest rate of ${rate}%. How much INTEREST will the account earn after ${years} years?`;

      return {
        id: `math_finance_${Date.now()}_${randInt(100, 999)}`,
        topic: 'math',
        level: 'advanced',
        topicName: 'Toán & Logic (Math)',
        question: qText,
        options: choices.map(c => `$${c}`),
        answerIndex,
        explanationEn: `Simple Interest = Principal × Rate × Time = $${principal} × ${rate}% × ${years} = $${interest}. ` + (askTotal ? `Total Balance = Principal + Interest = $${principal} + $${interest} = $${totalAmount}.` : ``),
        explanationVi: `Công thức Lãi đơn: Lãi = Vốn ban đầu × Lãi suất × Thời gian = $${principal} × ${rate}% × ${years} = $${interest}. ` + (askTotal ? `Tổng số dư = Vốn + Lãi = $${principal} + $${interest} = $${totalAmount}.` : ``),
        vocabulary: [
          { word: 'deposit', type: 'verb', vi: 'gửi tiền (vào ngân hàng)' },
          { word: 'annual interest rate', type: 'noun phrase', vi: 'lãi suất hàng năm' },
          { word: 'principal', type: 'noun', vi: 'tiền gốc, vốn ban đầu' }
        ]
      };
    }
  }
];
