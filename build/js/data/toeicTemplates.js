/**
 * TOEIC & Business English Procedural Generator — Extended Edition
 * Grammar (Word Form, Tenses, Relative Clauses, Conditionals, Passive),
 * Vocabulary, Prepositions, Conjunctions, Reading Comprehension-style fill-in.
 * ALL QUESTIONS 100% IN ENGLISH.
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
function makeQ(sentence, correct, options, level, vocabItems, explanationEn, explanationVi) {
  const choices = shuffle([...new Set([correct, ...options])].slice(0, 4));
  return {
    id: `t_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    topic: 'toeic', level, topicName: 'TOEIC & Business English',
    question: sentence, options: choices, answerIndex: choices.indexOf(correct),
    explanationEn, explanationVi,
    vocabulary: vocabItems
  };
}

export const toeicGenerators = [
  // ── SECTION A: WORD FORM (NOUN / VERB / ADJECTIVE / ADVERB) ──

  // 1. Adverb modifying verb
  {
    level: 'basic',
    generate: () => {
      const contexts = [
        { s: `The regional sales manager ________ reviewed all quarterly expense reports before the board meeting.`, c: 'thoroughly', o: ['thorough', 'thoroughness', 'more thorough'], rule: '"Thoroughly" (adverb) modifies the verb "reviewed". An adjective (thorough) cannot modify a verb; a noun (thoroughness) cannot be placed here.' },
        { s: `The operations team ________ adjusted the production schedule to meet the increased demand.`, c: 'promptly', o: ['prompt', 'promptness', 'prompting'], rule: '"Promptly" (adverb) modifies the verb "adjusted". Adverbs ending in -ly modify verbs, not nouns.' },
        { s: `The CEO ________ emphasized the importance of workplace safety during the annual meeting.`, c: 'strongly', o: ['strong', 'strength', 'strongest'], rule: '"Strongly" (adverb) modifies the verb "emphasized".' },
        { s: `The project deadline was ________ extended due to unforeseen technical difficulties.`, c: 'formally', o: ['formal', 'formality', 'formalizing'], rule: '"Formally" (adverb) modifies the passive verb phrase "was extended".' }
      ];
      const sel = sample(contexts);
      return makeQ(sel.s, sel.c, sel.o, 'basic',
        [{ word: 'adverb', type: 'grammar', vi: 'trạng từ (bổ nghĩa cho động từ/tính từ)' }],
        `Correct: "${sel.c}". ${sel.rule}`,
        `Đáp án đúng: "${sel.c}". ${sel.rule}`);
    }
  },

  // 2. Noun in Subject / Object position
  {
    level: 'basic',
    generate: () => {
      const contexts = [
        { s: `The ________ of the new product line exceeded all internal forecasts for the fiscal year.`, c: 'performance', o: ['perform', 'performed', 'performing'], rule: '"Performance" (noun) is needed after the article "The" in subject position.' },
        { s: `Management is currently reviewing the ________ submitted by the legal department.`, c: 'documentation', o: ['document', 'documenting', 'documented'], rule: '"Documentation" (noun) follows the article "the" and acts as the object of "reviewing".' },
        { s: `A formal ________ will be issued to all employees by the end of this week.`, c: 'notification', o: ['notify', 'notifying', 'notified'], rule: '"Notification" (noun) follows the indefinite article "A".' },
        { s: `The board requires ________ of all cross-border transactions above $50,000.`, c: 'verification', o: ['verify', 'verifying', 'verified'], rule: '"Verification" (noun) follows the verb "requires" as the direct object.' }
      ];
      const sel = sample(contexts);
      return makeQ(sel.s, sel.c, sel.o, 'basic',
        [{ word: 'noun form', type: 'grammar', vi: 'danh từ (thường kết thúc bằng -tion, -ment, -ance, -ness, -ity)' }],
        `Correct: "${sel.c}". ${sel.rule}`,
        `Đáp án đúng: "${sel.c}". ${sel.rule}`);
    }
  },

  // 3. Adjective modifying noun
  {
    level: 'basic',
    generate: () => {
      const contexts = [
        { s: `All ________ employees are required to complete the mandatory onboarding training within their first week.`, c: 'newly hired', o: ['new hire', 'newly hiring', 'new hires'], rule: '"Newly hired" (adjective phrase) modifies the noun "employees".' },
        { s: `The company released a ________ statement addressing the data breach.`, c: 'comprehensive', o: ['comprehensively', 'comprehend', 'comprehension'], rule: '"Comprehensive" (adjective) modifies the noun "statement".' },
        { s: `We need a ________ approach to handling customer complaints to improve satisfaction ratings.`, c: 'systematic', o: ['systematically', 'system', 'systematize'], rule: '"Systematic" (adjective) modifies the noun "approach".' },
        { s: `The ________ increase in operating costs has forced the company to revise its pricing strategy.`, c: 'significant', o: ['significantly', 'significance', 'signify'], rule: '"Significant" (adjective) modifies the noun "increase".' }
      ];
      const sel = sample(contexts);
      return makeQ(sel.s, sel.c, sel.o, 'basic',
        [{ word: 'adjective', type: 'grammar', vi: 'tính từ (bổ nghĩa cho danh từ)' }],
        `Correct: "${sel.c}". ${sel.rule}`,
        `Đáp án đúng: "${sel.c}". ${sel.rule}`);
    }
  },

  // 4. Passive Voice — Simple / Perfect
  {
    level: 'intermediate',
    generate: () => {
      const contexts = [
        { s: `The merger agreement ________ by both companies' legal teams after three months of intense negotiations.`, c: 'was finalized', o: ['finalized', 'has finalized', 'were finalizing'], rule: 'Past passive "was finalized" is correct: subject (agreement) receives the action, and the timeframe is past.' },
        { s: `All incoming shipments ________ by customs officers before being released to the warehouse.`, c: 'are inspected', o: ['inspect', 'have inspected', 'inspecting'], rule: 'Present simple passive "are inspected" describes a regular process. Subject (shipments) receives the action.' },
        { s: `The financial audit report ________ to shareholders by the end of the third quarter.`, c: 'will be presented', o: ['will present', 'presents', 'has been presenting'], rule: 'Future passive "will be presented" is required: subject (report) receives the action in future.' },
        { s: `New safety regulations ________ in all manufacturing facilities since January.`, c: 'have been implemented', o: ['have implemented', 'implemented', 'are implementing'], rule: 'Present perfect passive with "since" indicates an ongoing state from a past point.' }
      ];
      const sel = sample(contexts);
      return makeQ(sel.s, sel.c, sel.o, 'intermediate',
        [{ word: 'passive voice', type: 'grammar', vi: 'câu bị động (be + V3)' }, { word: 'finalize', type: 'v', vi: 'chốt, hoàn tất' }],
        `Correct: "${sel.c}". ${sel.rule}`,
        `Đáp án đúng: "${sel.c}". ${sel.rule}`);
    }
  },

  // 5. Tense Usage — Present Perfect vs Simple Past
  {
    level: 'intermediate',
    generate: () => {
      const contexts = [
        { s: `Our company ________ its market share by 15% over the last three years.`, c: 'has expanded', o: ['expanded', 'was expanding', 'expands'], rule: '"Has expanded" (present perfect) is used with "over the last three years" — a period extending to the present.' },
        { s: `The engineering team ________ the software defect and submitted a patch yesterday.`, c: 'identified', o: ['has identified', 'was identifying', 'had been identifying'], rule: '"Identified" (simple past) is correct because "yesterday" specifies a completed action at a definite past time.' },
        { s: `Since the new CEO took office, the company ________ several departments and reduced overhead.`, c: 'has restructured', o: ['restructured', 'is restructuring', 'had restructured'], rule: '"Has restructured" (present perfect) is used with "since" to indicate ongoing results from a past event.' },
        { s: `The previous supplier ________ the contract in 2021 due to quality control issues.`, c: 'terminated', o: ['has terminated', 'terminates', 'had been terminating'], rule: '"Terminated" (simple past) is correct because "in 2021" marks a specific past time.' }
      ];
      const sel = sample(contexts);
      return makeQ(sel.s, sel.c, sel.o, 'intermediate',
        [{ word: 'present perfect', type: 'grammar', vi: 'thì hiện tại hoàn thành (have/has + V3)' }, { word: 'simple past', type: 'grammar', vi: 'thì quá khứ đơn (V-ed)' }],
        `Correct: "${sel.c}". ${sel.rule}`,
        `Đáp án đúng: "${sel.c}". ${sel.rule}`);
    }
  },

  // 6. Prepositions & Multi-word Prepositions
  {
    level: 'intermediate',
    generate: () => {
      const contexts = [
        { s: `The shipment is expected to arrive ________ schedule, weather permitting.`, c: 'on', o: ['in', 'at', 'by'], rule: '"On schedule" means đúng lịch, đúng kế hoạch. Common TOEIC phrase.' },
        { s: `The marketing campaign was launched ________ response to declining brand awareness.`, c: 'in', o: ['on', 'at', 'with'], rule: '"In response to" = phản hồi lại, là một cum giới từ phổ biến.' },
        { s: `Customers are advised to retain their receipts ________ case of a return or exchange.`, c: 'in', o: ['on', 'for', 'at'], rule: '"In case of" = trong trường hợp. Prepositional phrase for conditions.' },
        { s: `The construction of the new headquarters is ________ track to be completed before year-end.`, c: 'on', o: ['in', 'at', 'by'], rule: '"On track" = đúng kế hoạch, đang tiến triển tốt. Key TOEIC idiom.' },
        { s: `Please submit your travel expense forms ________ prior to the end of the fiscal quarter.`, c: 'well', o: ['far', 'just', 'close'], rule: '"Well prior to" = rất trước (nhấn mạnh cần nộp sớm). "Far" and "well" are adverbs here, but "well prior to" is the standard business idiom.' },
        { s: `The new policy will come ________ effect starting from the first of next month.`, c: 'into', o: ['in', 'to', 'onto'], rule: '"Come into effect" = có hiệu lực (a fixed prepositional verb phrase in business English).' }
      ];
      const sel = sample(contexts);
      return makeQ(sel.s, sel.c, sel.o, 'intermediate',
        [{ word: 'prepositional phrase', type: 'grammar', vi: 'cụm giới từ' }, { word: 'on track', type: 'idiom', vi: 'đúng kế hoạch, đang tiến triển' }],
        `Correct: "${sel.c}". ${sel.rule}`,
        `Đáp án đúng: "${sel.c}". ${sel.rule}`);
    }
  },

  // 7. Conjunctions & Subordinators
  {
    level: 'intermediate',
    generate: () => {
      const contexts = [
        { s: `________ the storm caused widespread disruption, all flights to Osaka departed on schedule.`, c: 'Despite the fact that', o: ['Because', 'In addition to', 'Due to'], rule: '"Despite the fact that" + full clause shows concession. "Due to" is followed by a noun, not a clause.' },
        { s: `The project was approved ________ it met all environmental impact standards.`, c: 'provided that', o: ['in spite of', 'due to', 'regarding'], rule: '"Provided that" = với điều kiện là, introduces a conditional clause.' },
        { s: `________ receiving the complaint, the customer service team offered a full refund.`, c: 'Upon', o: ['Because of', 'Despite', 'Without'], rule: '"Upon receiving" = ngay khi nhận được. "Upon + V-ing" is a formal preposition used in business writing.' },
        { s: `The board approved the budget increase ________ the company reported record losses last year.`, c: 'even though', o: ['so that', 'in order to', 'as a result'], rule: '"Even though" introduces a concessive clause. It connects contradictory ideas.' }
      ];
      const sel = sample(contexts);
      return makeQ(sel.s, sel.c, sel.o, 'intermediate',
        [{ word: 'concession', type: 'grammar', vi: 'mệnh đề đối lập / nhượng bộ' }, { word: 'subordinator', type: 'grammar', vi: 'từ nối mệnh đề phụ' }],
        `Correct: "${sel.c}". ${sel.rule}`,
        `Đáp án đúng: "${sel.c}". ${sel.rule}`);
    }
  },

  // 8. Relative Clauses
  {
    level: 'advanced',
    generate: () => {
      const contexts = [
        { s: `The candidate ________ qualifications best match our requirements will be invited to a second interview.`, c: 'whose', o: ['which', 'whom', 'who'], rule: '"Whose" = relative pronoun for possession (qualifications belong to the candidate).' },
        { s: `The conference room ________ we held last week's strategy session is being renovated.`, c: 'in which', o: ['who', 'whose', 'that'], rule: '"In which" = relative pronoun with preposition, referring to a place. Formal register preferred in business writing.' },
        { s: `The quarterly report, ________ was reviewed by the audit committee, contains several discrepancies.`, c: 'which', o: ['that', 'who', 'whose'], rule: '"Which" introduces a non-restrictive relative clause (set off by commas). "That" cannot be used in non-restrictive clauses.' },
        { s: `Employees ________ work remotely must submit weekly productivity reports.`, c: 'who', o: ['which', 'whose', 'whom'], rule: '"Who" is used as subject relative pronoun for people.' }
      ];
      const sel = sample(contexts);
      return makeQ(sel.s, sel.c, sel.o, 'advanced',
        [{ word: 'relative pronoun', type: 'grammar', vi: 'đại từ quan hệ (who, which, whose, whom)' }, { word: 'non-restrictive clause', type: 'grammar', vi: 'mệnh đề quan hệ không hạn định (có dấu phẩy)' }],
        `Correct: "${sel.c}". ${sel.rule}`,
        `Đáp án đúng: "${sel.c}". ${sel.rule}`);
    }
  },

  // 9. Conditionals (Type 1 / 2 / 3)
  {
    level: 'advanced',
    generate: () => {
      const contexts = [
        { s: `If the supplier ________ delivery by Friday, we will need to source an alternative vendor immediately.`, c: 'fails to confirm', o: ['failed to confirm', 'had failed to confirm', 'would fail to confirm'], rule: 'Type 1 Conditional (if + present simple → will + base verb). Real / possible future situation.' },
        { s: `If we ________ the office expansion last year, we would have avoided the current overcrowding.`, c: 'had approved', o: ['approved', 'would approve', 'approve'], rule: 'Type 3 Conditional (if + past perfect → would have + V3). Hypothetical past situation that did NOT happen.' },
        { s: `If the company ________ its quality standards, it would lose ISO certification within a year.`, c: 'lowered', o: ['has lowered', 'had lowered', 'lowers'], rule: 'Type 2 Conditional (if + past simple → would + base verb). Hypothetical / unlikely present scenario.' }
      ];
      const sel = sample(contexts);
      return makeQ(sel.s, sel.c, sel.o, 'advanced',
        [{ word: 'conditional', type: 'grammar', vi: 'câu điều kiện (loại 1/2/3)' }, { word: 'hypothetical', type: 'adj', vi: 'giả định, không có thật' }],
        `Correct: "${sel.c}". ${sel.rule}`,
        `Đáp án đúng: "${sel.c}". ${sel.rule}`);
    }
  },

  // 10. Business Vocabulary — Precision (TOEIC 700-900+)
  {
    level: 'advanced',
    generate: () => {
      const vocabs = [
        { s: `Due to supply chain disruptions, the manufacturer was forced to ________ the product launch by two months.`, c: 'postpone', o: ['accelerate', 'implement', 'resume'], rule: '"Postpone" = hoãn lại. "Accelerate" = tăng tốc (opposite meaning).' },
        { s: `The HR department will ________ the candidates' credentials before extending a formal offer.`, c: 'verify', o: ['certify', 'satisfy', 'modify'], rule: '"Verify" = xác minh thông tin. "Certify" = cấp chứng nhận (different usage).' },
        { s: `The company is seeking to ________ its presence in the Southeast Asian market through strategic partnerships.`, c: 'expand', o: ['deplete', 'restrict', 'withdraw'], rule: '"Expand" = mở rộng. The other options carry opposite or unrelated meanings.' },
        { s: `All travel reimbursements must be ________ before the end of the current fiscal month.`, c: 'submitted', o: ['omitted', 'admitted', 'remitted'], rule: '"Submitted" = nộp/gửi lên. "Remitted" = chuyển tiền (different context). "Omitted" = bỏ qua.' },
        { s: `The new compliance officer will ________ that all branches adhere to updated financial regulations.`, c: 'ensure', o: ['insure', 'assure', 'reassure'], rule: '"Ensure" = đảm bảo rằng điều gì đó xảy ra. "Insure" = mua bảo hiểm. "Assure" = trấn an ai đó.' },
        { s: `The merger is expected to ________ in significant cost savings for both companies over three years.`, c: 'result', o: ['occur', 'happen', 'arise'], rule: '"Result in" = dẫn đến (followed by "in"). "Occur" and "happen" are intransitive — they cannot take a direct object with "in".' }
      ];
      const sel = sample(vocabs);
      return makeQ(sel.s, sel.c, sel.o, 'advanced',
        [{ word: sel.c, type: 'v', vi: sel.rule.split('"')[3] || 'see explanation' }],
        `Correct: "${sel.c}". ${sel.rule}`,
        `Đáp án đúng: "${sel.c}". ${sel.rule}`);
    }
  },

  // 11. Subject-Verb Agreement
  {
    level: 'intermediate',
    generate: () => {
      const contexts = [
        { s: `The number of complaints received this quarter ________ significantly increased compared to last year.`, c: 'has', o: ['have', 'had', 'were'], rule: '"The number of" takes a singular verb ("has increased"). Contrast: "A number of" takes plural.' },
        { s: `Neither the finance department nor the regional managers ________ informed about the restructuring plan.`, c: 'were', o: ['was', 'has been', 'is'], rule: 'With "Neither...nor", the verb agrees with the noun closest to it ("managers" = plural → "were").' },
        { s: `Each of the new employees ________ required to attend an orientation session.`, c: 'is', o: ['are', 'were', 'have been'], rule: '"Each of" always takes a singular verb ("is required").' },
        { s: `The board of directors ________ unanimously voted to approve the acquisition.`, c: 'has', o: ['have', 'were', 'are'], rule: '"The board of directors" is treated as a collective singular noun → "has voted".' }
      ];
      const sel = sample(contexts);
      return makeQ(sel.s, sel.c, sel.o, 'intermediate',
        [{ word: 'subject-verb agreement', type: 'grammar', vi: 'sự hòa hợp giữa chủ ngữ và động từ' }],
        `Correct: "${sel.c}". ${sel.rule}`,
        `Đáp án đúng: "${sel.c}". ${sel.rule}`);
    }
  },

  // 12. Email / Memo Vocabulary
  {
    level: 'basic',
    generate: () => {
      const vocabs = [
        { s: `I am writing to ________ the details of our upcoming meeting scheduled for Thursday, March 14th.`, c: 'confirm', o: ['inform', 'request', 'submit'], rule: '"Confirm" = xác nhận lại thông tin. Common opening phrase in formal TOEIC emails.' },
        { s: `Please ________ all required documents to this application form before submitting it.`, c: 'attach', o: ['detach', 'deduct', 'dispatch'], rule: '"Attach" = đính kèm. "Detach" = tháo ra (opposite). Business email staple.' },
        { s: `We ________ to inform you that your order has been shipped and will arrive within 3–5 business days.`, c: 'are pleased', o: ['are requested', 'are required', 'are reminded'], rule: '"We are pleased to inform you that..." is a standard polite email opening for good news.' },
        { s: `Should you require any further ________, please do not hesitate to contact our support team.`, c: 'assistance', o: ['assist', 'assisting', 'assisted'], rule: '"Assistance" (noun) follows "further" as the direct object of "require".' }
      ];
      const sel = sample(vocabs);
      return makeQ(sel.s, sel.c, sel.o, 'basic',
        [{ word: 'business writing', type: 'phrase', vi: 'văn bản thương mại' }, { word: 'attach', type: 'v', vi: 'đính kèm' }],
        `Correct: "${sel.c}". ${sel.rule}`,
        `Đáp án đúng: "${sel.c}". ${sel.rule}`);
    }
  },

  // 13. Comparative & Superlative in Business Context
  {
    level: 'basic',
    generate: () => {
      const contexts = [
        { s: `This year's profit margin is considerably ________ than it was in the previous fiscal year.`, c: 'higher', o: ['highest', 'highly', 'more high'], rule: '"Higher" is the comparative form of "high" used to compare two periods.' },
        { s: `Of all the proposals submitted, this one is the ________ in terms of cost-effectiveness.`, c: 'most efficient', o: ['more efficient', 'efficiently', 'efficiency'], rule: '"Most efficient" (superlative) compares among three or more options.' },
        { s: `The Q3 results were ________ impressive than Q2, largely due to strong performance in Southeast Asia.`, c: 'more', o: ['most', 'much', 'very'], rule: '"More impressive than" is the correct comparative structure for two-syllable+ adjectives.' }
      ];
      const sel = sample(contexts);
      return makeQ(sel.s, sel.c, sel.o, 'basic',
        [{ word: 'comparative', type: 'grammar', vi: 'so sánh hơn (more... than / -er than)' }, { word: 'superlative', type: 'grammar', vi: 'so sánh nhất (most... / the -est)' }],
        `Correct: "${sel.c}". ${sel.rule}`,
        `Đáp án đúng: "${sel.c}". ${sel.rule}`);
    }
  }
];
