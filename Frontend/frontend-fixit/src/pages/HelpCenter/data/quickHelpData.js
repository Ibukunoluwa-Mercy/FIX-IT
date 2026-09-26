// Quick Help Options structured data (4 core options)
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
