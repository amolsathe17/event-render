/**
 * Chatbot Role-Based Security & Permission Engine
 * 
 * Strict pre-query security check:
 * 1. Authenticate & identify user role (Participant, Judge, Admin)
 * 2. Identify query intent & classify restricted topics
 * 3. Check role permission BEFORE any database retrieval
 * 4. Return polite, professional, role-specific refusal if unauthorized
 */

const INTENTS = {
  // Restricted Financial & Admin Intents
  SPONSORSHIP: 'SPONSORSHIP',
  DONATION: 'DONATION',
  CSR_FUNDING: 'CSR_FUNDING',
  GOVERNMENT_FUNDING: 'GOVERNMENT_FUNDING',
  NGO_FUNDING: 'NGO_FUNDING',
  INSTITUTE_FUNDING: 'INSTITUTE_FUNDING',
  REVENUE: 'REVENUE',
  EXPENSES: 'EXPENSES',
  PROFIT_LOSS: 'PROFIT_LOSS',
  ADMIN_REPORT: 'ADMIN_REPORT',
  OTHER_PRIVATE_DATA: 'OTHER_PRIVATE_DATA',
  PROMPT_INJECTION: 'PROMPT_INJECTION',

  // Unrelated General
  GENERAL_UNRELATED: 'GENERAL_UNRELATED',

  // Allowed Participant Intents
  EVENT_RULES: 'EVENT_RULES',
  REGISTRATION_FEE: 'REGISTRATION_FEE',
  MY_PAYMENT: 'MY_PAYMENT',
  MY_SUBMISSION: 'MY_SUBMISSION',
  RESULTS: 'RESULTS',
  CERTIFICATE: 'CERTIFICATE',
  EVENT_DETAILS: 'EVENT_DETAILS',
  CONTACT_HELP: 'CONTACT_HELP',

  // Allowed Judge Intents
  JUDGE_ASSIGNED_EVENTS: 'JUDGE_ASSIGNED_EVENTS',
  JUDGE_PENDING_EVALUATIONS: 'JUDGE_PENDING_EVALUATIONS',
  JUDGE_CRITERIA: 'JUDGE_CRITERIA',

  // Allowed Admin Intents
  ADMIN_FINANCIAL_SUMMARY: 'ADMIN_FINANCIAL_SUMMARY',
  ADMIN_SPONSORSHIP_CSR: 'ADMIN_SPONSORSHIP_CSR',
  ADMIN_EVENT_STATS: 'ADMIN_EVENT_STATS',
  ADMIN_JUDGE_EVALUATIONS: 'ADMIN_JUDGE_EVALUATIONS',

  GENERAL_HELP: 'GENERAL_HELP'
};

/**
 * Detect query intent and check for prompt injection or restricted topics
 */
const classifyIntent = (message) => {
  const q = (message || '').toLowerCase().trim();

  // 1. Check Prompt Injection / Jailbreak Attempts
  const injectionPatterns = [
    'ignore previous', 'ignore instruction', 'forget instruction', 'disregard instruction',
    'override permission', 'act as', 'system prompt', 'hidden instruction', 'bypass security',
    'reveal prompt', 'reveal instruction', 'reveal api', 'reveal database'
  ];
  if (injectionPatterns.some(p => q.includes(p))) {
    return INTENTS.PROMPT_INJECTION;
  }

  // 2. Check Specific Restricted Financial & Funding Intents
  if (q.includes('csr') || q.includes('corporate social responsibility')) {
    return INTENTS.CSR_FUNDING;
  }
  if (q.includes('sponsor') || q.includes('sponsorship') || q.includes('sponsored') || q.includes('who sponsored')) {
    return INTENTS.SPONSORSHIP;
  }
  if (q.includes('donation') || q.includes('donor') || q.includes('donated') || q.includes('charity')) {
    return INTENTS.DONATION;
  }
  if (q.includes('government') || q.includes('govt') || q.includes('grant') || q.includes('scheme')) {
    return INTENTS.GOVERNMENT_FUNDING;
  }
  if (q.includes('ngo') || q.includes('trust funding') || q.includes('foundation grant')) {
    return INTENTS.NGO_FUNDING;
  }
  if (q.includes('institute') || q.includes('school funding') || q.includes('college grant')) {
    return INTENTS.INSTITUTE_FUNDING;
  }
  if (q.includes('revenue') || q.includes('gross inflow') || q.includes('total earnings') || q.includes('collections')) {
    return INTENTS.REVENUE;
  }
  if (q.includes('expense') || q.includes('expenses') || q.includes('payout') || q.includes('cost of event') || q.includes('budget')) {
    return INTENTS.EXPENSES;
  }
  if (q.includes('profit') || q.includes('loss') || q.includes('financial summary') || q.includes('external funding') || q.includes('money came from') || q.includes('ledger') || q.includes('balance sheet')) {
    return INTENTS.PROFIT_LOSS;
  }
  if (q.includes('other participant') || q.includes('another user') || q.includes('someone else payment') || q.includes('other payment')) {
    return INTENTS.OTHER_PRIVATE_DATA;
  }

  // 3. Check General Unrelated Questions (Off-topic trivia, weather, etc.)
  const unrelatedPatterns = [
    'capital of', 'weather', 'recipe', 'tell me a joke', 'who is president',
    'solve math', 'write code', 'how to cook', 'what time is it in', 'who won the world cup'
  ];
  if (unrelatedPatterns.some(p => q.includes(p))) {
    return INTENTS.GENERAL_UNRELATED;
  }

  // 4. Participant & General Event Allowed Intents
  if (q.includes('rule') || q.includes('guideline') || q.includes('regulation') || q.includes('requirement')) return INTENTS.EVENT_RULES;
  if (q.includes('fee') || q.includes('cost') || q.includes('price') || q.includes('package') || q.includes('pay fee')) return INTENTS.REGISTRATION_FEE;
  if (q.includes('my payment') || q.includes('paid') || q.includes('transaction') || q.includes('payment status')) return INTENTS.MY_PAYMENT;
  if (q.includes('my submission') || q.includes('upload') || q.includes('photo') || q.includes('video') || q.includes('my entry')) return INTENTS.MY_SUBMISSION;
  if (q.includes('result') || q.includes('winner') || q.includes('rank') || q.includes('score')) return INTENTS.RESULTS;
  if (q.includes('certificate')) return INTENTS.CERTIFICATE;
  if (q.includes('assigned')) return INTENTS.JUDGE_ASSIGNED_EVENTS;
  if (q.includes('pending') || q.includes('evaluate') || q.includes('grading')) return INTENTS.JUDGE_PENDING_EVALUATIONS;
  if (q.includes('criteria') || q.includes('scale') || q.includes('mark')) return INTENTS.JUDGE_CRITERIA;
  if (q.includes('event') || q.includes('venue') || q.includes('date') || q.includes('deadline') || q.includes('about')) return INTENTS.EVENT_DETAILS;
  if (q.includes('contact') || q.includes('support') || q.includes('help')) return INTENTS.CONTACT_HELP;

  return INTENTS.GENERAL_HELP;
};

/**
 * Evaluate Security & Role Permission BEFORE Database Query
 * Returns { allowed: boolean, intent: string, responseMessage?: string }
 */
const evaluateSecurityAndPermission = (message, role) => {
  const intent = classifyIntent(message);

  // 1. Handle Prompt Injection
  if (intent === INTENTS.PROMPT_INJECTION) {
    return {
      allowed: false,
      intent,
      responseMessage: `Sorry, I am your Event Assistant and can help you with event-related information available to you.`
    };
  }

  // 2. Handle Unrelated General Questions (e.g. "What is the capital of India?")
  if (intent === INTENTS.GENERAL_UNRELATED) {
    if (role === 'Judge') {
      return {
        allowed: false,
        intent,
        responseMessage: `Sorry, I can help you with assigned events, event rules, judging criteria, evaluations, and evaluation history.`
      };
    }
    return {
      allowed: false,
      intent,
      responseMessage: `Sorry, I can help you with event, registration, submission, payment, results, and certificate-related information.`
    };
  }

  // 3. Restricted Financial & Admin Intents Check for Non-Admins
  const isRestrictedFinancialIntent = [
    INTENTS.SPONSORSHIP,
    INTENTS.DONATION,
    INTENTS.CSR_FUNDING,
    INTENTS.GOVERNMENT_FUNDING,
    INTENTS.NGO_FUNDING,
    INTENTS.INSTITUTE_FUNDING,
    INTENTS.REVENUE,
    INTENTS.EXPENSES,
    INTENTS.PROFIT_LOSS,
    INTENTS.ADMIN_REPORT,
    INTENTS.OTHER_PRIVATE_DATA
  ].includes(intent);

  if (role === 'Participant') {
    if (isRestrictedFinancialIntent) {
      return {
        allowed: false,
        intent,
        responseMessage: `Sorry, I can help you with event, registration, submission, payment, results, and certificate-related information.`
      };
    }
  }

  if (role === 'Judge') {
    if (isRestrictedFinancialIntent) {
      return {
        allowed: false,
        intent,
        responseMessage: `Sorry, I can help you with assigned events, event rules, judging criteria, evaluations, and evaluation history.`
      };
    }
  }

  // 4. Admin Role Check: Admin can access financial/administrative intents if authorized
  if (role === 'Admin') {
    // Map specific restricted intents to Admin intents
    let adminMappedIntent = intent;
    if (intent === INTENTS.SPONSORSHIP || intent === INTENTS.CSR_FUNDING || intent === INTENTS.DONATION || intent === INTENTS.GOVERNMENT_FUNDING || intent === INTENTS.NGO_FUNDING || intent === INTENTS.INSTITUTE_FUNDING) {
      adminMappedIntent = INTENTS.ADMIN_SPONSORSHIP_CSR;
    } else if (intent === INTENTS.REVENUE || intent === INTENTS.EXPENSES || intent === INTENTS.PROFIT_LOSS) {
      adminMappedIntent = INTENTS.ADMIN_FINANCIAL_SUMMARY;
    }

    return {
      allowed: true,
      intent: adminMappedIntent
    };
  }

  // Allowed for Participant or Judge
  return {
    allowed: true,
    intent
  };
};

module.exports = {
  INTENTS,
  classifyIntent,
  evaluateSecurityAndPermission
};
