// Quick Guides structured data (4 step-by-step reading guides)
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
