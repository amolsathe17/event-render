const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const Sponsorship = require('../models/Sponsorship');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

// Multer storage for sponsorship agreements and supporting documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/sponsorships');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `sponsorship-doc-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf|doc|docx/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, JPG, PNG, WEBP, PDF, DOC, and DOCX supporting document files are allowed.'));
  }
});

// @route   POST /api/sponsorships/upload-document
// @desc    Upload supporting document / agreement
// @access  Private/Admin
router.post('/upload-document', protect, authorize('Admin'), upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document file uploaded.' });
    }
    const fileUrl = `/uploads/sponsorships/${req.file.filename}`;
    res.json({ success: true, fileUrl, filename: req.file.filename });
  } catch (err) {
    console.error('Error uploading sponsorship document:', err);
    res.status(500).json({ success: false, message: 'Failed to upload document file: ' + err.message });
  }
});

// @route   GET /api/sponsorships/summary
// @desc    Get dashboard metrics for sponsorships and donations
// @access  Private/Admin
router.get('/summary', protect, authorize('Admin'), async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = {};
    if (eventId && eventId !== 'all') {
      filter.eventId = eventId;
    }

    const items = await Sponsorship.find(filter);

    let totalSponsorship = 0;
    let totalDonations = 0;
    let csrFunding = 0;
    let govtFunding = 0;
    let pendingFunding = 0;
    let sponsorCount = 0;
    let donorCount = 0;

    const sponsorSet = new Set();
    const donorSet = new Set();

    items.forEach(item => {
      const amt = Number(item.amount) || 0;
      const type = (item.sponsorType || '').toLowerCase();
      const st = (item.status || '').toLowerCase();

      // Total Funding Breakdown
      if (type.includes('csr')) {
        csrFunding += amt;
      } else if (type.includes('government')) {
        govtFunding += amt;
      } else if (type.includes('individual') || type.includes('trust') || type.includes('ngo')) {
        totalDonations += amt;
        if (item.sponsorName) donorSet.add(item.sponsorName.trim().toLowerCase());
      } else {
        totalSponsorship += amt;
        if (item.sponsorName) sponsorSet.add(item.sponsorName.trim().toLowerCase());
      }

      if (st.includes('pending') || st.includes('partially')) {
        pendingFunding += amt;
      }
    });

    sponsorCount = sponsorSet.size || items.filter(i => !['individual', 'ngo'].includes(String(i.sponsorType).toLowerCase())).length;
    donorCount = donorSet.size || items.filter(i => ['individual', 'ngo'].includes(String(i.sponsorType).toLowerCase())).length;

    const grandTotalFunding = items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    res.json({
      success: true,
      summary: {
        totalFunding: grandTotalFunding,
        totalSponsorship,
        totalDonations,
        csrFunding,
        govtFunding,
        pendingFunding,
        sponsorCount,
        donorCount,
        totalRecords: items.length
      }
    });
  } catch (err) {
    console.error('Error computing sponsorship summary:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// @route   GET /api/sponsorships
// @desc    Get all sponsorship and donation records with optional filters
// @access  Private/Admin
router.get('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const { eventId, sponsorType, status, search, fromDate, toDate } = req.query;
    const filter = {};

    if (eventId && eventId !== 'all') {
      filter.eventId = eventId;
    }
    if (sponsorType) {
      filter.sponsorType = sponsorType;
    }
    if (status) {
      filter.status = status;
    }

    if (fromDate || toDate) {
      filter.fundingDate = {};
      if (fromDate) filter.fundingDate.$gte = new Date(fromDate);
      if (toDate) filter.fundingDate.$lte = new Date(toDate + 'T23:59:59.999Z');
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      filter.$or = [
        { sponsorName: { $regex: q, $options: 'i' } },
        { orgName: { $regex: q, $options: 'i' } },
        { contactPerson: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { transactionId: { $regex: q, $options: 'i' } },
        { purpose: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }

    const sponsorships = await Sponsorship.find(filter).sort({ fundingDate: -1, createdAt: -1 });
    res.json({ success: true, sponsorships });
  } catch (err) {
    console.error('Error fetching sponsorships:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// @route   POST /api/sponsorships
// @desc    Create a new sponsorship or donation record
// @access  Private/Admin
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const {
      sponsorName,
      orgName,
      sponsorType,
      contactPerson,
      email,
      phone,
      address,
      amount,
      fundingDate,
      paymentMode,
      transactionId,
      purpose,
      eventId,
      category,
      status,
      documentUrl,
      notes
    } = req.body;

    if (!sponsorName || !amount) {
      return res.status(400).json({ success: false, message: 'Sponsor/Donor Name and Amount are required.' });
    }

    let eventTitle = 'All Events Combined';
    let targetEventId = eventId || 'all';

    if (targetEventId && targetEventId !== 'all') {
      const foundEvent = await Event.findById(targetEventId);
      if (foundEvent) {
        eventTitle = foundEvent.title;
      }
    }

    const sponsorship = new Sponsorship({
      sponsorName,
      orgName: orgName || '',
      sponsorType: sponsorType || 'Corporate',
      contactPerson: contactPerson || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      amount: Number(amount),
      fundingDate: fundingDate ? new Date(fundingDate) : Date.now(),
      paymentMode: paymentMode || 'Bank Transfer',
      transactionId: transactionId || '',
      purpose: purpose || '',
      eventId: targetEventId,
      eventTitle,
      category: category || 'General Sponsorship',
      status: status || 'Received',
      documentUrl: documentUrl || '',
      notes: notes || ''
    });

    await sponsorship.save();
    res.status(201).json({ success: true, sponsorship, message: 'Sponsorship / Donation record added successfully.' });
  } catch (err) {
    console.error('Error creating sponsorship:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// @route   PUT /api/sponsorships/:id
// @desc    Update an existing sponsorship or donation record
// @access  Private/Admin
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const sponsorship = await Sponsorship.findById(req.params.id);
    if (!sponsorship) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    const fields = [
      'sponsorName',
      'orgName',
      'sponsorType',
      'contactPerson',
      'email',
      'phone',
      'address',
      'amount',
      'fundingDate',
      'paymentMode',
      'transactionId',
      'purpose',
      'eventId',
      'category',
      'status',
      'documentUrl',
      'notes'
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        if (f === 'amount') sponsorship[f] = Number(req.body[f]);
        else if (f === 'fundingDate') sponsorship[f] = new Date(req.body[f]);
        else sponsorship[f] = req.body[f];
      }
    });

    if (req.body.eventId) {
      if (req.body.eventId === 'all') {
        sponsorship.eventTitle = 'All Events Combined';
      } else {
        const foundEvent = await Event.findById(req.body.eventId);
        if (foundEvent) {
          sponsorship.eventTitle = foundEvent.title;
        }
      }
    }

    await sponsorship.save();
    res.json({ success: true, sponsorship, message: 'Sponsorship / Donation record updated successfully.' });
  } catch (err) {
    console.error('Error updating sponsorship:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// @route   DELETE /api/sponsorships/:id
// @desc    Delete a sponsorship or donation record
// @access  Private/Admin
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const sponsorship = await Sponsorship.findById(req.params.id);
    if (!sponsorship) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    await Sponsorship.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Record deleted successfully.' });
  } catch (err) {
    console.error('Error deleting sponsorship:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

module.exports = router;
