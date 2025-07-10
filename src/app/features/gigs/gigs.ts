export interface Gig {
  id: number;
  date: {
    day: number;
    month: string;
  };
  title: string;
  venue: string;
  location: string;
  time: string;
  dayOfWeek: string;
  description: string;
  ticketUrl: string;
}

export const MOCK_GIGS: Gig[] = [
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
    date: { day: 19, month: 'JUL' },
    title: 'Decibel Pharetra Lorem Vitae, Chicago',
    venue: 'Auditorium',
    location: 'Chicago',
    time: '6:00pm',
    dayOfWeek: 'Saturday',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non ipsum erat. Cras quis justo vel lorem lobortis facilisis. Fusce rhoncus rutrum sapien posuere porttitor.',
    ticketUrl: '#'
  }
];
