# Meeting Usefulness AI - Deployment Guide

This guide provides step-by-step instructions for deploying the Meeting Usefulness AI system in your organization.

## Prerequisites

- Node.js (v16+) and npm installed
- Access to calendar systems (Google Calendar/Microsoft Outlook)
- MongoDB or similar database for storing meeting data and feedback
- Web server for hosting the frontend application

## System Components Overview

1. **Core AI Engine** - `meeting-usefulness-ai.js`
2. **Frontend Application** - React-based dashboard
3. **Backend API Service** - Express.js REST API
4. **Calendar Integration** - Connectors for calendar systems
5. **Feedback Collection System** - Post-meeting survey tools

## Deployment Steps

### 1. Set Up the Backend API Server

```bash
# Clone the repository
git clone https://github.com/your-org/meeting-usefulness-ai.git
cd meeting-usefulness-ai/server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your settings (database, API keys, etc.)

# Start the server
npm start
```

The API server will be available at http://localhost:3001 by default.

### 2. Set Up the Frontend Application

```bash
# Navigate to the frontend directory
cd ../client

# Install dependencies
npm install

# Configure API endpoint
cp .env.example .env
# Edit .env with your API endpoint

# Build for production
npm run build

# Deploy the built files to your web server
cp -r build/* /path/to/your/webserver/public/
```

### 3. Database Setup

The system requires a MongoDB database for storing meeting data, evaluation results, and feedback.

```bash
# Create the required collections
mongo
> use meeting_usefulness
> db.createCollection("meetings")
> db.createCollection("feedback")
> db.createCollection("users")
> exit
```

### 4. Calendar Integration Setup

#### Google Calendar

1. Create a Google Cloud Project
2. Enable the Google Calendar API
3. Create OAuth 2.0 credentials
4. Add the credentials to your `.env` file:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://your-server/api/calendar/google/callback
```

#### Microsoft Outlook

1. Register an application in the Azure Portal
2. Enable Microsoft Graph permissions for Calendar access
3. Add the credentials to your `.env` file:

```
OUTLOOK_CLIENT_ID=your-client-id
OUTLOOK_CLIENT_SECRET=your-client-secret
OUTLOOK_REDIRECT_URI=http://your-server/api/calendar/outlook/callback
```

### 5. Feedback System Integration

#### Email Notifications

Configure SMTP settings in your `.env` file:

```
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=meeting-feedback@your-company.com
```

#### Slack Integration (Optional)

1. Create a Slack App in your workspace
2. Enable the necessary permissions
3. Add the Slack webhook URL to your `.env` file:

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your-webhook-url
```

#### Microsoft Teams Integration (Optional)

1. Create a Teams App
2. Configure a webhook connector
3. Add the Teams webhook URL to your `.env` file:

```
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/your-webhook-url
```

## Configuration Options

### AI Scoring Weights

You can customize the weights used for meeting scoring in `meeting-usefulness-ai.js`:

```javascript
// Adjust these values to match your organization's priorities
const SCORE_WEIGHTS = {
  DECISION_MADE: 30,
  AGENDA_PROVIDED: 15,
  FOLLOW_UP_SENT: 20,
  COULD_BE_ASYNC: -25,
  PARTICIPATION_RATIO: 20,
  LONG_MEETING_PENALTY: -10
};
```

### Feedback Survey Templates

Modify the survey templates in `feedback-collection.js` to match your organization's feedback requirements.

## Usage Instructions

### Calendar Authentication

Users need to authenticate with their calendar system before using the app:

1. Navigate to the Settings page
2. Click "Connect Calendar"
3. Choose Google Calendar or Microsoft Outlook
4. Follow the authentication prompts

### Training the AI

For optimal results, the AI needs historical meeting data:

1. Export meeting data from your calendar system
2. Format the data according to the expected schema
3. Import the data through the admin interface

### Auto-Decline Configuration

Configure auto-decline rules in the Settings page:

1. Set minimum score threshold for auto-decline
2. Choose notification preferences
3. Create custom decline messages
4. Set exceptions for specific meeting types or participants

## Monitoring and Maintenance

### Logs

Application logs are stored in:
- `/var/log/meeting-ai/api.log` - API server logs
- `/var/log/meeting-ai/worker.log` - Background worker logs

### Database Backups

Schedule regular backups of your MongoDB database:

```bash
mongodump --db meeting_usefulness --out /backup/$(date +"%Y-%m-%d")
```

### Performance Monitoring

Monitor API performance using the included Prometheus metrics:
- `http://your-server:3001/metrics`

## Troubleshooting

### Common Issues

1. **Calendar Connection Issues**
   - Check API credentials
   - Verify OAuth scopes
   - Ensure redirect URIs are correctly configured

2. **Feedback Collection Failures**
   - Check SMTP settings
   - Verify webhook URLs
   - Check notification permissions

3. **Scoring Inconsistencies**
   - Review historical data quality
   - Adjust scoring weights
   - Add more training data

## Support and Resources

- Documentation: [http://your-docs-url.com](http://your-docs-url.com)
- Source Code: [http://your-repo-url.com](http://your-repo-url.com)
- Issue Tracker: [http://your-issues-url.com](http://your-issues-url.com)

## Version History

- v1.0.0 - Initial release
- v1.1.0 - Added Microsoft Teams integration
- v1.2.0 - Improved scoring algorithm
- v1.3.0 - Added auto-decline features
