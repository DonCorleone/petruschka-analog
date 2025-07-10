import { defineEventHandler } from 'h3';
import { BandMember, ApiResponse } from '../../../../shared/types';

const MOCK_BAND_MEMBERS: BandMember[] = [
  {
    id: 1,
    name: 'Daniel Contreras',
    instrument: 'Vocals',
    image: '/images/members/member-1.png',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ipsum neque, ornare vitae auctor vitae, blandit sit amet metus. Nulla vestibulum sem odio, eget tempor nisl mattis et.'
  },
  {
    id: 2,
    name: 'Tim Wallace',
    instrument: 'Guitar',
    image: '/images/members/member-2.png',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ipsum neque, ornare vitae auctor vitae, blandit sit amet metus. Nulla vestibulum sem odio, eget tempor nisl mattis et.'
  },
  {
    id: 3,
    name: 'Andrew Bryant',
    instrument: 'Bass',
    image: '/images/members/member-3.png',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ipsum neque, ornare vitae auctor vitae, blandit sit amet metus. Nulla vestibulum sem odio, eget tempor nisl mattis et.'
  },
  {
    id: 4,
    name: 'Ray Anderson',
    instrument: 'Drums',
    image: '/images/members/member-4.png',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ipsum neque, ornare vitae auctor vitae, blandit sit amet metus. Nulla vestibulum sem odio, eget tempor nisl mattis et.'
  }
];

export default defineEventHandler(async (event): Promise<ApiResponse<BandMember[]>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 120));
  
  return {
    success: true,
    data: MOCK_BAND_MEMBERS,
    timestamp: new Date().toISOString()
  };
});
