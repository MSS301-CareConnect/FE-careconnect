export const servicesPreview = [
  {
    id: 'CC-ELD-01',
    name: 'elderly',
    group: 'elderly',
    unit: 'shift',
    status: 'active',
    icon: 'elderly',
    prices: [
      { label: 'four', amount: 350000 },
      { label: 'eight', amount: 650000 },
      { label: 'daily', amount: 1450000 }
    ],
    bookings: 1420,
    rating: 4.9,
    reviews: 318
  },
  {
    id: 'CC-REH-02',
    name: 'rehab',
    group: 'rehab',
    unit: 'hour',
    status: 'active',
    icon: 'accessibility_new',
    prices: [
      { label: 'hour', amount: 150000 },
      { label: 'package', amount: 1500000 }
    ],
    bookings: 894,
    rating: 4.95,
    reviews: 210
  },
  {
    id: 'CC-SUR-03',
    name: 'surgery',
    group: 'surgery',
    unit: 'shift',
    status: 'active',
    icon: 'healing',
    prices: [{ label: 'visit', amount: 180000 }],
    bookings: 2140,
    rating: 4.88,
    reviews: 540
  },
  {
    id: 'CC-SND-04',
    name: 'sonde',
    group: 'surgery',
    unit: 'shift',
    status: 'active',
    icon: 'vaccines',
    prices: [{ label: 'visit', amount: 320000 }],
    bookings: 512,
    rating: 4.92,
    reviews: 128
  },
  {
    id: 'CC-CHR-05',
    name: 'chronic',
    group: 'chronic',
    unit: 'shift',
    status: 'active',
    icon: 'cardiology',
    prices: [
      { label: 'four', amount: 380000 },
      { label: 'package', amount: 6800000 }
    ],
    bookings: 730,
    rating: 4.85,
    reviews: 176
  },
  {
    id: 'CC-MOM-06',
    name: 'mother',
    group: 'mother',
    unit: 'daily',
    status: 'paused',
    icon: 'child_care',
    prices: [
      { label: 'eight', amount: 720000 },
      { label: 'daily', amount: 1600000 }
    ],
    bookings: 638,
    rating: 4.96,
    reviews: 190
  }
] as const
