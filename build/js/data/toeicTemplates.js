/**
 * TOEIC & Business English Procedural Question Generator
 * Generates dynamic TOEIC Part 5 & 6 style questions (Grammar, Vocabulary, Prepositions, Word Form) with realistic corporate contexts.
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

export const toeicGenerators = [
  // 1. Word Form / Part of Speech (Adverb modifying Verb/Adjective) - Basic to Intermediate
  {
    level: 'basic',
    generate: () => {
      const contexts = [
        {
          company: 'Nexus Tech',
          action: 'reviewed',
          object: 'the annual quarterly budget report',
          verbRoot: 'thorough',
          correct: 'thoroughly',
          options: ['thoroughly', 'thorough', 'thoroughness', 'more thorough'],
          rule: 'An adverb (thoroughly) is required to modify the main action verb (reviewed).'
        },
        {
          company: 'Apex Logistics',
          action: 'inspected',
          object: 'the new shipping facilities',
          verbRoot: 'careful',
          correct: 'carefully',
          options: ['carefully', 'careful', 'carefulness', 'caring'],
          rule: 'An adverb (carefully) is required to modify the transitive verb (inspected).'
        },
        {
          company: 'Global Health Inc.',
          action: 'approved',
          object: 'the proposed medical research budget',
          verbRoot: 'prompt',
          correct: 'promptly',
          options: ['promptly', 'prompt', 'promptness', 'prompting'],
          rule: 'An adverb (promptly) is used to modify the verb (approved).'
        }
      ];

      const item = sample(contexts);
      const questionText = `The board of directors at ${item.company} ________ ${item.action} ${item.object} before submitting it to the shareholders.`;

      const correctAns = item.correct;
      const choices = shuffle(item.options);
      const answerIndex = choices.indexOf(correctAns);

      return {
        id: `toeic_wf_${Date.now()}_${randInt(100, 999)}`,
        topic: 'toeic',
        level: 'basic',
        topicName: 'TOEIC & Business English',
        question: questionText,
        options: choices,
        answerIndex,
        explanationEn: `Correct answer: "${correctAns}". ${item.rule}`,
        explanationVi: `Đáp án đúng: "${correctAns}". ${item.rule} (Trạng từ bổ nghĩa cho động từ thường "${item.action}").`,
        vocabulary: [
          { word: 'board of directors', type: 'noun phrase', vi: 'Hội đồng quản trị' },
          { word: 'shareholders', type: 'noun', vi: 'cổ đông' },
          { word: 'submit', type: 'verb', vi: 'nộp, trình duyệt' }
        ]
      };
    }
  },

  // 2. Verb Tenses & Passive Voice (Intermediate)
  {
    level: 'intermediate',
    generate: () => {
      const tenses = [
        {
          subject: 'All upcoming product designs',
          timeIndicator: 'by the end of next month',
          correct: 'will be finalized',
          options: ['will be finalized', 'were finalizing', 'have finalized', 'finalizes'],
          rule: 'The passive future tense "will be + V3" is required because the subject (product designs) receives the action and the phrase "by the end of next month" indicates future completion.'
        },
        {
          subject: 'The construction of the new headquarters',
          timeIndicator: 'since last autumn',
          correct: 'has been delayed',
          options: ['has been delayed', 'is delaying', 'will delay', 'delayed'],
          rule: 'The present perfect passive "has been delayed" is used with "since" to indicate an ongoing state starting in the past.'
        },
        {
          subject: 'Several key confidential documents',
          timeIndicator: 'when the system crash occurred yesterday',
          correct: 'were being updated',
          options: ['were being updated', 'will update', 'have updated', 'updates'],
          rule: 'Past continuous passive "were being updated" is used for an action in progress in the past when another action interrupted it.'
        }
      ];

      const item = sample(tenses);
      const questionText = `${item.subject} ________ ${item.timeIndicator}.`;

      const correctAns = item.correct;
      const choices = shuffle(item.options);
      const answerIndex = choices.indexOf(correctAns);

      return {
        id: `toeic_tense_${Date.now()}_${randInt(100, 999)}`,
        topic: 'toeic',
        level: 'intermediate',
        topicName: 'TOEIC & Business English',
        question: questionText,
        options: choices,
        answerIndex,
        explanationEn: `Correct answer: "${correctAns}". ${item.rule}`,
        explanationVi: `Đáp án đúng: "${correctAns}". ${item.rule}`,
        vocabulary: [
          { word: 'headquarters', type: 'noun', vi: 'trụ sở chính' },
          { word: 'confidential', type: 'adjective', vi: 'bảo mật, tin cẩn' },
          { word: 'finalize', type: 'verb', vi: 'chốt, hoàn tất' }
        ]
      };
    }
  },

  // 3. Prepositions & Complex Connectors (Intermediate - Advanced)
  {
    level: 'intermediate',
    generate: () => {
      const connectors = [
        {
          sentence: `________ the severe weather conditions, the morning flight to Singapore departed on schedule.`,
          correct: 'Despite',
          options: ['Despite', 'Although', 'Because of', 'Even if'],
          rule: '"Despite" is a preposition followed by a noun phrase ("the severe weather conditions") to show concession (mặc dù).'
        },
        {
          sentence: `The factory expansion project was approved ________ it met all environmental safety regulations.`,
          correct: 'provided that',
          options: ['provided that', 'in spite of', 'due to', 'prior to'],
          rule: '"Provided that" means "if / với điều kiện là" and introduces a full conditional clause.'
        },
        {
          sentence: `All employees must submit their travel expense claims ________ prior to the end of the fiscal year.`,
          correct: 'well',
          options: ['well', 'far', 'almost', 'nearly'],
          rule: '"Well prior to" (hoàn toàn trước) is an idiom used in business contexts to emphasize plenty of advance time.'
        }
      ];

      const item = sample(connectors);
      const correctAns = item.correct;
      const choices = shuffle(item.options);
      const answerIndex = choices.indexOf(correctAns);

      return {
        id: `toeic_conn_${Date.now()}_${randInt(100, 999)}`,
        topic: 'toeic',
        level: 'intermediate',
        topicName: 'TOEIC & Business English',
        question: item.sentence,
        options: choices,
        answerIndex,
        explanationEn: `Correct answer: "${correctAns}". ${item.rule}`,
        explanationVi: `Đáp án đúng: "${correctAns}". ${item.rule}`,
        vocabulary: [
          { word: 'departed on schedule', type: 'phrase', vi: 'khởi hành đúng giờ' },
          { word: 'expense claim', type: 'noun phrase', vi: 'yêu cầu thanh toán chi phí' },
          { word: 'fiscal year', type: 'noun phrase', vi: 'năm tài chính' }
        ]
      };
    }
  },

  // 4. Business Vocabulary in Context (Advanced - TOEIC 800+)
  {
    level: 'advanced',
    generate: () => {
      const vocabItems = [
        {
          sentence: `Due to unexpected supply chain disruptions, the manufacturer was forced to ________ the release of its new line of electronic devices.`,
          correct: 'postpone',
          options: ['postpone', 'accelerate', 'implement', 'substitute'],
          rule: '"Postpone" means to delay or put off to a later time (hoãn lại).'
        },
        {
          sentence: `All newly hired software engineers are eligible for a comprehensive benefits package ________ upon completion of their three-month probationary period.`,
          correct: 'immediately',
          options: ['immediately', 'reluctantly', 'adversely', 'incidentally'],
          rule: '"Immediately upon completion" means ngay lập tức khi hoàn thành.'
        },
        {
          sentence: `The marketing department launched an aggressive campaign to ________ brand awareness among young consumers.`,
          correct: 'enhance',
          options: ['enhance', 'dwindle', 'forfeit', 'waive'],
          rule: '"Enhance" means to increase or improve the quality/value/awareness (nâng cao, tăng cường).'
        }
      ];

      const item = sample(vocabItems);
      const correctAns = item.correct;
      const choices = shuffle(item.options);
      const answerIndex = choices.indexOf(correctAns);

      return {
        id: `toeic_vocab_${Date.now()}_${randInt(100, 999)}`,
        topic: 'toeic',
        level: 'advanced',
        topicName: 'TOEIC & Business English',
        question: item.sentence,
        options: choices,
        answerIndex,
        explanationEn: `Correct answer: "${correctAns}". ${item.rule}`,
        explanationVi: `Đáp án đúng: "${correctAns}". ${item.rule}`,
        vocabulary: [
          { word: 'probationary period', type: 'noun phrase', vi: 'thời gian thử việc' },
          { word: 'comprehensive benefits', type: 'noun phrase', vi: 'phúc lợi toàn diện' },
          { word: 'supply chain disruption', type: 'noun phrase', vi: 'gián đoạn chuỗi cung ứng' }
        ]
      };
    }
  }
];
