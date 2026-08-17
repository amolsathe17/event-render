const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const Submission = require('../models/Submission');
const Sponsorship = require('../models/Sponsorship');
const { protect, authorize } = require('../middleware/auth');

// Multer storage for expense receipts
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/receipts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `receipt-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, JPG, PNG, WEBP, and PDF receipt files are allowed.'));
  }
});

// @route   POST /api/expenses/upload-receipt
// @desc    Upload receipt file
// @access  Private/Admin
router.post('/upload-receipt', protect, authorize('Admin'), (req, res) => {
  upload.single('receipt')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const fileUrl = `/uploads/receipts/${req.file.filename}`;
    res.json({ success: true, fileUrl, filename: req.file.originalname });
  });
});

// @route   GET /api/expenses
// @desc    Get all expenses (optional eventId, search, category, paymentStatus filters)
// @access  Private/Admin
router.get('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const { eventId, search, category, paymentStatus } = req.query;
    const filter = {};

    if (eventId) {
      filter.eventId = eventId;
    }

    if (category) {
      filter.category = category;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { paidTo: searchRegex },
        { subcategory: searchRegex },
        { notes: searchRegex }
      ];
    }

    const expenses = await Expense.find(filter)
      .populate('eventId', 'title status mediaType eventType')
      .populate('createdBy', 'name email')
      .sort({ date: -1, createdAt: -1 });

    res.json({ success: true, expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, message: 'Server error fetching expenses' });
  }
});

// @route   GET /api/expenses/summary
// @desc    Get financial summary (Total Revenue, Total Expenses, Paid, Pending, Net Profit/Loss, Category Breakdown, Event-wise Ledger)
// @access  Private/Admin
router.get('/summary', protect, authorize('Admin'), async (req, res) => {
  try {
    const { eventId } = req.query;
    const allEvents = await Event.find({}).sort({ createdAt: -1 });

    if (eventId) {
      // Single event financial summary
      const eventObj = await Event.findById(eventId);
      if (!eventObj) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      // Calculate Event Revenue
      const successfulPayments = await Payment.find({ eventId, status: 'Success' });
      const totalRevenue = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Sponsorships & Donations for this event
      const sponsorships = await Sponsorship.find({ eventId });
      let totalSponsorship = 0;
      let totalDonations = 0;
      let csrFunding = 0;
      let govtFunding = 0;
      let pendingFunding = 0;

      sponsorships.forEach(s => {
        const amt = Number(s.amount) || 0;
        const st = (s.sponsorType || '').toLowerCase();
        const stat = (s.status || '').toLowerCase();
        if (st.includes('csr')) csrFunding += amt;
        else if (st.includes('government')) govtFunding += amt;
        else if (st.includes('individual') || st.includes('trust') || st.includes('ngo')) totalDonations += amt;
        else totalSponsorship += amt;

        if (stat.includes('pending') || stat.includes('partially')) pendingFunding += amt;
      });

      const totalFunding = totalSponsorship + totalDonations + csrFunding + govtFunding;
      const grandTotalRevenue = totalRevenue + totalFunding;

      // Expenses for this event
      const expenses = await Expense.find({ eventId });
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const paidExpenses = expenses
        .filter(e => e.paymentStatus === 'Paid')
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const pendingExpenses = expenses
        .filter(e => e.paymentStatus === 'Pending')
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      const netProfitLoss = grandTotalRevenue - totalExpenses;

      // Category breakdown for this event
      const categoryMap = {};
      expenses.forEach(e => {
        const cat = e.category || 'Uncategorized';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { category: cat, total: 0, count: 0, paid: 0, pending: 0 };
        }
        categoryMap[cat].total += e.amount || 0;
        categoryMap[cat].count += 1;
        if (e.paymentStatus === 'Paid') categoryMap[cat].paid += e.amount || 0;
        if (e.paymentStatus === 'Pending') categoryMap[cat].pending += e.amount || 0;
      });

      const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.total - a.total);
      const highestCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].category : 'N/A';

      return res.json({
        success: true,
        mode: 'single',
        eventId,
        eventTitle: eventObj.title,
        summary: {
          totalRevenue,
          totalSponsorship,
          totalDonations,
          csrFunding,
          govtFunding,
          totalFunding,
          grandTotalRevenue,
          pendingFunding,
          totalExpenses,
          paidExpenses,
          pendingExpenses,
          netProfitLoss,
          expenseCount: expenses.length,
          highestCategory,
          categoryBreakdown
        }
      });
    } else {
      // Combined All Events summary
      const allPayments = await Payment.find({ status: 'Success' });
      const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      const allSponsorships = await Sponsorship.find({});
      let totalSponsorship = 0;
      let totalDonations = 0;
      let csrFunding = 0;
      let govtFunding = 0;
      let pendingFunding = 0;

      allSponsorships.forEach(s => {
        const amt = Number(s.amount) || 0;
        const st = (s.sponsorType || '').toLowerCase();
        const stat = (s.status || '').toLowerCase();
        if (st.includes('csr')) csrFunding += amt;
        else if (st.includes('government')) govtFunding += amt;
        else if (st.includes('individual') || st.includes('trust') || st.includes('ngo')) totalDonations += amt;
        else totalSponsorship += amt;

        if (stat.includes('pending') || stat.includes('partially')) pendingFunding += amt;
      });

      const totalFunding = totalSponsorship + totalDonations + csrFunding + govtFunding;
      const grandTotalRevenue = totalRevenue + totalFunding;

      const allExpenses = await Expense.find({});
      const totalExpenses = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const paidExpenses = allExpenses
        .filter(e => e.paymentStatus === 'Paid')
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const pendingExpenses = allExpenses
        .filter(e => e.paymentStatus === 'Pending')
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      const netProfitLoss = grandTotalRevenue - totalExpenses;

      // Category breakdown across all events
      const categoryMap = {};
      allExpenses.forEach(e => {
        const cat = e.category || 'Uncategorized';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { category: cat, total: 0, count: 0, paid: 0, pending: 0 };
        }
        categoryMap[cat].total += e.amount || 0;
        categoryMap[cat].count += 1;
        if (e.paymentStatus === 'Paid') categoryMap[cat].paid += e.amount || 0;
        if (e.paymentStatus === 'Pending') categoryMap[cat].pending += e.amount || 0;
      });

      const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.total - a.total);
      const highestCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].category : 'N/A';

      // Event-wise financial ledger table
      const eventWiseFinancials = await Promise.all(allEvents.map(async (ev) => {
        const evPayments = await Payment.find({ eventId: ev._id, status: 'Success' });
        const evRev = evPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        const evExpenses = await Expense.find({ eventId: ev._id });
        const evExpTotal = evExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const evPaid = evExpenses
          .filter(e => e.paymentStatus === 'Paid')
          .reduce((sum, e) => sum + (e.amount || 0), 0);
        const evPending = evExpenses
          .filter(e => e.paymentStatus === 'Pending')
          .reduce((sum, e) => sum + (e.amount || 0), 0);

        return {
          eventId: String(ev._id),
          title: ev.title,
          status: ev.status,
          revenue: evRev,
          expenses: evExpTotal,
          paid: evPaid,
          pending: evPending,
          netProfitLoss: evRev - evExpTotal,
          expenseCount: evExpenses.length
        };
      }));

      return res.json({
        success: true,
        mode: 'all',
        summary: {
          totalRevenue,
          totalSponsorship,
          totalDonations,
          csrFunding,
          govtFunding,
          totalFunding,
          grandTotalRevenue,
          pendingFunding,
          totalExpenses,
          paidExpenses,
          pendingExpenses,
          netProfitLoss,
          expenseCount: allExpenses.length,
          highestCategory,
          categoryBreakdown,
          eventWiseFinancials
        }
      });
    }
  } catch (error) {
    console.error('Error fetching expenses summary:', error);
    res.status(500).json({ success: false, message: 'Server error calculating expense summary' });
  }
});

// @route   POST /api/expenses
// @desc    Add a new expense
// @access  Private/Admin
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const {
      eventId,
      category,
      subcategory,
      name,
      amount,
      date,
      paidTo,
      paymentMethod,
      paymentStatus,
      receiptUrl,
      notes
    } = req.body;

    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId) || !category || !name || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid event, category, name, and amount for the expense.'
      });
    }

    const eventObj = await Event.findById(eventId);
    if (!eventObj) {
      return res.status(404).json({ success: false, message: 'Selected event not found' });
    }

    const newExpense = new Expense({
      eventId,
      category,
      subcategory: subcategory || '',
      name,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      paidTo: paidTo || '',
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: paymentStatus || 'Paid',
      receiptUrl: receiptUrl || '',
      notes: notes || '',
      createdBy: req.user.id
    });

    await newExpense.save();
    const populated = await Expense.findById(newExpense._id)
      .populate('eventId', 'title status')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Expense added successfully!',
      expense: populated
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ success: false, message: 'Failed to create expense: ' + error.message });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Edit an existing expense
// @access  Private/Admin
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    const {
      eventId,
      category,
      subcategory,
      name,
      amount,
      date,
      paidTo,
      paymentMethod,
      paymentStatus,
      receiptUrl,
      notes
    } = req.body;

    if (eventId) expense.eventId = eventId;
    if (category) expense.category = category;
    if (subcategory !== undefined) expense.subcategory = subcategory;
    if (name) expense.name = name;
    if (amount !== undefined) expense.amount = Number(amount);
    if (date) expense.date = new Date(date);
    if (paidTo !== undefined) expense.paidTo = paidTo;
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (paymentStatus) expense.paymentStatus = paymentStatus;
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;
    if (notes !== undefined) expense.notes = notes;

    await expense.save();
    const populated = await Expense.findById(expense._id)
      .populate('eventId', 'title status')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Expense updated successfully!',
      expense: populated
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ success: false, message: 'Failed to update expense: ' + error.message });
  }
});

// @route   PATCH /api/expenses/:id/status
// @desc    Quick toggle payment status (Paid / Pending)
// @access  Private/Admin
router.patch('/:id/status', protect, authorize('Admin'), async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!['Paid', 'Pending'].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    )
      .populate('eventId', 'title status')
      .populate('createdBy', 'name email');

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    res.json({
      success: true,
      message: `Expense payment status updated to ${paymentStatus}`,
      expense
    });
  } catch (error) {
    console.error('Error toggling expense status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private/Admin
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully!'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, message: 'Server error deleting expense' });
  }
});

module.exports = router;
