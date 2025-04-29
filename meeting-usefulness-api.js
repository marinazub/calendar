// api.js - Backend API service for Meeting Usefulness App

/**
 * API service for the Meeting Usefulness Application
 * Provides endpoints for meeting analysis, calendar integration, and feedback
 */

// Import required modules
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import MeetingUsefulnessAI from './meeting-usefulness-ai';
import { createCalendarIntegration } from './calendar-integration';
import FeedbackCollection from './feedback-collection';

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize services
const meetingAI = new MeetingUsefulnessAI();
const feedbackSystem = new FeedbackCollection();
let calendarIntegration = null;

// Load historical data
async function initializeServices() {
  try {
    await meetingAI.loadHistoricalData('./data/meeting_history.csv');
    feedbackSystem.initialize();
    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Error initializing services:', error);
  }
}

initializeServices();

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Calendar authentication
app.post('/api/calendar/auth', async (req, res) => {
  try {
    const { calendarType, credentials } = req.body;
    
    calendarIntegration = createCalendarIntegration(calendarType);
    const success = await calendarIntegration.authenticate(credentials);
    
    if (success) {
      res.json({ success: true, message: `${calendarType} calendar connected successfully` });
    } else {
      res.status(401).json({ success: false, message: 'Authentication failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch upcoming meetings
app.get('/api/meetings/upcoming', async (req, res) => {
  try {
    if (!calendarIntegration || !calendarIntegration.isAuthenticated) {
      throw new Error('Calendar not authenticated');
    }
    
    const daysAhead = parseInt(req.query.daysAhead) || 7;
    const meetings = await calendarIntegration.fetchUpcomingMeetings(daysAhead);
    const transformedMeetings = calendarIntegration.transformMeetingsForAI(meetings);
    
    res.json({ success: true, meetings: transformedMeetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Evaluate meetings
app.post('/api/meetings/evaluate', async (req, res) => {
  try {
    const { meetings } = req.body;
    
    if (!meetings || !Array.isArray(meetings)) {
      throw new Error('Invalid meetings data');
    }
    
    const evaluation = meetingAI.evaluateCalendar(meetings);
    res.json({ success: true, evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Evaluate single meeting
app.post('/api/meetings/evaluate-single', async (req, res) => {
  try {
    const { meeting } = req.body;
    
    if (!meeting) {
      throw new Error('Invalid meeting data');
    }
    
    const evaluation = meetingAI.evaluateFutureMeeting(meeting);
    res.json({ success: true, evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Schedule meeting feedback
app.post('/api/feedback/schedule', async (req, res) => {
  try {
    const { meeting, templateName } = req.body;
    
    if (!meeting) {
      throw new Error('Invalid meeting data');
    }
    
    const feedback = feedbackSystem.scheduleFeedback(meeting, templateName || 'standard');
    
    if (feedback) {
      await feedbackSystem.sendFeedbackNotification(meeting, feedback.id);
      res.json({ success: true, feedback });
    } else {
      throw new Error('Failed to schedule feedback');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get feedback survey
app.get('/api/feedback/survey/:id', (req, res) => {
  try {
    const { id } = req.params;
    const survey = feedbackSystem.getFeedbackSurvey(id);
    
    if (survey) {
      res.json({ success: true, survey });
    } else {
      res.status(404).json({ success: false, message: 'Survey not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit feedback
app.post('/api/feedback/submit', (req, res) => {
  try {
    const { feedbackId, responses } = req.body;
    
    if (!feedbackId || !responses) {
      throw new Error('Invalid feedback data');
    }
    
    const success = feedbackSystem.submitFeedback(feedbackId, responses);
    
    if (success) {
      res.json({ success: true, message: 'Feedback submitted successfully' });
    } else {
      throw new Error('Failed to submit feedback');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get meeting effectiveness trends
app.get('/api/analytics/trends', (req, res) => {
  try {
    const months = parseInt(req.query.months) || 3;
    const trends = feedbackSystem.getEffectivenessTrends(months);
    
    res.json({ success: true, trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Suggest meeting decline
app.post('/api/meetings/suggest-decline', async (req, res) => {
  try {
    if (!calendarIntegration || !calendarIntegration.isAuthenticated) {
      throw new Error('Calendar not authenticated');
    }
    
    const { meeting, reason, alternatives } = req.body;
    
    if (!meeting) {
      throw new Error('Invalid meeting data');
    }
    
    const success = await calendarIntegration.suggestDecline(meeting, reason, alternatives);
    
    if (success) {
      res.json({ success: true, message: 'Decline suggestion sent' });
    } else {
      throw new Error('Failed to send decline suggestion');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Auto-decline meeting
app.post('/api/meetings/auto-decline', async (req, res) => {
  try {
    if (!calendarIntegration || !calendarIntegration.isAuthenticated) {
      throw new Error('Calendar not authenticated');
    }
    
    const { meeting, reason, message } = req.body;
    
    if (!meeting) {
      throw new Error('Invalid meeting data');
    }
    
    const success = await calendarIntegration.autoDeclineMeeting(meeting, reason, message);
    
    if (success) {
      res.json({ success: true, message: 'Meeting auto-declined' });
    } else {
      throw new Error('Failed to auto-decline meeting');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get calendar stats
app.get('/api/calendar/stats', async (req, res) => {
  try {
    if (!calendarIntegration || !calendarIntegration.isAuthenticated) {
      throw new Error('Calendar not authenticated');
    }
    
    const daysBack = parseInt(req.query.daysBack) || 30;
    const stats = await calendarIntegration.getCalendarStats(daysBack);
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Meeting Usefulness API server running on port ${port}`);
});

export default app;