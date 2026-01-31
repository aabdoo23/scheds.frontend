export const NAV_ITEMS = [
  { to: '/generate-schedules', label: 'Generate Schedules' },
  { to: '/self-service-search', label: 'Self Service Search' },
  { to: '/seat-moderation', label: 'Seat Moderation' },
  { to: '/find-study-rooms', label: 'Find Study Rooms' },
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
