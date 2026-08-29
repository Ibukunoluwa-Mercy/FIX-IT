import potholeImg from '../../assets/massive pothole on main St.png';
import dumpingParkImg from '../../assets/illegal dumping in park.png';
import streetlightImg from '../../assets/streetlight outage.png';
import flooding3rdImg from '../../assets/flooding in third avenue.png';
import playgroundImg from '../../assets/homepage one.jpeg';

import trendFloodingImg from '../../assets/05_flooding_at_central_road.png';
import trendStreetlightImg from '../../assets/06_broken_streetlight_park_entrance.png';
import trendDumpingImg from '../../assets/07_illegal_dumping_downtown_alley.png';
import trendManholeImg from '../../assets/08_open_manhole_near_school.png';

export const MOCK_ISSUES = [
  {
    id: 'ISS-001',
    title: 'Massive Pothole on Main St.',
    description: 'Large pothole in the right lane causing vehicles to swerve dangerously. Needs immediate attention.',
    location: '1200 Block, Main St.',
    category: 'Roads & Potholes',
    status: 'Verified',
    severity: 'High',
    photoCount: 3,
    image: potholeImg,
    confirmations: 24,
    commentsCount: 5,
    createdAt: '2d ago',
    dateReported: '2026-08-27'
  },
  {
    id: 'ISS-002',
    title: 'Illegal Dumping in Park',
    description: 'Large pile of construction debris and household waste dumped near the park entrance.',
    location: 'Centennial Park, North Entrance',
    category: 'Waste & Dumping',
    status: 'Verified',
    severity: 'Medium',
    photoCount: 4,
    image: dumpingParkImg,
    confirmations: 12,
    commentsCount: 3,
    createdAt: '5h ago',
    dateReported: '2026-08-29'
  },
  {
    id: 'ISS-003',
    title: 'Streetlight Outage',
    description: 'Streetlight has been out for over a week, area is very dark at night and causes safety concerns.',
    location: 'Corner of 8th St. & 4th Ave',
    category: 'Streetlights',
    status: 'In Progress',
    severity: 'Low',
    photoCount: 2,
    image: streetlightImg,
    confirmations: 6,
    commentsCount: 1,
    createdAt: '1w ago',
    dateReported: '2026-08-20'
  },
  {
    id: 'ISS-004',
    title: 'Flooding on 3rd Avenue',
    description: 'Heavy flooding after rain, water stays for hours making the road impassable for pedestrians.',
    location: '3rd Avenue, Downtown',
    category: 'Flooding & Drainage',
    status: 'Pending',
    severity: 'High',
    photoCount: 5,
    image: flooding3rdImg,
    confirmations: 31,
    commentsCount: 7,
    createdAt: '3d ago',
    dateReported: '2026-08-26'
  },
  {
    id: 'ISS-005',
    title: 'Damaged Playground Swing',
    description: 'Broken chain on children swings at local recreational park.',
    location: 'Riverside Community Park',
    category: 'Public Facilities',
    status: 'Resolved',
    severity: 'Medium',
    photoCount: 1,
    image: playgroundImg,
    confirmations: 18,
    commentsCount: 2,
    createdAt: '2w ago',
    dateReported: '2026-08-15'
  }
];

export const TRENDING_ISSUES = [
  {
    id: 'TR-1',
    title: 'Flooding at Central Road',
    location: 'Central District',
    confirmations: 87,
    severity: 'High',
    image: trendFloodingImg
  },
  {
    id: 'TR-2',
    title: 'Broken Streetlight - Park Entrance',
    location: 'Riverside Park',
    confirmations: 54,
    severity: 'Medium',
    image: trendStreetlightImg
  },
  {
    id: 'TR-3',
    title: 'Illegal Dumping - Downtown Alley',
    location: 'Downtown Alley 4',
    confirmations: 113,
    severity: 'High',
    image: trendDumpingImg
  },
  {
    id: 'TR-4',
    title: 'Open Manhole Near School',
    location: 'Lincoln High School',
    confirmations: 28,
    severity: 'High',
    image: trendManholeImg
  }
];

export const CATEGORY_LIST = [
  { name: 'Roads & Potholes', count: 36, icon: 'fa-road', color: '#ef4444' },
  { name: 'Waste & Dumping', count: 22, icon: 'fa-trash', color: '#16a34a' },
  { name: 'Flooding & Drainage', count: 18, icon: 'fa-water', color: '#3b82f6' },
  { name: 'Streetlights', count: 14, icon: 'fa-lightbulb', color: '#f59e0b' },
  { name: 'Water Problems', count: 9, icon: 'fa-tint', color: '#0ea5e9' },
  { name: 'Public Facilities', count: 12, icon: 'fa-building', color: '#8b5cf6' },
  { name: 'Safety Hazards', count: 8, icon: 'fa-exclamation-triangle', color: '#dc2626' },
  { name: 'Environment', count: 7, icon: 'fa-leaf', color: '#10b981' },
  { name: 'Other', count: 2, icon: 'fa-ellipsis-h', color: '#6b7280' },
];
