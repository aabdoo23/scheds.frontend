export type NavItem = {
  to: string;
  label: string;
  shortLabel?: string;
  primary?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { to: '/generate-schedules', label: 'Generate Schedules', shortLabel: 'Generate', primary: true },
  { to: '/self-service-search', label: 'Self Service Search', shortLabel: 'Search' },
  { to: '/seat-alerts', label: 'Seat Alerts', shortLabel: 'Alerts' },
  { to: '/find-study-rooms', label: 'Find Study Rooms', shortLabel: 'Rooms' },
  { to: '/contributors', label: 'Contributors', shortLabel: 'Contributors' },
];

const GITHUB_ORG = 'aabdoo23';

export const GITHUB_REPOS = [
  { href: `https://github.com/${GITHUB_ORG}/Scheds`, label: 'Backend' },
  { href: `https://github.com/${GITHUB_ORG}/scheds.frontend`, label: 'Frontend' },
] as const;

export const EXTERNAL_LINKS = [
  {
    href: 'https://forms.gle/2qJ84eaXxJh3r5TD8',
    label: 'Support Form',
    icon: 'fa-question-circle' as const,
  },
  {
    href: 'https://www.facebook.com/profile.php?id=61566138420193&mibextid=LQQJ4d',
    label: 'Facebook Page',
    icon: 'fab fa-facebook' as const,
  },
] as const;

/** Team members who don't appear in GitHub contributors. */
export const MANUAL_CONTRIBUTORS: Array<{
  name: string;
  avatarUrl: string;
  role: string;
  link?: string;
}> = [
  {
    name: 'Farida Ashraf',
    avatarUrl: 'https://i.ibb.co/xqvdt5Fv/514488836-23903787822620398-2050358979193025309-n.jpg',
    role: 'Designer, Social media and Developer',
    link: 'https://www.linkedin.com/in/farida-ashraf-0091a0301/',
  },
];
