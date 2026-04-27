const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Check this path matches your User model
require('dotenv').config();

const seedUsers = [
  { name: "Ishaan Sharma", email: "ishaan@example.com", city: "Delhi", description: "Backend specialist. I love architecting scalable APIs. Can teach Node.js and SQL optimization.", skillsOffered: ["Node.js", "PostgreSQL", "System Design"], skillsWanted: ["React", "UI Design"], isVerified: true },
  { name: "Priya Das", email: "priya@example.com", city: "Kolkata", description: "Frontend enthusiast. I create smooth animations with Framer Motion. Looking to learn Python for Data Science.", skillsOffered: ["React", "Framer Motion", "Tailwind"], skillsWanted: ["Python", "Pandas"], isVerified: true },
  { name: "Rohan Varma", email: "rohan@example.com", city: "Hyderabad", description: "Cloud Engineer. I can help you deploy your MERN apps to AWS or Azure.", skillsOffered: ["AWS", "Docker", "Terraform"], skillsWanted: ["Next.js", "TypeScript"], isVerified: false },
  { name: "Ananya Iyer", email: "ananya@example.com", city: "Chennai", description: "Data Scientist by day. I want to learn how to build beautiful frontends for my ML models.", skillsOffered: ["Python", "Machine Learning", "SQL"], skillsWanted: ["React", "CSS Grid"], isVerified: true },
  { name: "Kabir Singh", email: "kabir@example.com", city: "Pune", description: "Java Developer. Switching to JavaScript ecosystem. Can teach Spring Boot.", skillsOffered: ["Java", "Spring Boot", "Microservices"], skillsWanted: ["Node.js", "Express"], isVerified: false },
  { name: "Meera Reddy", email: "meera@example.com", city: "Bangalore", description: "Product Designer. Offering Figma mentorship. I want to understand how my designs are coded.", skillsOffered: ["Figma", "UX Research", "Prototyping"], skillsWanted: ["HTML", "CSS", "JavaScript"], isVerified: true },
  { name: "Vikram Malhotra", email: "vikram@example.com", city: "Mumbai", description: "DevOps pro. Let's talk about CI/CD pipelines. Looking for GraphQL experts.", skillsOffered: ["Jenkins", "Kubernetes", "GitLab"], skillsWanted: ["GraphQL", "Apollo"], isVerified: true },
  { name: "Sanya Gupta", email: "sanya@example.com", city: "Gurgaon", description: "Content Strategist and basic coder. I can help with SEO and technical writing.", skillsOffered: ["SEO", "Technical Writing"], skillsWanted: ["Webflow", "JavaScript"], isVerified: false },
  { name: "Aarav Goel", email: "aarav@example.com", city: "Ahmedabad", description: "Mobile Dev. Expert in Flutter. Wanting to learn Backend development to go Fullstack.", skillsOffered: ["Flutter", "Dart", "Firebase"], skillsWanted: ["Node.js", "MongoDB"], isVerified: true },
  { name: "Zara Khan", email: "zara@example.com", city: "Lucknow", description: "Cybersecurity student. I can teach you about JWT security and web vulnerabilities.", skillsOffered: ["Cybersecurity", "JWT", "Ethical Hacking"], skillsWanted: ["React", "Redux"], isVerified: false },
  { name: "Aditya Joshi", email: "aditya@example.com", city: "Jaipur", description: "Fullstack intern. Strong in C++. Wanting to master the MERN stack.", skillsOffered: ["C++", "Data Structures"], skillsWanted: ["MongoDB", "Express", "React"], isVerified: true },
  { name: "Tanvi Shah", email: "tanvi@example.com", city: "Surat", description: "Graphic Designer. Can help with branding. Looking for someone to teach me basic React.", skillsOffered: ["Illustrator", "Photoshop"], skillsWanted: ["React", "HTML"], isVerified: false },
  { name: "Rahul Nair", email: "rahul@example.com", city: "Kochi", description: "Blockchain Developer. Offering Solidity lessons. Looking for Three.js wizards.", skillsOffered: ["Solidity", "Web3.js"], skillsWanted: ["Three.js", "WebGL"], isVerified: true },
  { name: "Sneha Kapoor", email: "sneha@example.com", city: "Chandigarh", description: "Manual Tester moving to Automation. Can help with documentation and QA.", skillsOffered: ["Manual Testing", "QA"], skillsWanted: ["Selenium", "Python"], isVerified: false },
  { name: "Aryan Saxena", email: "aryan@example.com", city: "Indore", description: "Marketing lead. Expert in Google Ads. I want to build my own landing pages.", skillsOffered: ["Digital Marketing", "Google Ads"], skillsWanted: ["Tailwind CSS", "React"], isVerified: true }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // 1. Optional: Clear existing users (Careful! This deletes your current test accounts)
    // await User.deleteMany({}); 

    // 2. Prepare users (add a default password for all)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const usersWithPasswords = seedUsers.map(user => ({
      ...user,
      password: hashedPassword
    }));

    // 3. Insert into Database
    await User.insertMany(usersWithPasswords);
    console.log(`${seedUsers.length} users seeded successfully!`);
    
    process.exit();
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
};

seedDB();