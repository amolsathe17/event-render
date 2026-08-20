const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Submission = require('../models/Submission');
const Payment = require('../models/Payment');
const Event = require('../models/Event');
const Expense = require('../models/Expense');
const Sponsorship = require('../models/Sponsorship');
const AuditLog = require('../models/AuditLog');
const Broadcast = require('../models/Broadcast');
const { protect, authorize } = require('../middleware/auth');

// Helper to escape CSV fields
const escapeCSV = (str) => {
  if (str === null || str === undefined) return '';
  const stringVal = String(str);
  if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return stringVal;
};

// @desc    Export Participant list to CSV / Excel
// @route   GET /api/reports/participants
// @access  Private/Admin
router.get('/participants', protect, authorize('Admin'), async (req, res) => {
  try {
    const { eventId } = req.query;
    const eventsMap = (await Event.find()).reduce((acc, e) => {
      acc[String(e._id)] = e.title;
      return acc;
    }, {});

    let participants;
    if (eventId && eventId !== 'all') {
      const eventSubmissions = await Submission.find({ eventId });
      const userIds = [...new Set(eventSubmissions.map(s => String(s.userId)))];
      participants = await User.find({ _id: { $in: userIds }, role: 'Participant' }).sort({ name: 1 });
    } else {
      participants = await User.find({ role: 'Participant' }).sort({ name: 1 });
    }
    
    let csv = 'ID,Name,Email,Mobile,City,AssignedEvent,Verified,Suspended,RegistrationDate\n';
    
    participants.forEach(p => {
      const assignedTitle = (eventId && eventId !== 'all') ? (eventsMap[eventId] || 'Selected Event') : 'All Events Combined';
      csv += `${escapeCSV(p._id)},${escapeCSV(p.name)},${escapeCSV(p.email)},${escapeCSV(p.mobile)},${escapeCSV(p.city)},${escapeCSV(assignedTitle)},${p.isVerified},${p.isSuspended},${p.createdAt.toISOString()}\n`;
    });

    const filename = (eventId && eventId !== 'all') ? `event-participants-report.csv` : `all-events-participants-report.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Export Revenue report to CSV / Excel
// @route   GET /api/reports/revenue
// @access  Private/Admin
router.get('/revenue', protect, authorize('Admin'), async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = { status: 'Success' };
    if (eventId && eventId !== 'all') {
      filter.eventId = eventId;
    }

    const eventsMap = (await Event.find()).reduce((acc, e) => {
      acc[String(e._id)] = e.title;
      return acc;
    }, {});

    const payments = await Payment.find(filter).sort({ paymentDate: -1 });
    
    let csv = 'TransactionID,InvoiceNumber,EventTitle,Name,Email,PackageName,Amount(INR),PaymentMethod,PaymentDate\n';
    let totalRevenueSum = 0;
    
    payments.forEach(p => {
      const amt = Number(p.amount) || 0;
      totalRevenueSum += amt;
      const evTitle = (p.eventId && eventsMap[String(p.eventId)]) || (eventId && eventsMap[eventId]) || 'All Events Combined';
      csv += `${escapeCSV(p.transactionId)},${escapeCSV(p.invoiceNumber)},${escapeCSV(evTitle)},${escapeCSV(p.userName)},${escapeCSV(p.userEmail)},${escapeCSV(p.packageName)},${amt},${escapeCSV(p.paymentMethod)},${p.paymentDate ? p.paymentDate.toISOString() : ''}\n`;
    });

    // Summary row at the bottom with Total Sum of Amount(INR)
    csv += `TOTAL REVENUE SUMMARY,Total Transactions: ${payments.length},,,,"TOTAL AMOUNT (INR)",${totalRevenueSum},,\n`;

    const filename = eventId ? `event-revenue-report.csv` : `all-events-revenue-report.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(`\uFEFF${csv}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Export Expenses report to CSV / Excel
// @route   GET /api/reports/expenses
// @access  Private/Admin
router.get('/expenses', protect, authorize('Admin'), async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = {};
    if (eventId && eventId !== 'all') filter.eventId = eventId;

    const eventsMap = (await Event.find()).reduce((acc, e) => {
      acc[String(e._id)] = e.title;
      return acc;
    }, {});

    const expenses = await Expense.find(filter).sort({ date: -1 });

    let csv = 'Index,Expense Title,Category,Vendor / Paid To,Amount (INR),Payment Status,Expense Date,Event Title\n';
    let totalExpensesSum = 0;
    let paidExpensesSum = 0;
    let pendingExpensesSum = 0;

    expenses.forEach((e, idx) => {
      const amt = Number(e.amount) || 0;
      totalExpensesSum += amt;
      const status = e.paymentStatus || 'Paid';
      if (status === 'Paid') paidExpensesSum += amt;
      else pendingExpensesSum += amt;

      const evTitle = (e.eventId && eventsMap[String(e.eventId)]) || 'All Events Combined';
      const dateStr = e.date ? new Date(e.date).toLocaleDateString('en-IN') : '';

      csv += `${idx + 1},${escapeCSV(e.name)},${escapeCSV(e.category || 'Operational Expense')},${escapeCSV(e.paidTo || 'Vendor Payout')},${amt},${escapeCSV(status)},${dateStr},${escapeCSV(evTitle)}\n`;
    });

    csv += `\nSUMMARY,TOTAL EXPENSES: ₹${totalExpensesSum},PAID EXPENSES: ₹${paidExpensesSum},PENDING EXPENSES: ₹${pendingExpensesSum},,,\n`;

    const filename = eventId ? `event-expenses-report.csv` : `all-events-expenses-report.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(`\uFEFF${csv}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error exporting expenses' });
  }
});

// @desc    Export Sponsorships report to CSV / Excel
// @route   GET /api/reports/sponsorships
// @access  Private/Admin
router.get('/sponsorships', protect, authorize('Admin'), async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = {};
    if (eventId && eventId !== 'all') filter.eventId = eventId;

    const items = await Sponsorship.find(filter).sort({ fundingDate: -1 });

    let csv = 'Index,Sponsor / Donor Name,Organization,Sponsor Type,Event Title,Amount (INR),Payment Mode,Funding Date,Status,Transaction ID\n';
    let totalSpons = 0;
    let totalDonations = 0;

    items.forEach((s, idx) => {
      const amt = Number(s.amount) || 0;
      if (String(s.sponsorType).toLowerCase().includes('individual') || String(s.sponsorType).toLowerCase().includes('donor')) {
        totalDonations += amt;
      } else {
        totalSpons += amt;
      }

      const dateStr = s.fundingDate ? new Date(s.fundingDate).toLocaleDateString('en-IN') : '';
      csv += `${idx + 1},${escapeCSV(s.sponsorName)},${escapeCSV(s.orgName || '—')},${escapeCSV(s.sponsorType)},${escapeCSV(s.eventTitle || 'All Events Combined')},${amt},${escapeCSV(s.paymentMode)},${dateStr},${escapeCSV(s.status)},${escapeCSV(s.transactionId || '—')}\n`;
    });

    csv += `\nSUMMARY,TOTAL SPONSORSHIP: ₹${totalSpons},TOTAL DONATIONS: ₹${totalDonations},TOTAL FUNDING: ₹${totalSpons + totalDonations},,,,,\n`;

    const filename = eventId ? `event-sponsorships-report.csv` : `all-events-sponsorships-report.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(`\uFEFF${csv}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error exporting sponsorships' });
  }
});

// @desc    Export Profit & Loss report to CSV / Excel
// @route   GET /api/reports/profit_loss
// @access  Private/Admin
router.get('/profit_loss', protect, authorize('Admin'), async (req, res) => {
  try {
    const { eventId } = req.query;
    const filterExp = {};
    const filterPay = { status: 'Success' };
    const filterSpon = {};

    if (eventId && eventId !== 'all') {
      filterExp.eventId = eventId;
      filterPay.eventId = eventId;
      filterSpon.eventId = eventId;
    }

    const expenses = await Expense.find(filterExp).sort({ date: -1 });
    const payments = await Payment.find(filterPay).sort({ paymentDate: -1 });
    const spons = await Sponsorship.find(filterSpon).sort({ fundingDate: -1 });

    let list = [];
    let totalRevenue = 0;
    let totalExpenses = 0;
    let paidSettled = 0;

    payments.forEach(p => {
      const amt = Number(p.amount) || 0;
      totalRevenue += amt;
      list.push({
        name: `Income: ${p.packageName || 'Package Registration'}`,
        category: '▲ Revenue Income',
        payerVendor: p.userName || p.userEmail || 'Participant',
        amount: amt,
        status: 'Paid In',
        date: p.paymentDate
      });
    });

    spons.forEach(s => {
      const amt = Number(s.amount) || 0;
      totalRevenue += amt;
      list.push({
        name: `Grant/Funding: ${s.sponsorName} (${s.sponsorType})`,
        category: '🏢 Sponsorship Funding',
        payerVendor: s.orgName || s.sponsorName,
        amount: amt,
        status: 'Received',
        date: s.fundingDate || s.createdAt
      });
    });

    expenses.forEach(e => {
      const amt = Number(e.amount) || 0;
      totalExpenses += amt;
      if (e.paymentStatus === 'Paid') paidSettled += amt;
      list.push({
        name: `Expense: ${e.name}`,
        category: '▼ Expense Outflow',
        payerVendor: e.paidTo || 'Vendor Payout',
        amount: -amt,
        status: e.paymentStatus === 'Paid' ? 'Paid Out' : 'Pending Payout',
        date: e.date
      });
    });

    list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    let csv = 'Index,Financial Line Item / Description,Financial Type & Category,Payer / Vendor / Event Ref,Net Amount (INR),Status,Log Date\n';

    list.forEach((item, idx) => {
      const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-IN') : '';
      csv += `${idx + 1},${escapeCSV(item.name)},${escapeCSV(item.category)},${escapeCSV(item.payerVendor)},${item.amount},${escapeCSV(item.status)},${dateStr}\n`;
    });

    const netProfitLoss = totalRevenue - totalExpenses;
    csv += `\nPROFIT & LOSS SUMMARY,TOTAL REVENUE: ₹${totalRevenue},TOTAL EXPENSES: ₹${totalExpenses},NET PROFIT / LOSS: ₹${netProfitLoss},PAID / SETTLED: ₹${paidSettled},,\n`;

    const filename = eventId ? `event-profit-loss-report.csv` : `all-events-profit-loss-report.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(`\uFEFF${csv}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error exporting profit & loss' });
  }
});

// @desc    Export Submission report to CSV / Excel
// @route   GET /api/reports/submissions
// @access  Private/Admin
router.get('/submissions', protect, authorize('Admin'), async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = { isFinalSubmitted: true };
    if (eventId && eventId !== 'all') {
      filter.eventId = eventId;
    }

    const eventsMap = (await Event.find()).reduce((acc, e) => {
      acc[String(e._id)] = e.title;
      return acc;
    }, {});

    const submissions = await Submission.find(filter);
    
    let csv = 'SubmissionID,EventTitle,ParticipantName,ParticipantEmail,PhotoID,PhotoTitle,Category,CameraBrandOrMedium,CameraModelOrDimensions,LensOrMaterials,UploadStatus,AverageScore\n';
    
    submissions.forEach(sub => {
      const evTitle = (sub.eventId && eventsMap[String(sub.eventId)]) || (eventId && eventsMap[eventId]) || 'All Events Combined';
      sub.photographs.forEach(photo => {
        const scoresList = photo.scores || [];
        const isDisapprovedByAny = scoresList.some(s => s.approvalStatus === 'Disapproved');
        const avgScore = (scoresList.length > 0 && !isDisapprovedByAny)
          ? scoresList.reduce((acc, s) => acc + s.averageScore, 0) / scoresList.length
          : 0;
        
        csv += `${escapeCSV(sub._id)},${escapeCSV(evTitle)},${escapeCSV(sub.userName)},${escapeCSV(sub.userEmail)},${escapeCSV(photo.id)},${escapeCSV(photo.title)},${escapeCSV(photo.category)},${escapeCSV(photo.cameraBrand)},${escapeCSV(photo.cameraModel)},${escapeCSV(photo.lensUsed)},${escapeCSV(photo.status)},${avgScore.toFixed(2)}\n`;
      });
    });

    const filename = eventId ? `event-photos-metadata-report.csv` : `all-events-photos-metadata-report.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Export Winners list to CSV
// @route   GET /api/reports/winners/:eventId
// @access  Private/Admin
router.get('/winners/:eventId', protect, authorize('Admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    let csv = 'Rank,Reward,UserName,PhotoTitle,Score\n';
    
    if (event.winners && event.winners.length > 0) {
      event.winners.forEach(w => {
        csv += `${escapeCSV(w.rank)},${escapeCSV(w.reward)},${escapeCSV(w.userName)},${escapeCSV(w.photoTitle)},${w.score}\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=winners-${event.title.replace(/\s+/g, '-')}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get 100% REAL MongoDB JSON data for report tables
// @route   GET /api/reports/data/:type
// @access  Private/Admin
router.get('/data/:type', protect, authorize('Admin'), async (req, res) => {
  try {
    const { type } = req.params;
    const { eventId, search, status } = req.query;

    if (type === 'overview') {
      let filter = {};
      if (eventId && eventId !== 'all') filter.eventId = eventId;
      const payments = await Payment.find(filter).sort({ paymentDate: -1 }).limit(10);
      const subs = await Submission.find(filter).sort({ createdAt: -1 }).limit(10);

      let overviewList = [];
      payments.forEach(p => {
        overviewList.push({
          _id: p._id,
          name: `Registration: ${p.packageName || 'Package Entry'}`,
          category: 'Payment Received',
          email: p.userEmail || p.userName,
          amount: p.amount,
          status: p.status || 'Successful',
          createdAt: p.paymentDate
        });
      });
      subs.forEach(s => {
        overviewList.push({
          _id: s._id,
          name: `Submission: ${s.photographs?.[0]?.title || 'Contest Entry'}`,
          category: 'Contest Submission',
          email: s.userEmail || s.userName,
          amount: null,
          score: 'Submitted',
          status: s.isFinalSubmitted ? 'Finalized' : 'Draft',
          createdAt: s.createdAt
        });
      });

      return res.status(200).json({ success: true, data: overviewList });
    }

    if (type === 'participants') {
      let userIds = null;
      if (eventId && eventId !== 'all') {
        const subs = await Submission.find({ eventId });
        userIds = [...new Set(subs.map(s => String(s.userId)))];
      }
      
      let query = { role: 'Participant' };
      if (userIds !== null) {
        query._id = { $in: userIds };
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } }
        ];
      }

      const participants = await User.find(query).sort({ createdAt: -1 });

      const pIds = participants.map(p => p._id);
      const subFilter = { userId: { $in: pIds } };
      if (eventId && eventId !== 'all') subFilter.eventId = eventId;
      const allSubs = await Submission.find(subFilter);

      const payFilter = { userId: { $in: pIds }, status: 'Success' };
      if (eventId && eventId !== 'all') payFilter.eventId = eventId;
      const allPayments = await Payment.find(payFilter);

      const data = participants.map(p => {
        const pIdStr = String(p._id);
        const pSubs = allSubs.filter(s => String(s.userId) === pIdStr);
        const pPays = allPayments.filter(pay => String(pay.userId) === pIdStr);

        const amount = pPays.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        let totalScoreSum = 0;
        let scoreCount = 0;
        pSubs.forEach(s => {
          if (Array.isArray(s.photographs)) {
            s.photographs.forEach(photo => {
              if (Array.isArray(photo.scores)) {
                photo.scores.forEach(sc => {
                  if (typeof sc.averageScore === 'number') {
                    totalScoreSum += sc.averageScore;
                    scoreCount += 1;
                  }
                });
              }
            });
          }
        });
        const score = scoreCount > 0 ? (totalScoreSum / scoreCount).toFixed(1) : null;

        return {
          _id: p._id,
          name: p.name,
          email: p.email,
          mobile: p.mobile || p.phone || '—',
          category: p.city || 'Participant',
          amount: amount > 0 ? amount : null,
          score: score ? `${score}/10` : '—',
          status: p.isSuspended ? 'Suspended' : (p.isVerified ? 'Verified' : 'Pending'),
          createdAt: p.createdAt
        };
      });

      return res.status(200).json({
        success: true,
        data
      });
    }

    if (type === 'revenue') {
      let filter = { status: 'Success' };
      if (eventId && eventId !== 'all') filter.eventId = eventId;
      if (search) {
        filter.$or = [
          { userName: { $regex: search, $options: 'i' } },
          { userEmail: { $regex: search, $options: 'i' } },
          { transactionId: { $regex: search, $options: 'i' } }
        ];
      }
      const payments = await Payment.find(filter).sort({ paymentDate: -1 });
      const totalRevenue = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      return res.status(200).json({
        success: true,
        summary: { totalRevenue },
        data: payments.map(p => ({
          _id: p._id,
          transactionId: p.transactionId || p.invoiceNumber || String(p._id),
          name: p.userName || 'Participant',
          email: p.userEmail || p.transactionId,
          category: p.packageName || 'Package Entry',
          amount: p.amount,
          status: p.status || 'Success',
          createdAt: p.paymentDate
        }))
      });
    }

    if (type === 'winners') {
      let filter = {};
      if (eventId && eventId !== 'all') filter._id = eventId;
      const events = await Event.find(filter);
      let winnersList = [];
      let totalPrizePool = 0;

      events.forEach(ev => {
        let eventPrizeSum = 0;
        if (ev.prizes && ev.prizes.length > 0) {
          ev.prizes.forEach(p => {
            if (p.reward) {
              const match = p.reward.match(/₹\s*([\d,]+)/) || p.reward.match(/(\d[\d,]*)/);
              if (match) {
                const amt = parseInt(match[1].replace(/,/g, ''), 10);
                if (!isNaN(amt)) eventPrizeSum += amt;
              }
            }
          });
        }

        if (ev.winners && ev.winners.length > 0) {
          ev.winners.forEach(w => {
            if (w.reward || w.prizeAmount) {
              const str = w.reward || w.prizeAmount || '';
              const match = str.match(/₹\s*([\d,]+)/) || str.match(/(\d[\d,]*)/);
              if (match) {
                const amt = parseInt(match[1].replace(/,/g, ''), 10);
                if (!isNaN(amt) && eventPrizeSum === 0) eventPrizeSum += amt;
              }
            }
            winnersList.push({
              _id: w._id || `${ev._id}-${w.rank}`,
              name: `${w.rank} - ${w.userName}`,
              email: ev.title,
              category: w.reward || w.prizeAmount || 'Winner Trophy & Prize Reward',
              score: w.score,
              status: 'Winner Declared',
              createdAt: ev.updatedAt
            });
          });
        }

        // If no explicit amount parsed for this event, default to ₹50,000 per contest
        if (eventPrizeSum === 0) eventPrizeSum = 50000;
        totalPrizePool += eventPrizeSum;
      });

      return res.status(200).json({
        success: true,
        summary: { totalPrizePool },
        data: winnersList
      });
    }

    if (type === 'expenses') {
      let filter = {};
      if (eventId && eventId !== 'all') filter.eventId = eventId;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { paidTo: { $regex: search, $options: 'i' } }
        ];
      }
      const expenses = await Expense.find(filter).sort({ date: -1 });
      return res.status(200).json({
        success: true,
        data: expenses.map(e => ({
          _id: e._id,
          name: e.name,
          title: e.name,
          category: e.category || 'Operational Expense',
          email: e.paidTo || 'Vendor Payout',
          paidTo: e.paidTo || 'Vendor Payout',
          amount: e.amount,
          status: e.paymentStatus === 'Paid' ? 'Paid Out' : 'Pending Payout',
          paymentStatus: e.paymentStatus || 'Paid',
          createdAt: e.date
        }))
      });
    }

    if (type === 'profit_loss') {
      let filterExp = {};
      let filterPay = { status: 'Success' };
      if (eventId && eventId !== 'all') {
        filterExp.eventId = eventId;
        filterPay.eventId = eventId;
      }
      const expenses = await Expense.find(filterExp).sort({ date: -1 });
      const payments = await Payment.find(filterPay).sort({ paymentDate: -1 });

      let list = [];
      payments.forEach(p => {
        list.push({
          _id: p._id,
          name: `Income: ${p.packageName || 'Package Registration'}`,
          email: p.userName || p.userEmail,
          category: 'Revenue Income',
          type: 'Income',
          amount: p.amount,
          status: 'Paid In',
          createdAt: p.paymentDate
        });
      });
      expenses.forEach(e => {
        list.push({
          _id: e._id,
          name: `Expense: ${e.name}`,
          email: e.paidTo || 'Vendor Payout',
          category: e.category || 'Operational Expense',
          type: 'Expense',
          amount: -e.amount,
          status: e.paymentStatus === 'Paid' ? 'Paid Out' : 'Pending Payout',
          createdAt: e.date
        });
      });

      return res.status(200).json({ success: true, data: list });
    }

    if (type === 'refunds') {
      let filter = { status: { $in: ['Refunded', 'Failed', 'Cancelled'] } };
      if (eventId && eventId !== 'all') filter.eventId = eventId;
      if (search) {
        filter.$or = [
          { userName: { $regex: search, $options: 'i' } },
          { userEmail: { $regex: search, $options: 'i' } },
          { transactionId: { $regex: search, $options: 'i' } }
        ];
      }
      const payments = await Payment.find(filter).sort({ paymentDate: -1 });

      return res.status(200).json({
        success: true,
        data: payments.map((p, idx) => ({
          _id: p._id,
          transactionId: p.transactionId || p.invoiceNumber || String(p._id),
          name: p.userName || 'Participant Refund',
          email: p.userEmail,
          category: p.cancellationReason || 'Registration Refund',
          amount: p.amount,
          status: p.status || 'Refunded',
          createdAt: p.paymentDate
        }))
      });
    }

    if (type === 'sponsorships') {
      let filter = {};
      if (eventId && eventId !== 'all') filter.eventId = eventId;
      if (search) {
        filter.$or = [
          { sponsorName: { $regex: search, $options: 'i' } },
          { orgName: { $regex: search, $options: 'i' } },
          { transactionId: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }
      const items = await Sponsorship.find(filter).sort({ fundingDate: -1 });

      return res.status(200).json({
        success: true,
        data: items.map(s => ({
          _id: s._id,
          name: s.sponsorName,
          orgName: s.orgName || '—',
          sponsorType: s.sponsorType,
          eventTitle: s.eventTitle || 'All Events Combined',
          amount: s.amount,
          fundingDate: s.fundingDate,
          paymentMode: s.paymentMode,
          status: s.status,
          transactionId: s.transactionId || '—'
        }))
      });
    }

    return res.status(200).json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error fetching report data:', error);
    res.status(500).json({ success: false, message: 'Server error fetching report data' });
  }
});

module.exports = router;
