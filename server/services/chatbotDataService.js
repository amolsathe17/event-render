const Event = require('../models/Event');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Sponsorship = require('../models/Sponsorship');

/**
 * Controlled Backend Data Retriever for Chatbot
 * Enforces role-based security, event isolation, and prevents AI database hallucination.
 */

// 1. Fetch Event Specific Public Context (Event info, dates, fees, rules, categories, FAQs, prizes)
const getEventInfo = async (eventId) => {
  if (!eventId || eventId === 'all') {
    const events = await Event.find({ status: { $ne: 'Draft' } }).sort({ startDate: -1 });
    return {
      isAllEvents: true,
      count: events.length,
      events: events.map(e => ({
        id: String(e._id),
        title: e.title,
        theme: e.theme,
        venue: e.venue || 'Online / Hybrid',
        deadline: e.deadline ? new Date(e.deadline).toLocaleDateString('en-IN') : 'N/A',
        startDate: e.startDate ? new Date(e.startDate).toLocaleDateString('en-IN') : 'N/A',
        status: e.status
      }))
    };
  }

  const event = await Event.findById(eventId);
  if (!event) return null;

  return {
    id: String(event._id),
    title: event.title,
    eventType: event.eventType || 'Photography',
    theme: event.theme,
    description: event.description || '',
    venue: event.venue || 'Online / Hybrid Venue',
    deadline: event.deadline ? new Date(event.deadline).toLocaleDateString('en-IN') : 'N/A',
    startDate: event.startDate ? new Date(event.startDate).toLocaleDateString('en-IN') : 'N/A',
    eventDate: event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-IN') : 'N/A',
    exhibitionDates: event.hasExhibition ? `${event.exhibitionFromDate ? new Date(event.exhibitionFromDate).toLocaleDateString('en-IN') : 'TBD'} to ${event.exhibitionToDate ? new Date(event.exhibitionToDate).toLocaleDateString('en-IN') : 'TBD'}` : 'No Exhibition',
    rules: Array.isArray(event.rules) && event.rules.length > 0 ? event.rules : ['Submissions must be original DSLR captures with intact EXIF data.'],
    terms: Array.isArray(event.terms) ? event.terms : [],
    packages: Array.isArray(event.packages) ? event.packages.map(p => ({
      name: p.name,
      price: p.price,
      maxPhotos: p.maxPhotos
    })) : [],
    prizes: Array.isArray(event.prizes) ? event.prizes : [],
    faqs: Array.isArray(event.faqs) ? event.faqs : [],
    winnersPublished: event.winnersPublished || false,
    winnersCount: Array.isArray(event.winners) ? event.winners.length : 0,
    status: event.status
  };
};

// 2. Fetch Participant Private Context (Registration, Payments, Uploads, Scores, Certificates)
const getParticipantContext = async (user, eventId) => {
  const userIdStr = String(user._id || user.id);

  // Submissions for this participant
  const subFilter = { userId: userIdStr };
  if (eventId && eventId !== 'all') {
    subFilter.eventId = eventId;
  }
  const userSubmissions = await Submission.find(subFilter);

  // Payments for this participant
  const payFilter = { userId: userIdStr };
  if (eventId && eventId !== 'all') {
    payFilter.eventId = eventId;
  }
  const userPayments = await Payment.find(payFilter);

  // Extract uploaded photos & videos count
  let totalPhotos = 0;
  let totalVideos = 0;
  let verifiedCount = 0;
  let scoresList = [];

  userSubmissions.forEach(sub => {
    if (Array.isArray(sub.photographs)) {
      sub.photographs.forEach(photo => {
        if (photo.mediaType === 'video') totalVideos++;
        else totalPhotos++;

        if (photo.dslrValidationStatus === 'VERIFIED') verifiedCount++;

        if (Array.isArray(photo.scores) && photo.scores.length > 0) {
          const avg = photo.scores[0].averageScore || photo.scores[0].totalScore / 5;
          scoresList.push({
            photoTitle: photo.title,
            category: photo.category,
            averageScore: avg ? `${avg.toFixed(1)}/10` : 'Evaluated',
            remarks: photo.scores[0].remarks || 'Good submission'
          });
        }
      });
    }
  });

  const totalPaidAmount = userPayments
    .filter(p => p.status === 'Success')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const pendingPayments = userPayments.filter(p => p.status === 'Pending');

  // Check event winners & certificate availability
  let isWinner = false;
  let winnerDetails = null;
  if (eventId && eventId !== 'all') {
    const ev = await Event.findById(eventId);
    if (ev && ev.winnersPublished && Array.isArray(ev.winners)) {
      const win = ev.winners.find(w => String(w.userId) === userIdStr);
      if (win) {
        isWinner = true;
        winnerDetails = win;
      }
    }
  }

  return {
    participantName: user.name,
    email: user.email,
    registeredEventsCount: userSubmissions.length,
    isRegisteredForCurrentEvent: userSubmissions.length > 0,
    submissions: userSubmissions.map(s => ({
      eventId: s.eventId,
      eventTitle: s.eventTitle,
      packageId: s.packageId,
      entryNumber: s.entryNumber || 'Draft Entry',
      paymentStatus: s.paymentStatus || 'Unpaid',
      entryStatus: s.entryStatus || 'Draft',
      isFinalSubmitted: s.isFinalSubmitted,
      submissionDate: s.submissionDate ? new Date(s.submissionDate).toLocaleDateString('en-IN') : 'In Draft'
    })),
    uploadsSummary: {
      totalUploaded: totalPhotos + totalVideos,
      photosCount: totalPhotos,
      videosCount: totalVideos,
      verifiedDslrCount: verifiedCount
    },
    paymentSummary: {
      totalPaid: totalPaidAmount,
      successfulTransactions: userPayments.filter(p => p.status === 'Success').length,
      hasPendingPayment: pendingPayments.length > 0,
      latestTransactionId: userPayments.length > 0 ? userPayments[userPayments.length - 1].transactionId : null
    },
    evaluations: scoresList,
    results: {
      isWinner,
      winnerDetails,
      certificateAvailable: totalPaidAmount > 0 || userSubmissions.some(s => s.isFinalSubmitted)
    }
  };
};

// 3. Fetch Judge Context (Assigned Events, Assigned Submissions, Evaluation History)
const getJudgeContext = async (user, eventId) => {
  const userIdStr = String(user._id || user.id);

  // Assigned Events
  const assignedEvents = await Event.find({ assignedJudges: userIdStr });
  const assignedEventIds = assignedEvents.map(e => String(e._id));

  // Submissions assigned to this judge
  const subFilter = { eventId: { $in: assignedEventIds } };
  if (eventId && eventId !== 'all') {
    subFilter.eventId = eventId;
  }
  const submissions = await Submission.find(subFilter);

  let totalAssignedPhotos = 0;
  let evaluatedPhotos = 0;
  let pendingPhotos = 0;
  let evaluationRecords = [];

  submissions.forEach(sub => {
    if (Array.isArray(sub.photographs)) {
      sub.photographs.forEach(photo => {
        const isAssigned = Array.isArray(photo.assignedJudges) ? photo.assignedJudges.includes(userIdStr) : true;
        if (isAssigned) {
          totalAssignedPhotos++;
          const judgeScore = Array.isArray(photo.scores) ? photo.scores.find(s => String(s.judgeId) === userIdStr) : null;
          if (judgeScore) {
            evaluatedPhotos++;
            evaluationRecords.push({
              photoTitle: photo.title,
              category: photo.category,
              score: judgeScore.averageScore ? `${judgeScore.averageScore}/10` : `${judgeScore.totalScore}/50`,
              remarks: judgeScore.remarks || 'Evaluated',
              date: judgeScore.gradedAt ? new Date(judgeScore.gradedAt).toLocaleDateString('en-IN') : 'Recent'
            });
          } else {
            pendingPhotos++;
          }
        }
      });
    }
  });

  return {
    judgeName: user.name,
    assignedEventsCount: assignedEvents.length,
    assignedEvents: assignedEvents.map(e => ({ id: String(e._id), title: e.title, status: e.status })),
    evaluationStats: {
      totalAssigned: totalAssignedPhotos,
      evaluated: evaluatedPhotos,
      pending: pendingPhotos
    },
    judgingCriteria: [
      '1. Creativity & Originality (1-10)',
      '2. Composition & Framing (1-10)',
      '3. Technical Quality & Focus (1-10)',
      '4. Storytelling & Mood (1-10)',
      '5. Overall Visual Impact (1-10)'
    ],
    recentEvaluations: evaluationRecords.slice(-5)
  };
};

// 4. Fetch Admin Context (System Stats, Revenue, Expenses, Net Profit/Loss, Sponsorships, CSR, Grants)
const getAdminContext = async (eventId) => {
  // Query Filters
  const eventFilter = eventId && eventId !== 'all' ? { eventId } : {};
  const expenseFilter = eventId && eventId !== 'all' ? { eventId } : {};
  const sponsorFilter = eventId && eventId !== 'all' ? { eventId } : {};

  // 1. Overall counts
  const totalParticipants = await User.countDocuments({ role: 'Participant' });
  const totalJudges = await User.countDocuments({ role: 'Judge' });
  const activeEventsCount = await Event.countDocuments({ status: 'Active' });
  const totalEventsCount = await Event.countDocuments({});

  // 2. Submissions
  const submissions = await Submission.find(eventFilter);
  let totalUploadedMedia = 0;
  let verifiedMedia = 0;
  submissions.forEach(sub => {
    if (Array.isArray(sub.photographs)) {
      totalUploadedMedia += sub.photographs.length;
      verifiedMedia += sub.photographs.filter(p => p.dslrValidationStatus === 'VERIFIED').length;
    }
  });

  // 3. Revenue (Registration payments)
  const payments = await Payment.find({ ...eventFilter, status: 'Success' });
  const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // 4. Expenses
  const expenses = await Expense.find(expenseFilter);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const paidExpenses = expenses.filter(e => e.paymentStatus === 'Paid').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const pendingExpenses = expenses.filter(e => e.paymentStatus === 'Pending').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // 5. Sponsorships, CSR, Donations & Funding
  const sponsorships = await Sponsorship.find(sponsorFilter);
  let totalSponsorship = 0;
  let csrFunding = 0;
  let govtFunding = 0;
  let instituteFunding = 0;
  let ngoFunding = 0;
  let individualDonations = 0;

  sponsorships.forEach(s => {
    const amt = Number(s.amount) || 0;
    totalSponsorship += amt;

    const type = String(s.sponsorType || s.category || '').toLowerCase();
    if (type.includes('csr')) csrFunding += amt;
    else if (type.includes('gov')) govtFunding += amt;
    else if (type.includes('institute') || type.includes('school') || type.includes('college')) instituteFunding += amt;
    else if (type.includes('ngo') || type.includes('trust') || type.includes('foundation')) ngoFunding += amt;
    else if (type.includes('individual') || type.includes('donation')) individualDonations += amt;
  });

  const totalExternalFunding = totalSponsorship;
  const grossInflow = totalRevenue + totalExternalFunding;
  const netProfitLoss = grossInflow - totalExpenses;

  // Selected Event Title
  let selectedEventTitle = 'All Events Combined';
  if (eventId && eventId !== 'all') {
    const ev = await Event.findById(eventId);
    if (ev) selectedEventTitle = ev.title;
  }

  // 6. Event-Wise Judge Evaluation Status
  const allEventsList = await Event.find({}).populate('assignedJudges', 'name email');
  const allSubmissionsList = await Submission.find({});

  const eventWiseJudgeEvaluations = allEventsList.map(ev => {
    const evSubs = allSubmissionsList.filter(s => String(s.eventId) === String(ev._id));
    let totalPhotos = 0;
    let evaluatedPhotos = 0;
    let pendingPhotos = 0;

    evSubs.forEach(sub => {
      if (Array.isArray(sub.photographs)) {
        sub.photographs.forEach(photo => {
          totalPhotos++;
          if (Array.isArray(photo.scores) && photo.scores.length > 0) {
            evaluatedPhotos++;
          } else {
            pendingPhotos++;
          }
        });
      }
    });

    const completionRate = totalPhotos > 0 ? Math.round((evaluatedPhotos / totalPhotos) * 100) : 0;
    const judgeNames = Array.isArray(ev.assignedJudges) && ev.assignedJudges.length > 0
      ? ev.assignedJudges.map(j => j.name || 'Judge').join(', ')
      : 'None Assigned';

    return {
      eventId: String(ev._id),
      eventTitle: ev.title,
      status: ev.status,
      assignedJudgesCount: Array.isArray(ev.assignedJudges) ? ev.assignedJudges.length : 0,
      assignedJudgeNames: judgeNames,
      totalPhotos,
      evaluatedPhotos,
      pendingPhotos,
      completionRate
    };
  });

  return {
    eventTitle: selectedEventTitle,
    stats: {
      totalParticipants,
      totalJudges,
      activeEventsCount,
      totalEventsCount,
      totalSubmissions: submissions.length,
      totalUploadedMedia,
      verifiedMedia
    },
    financialSummary: {
      registrationRevenue: totalRevenue,
      totalExternalFunding,
      totalGrossInflow: grossInflow,
      totalExpenses,
      paidExpenses,
      pendingExpenses,
      netProfitLoss
    },
    fundingBreakdown: {
      corporateSponsorship: totalSponsorship - (csrFunding + govtFunding + instituteFunding + ngoFunding + individualDonations),
      csrFunding,
      govtFunding,
      instituteFunding,
      ngoFunding,
      individualDonations,
      totalSponsorship
    },
    eventWiseJudgeEvaluations,
    sponsorsList: sponsorships.map(s => ({
      name: s.sponsorName || s.name,
      org: s.orgName || 'N/A',
      type: s.sponsorType || 'Corporate',
      amount: s.amount,
      status: s.status || 'Received'
    }))
  };
};

module.exports = {
  getEventInfo,
  getParticipantContext,
  getJudgeContext,
  getAdminContext
};
