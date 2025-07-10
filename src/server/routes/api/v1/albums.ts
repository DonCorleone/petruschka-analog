import { defineEventHandler } from 'h3';
import { Album, ApiResponse } from '../../../../shared/types';

const MOCK_ALBUMS: Album[] = [
  {
    id: 1,
    title: 'Album Title Lorem Ipsum',
    coverImage: '/images/albums/album-cover-1.jpg',
    status: 'coming-soon',
    purchaseUrl: '#'
  },
  {
    id: 2,
    title: 'Album Title Sollicitudin',
    coverImage: '/images/albums/album-cover-2.jpg',
    status: 'available',
    price: 15,
    purchaseUrl: '#'
  },
  {
    id: 3,
    title: 'Album Title Maecenas',
    coverImage: '/images/albums/album-cover-3.jpg',
    status: 'available',
    price: 15,
    purchaseUrl: '#'
  },
  {
    id: 4,
    title: 'Album Title Proin Interdum',
    coverImage: '/images/albums/album-cover-4.jpg',
    status: 'available',
    price: 15,
    purchaseUrl: '#'
  },
  {
    id: 5,
    title: 'Album Title Vestibulum',
    coverImage: '/images/albums/album-cover-5.jpg',
    status: 'available',
    price: 15,
    purchaseUrl: '#'
  },
  {
    id: 6,
    title: 'Album Title Donec',
    coverImage: '/images/albums/album-cover-6.jpg',
    status: 'available',
    price: 15,
    purchaseUrl: '#'
  }
];

export default defineEventHandler(async (event): Promise<ApiResponse<Album[]>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 150));
  
  return {
    success: true,
    data: MOCK_ALBUMS,
    timestamp: new Date().toISOString()
  };
});
