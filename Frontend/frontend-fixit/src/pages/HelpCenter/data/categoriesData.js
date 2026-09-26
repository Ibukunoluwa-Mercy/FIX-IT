// Browse by Category structured data (8 categories)
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
