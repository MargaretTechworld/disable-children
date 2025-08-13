export const users = {
  'super@example.com': {
    password: 'superpassword',
    role: 'super-admin',
    name: 'Super Admin',
  },
  'admin1@example.com': {
    password: 'password1',
    role: 'admin',
    name: 'Admin User 1',
  },
  'admin2@example.com': {
    password: 'password2',
    role: 'admin',
    name: 'Admin User 2',
  },
};

export let messages = [
  {
    id: 1,
    from: 'super@example.com',
    to: 'admin1@example.com',
    subject: 'Welcome to the team!',
    body: 'Hi Admin 1, welcome aboard! Let me know if you have any questions.',
    timestamp: '2025-07-21T14:05:00Z',
    read: false,
  },
  {
    id: 2,
    from: 'admin1@example.com',
    to: 'super@example.com',
    subject: 'Re: Welcome to the team!',
    body: 'Thanks! I\'m excited to get started.',
    timestamp: '2025-07-21T14:10:00Z',
    read: true,
  },
  {
    id: 3,
    from: 'super@example.com',
    to: 'admin2@example.com',
    subject: 'Quick Question',
    body: 'Can you please review the latest child registration form?',
    timestamp: '2025-07-21T14:15:00Z',
    read: false,
  },
  {
  id: 4,
  from: 'super@example.com',
  to: 'admin1@example.com',
  subject: 'Welcome to the team!',
  body: 'Hi Admin 1, welcome aboard! Let me know if you have any questions.',
  timestamp: '2025-07-21T14:05:00Z',
  read: false,
}

];

// In src/data/mockData.js

export const childrenData = [
  {
    firstName: "John",
    lastName: "Doe",
    age: 8,
    gender: "Male",
    disabilityType: "Autism",
    parentsContact: "123-456-7890",
    severity: "Mild",
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    age: 12,
    gender: "Female",
    disabilityType: "Down Syndrome",
    parentsContact: "098-765-4321",
    severity: "Moderate",
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    age: 10,
    gender: "Female",
    disabilityType: "Down Syndrome",
    parentsContact: "098-765-4321",
    severity: "Moderate",
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    age: 7,
    gender: "Female",
    disabilityType: "Down Syndrome",
    parentsContact: "098-765-4321",
    severity: "Moderate",
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    age: 14,
    gender: "Female",
    disabilityType: "Down Syndrome",
    parentsContact: "098-765-4321",
    severity: "Moderate",
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    age: 9,
    gender: "Female",
    disabilityType: "Down Syndrome",
    parentsContact: "098-765-4321",
    severity: "Moderate",
  },
];

// ... keep other mock data like users and messages
