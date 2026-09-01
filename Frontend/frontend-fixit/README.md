# Fixit – Community Problem Reporting & Resolution Platform

## Overview

Fixit is a community-driven problem reporting and resolution platform designed to bridge the communication gap between citizens, maintenance teams, and administrators. The platform provides a centralized system where community members can report local issues, track their progress, and receive updates until resolution.

Rather than relying on fragmented communication channels such as social media posts, messaging groups, or word-of-mouth reports, Fixit creates a transparent and accountable workflow for identifying, verifying, prioritizing, and resolving community problems.

---

## Problem Statement

Communities face numerous challenges such as:

* Potholes and damaged roads
* Broken streetlights
* Flooding and drainage issues
* Illegal waste dumping
* Damaged public facilities
* Open manholes and safety hazards
* Water supply issues

Many of these problems go unresolved because reports are scattered across different platforms, making it difficult to track accountability and progress.

Fixit solves this by creating a structured digital ecosystem where every issue becomes a trackable record from submission to resolution.

---

## Key Features

### Community Reporting

Users can:

* Submit community issues
* Add detailed descriptions
* Attach photos and videos
* Share exact locations using GPS
* Track submitted reports

### Multi-Step Reporting Wizard

The reporting process includes:

1. Select Category
2. Describe the Problem
3. Choose Location
4. Upload Evidence
5. Set Severity Level
6. Review & Submit

### Issue Lifecycle Management

Every report follows a structured workflow:

```text
Submitted
    ↓
Under Review
    ↓
Verified
    ↓
Prioritized
    ↓
Assigned
    ↓
In Progress
    ↓
Resolved
    ↓
Community Confirmation
    ↓
Closed
```

### Community Verification

Residents can:

* Confirm existing reports
* Upvote community issues
* Prevent duplicate submissions
* Increase issue visibility

### Duplicate Detection

The system identifies similar reports using:

* Geolocation matching
* Category comparison
* Text similarity analysis

### Intelligent Prioritization

Issues are automatically ranked based on:

* Severity level
* Number of confirmations
* Report age
* Estimated affected population

### Analytics Dashboard

Administrators can monitor:

* Total reports
* Resolution rates
* Active issues
* Category distribution
* Community engagement metrics

---

## User Roles

### Community Member

* Report issues
* Upload media evidence
* Confirm existing reports
* Track report status
* Comment on reports

### Issue Resolver

* Accept assigned tasks
* Update progress
* Upload before-and-after photos
* Mark issues as resolved

### Administrator

* Verify reports
* Manage users
* Assign tasks
* Moderate content
* Monitor platform performance

---

## Technology Stack

### Frontend

* React.js
* HTML5
* CSS3
* Leaflet Maps
* OpenStreetMap

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Authentication

* JSON Web Tokens (JWT)
* bcrypt Password Hashing

### Notifications

* WebSockets
* Nodemailer
* In-App Notifications

---

## Database Models

### Users

```javascript
{
  id,
  name,
  email,
  password,
  role,
  location
}
```

### Reports

```javascript
{
  id,
  user_id,
  category_id,
  title,
  description,
  lat,
  lng,
  severity,
  priority,
  status,
  created_at
}
```

### Additional Collections

* Confirmations
* Comments
* Images
* Assignments

---

## Brand Colors

| Purpose          | Color           | Hex     |
| ---------------- | --------------- | ------- |
| Primary Dark     | Midnight Navy   | #0d1b2a |
| Action Alert     | Crimson Flame   | #e63946 |
| Secondary Accent | Cool Steel Blue | #457b9d |
| Background       | Soft Off-White  | #f7f9fa |

---

## Development Roadmap

### Phase 1 – MVP

* User Authentication
* Report Management (CRUD)
* Admin Dashboard
* Database Setup

### Phase 2 – Crowdsourcing

* Comments
* Confirmations/Upvotes
* Search and Filters
* Image Uploads

### Phase 3 – Geospatial Mapping

* OpenStreetMap Integration
* Coordinate Pinning
* Radius-Based Search

### Phase 4 – Notifications & Intelligence

* Email Notifications
* In-App Alerts
* Priority Scoring
* Duplicate Detection

### Phase 5 – Analytics & Community Mode

* Resolution Metrics
* Category Analytics
* Community/Campus Support

---

## Installation

```bash
# Clone repository
git clone https://github.com/your-username/fixit.git

# Navigate to project
cd fixit

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Future Enhancements

* AI-powered issue categorization
* Mobile application (Android & iOS)
* Government agency integrations
* SMS notifications
* Real-time mapping dashboard
* Predictive maintenance analytics

---

## Project Vision

Fixit aims to empower communities by transforming problem reporting into a transparent, collaborative, and accountable process. By connecting residents, maintenance teams, and administrators on a single platform, Fixit helps communities identify issues faster, prioritize resources effectively, and achieve measurable improvements in public infrastructure and services.

---

## License

This project is developed for academic, research, and community impact purposes. Future licensing terms may be updated as the platform evolves.
