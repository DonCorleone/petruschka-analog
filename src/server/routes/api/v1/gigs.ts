import { defineEventHandler } from 'h3';
import { Gig, ApiResponse } from '../../../../shared/types';

const MOCK_GIGS: Gig[] = [
  {
    id: 1,
    date: { day: 16, month: 'OCT' },
    title: 'Decibel Lorem Ipsum, London',
    venue: 'Dingwalls',
    location: 'London',
    time: '9:00pm',
    dayOfWeek: 'Saturday',
    description: 'Sed feugiat varius felis pulvinar tincidunt. Donec bibendum fermentum justo, sit amet commodo augue porta in. Etiam lacinia quam vel ante aliquam euismod. Nam vitae molestie purus. Suspendisse id erat quis leo molestie laoreet at eget libero. In eget ipsum leo.',
    ticketUrl: '#'
  },
  {
    id: 2,
    date: { day: 28, month: 'SEP' },
    title: 'Decibel Aenean Massa, Bristol',
    venue: 'O2 Academy',
    location: 'Bristol',
    time: '7:00pm',
    dayOfWeek: 'Thursday',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non ipsum erat. Cras quis justo vel lorem lobortis facilisis. Fusce rhoncus rutrum sapien posuere porttitor.',
    ticketUrl: '#'
  },
  {
    id: 3,
    date: { day: 5, month: 'AUG' },
    title: 'Decibel Pharetra Lorem Vitae, San Francisco',
    venue: 'Mission',
    location: 'San Francisco',
    time: '8:30pm',
    dayOfWeek: 'Friday',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non ipsum erat. Cras quis justo vel lorem lobortis facilisis. Fusce rhoncus rutrum sapien posuere porttitor.',
    ticketUrl: '#'
  },
  {
    id: 4,
    date: { day: 18, month: 'JUL' },
    title: 'Decibel Vehicula, New York',
    venue: 'Irving Plaza',
    location: 'New York',
    time: '7:30pm',
    dayOfWeek: 'Sunday',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non ipsum erat. Cras quis justo vel lorem lobortis facilisis.',
    ticketUrl: '#'
  }
];

export default defineEventHandler(async (event): Promise<ApiResponse<Gig[]>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    success: true,
    data: MOCK_GIGS,
    timestamp: new Date().toISOString()
  };
});
