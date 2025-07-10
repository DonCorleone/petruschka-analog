import { defineEventHandler } from 'h3';
import { MerchItem, Update, ApiResponse } from '../../../../shared/types';

const MOCK_MERCH: MerchItem[] = [
  {
    id: 1,
    title: 'Band T-Shirt',
    price: 20,
    image: '/images/merch/merch-1.jpg',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor aenean massa.',
    purchaseUrl: '#'
  },
  {
    id: 2,
    title: 'Band T-Shirt',
    price: 20,
    image: '/images/merch/merch-2.jpg',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor aenean massa.',
    purchaseUrl: '#'
  },
  {
    id: 3,
    title: 'Band Hoody',
    price: 35,
    image: '/images/merch/merch-3.jpg',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
    purchaseUrl: '#'
  },
  {
    id: 4,
    title: 'Band Tote Bag',
    price: 12,
    image: '/images/merch/merch-4.jpg',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
    purchaseUrl: '#'
  }
];

const MOCK_UPDATES: Update[] = [
  {
    id: 1,
    title: "Decibel's EP is out July 18th 2024",
    description: 'Our forthcoming EP is available for pre-order via pledgemusic.com now',
    ctaText: 'Pre-order Now',
    ctaUrl: '#',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube.com/embed/mCHUw7ACS8o',
    mediaThumb: '/images/video-thumb-1.jpg',
    isCountdown: true,
    countdownDate: 'July 18, 2025'
  },
  {
    id: 2,
    title: 'We are performing at The Fleece, London this Saturday night 9:00pm',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes.',
    ctaText: 'Buy Tickets',
    ctaUrl: '#'
  },
  {
    id: 3,
    title: 'Help to fund our new album via KickStarter',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes.',
    ctaText: 'Support Us',
    ctaUrl: '#',
    mediaType: 'image',
    mediaThumb: '/images/image-thumb-1.jpg'
  }
];

export default defineEventHandler(async (event): Promise<ApiResponse<{ merchandise: MerchItem[], updates: Update[] }>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 180));
  
  return {
    success: true,
    data: {
      merchandise: MOCK_MERCH,
      updates: MOCK_UPDATES
    },
    timestamp: new Date().toISOString()
  };
});
