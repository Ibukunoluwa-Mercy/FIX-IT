// Structured data for Help Center topics, categories, guides, and FAQs
// Accurately reflects the real app flows (Report Wizard, Community Map, Nearby Issues, My Reports, Profile)

export const quickHelpOptions = [
  {
    id: 'report-an-issue',
    slug: 'report-an-issue',
    title: 'Report an Issue',
    description: 'Learn how to submit a new community issue.',
    icon: 'fa-solid fa-file-circle-plus',
    iconBg: '#fee2e2',
    iconColor: '#ef4444',
    badgeType: 'steps',
    steps: [
      {
        number: 1,
        title: 'Click "+ New Report"',
        description: 'From your resident dashboard header or sidebar, click the "+ New Report" button to launch the 4-step reporting wizard.'
      },
      {
        number: 2,
        title: 'Enter Issue Details',
        description: 'Select your issue category (e.g. Potholes & Road Damage, Streetlight Outages, Water Leaks), write a description, and select the severity level (Low, Medium, High).'
      },
      {
        number: 3,
        title: 'Specify Location',
        description: 'Allow automatic GPS detection, search by street address, or drag the pin on the interactive map to lock the exact coordinates.'
      },
      {
        number: 4,
        title: 'Attach Photos',
        description: 'Upload up to 5 clear photos (JPEG or PNG, max 5MB each) to provide visual evidence for municipal resolvers.'
      },
      {
        number: 5,
        title: 'Review & Submit',
        description: 'Review your submission summary, verify there are no duplicate nearby reports, and confirm to submit for resolver dispatch.'
      }
    ]
  },
  {
    id: 'use-the-map',
    slug: 'use-the-map',
    title: 'Use the Map',
    description: 'Find and explore issues near you.',
    icon: 'fa-solid fa-location-dot',
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    badgeType: 'steps',
    steps: [
      {
        number: 1,
        title: 'Open Nearby Issues or Community Map',
        description: 'Select "Nearby Issues" in your sidebar or "Community Map" in the main navigation to open the interactive map.'
      },
      {
        number: 2,
        title: 'Center on Your Location',
        description: 'Enable browser location to automatically display issues within a 5 km radius, or type any neighborhood or zone in the search bar.'
      },
      {
        number: 3,
        title: 'Filter by Category & Status',
        description: 'Use the filter chips (Road/Pothole, Water, Streetlight, Drainage, Public Facilities) and toggles for Pending, In Progress, or Resolved.'
      },
      {
        number: 4,
        title: 'Click Markers for Details',
        description: 'Click on any map pin or nearby card to inspect photos, distance, reported date, and the assigned resolver updates.'
      },
      {
        number: 5,
        title: 'Track and Upvote',
        description: 'Click "Track" on an issue card to upvote it and receive notification updates as it progresses towards resolution.'
      }
    ]
  },
  {
    id: 'track-your-report',
    slug: 'track-your-report',
    title: 'Track Your Report',
    description: 'Check the status of your submitted issues.',
    icon: 'fa-solid fa-circle-check',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    badgeType: 'steps',
    steps: [
      {
        number: 1,
        title: 'Navigate to "My Reports"',
        description: 'Click "My Reports" on your dashboard sidebar to view your complete submission history.'
      },
      {
        number: 2,
        title: 'Filter by Status Tabs',
        description: 'Switch between status tabs: All, Pending (submitted & awaiting review), In Progress (assigned to resolver), Resolved (fixed), or Rejected.'
      },
      {
        number: 3,
        title: 'Search by Keyword',
        description: 'Use the search input at the top of My Reports to quickly locate specific reports by category, address, or description.'
      },
      {
        number: 4,
        title: 'Inspect Detailed Timeline',
        description: 'Click "View Details" on any report card to review the resolution progress, resolver notes, and before-and-after photos.'
      }
    ]
  },
  {
    id: 'community-guidelines',
    slug: 'community-guidelines',
    title: 'Community Guidelines',
    description: 'Understand our rules and expectations.',
    icon: 'fa-solid fa-users',
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
    badgeType: 'article',
    content: [
      'FixIt connects residents and municipal authorities to ensure faster, transparent civic improvements across our neighborhoods.',
      'To keep our platform constructive, respectful, and effective, please adhere to these core rules:',
      '• Genuine Civic Issues: Only report legitimate public infrastructure damage, sanitation, water, electrical, and safety concerns.',
      '• Accurate Information: Provide precise addresses or GPS pins and honest descriptions. Never file false or prank reports.',
      '• Respectful Media: Ensure uploaded photos clearly show the problem without capturing private faces or confidential vehicle details without consent.',
      '• Constructive Discourse: Harassment, abusive language, or spam in community comments and discussions will result in immediate account suspension.',
      '• Duplicate Reporting: Check nearby issues on the map before reporting; upvoting an existing report accelerates its resolution more than filing a duplicate.'
    ]
  }
];

export const categoriesList = [
  {
    id: 'getting-started',
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using FixIt.',
    icon: 'fa-solid fa-rocket',
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
    badgeType: 'steps',
    steps: [
      {
        number: 1,
        title: 'Create Your Resident Account',
        description: 'Sign up with your name, email, phone number, and residential zone.'
      },
      {
        number: 2,
        title: 'Explore the Resident Dashboard',
        description: 'Review your personal impact score, monthly resolved count, and active neighborhood alerts.'
      },
      {
        number: 3,
        title: 'Check Your Community Map',
        description: 'Explore live issues reported in your immediate 5 km radius.'
      },
      {
        number: 4,
        title: 'Submit Your First Report',
        description: 'Click "+ New Report" anytime you encounter civic issues needing municipal attention.'
      }
    ]
  },
  {
    id: 'reporting-issues',
    slug: 'reporting-issues',
    title: 'Reporting Issues',
    description: 'How to report and add media.',
    icon: 'fa-solid fa-file-lines',
    iconBg: '#fee2e2',
    iconColor: '#ef4444',
    badgeType: 'steps',
    steps: [
      {
        number: 1,
        title: 'Choose the Right Category',
        description: 'Select from Potholes & Road Damage, Streetlight Outages, Garbage & Litter, Water Leaks, or Others.'
      },
      {
        number: 2,
        title: 'Describe the Problem Clearly',
        description: 'Provide specific landmarks, size/extent of the hazard, and relevant danger factors.'
      },
      {
        number: 3,
        title: 'Capture High Quality Photos',
        description: 'Upload up to 5 clear photos under 5MB each. Good lighting and wide angles help resolvers locate the issue quickly.'
      },
      {
        number: 4,
        title: 'Confirm Location Accuracy',
        description: 'Check the map marker to ensure the pin corresponds exactly with where the issue is situated on the street.'
      }
    ]
  },
  {
    id: 'map-location',
    slug: 'map-location',
    title: 'Map & Location',
    description: 'Using the map and nearby issues.',
    icon: 'fa-solid fa-location-dot',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    badgeType: 'steps',
    steps: [
      {
        number: 1,
        title: 'Enable Geolocation Access',
        description: 'Allow browser location permissions to center automatically on your neighborhood coordinates.'
      },
      {
        number: 2,
        title: 'Use Search & Filters',
        description: 'Filter map markers by category, severity (High, Medium, Low), and status (Verified, In Progress, Resolved).'
      },
      {
        number: 3,
        title: 'Toggle Satellite View',
        description: 'Switch between standard street view and satellite imagery to verify ground landmarks.'
      },
      {
        number: 4,
        title: 'Track Nearby Issues',
        description: 'Click "Track" on nearby cards to add them to your watchlist and support prioritization.'
      }
    ]
  },
  {
    id: 'account-profile',
    slug: 'account-profile',
    title: 'Account & Profile',
    description: 'Manage your account and settings.',
    icon: 'fa-solid fa-user',
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    badgeType: 'steps',
    steps: [
      {
        number: 1,
        title: 'Access Account Settings',
        description: 'Click your avatar at the bottom of the sidebar or top right header and choose "Account settings".'
      },
      {
        number: 2,
        title: 'Update Personal Information',
        description: 'Keep your full name, email address, and phone number up to date for SMS or email resolution alerts.'
      },
      {
        number: 3,
        title: 'Set Default Saved Location',
        description: 'Configure your primary residential zone/ward so your dashboard always highlights your home area.'
      },
      {
        number: 4,
        title: 'Security & Sign Out',
        description: 'Manage your password credentials or sign out securely on shared devices.'
      }
    ]
  },
  {
    id: 'issue-status-updates',
    slug: 'issue-status-updates',
    title: 'Issue Status & Updates',
    description: 'Track progress and notifications.',
    icon: 'fa-solid fa-clock',
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    badgeType: 'steps',
    steps: [
      {
        number: 1,
        title: 'Pending / New',
        description: 'Your report has been successfully submitted and logged in the municipal queue awaiting initial triage.'
      },
      {
        number: 2,
        title: 'Verified',
        description: 'The local zonal supervisor has reviewed the photos, location, and verified the authenticity of the issue.'
      },
      {
        number: 3,
        title: 'In Progress',
        description: 'A municipal maintenance crew or contractor has been assigned with work actively underway on site.'
      },
      {
        number: 4,
        title: 'Resolved',
        description: 'The repair work has been completed and verified with photographic proof attached to the report timeline.'
      },
      {
        number: 5,
        title: 'Rejected / Duplicate',
        description: 'If a report is outside jurisdiction, invalid, or duplicate, a notification note explains the rationale.'
      }
    ]
  },
  {
    id: 'safety-community',
    slug: 'safety-community',
    title: 'Safety & Community',
    description: 'Guidelines and reporting safety hazards.',
    icon: 'fa-solid fa-shield-halved',
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
    badgeType: 'article',
    content: [
      'Safety is our utmost priority across all participating communities and municipal zones.',
      'Important Safety Protocols:',
      '• Immediate Life Threats: If you encounter fallen live electrical cables, active gas leaks, or collapsing structures, immediately contact emergency services (112 / 199) first before submitting a report.',
      '• Safe Photo Capture: Never endanger yourself or others while photographing road damage or dangerous intersections. Take photos from a safe sidewalk or roadside.',
      '• High Severity Flagging: Always select "High" severity for hazards that pose direct danger to pedestrians or vehicles so municipal dispatch teams are alerted instantly.',
      '• Community Collaboration: Comment respectfully on community discussions to share updates or detours with fellow residents.'
    ]
  },
  {
    id: 'troubleshooting',
    slug: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Fix common issues and errors.',
    icon: 'fa-solid fa-wrench',
    iconBg: '#ffedd5',
    iconColor: '#ea580c',
    badgeType: 'article',
    content: [
      'Having technical difficulties? Here are quick solutions for common questions:',
      '• GPS / Location Not Detected: Ensure location permissions are allowed in your browser settings (look for the lock/settings icon in your address bar). You can also type your address manually in the search field.',
      '• Photos Not Uploading: Check that your images are under 5MB each and formatted as JPEG, PNG, or WebP. Verify that your device has an active internet connection.',
      '• Session Expired / 401 Error: If you see an authentication alert, click your profile menu, sign out, and log back in to refresh your secure token.',
      '• Map Not Rendering: Ensure WebGL is enabled in your browser and disable ad-blockers that might block tile servers (OpenStreetMap/Leaflet).',
      '• Still Stuck?: Reach out directly to our support desk via email at ibukunoludapo2022@gmail.com or call 09134640553.'
    ]
  },
  {
    id: 'other',
    slug: 'other',
    title: 'Other',
    description: 'More help and resources.',
    icon: 'fa-solid fa-ellipsis',
    iconBg: '#f1f5f9',
    iconColor: '#64748b',
    badgeType: 'article',
    content: [
      'Looking for additional resources or municipal partnership information?',
      '• Municipal & Resolver Inquiries: If you are a municipal staff member or community ward leader seeking resolver portal access, contact our administrative desk.',
      '• Data Privacy & GDPR: You can request an export of your personal reports or account data deletion at any time.',
      '• Feature Requests & Feedback: We are continuously improving FixIt. If you have suggestions for new features, send them to our support email at ibukunoludapo2022@gmail.com.',
      '• Emergency Contacts: For urgent police, fire, or medical emergencies, please dial your official local emergency numbers directly.'
    ]
  }
];

export const quickGuides = [
  {
    id: 'how-to-report-an-issue',
    slug: 'how-to-report-an-issue',
    title: 'How to Report an Issue',
    readTime: '2 min read',
    icon: 'fa-solid fa-file-lines',
    badgeType: 'steps',
    steps: [
      {
        number: 1,
        title: 'Open the Report Wizard',
        description: 'Click "+ New Report" in the dashboard header or on the quick action button.'
      },
      {
        number: 2,
        title: 'Select Issue Category & Severity',
        description: 'Choose from 5 primary categories and rate the severity (Low, Medium, High).'
      },
      {
        number: 3,
        title: 'Pinpoint Location on Map',
        description: 'Use device GPS, type the street address, or reposition the map pin directly over the problem.'
      },
      {
        number: 4,
        title: 'Upload Clear Photos',
        description: 'Add up to 5 photos showing the full context and close-up damage.'
      },
      {
        number: 5,
        title: 'Submit & Track',
        description: 'Review summary and click Submit. Your issue will immediately receive a tracking ticket in My Reports.'
      }
    ]
  },
  {
    id: 'using-the-community-map',
    slug: 'using-the-community-map',
    title: 'Using the Community Map',
    readTime: '3 min read',
    icon: 'fa-solid fa-file-lines',
    badgeType: 'steps',
    steps: [
      {
        number: 1,
        title: 'Explore Your Neighborhood',
        description: 'Navigate to "Nearby Issues" to view reports within 5 km of your location.'
      },
      {
        number: 2,
        title: 'Filter by Problem Type',
        description: 'Use category pills (Roads, Water, Streetlights, Drainage) to see what impacts your daily route.'
      },
      {
        number: 3,
        title: 'Inspect Markers and Photos',
        description: 'Click pins on the map to view submitted images, timestamps, and resolver status.'
      },
      {
        number: 4,
        title: 'Upvote & Track',
        description: 'Track issues to stay informed with real-time push and email notifications as repairs take place.'
      }
    ]
  },
  {
    id: 'understanding-issue-status',
    slug: 'understanding-issue-status',
    title: 'Understanding Issue Status',
    readTime: '2 min read',
    icon: 'fa-solid fa-file-lines',
    badgeType: 'steps',
    steps: [
      {
        number: 1,
        title: 'Pending Review',
        description: 'Issue has been received and queued for review by the municipal zonal coordinator.'
      },
      {
        number: 2,
        title: 'Verified',
        description: 'Site details have been validated and assigned to the relevant public works department.'
      },
      {
        number: 3,
        title: 'In Progress',
        description: 'Crews are deployed and active repair work or maintenance is ongoing.'
      },
      {
        number: 4,
        title: 'Resolved',
        description: 'The problem is officially fixed, confirmed by photographic before-and-after evidence.'
      }
    ]
  },
  {
    id: 'setting-up-your-profile',
    slug: 'setting-up-your-profile',
    title: 'Setting Up Your Profile',
    readTime: '2 min read',
    icon: 'fa-solid fa-file-lines',
    badgeType: 'steps',
    steps: [
      {
        number: 1,
        title: 'Open Settings',
        description: 'Click your profile avatar on the sidebar to access Account Settings.'
      },
      {
        number: 2,
        title: 'Configure Your Residential Zone',
        description: 'Set your neighborhood zone/ward to receive localized civic alerts.'
      },
      {
        number: 3,
        title: 'Save Default Coordinates',
        description: 'Save your primary home address for instant 1-click nearby map positioning.'
      },
      {
        number: 4,
        title: 'Notification Preferences',
        description: 'Customize SMS or email notifications for updates on your reported and tracked issues.'
      }
    ]
  }
];

export const faqsList = [
  {
    id: 'faq-1',
    question: 'How do I report a problem on FixIt?',
    answer: 'Click the "+ New Report" button located in the dashboard header or sidebar. The wizard will walk you through 4 simple steps: choosing an issue category, entering a description, specifying the location via GPS or address search, uploading up to 5 photos, and reviewing before submitting.'
  },
  {
    id: 'faq-2',
    question: 'Can I add photos or videos to my report?',
    answer: 'Yes! In Step 3 of the reporting wizard, you can upload up to 5 high-resolution photos (up to 5MB each, JPEG or PNG). High-clarity photos significantly accelerate municipal verification and dispatch. Video upload support is currently in development and will be available soon.'
  },
  {
    id: 'faq-3',
    question: 'How do I check the status of my reported issue?',
    answer: 'Navigate to "My Reports" from your dashboard sidebar. You will see a breakdown of all your reports organized by status tabs: All, Pending, In Progress, Resolved, and Rejected. Click "View Details" on any report to see the live timeline, assigned resolver team, and resolution notes.'
  },
  {
    id: 'faq-4',
    question: 'What do the different severity levels mean?',
    answer: 'Low: Minor non-urgent issues that do not disrupt traffic or pose immediate danger (e.g. minor paint fading, small litter). Medium: Moderate problems that require routine maintenance (e.g. potholes, non-functional streetlights). High: Urgent hazards posing immediate danger to life or property (e.g. fallen power lines, major main water bursts, severe road collapses).'
  },
  {
    id: 'faq-5',
    question: 'How do I change my location or update my profile?',
    answer: 'Click on your avatar at the bottom of the sidebar or top header, then select "Account settings". Here you can update your contact information, residential zone/ward, and save your default community location to customize your Nearby Issues feed.'
  },
  {
    id: 'faq-6',
    question: 'Who resolves the issues reported on FixIt?',
    answer: 'Reports are automatically routed to verified municipal departments, public utility agencies, and local zonal resolvers assigned to your district.'
  },
  {
    id: 'faq-7',
    question: 'Can I upvote or track issues reported by other residents?',
    answer: 'Yes! Open "Nearby Issues" or "Community Map" to view reports around you and click the "Track" button to upvote and increase its community priority score.'
  },
  {
    id: 'faq-8',
    question: 'Is my personal information kept private when I report?',
    answer: 'Yes. Your contact phone number and exact personal account details are never publicly visible on community boards. Only your report description, location, and photos are displayed.'
  }
];

export const contactInfo = {
  email: 'ibukunoludapo2022@gmail.com',
  phone: '09134640553',
  displayPhone: '+234 913 464 0553',
  hours: 'Mon - Fri, 8am - 6pm (WAT)'
};
