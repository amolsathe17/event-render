const https = require('https');

/**
 * AI Provider Abstraction Layer
 * Supports Google Gemini API, OpenAI API, or fallback to Verified Knowledge Generator
 */

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
};

// Natural language response generator based strictly on retrieved database facts
const generateVerifiedFactResponse = ({ intent, role, eventInfo, participantData, judgeData, adminData, userQuery }) => {
  const eventTitle = eventInfo?.title || 'Selected Event';
  const queryLower = (userQuery || '').toLowerCase();

  // 1. PARTICIPANT RESPONSES
  if (role === 'Participant') {
    if (intent === 'EVENT_RULES' || queryLower.includes('rule') || queryLower.includes('guideline') || queryLower.includes('requirement')) {
      if (!eventInfo || eventInfo.isAllEvents) {
        return `Please select a specific event from the top event selector to view its rules and regulations.`;
      }
      const rulesList = (eventInfo.rules || []).map((r, i) => `${i + 1}. ${r}`).join('\n');
      return `📌 **Rules & Regulations for ${eventTitle}**:\n\n${rulesList || 'Submissions must be original captures with intact DSLR EXIF data.'}\n\n*Note: All uploaded photos undergo automated DSLR EXIF validation.*`;
    }

    if (intent === 'REGISTRATION_FEE' || queryLower.includes('fee') || queryLower.includes('cost') || queryLower.includes('price') || queryLower.includes('package')) {
      if (!eventInfo || eventInfo.isAllEvents) {
        return `Registration packages vary by contest. Please select an event to view entry fee details.`;
      }
      if (Array.isArray(eventInfo.packages) && eventInfo.packages.length > 0) {
        const pkgs = eventInfo.packages.map(p => `• **${p.name}**: ${formatCurrency(p.price)} (up to ${p.maxPhotos} uploads)`).join('\n');
        return `💳 **Entry Fee & Packages for ${eventTitle}**:\n\n${pkgs}\n\nYou can upgrade or select entry packages on your dashboard.`;
      }
      return `Entry fee for **${eventTitle}** is specified in your participant dashboard package selection.`;
    }

    if (intent === 'MY_PAYMENT' || queryLower.includes('my payment') || queryLower.includes('paid') || queryLower.includes('transaction')) {
      const p = participantData?.paymentSummary;
      if (!p || p.totalPaid === 0) {
        return `You currently have **no successful payments** recorded for this event. Please complete entry fee payment from your participant dashboard to finalize your entry.`;
      }
      return `✅ **Your Payment Summary**:\n\n• **Total Paid**: ${formatCurrency(p.totalPaid)}\n• **Successful Transactions**: ${p.successfulTransactions}\n• **Latest Transaction ID**: \`${p.latestTransactionId || 'Verified'}\`\n• **Status**: Success & Verified`;
    }

    if (intent === 'MY_SUBMISSION' || queryLower.includes('my submission') || queryLower.includes('uploaded') || queryLower.includes('photo') || queryLower.includes('video')) {
      const u = participantData?.uploadsSummary;
      if (!u || u.totalUploaded === 0) {
        return `You have **not uploaded any photographs or videos** for **${eventTitle}** yet. Navigate to your Participant Dashboard to upload your DSLR entries.`;
      }
      return `📸 **Your Submission Status for ${eventTitle}**:\n\n• **Total Uploads**: ${u.totalUploaded} files\n• **Photographs**: ${u.photosCount}\n• **Videos**: ${u.videosCount}\n• **DSLR Verified Files**: ${u.verifiedDslrCount}\n• **Status**: ${participantData.submissions[0]?.entryStatus || 'Uploaded'}`;
    }

    if (intent === 'RESULTS' || queryLower.includes('result') || queryLower.includes('winner') || queryLower.includes('rank')) {
      if (participantData?.results?.isWinner) {
        const w = participantData.results.winnerDetails;
        return `🏆 **CONGRATULATIONS! You are a winner in ${eventTitle}!**\n\n• **Rank**: ${w.rank || 'Winner'}\n• **Prize**: ${w.prizeAmount || 'Trophy & Certificate'}\n• **Jury Score**: ${w.score ? `${w.score}/10` : 'Declared'}`;
      }
      if (eventInfo?.winnersPublished) {
        return `Results for **${eventTitle}** have been published. Check the Gallery & Results page for the official standings!`;
      }
      return `⏳ Results for **${eventTitle}** have not been published yet. The judging panel is currently evaluating submissions. Stay tuned!`;
    }

    if (intent === 'CERTIFICATE' || queryLower.includes('certificate')) {
      if (participantData?.results?.certificateAvailable) {
        return `📜 **Certificate Available!**\nYour official participation certificate for **${eventTitle}** is available for digital download from your Participant Dashboard!`;
      }
      return `Participation certificates are generated after your entry fee payment is verified and final submission is completed.`;
    }

    if (intent === 'EVENT_DETAILS' || queryLower.includes('event') || queryLower.includes('venue') || queryLower.includes('date') || queryLower.includes('deadline')) {
      if (!eventInfo || eventInfo.isAllEvents) {
        return `Here is a summary of our available events. Select a specific contest to view detailed guidelines!`;
      }
      return `ℹ️ **${eventInfo.title}**:\n\n• **Theme**: ${eventInfo.theme}\n• **Venue**: ${eventInfo.venue}\n• **Submission Deadline**: ${eventInfo.deadline}\n• **Status**: ${eventInfo.status}`;
    }
  }

  // 2. JUDGE RESPONSES
  if (role === 'Judge') {
    if (intent === 'JUDGE_ASSIGNED_EVENTS' || queryLower.includes('assigned')) {
      const count = judgeData?.assignedEventsCount || 0;
      if (count === 0) return `You currently have no events assigned for evaluation.`;
      const evList = (judgeData.assignedEvents || []).map(e => `• **${e.title}** (Status: ${e.status || 'Active'})`).join('\n');
      return `⚖️ **Your Assigned Events (${count})**:\n\n${evList}\n\n📌 **Next Action**: Navigate to **Judge Evaluation Desk** in your navigation menu to view assigned entries and submit scores.`;
    }

    if (intent === 'JUDGE_PENDING_EVALUATIONS' || queryLower.includes('pending') || queryLower.includes('evaluat')) {
      const stats = judgeData?.evaluationStats;
      if (!stats) return `No evaluation statistics available.`;
      const pendingCount = stats.pending || 0;
      const nextActionStr = pendingCount > 0
        ? `📌 **Next Action**: You have **${pendingCount} pending submission(s)** requiring scores. Please navigate to **Judge Evaluation Desk** in your navigation menu to review and submit grades.`
        : `✅ **Next Action**: All assigned entries are fully evaluated! No pending items.`;

      return `📊 **Your Evaluation Summary (${eventTitle})**:\n\n` +
        `• **Total Assigned**: ${stats.totalAssigned || 0} submission(s)\n` +
        `• **Completed & Graded**: ${stats.evaluated || 0}\n` +
        `• **Pending Review**: **${pendingCount} remaining**\n\n` +
        nextActionStr;
    }

    if (intent === 'JUDGE_CRITERIA' || queryLower.includes('criteria') || queryLower.includes('grade') || queryLower.includes('scale')) {
      const criteria = (judgeData?.judgingCriteria || []).join('\n');
      return `📝 **Official Judging & Scoring Criteria**:\n\n${criteria}\n\nEach criteria is scored from 1 to 10 for a max total score of 50 per submission.\n\n📌 **Next Action**: Use these standard criteria when evaluating entries in your Judge Evaluation Desk.`;
    }
  }

  // 3. ADMIN RESPONSES
  if (role === 'Admin') {
    if (intent === 'ADMIN_FINANCIAL_SUMMARY' || queryLower.includes('financial') || queryLower.includes('profit') || queryLower.includes('loss') || queryLower.includes('revenue') || queryLower.includes('expense')) {
      const f = adminData?.financialSummary;
      if (!f) return `Financial statistics unavailable.`;
      return `💼 **Financial Summary (${adminData.eventTitle})**:\n\n` +
        `• **Registration Revenue**: ${formatCurrency(f.registrationRevenue)}\n` +
        `• **External Funding**: ${formatCurrency(f.totalExternalFunding)}\n` +
        `• **Total Gross Inflow**: ${formatCurrency(f.totalGrossInflow)}\n` +
        `• **Total Operational Expenses**: ${formatCurrency(f.totalExpenses)}\n` +
        `  - Paid Payouts: ${formatCurrency(f.paidExpenses)}\n` +
        `  - Pending Payouts: ${formatCurrency(f.pendingExpenses)}\n` +
        `• **Net Profit / Loss**: **${formatCurrency(f.netProfitLoss)}** (${f.netProfitLoss >= 0 ? 'Surplus' : 'Deficit'})`;
    }

    if (intent === 'ADMIN_SPONSORSHIP_CSR' || queryLower.includes('csr') || queryLower.includes('sponsor') || queryLower.includes('donation') || queryLower.includes('grant') || queryLower.includes('government')) {
      const b = adminData?.fundingBreakdown;
      if (!b) return `Sponsorship & Funding details unavailable.`;
      return `🏛️ **Donation, Sponsorship & CSR Funding Breakdown (${adminData.eventTitle})**:\n\n` +
        `• **Corporate Sponsorship**: ${formatCurrency(b.corporateSponsorship)}\n` +
        `• **CSR Funding**: ${formatCurrency(b.csrFunding)}\n` +
        `• **Government Grants & Schemes**: ${formatCurrency(b.govtFunding)}\n` +
        `• **Institute Funding**: ${formatCurrency(b.instituteFunding)}\n` +
        `• **NGO / Trust Grants**: ${formatCurrency(b.ngoFunding)}\n` +
        `• **Individual Donations**: ${formatCurrency(b.individualDonations)}\n` +
        `• **Total Funding Inflow**: **${formatCurrency(b.totalSponsorship)}**`;
    }

    if (intent === 'ADMIN_EVENT_STATS' || queryLower.includes('participant') || queryLower.includes('submission') || queryLower.includes('stat')) {
      const s = adminData?.stats;
      if (!s) return `System statistics unavailable.`;
      return `📈 **Executive System Overview (${adminData.eventTitle})**:\n\n` +
        `• **Total Participants**: ${s.totalParticipants}\n` +
        `• **Total Assigned Judges**: ${s.totalJudges}\n` +
        `• **Active Contests**: ${s.activeEventsCount}\n` +
        `• **Event Submissions**: ${s.totalSubmissions}\n` +
        `• **Uploaded Media Files**: ${s.totalUploadedMedia} (DSLR Verified: ${s.verifiedMedia})`;
    }

    if (intent === 'ADMIN_JUDGE_EVALUATIONS' || queryLower.includes('judge evaluation') || queryLower.includes('evaluation status') || queryLower.includes('event wise') || (queryLower.includes('judge') && queryLower.includes('status'))) {
      const evList = adminData?.eventWiseJudgeEvaluations || [];
      if (!evList || evList.length === 0) {
        return `No event-wise judge evaluation data is currently available.`;
      }

      let text = `⚖️ **Event-Wise Judge Evaluation Status**:\n\n`;
      let totalAllPhotos = 0;
      let totalAllEvaluated = 0;
      let totalAllPending = 0;

      evList.forEach(e => {
        totalAllPhotos += e.totalPhotos;
        totalAllEvaluated += e.evaluatedPhotos;
        totalAllPending += e.pendingPhotos;

        text += `🏆 **${e.eventTitle}** (${e.status || 'Active'})\n` +
          `• **Assigned Judges**: ${e.assignedJudgeNames} (${e.assignedJudgesCount})\n` +
          `• **Total Submissions**: ${e.totalPhotos} entries\n` +
          `• **Evaluated & Graded**: ${e.evaluatedPhotos}\n` +
          `• **Pending Review**: **${e.pendingPhotos} remaining**\n` +
          `• **Progress**: **${e.completionRate}% Completed**\n\n`;
      });

      const overallProgress = totalAllPhotos > 0 ? Math.round((totalAllEvaluated / totalAllPhotos) * 100) : 0;
      text += `📊 **Overall Evaluation Summary (All Contests Combined)**:\n` +
        `• **Total Submissions**: ${totalAllPhotos}\n` +
        `• **Total Evaluated**: ${totalAllEvaluated}\n` +
        `• **Total Pending**: **${totalAllPending} remaining**\n` +
        `• **Overall Progress**: **${overallProgress}% Completed**`;

      return text;
    }
  }

  // GENERAL FALLBACK RESPONSE
  if (eventInfo && !eventInfo.isAllEvents) {
    return `I am your Event Assistant for **${eventInfo.title}**.\n\nYou can ask me about event rules, registration status, payment records, judging criteria, or financial summaries!`;
  }
  return `Hello! I am your Event Assistant. Please ask any question regarding contest rules, registration, payments, submissions, or results!`;
};

/**
 * Call AI Model or Fallback Provider
 */
const generateAIResponse = async ({ intent, role, eventInfo, participantData, judgeData, adminData, userQuery }) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

  if (!apiKey) {
    // Return verified factual response engine result
    return generateVerifiedFactResponse({ intent, role, eventInfo, participantData, judgeData, adminData, userQuery });
  }

  // System Prompt strictly instructing AI model not to hallucinate
  const systemPrompt = `You are the official AI Event Assistant for the DSLR Photography Contest & Event Management System.
Role of authenticated user: ${role}
Selected Event: ${eventInfo?.title || 'All Events Combined'}

RULES:
1. Answer strictly using ONLY the provided verified context facts below. Do NOT invent dates, fees, rules, figures, amounts, names, or winners.
2. If information is not present in the context below, clearly state: "I couldn't find this information in the event system. Please contact event support for assistance."
3. Be professional, clear, concise, and friendly. Use bullet points and currency formatting (₹) where appropriate.

VERIFIED DATABASE CONTEXT:
- Event Info: ${JSON.stringify(eventInfo)}
- Participant Private Context: ${JSON.stringify(participantData)}
- Judge Context: ${JSON.stringify(judgeData)}
- Admin Context: ${JSON.stringify(adminData)}
`;

  try {
    if (process.env.GEMINI_API_KEY || process.env.AI_API_KEY) {
      // Call Gemini REST API directly with timeout
      const key = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
      const model = process.env.AI_MODEL || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

      const postData = JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${userQuery}` }] }
        ]
      });

      const responseText = await new Promise((resolve, reject) => {
        const req = https.request(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          },
          timeout: 10000
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              resolve(text);
            } catch (e) {
              resolve(null);
            }
          });
        });
        req.on('error', err => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
        req.write(postData);
        req.end();
      });

      if (responseText) return responseText;
    }
  } catch (err) {
    console.warn('AI Provider API call failed or timed out. Falling back to Verified Fact Engine:', err.message);
  }

  return generateVerifiedFactResponse({ intent, role, eventInfo, participantData, judgeData, adminData, userQuery });
};

module.exports = {
  generateAIResponse,
  generateVerifiedFactResponse
};
