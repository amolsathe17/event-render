const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all photographs assigned to the logged-in judge
// @route   GET /api/judges/assigned-photos/:eventId
// @access  Private/Judge
router.get('/assigned-photos/:eventId', protect, authorize('Judge', 'Admin'), async (req, res) => {
  try {
    const { eventId } = req.params;
    const isAdmin = req.user.role === 'Admin';
    const judgeId = req.user._id.toString();

    const Event = require('../models/Event');
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if event submission deadline has passed, send alert to judge if not already sent
    if (event.deadline && new Date() >= new Date(event.deadline)) {
      const User = require('../models/User');
      const currentJudge = await User.findById(req.user._id);
      if (currentJudge) {
        if (!currentJudge.notifications) currentJudge.notifications = [];
        const hasNotified = currentJudge.notifications.some(
          n => (n.eventId === event._id.toString() || n.eventTitle === event.title) &&
               n.type === 'evaluation_reminder'
        );
        if (!hasNotified) {
          currentJudge.notifications.push({
            message: `Submission deadline for "${event.title}" has closed. Please proceed with photo evaluations in your Judge Workspace.`,
            senderName: 'System Alert',
            senderRole: 'Admin',
            eventTitle: event.title,
            eventId: event._id.toString(),
            type: 'evaluation_reminder',
            isRead: false,
            createdAt: new Date()
          });
          await currentJudge.save();
        }
      }
    }

    const isAssignedToEvent = isAdmin || (event.assignedJudges && event.assignedJudges.includes(judgeId));

    // Find submissions for this event (matching admin view to ensure all uploaded photos are graded)
    let submissions;
    if (isAssignedToEvent) {
      submissions = await Submission.find({
        eventId,
        entryStatus: { $ne: 'Withdrawn' }
      });
    } else {
      submissions = await Submission.find({
        eventId,
        entryStatus: { $ne: 'Withdrawn' },
        'photographs.assignedJudges': judgeId
      });
    }

    // Extract only the photographs assigned to this judge (or all if Admin)
    const assignedPhotos = [];
    submissions.forEach(sub => {
      sub.photographs.forEach(photo => {
        if (photo.status === 'Rejected') return;
        if (isAssignedToEvent || (photo.assignedJudges && photo.assignedJudges.includes(judgeId))) {
          // If Admin, the "existingScore" can be the average score of all judges, or the first judge's score
          const isUnpaid = (sub.paymentStatus === 'Unpaid' || !sub.paymentStatus);
          
          const existingScore = isAdmin 
            ? (photo.scores && photo.scores.length > 0 ? photo.scores[0] : null) 
            : (photo.scores || []).find(s => s.judgeId === judgeId);

          let gradedVal = isAdmin ? (photo.scores && photo.scores.length > 0) : !!existingScore;
          let scoreVal = existingScore || null;
          
          if (isUnpaid) {
            gradedVal = true;
            scoreVal = {
              creativity: 0,
              composition: 0,
              technicalQuality: 0,
              storytelling: 0,
              overallImpact: 0,
              averageScore: 0,
              remarks: 'Automatically assigned Grade 0 due to pending payment.',
              approvalStatus: 'Approved'
            };
          }

          assignedPhotos.push({
            submissionId: sub._id,
            participantName: sub.userName,
            photoId: photo.id,
            title: photo.title,
            category: photo.category,
            cameraBrand: photo.cameraBrand,
            cameraModel: photo.cameraModel,
            lensUsed: photo.lensUsed,
            location: photo.location,
            dateCaptured: photo.dateCaptured,
            description: photo.description,
            fileUrl: photo.fileUrl,
            rawFileUrl: photo.rawFileUrl,
            fileSizeBytes: photo.fileSizeBytes,
            status: photo.status,
            paymentStatus: sub.paymentStatus || 'Unpaid',
            graded: gradedVal,
            score: scoreVal,
            allScores: photo.scores || [] // Expose all scores for the Admin to review
          });
        }
      });
    });

    res.json({ success: true, photographs: assignedPhotos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Submit scoring for a photograph
// @route   POST /api/judges/score
// @access  Private/Judge
router.post('/score', protect, authorize('Judge'), async (req, res) => {
  try {
    const { submissionId, photoId, creativity, composition, technicalQuality, storytelling, overallImpact, remarks, approvalStatus } = req.body;
    const judgeId = req.user._id.toString();
    const judgeName = req.user.name;

    if (approvalStatus === 'Disapproved' && (!remarks || remarks.trim() === '')) {
      return res.status(400).json({ success: false, message: 'Remarks/Explanation is required when disapproving an entry' });
    }

    if (!submissionId || !photoId) {
      return res.status(400).json({ success: false, message: 'Submission ID and Photograph ID are required' });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (submission.paymentStatus === 'Unpaid') {
      return res.status(400).json({ success: false, message: 'This entry has not been paid and cannot be scored' });
    }

    const photoIndex = submission.photographs.findIndex(p => p.id === photoId);
    if (photoIndex === -1) {
      return res.status(404).json({ success: false, message: 'Photograph not found' });
    }

    const photo = submission.photographs[photoIndex];

    // Check if the judge is indeed assigned to this photograph or the event
    const Event = require('../models/Event');
    const event = await Event.findById(submission.eventId);
    const isAssignedToEvent = event && event.assignedJudges && event.assignedJudges.includes(judgeId);

    if (!isAssignedToEvent && !photo.assignedJudges.includes(judgeId)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to score this photograph' });
    }

    const isDisapproved = (approvalStatus === 'Disapproved');

    const c = isDisapproved ? 0 : (parseFloat(creativity) || 0);
    const co = isDisapproved ? 0 : (parseFloat(composition) || 0);
    const t = isDisapproved ? 0 : (parseFloat(technicalQuality) || 0);
    const s = isDisapproved ? 0 : (parseFloat(storytelling) || 0);
    const o = isDisapproved ? 0 : (parseFloat(overallImpact) || 0);

    if (!isDisapproved && [c, co, t, s, o].some(val => val < 1 || val > 10)) {
      return res.status(400).json({ success: false, message: 'All scores must be between 1 and 10' });
    }

    const totalScore = isDisapproved ? 0 : (c + co + t + s + o);
    const averageScore = isDisapproved ? 0 : parseFloat((totalScore / 5).toFixed(2));

    const scoreData = {
      judgeId,
      judgeName,
      creativity: c,
      composition: co,
      technicalQuality: t,
      storytelling: s,
      overallImpact: o,
      totalScore,
      averageScore,
      remarks: remarks || '',
      approvalStatus: approvalStatus || 'Approved',
      gradedAt: new Date()
    };

    if (!photo.scores) {
      photo.scores = [];
    }

    // Remove old score if exists and push new score
    const existingScoreIndex = photo.scores.findIndex(sc => sc.judgeId === judgeId);
    if (existingScoreIndex !== -1) {
      photo.scores[existingScoreIndex] = scoreData;
    } else {
      photo.scores.push(scoreData);
    }

    await submission.save();

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'Score Photograph',
      details: `Graded photo ID: ${photoId}. Avg Score: ${averageScore}.`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Scores submitted successfully!',
      photo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const mongoose = require('mongoose');

// @desc    Send broadcast notification (Judge)
// @route   POST /api/judges/broadcasts
// @access  Private/Judge
router.post('/broadcasts', protect, authorize('Judge', 'Admin'), async (req, res) => {
  try {
    const { message, recipientType, eventId, participantId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Notification message is required' });
    }

    const Broadcast = require('../models/Broadcast');
    const User = require('../models/User');
    const Event = require('../models/Event');
    const Submission = require('../models/Submission');

    const validRecipientTypes = ['Participant', 'Judge', 'Both', 'Admin', 'Graded', 'Ungraded', 'Specific'];
    const finalRecipientType = validRecipientTypes.includes(recipientType) ? recipientType : 'Participant';

    // Fetch event details if eventId provided
    let eventTitle = '';
    if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
      const eDoc = await Event.findById(eventId);
      if (eDoc) eventTitle = eDoc.title;
    }

    const broadcast = await Broadcast.create({
      message: message.trim(),
      recipientType: finalRecipientType,
      sentBy: req.user?.name || 'Judge',
      eventTitle: eventTitle || null,
      ...(eventId ? { eventId } : {})
    });

    let targetUsers = [];
    if (recipientType === 'Specific' && participantId) {
      if (mongoose.Types.ObjectId.isValid(participantId)) {
        targetUsers = await User.find({ _id: participantId });
      } else {
        targetUsers = await User.find({ name: participantId });
      }
    } else if (recipientType === 'Admin') {
      targetUsers = await User.find({ role: 'Admin' });
    } else if (recipientType === 'Graded') {
      if (eventId) {
        const subs = await Submission.find({ eventId, graded: true });
        const pIds = [...new Set(subs.map(s => s.userId))];
        targetUsers = await User.find({ _id: { $in: pIds }, role: 'Participant' });
      } else {
        targetUsers = await User.find({ role: 'Participant' });
      }
    } else if (recipientType === 'Ungraded') {
      if (eventId) {
        const subs = await Submission.find({ eventId, graded: false });
        const pIds = [...new Set(subs.map(s => s.userId))];
        targetUsers = await User.find({ _id: { $in: pIds }, role: 'Participant' });
      } else {
        targetUsers = await User.find({ role: 'Participant' });
      }
    } else if (recipientType === 'Both') {
      let pUsers = [];
      if (eventId) {
        const subs = await Submission.find({ eventId });
        const pIds = [...new Set(subs.map(s => s.userId))];
        pUsers = await User.find({ _id: { $in: pIds }, role: 'Participant' });
      } else {
        pUsers = await User.find({ role: 'Participant' });
      }
      const admins = await User.find({ role: 'Admin' });
      targetUsers = [...pUsers, ...admins];
    } else {
      // Default: Participant
      if (eventId) {
        const subs = await Submission.find({ eventId });
        const pIds = [...new Set(subs.map(s => s.userId))];
        targetUsers = await User.find({ _id: { $in: pIds }, role: 'Participant' });
      } else {
        targetUsers = await User.find({ role: 'Participant' });
      }
    }

    for (const u of targetUsers) {
      try {
        if (!u.notifications) u.notifications = [];
        u.notifications.push({
          _id: new mongoose.Types.ObjectId(),
          message: message.trim(),
          senderName: req.user?.name || 'Judge',
          senderRole: 'Judge',
          eventTitle: eventTitle,
          eventId: eventId || '',
          type: 'reminder',
          isRead: false,
          createdAt: new Date()
        });
        await u.save({ validateBeforeSave: false });
      } catch (uErr) {
        console.error(`Error saving notification to user ${u._id}:`, uErr.message);
      }
    }

    res.status(201).json({ success: true, message: 'Notification sent successfully', broadcast });
  } catch (error) {
    console.error('Judge Broadcast Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send notification' });
  }
});

// @desc    Get broadcasts sent by Judge
// @route   GET /api/judges/broadcasts
// @access  Private/Judge
router.get('/broadcasts', protect, authorize('Judge', 'Admin'), async (req, res) => {
  try {
    const Broadcast = require('../models/Broadcast');
    const broadcasts = await Broadcast.find({ sentBy: req.user.name }).sort({ createdAt: -1 });
    res.json({ success: true, broadcasts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete Judge broadcast
// @route   DELETE /api/judges/broadcasts/:id
// @access  Private/Judge
router.delete('/broadcasts/:id', protect, authorize('Judge', 'Admin'), async (req, res) => {
  try {
    const Broadcast = require('../models/Broadcast');
    await Broadcast.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Broadcast deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
