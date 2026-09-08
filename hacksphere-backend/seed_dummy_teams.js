import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Team from './models/Team.js';
import User from './models/User.js';
import Progress from './models/Progress.js';

dotenv.config();

const dummyTeams = [
  {
    name: 'Quantum Coders',
    description: 'Building an AI-powered code reviewer that actually understands architectural patterns. We need a frontend wiz.',
    leaderName: 'Alice',
    membersCount: 4,
    percentage: 95,
    maxMembers: 4,
    requiredSkills: ['React', 'Tailwind', 'Framer Motion']
  },
  {
    name: 'EcoSync',
    description: 'Hardware/software hybrid solution for optimizing smart grid distribution in university campuses.',
    leaderName: 'Bob',
    membersCount: 5,
    percentage: 80,
    maxMembers: 5,
    requiredSkills: ['IoT', 'Node.js', 'Python']
  },
  {
    name: 'DeFi Pioneers',
    description: 'Creating a zero-knowledge proof based voting system for DAOs. Solidity experience is a huge plus.',
    leaderName: 'Charlie',
    membersCount: 3,
    percentage: 65,
    maxMembers: 4,
    requiredSkills: ['Solidity', 'Web3.js', 'Rust']
  },
  {
    name: 'Cyber Knights',
    description: 'A cybersecurity tool that automates penetration testing using reinforcement learning agents.',
    leaderName: 'Diana',
    membersCount: 4,
    percentage: 40,
    maxMembers: 5,
    requiredSkills: ['Python', 'Docker', 'Security']
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://23mh1a4261_db_user:sanfarfab@cluster1.p1mtrf3.mongodb.net/hacksphere?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    for (const data of dummyTeams) {
      // Create leader
      const leader = await User.create({
        name: data.leaderName,
        email: `dummy_${data.leaderName.toLowerCase()}@dummy.com`,
        password: 'password123',
        skills: data.requiredSkills
      });

      // Create dummy members
      const memberIds = [leader._id];
      for (let i = 1; i < data.membersCount; i++) {
        const member = await User.create({
          name: `${data.leaderName} Member ${i}`,
          email: `${data.leaderName.toLowerCase()}_member${i}@dummy.com`,
          password: 'password123'
        });
        memberIds.push(member._id);
      }

      // Create team
      const team = await Team.create({
        name: data.name,
        description: data.description,
        leader: leader._id,
        members: memberIds,
        maxMembers: data.maxMembers,
        requiredSkills: data.requiredSkills,
        openToMembers: true
      });

      // Update users with team
      await User.updateMany({ _id: { $in: memberIds } }, { team: team._id });

      // Create progress
      await Progress.create({
        team: team._id,
        percentage: data.percentage
      });

      console.log(`Seeded team ${data.name}`);
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
