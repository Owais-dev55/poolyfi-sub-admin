// Leaderboard page data

export interface Employee {
  id: string;
  name: string;
  initials: string;
  role: 'Driver' | 'Passenger';
  rides: number;
  score: number;
  rank: number;
  isTopPerformer?: boolean;
  avatarColor: string;
}

export const employees: Employee[] = [
  {
    id: '1',
    name: 'John Smith',
    initials: 'JS',
    role: 'Driver',
    rides: 1,
    score: 98,
    rank: 1,
    isTopPerformer: true,
    avatarColor: 'bg-yellow-400'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    initials: 'SJ',
    role: 'Passenger',
    rides: 1,
    score: 98,
    rank: 2,
    isTopPerformer: true,
    avatarColor: 'bg-gray-400'
  },
  {
    id: '3',
    name: 'Emma Martinez',
    initials: 'EM',
    role: 'Driver',
    rides: 0,
    score: 100,
    rank: 3,
    isTopPerformer: true,
    avatarColor: 'bg-orange-400'
  },
  {
    id: '4',
    name: 'Adeelrao',
    initials: 'A',
    role: 'Passenger',
    rides: 0,
    score: 100,
    rank: 4,
    avatarColor: 'bg-blue-500'
  }
];
