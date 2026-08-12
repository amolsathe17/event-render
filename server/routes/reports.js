const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Submission = require('../models/Submission');
const Payment = require('../models/Payment');
const Event = require('../models/Event');
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
    if (eventId) {
      const eventSubmissions = await Submission.find({ eventId });
      const userIds = [...new Set(eventSubmissions.map(s => String(s.userId)))];
      participants = await User.find({ _id: { $in: userIds }, role: 'Participant' }).sort({ name: 1 });
    } else {
      participants = await User.find({ role: 'Participant' }).sort({ name: 1 });
    }
    
    let csv = 'ID,Name,Email,Mobile,City,AssignedEvent,Verified,Suspended,RegistrationDate\n';
    
    participants.forEach(p => {
      const assignedTitle = eventId ? (eventsMap[eventId] || 'Selected Event') : 'All Events Combined';
      csv += `${escapeCSV(p._id)},${escapeCSV(p.name)},${escapeCSV(p.email)},${escapeCSV(p.mobile)},${escapeCSV(p.city)},${escapeCSV(assignedTitle)},${p.isVerified},${p.isSuspended},${p.createdAt.toISOString()}\n`;
    });

    const filename = eventId ? `event-participants-report.csv` : `all-events-participants-report.csv`;
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
    if (eventId) {
      filter.eventId = eventId;
    }

    const eventsMap = (await Event.find()).reduce((acc, e) => {
      acc[String(e._id)] = e.title;
      return acc;
    }, {});

    const payments = await Payment.find(filter).sort({ paymentDate: -1 });
    
    let csv = 'TransactionID,InvoiceNumber,EventTitle,Name,Email,PackageName,Amount(INR),PaymentMethod,PaymentDate\n';
    
    payments.forEach(p => {
      const evTitle = (p.eventId && eventsMap[String(p.eventId)]) || (eventId && eventsMap[eventId]) || 'All Events Combined';
      csv += `${escapeCSV(p.transactionId)},${escapeCSV(p.invoiceNumber)},${escapeCSV(evTitle)},${escapeCSV(p.userName)},${escapeCSV(p.userEmail)},${escapeCSV(p.packageName)},${p.amount},${escapeCSV(p.paymentMethod)},${p.paymentDate.toISOString()}\n`;
    });

    const filename = eventId ? `event-revenue-report.csv` : `all-events-revenue-report.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Export Submission report to CSV / Excel
// @route   GET /api/reports/submissions
// @access  Private/Admin
router.get('/submissions', protect, authorize('Admin'), async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = { isFinalSubmitted: true };
    if (eventId) {
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

module.exports = router;
