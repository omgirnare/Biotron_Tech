import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define User schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor'], required: true },
  },
  { timestamps: true }
);

// Create User model (check mongoose.models.User to avoid duplicates)
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Sample users data
const users = [
  // Patients
  { name: 'Om', email: 'om.patient@example.com', password: '1234', role: 'patient' },
  { name: 'Aditya', email: 'aditya.patient@example.com', password: '1234', role: 'patient' },
  { name: 'Sunil', email: 'sunil.patient@example.com', password: '1234', role: 'patient' },
  { name: 'Nilakshi', email: 'nilakshi.patient@example.com', password: '1234', role: 'patient' },
  { name: 'Shreyas', email: 'shreyas.patient@example.com', password: '1234', role: 'patient' },
  { name: 'Akshay', email: 'akshay.patient@example.com', password: '1234', role: 'patient' },
  
  // Doctors
  { name: 'Dr. Sarthak Kad', email: 'sarthak@hospital.com', password: '1234', role: 'doctor' },
  { name: 'Dr. Shivraj Phatangare', email: 'shivraj@hospital.com', password: '1234', role: 'doctor' },
  { name: 'Dr. Ashish Shingade', email: 'ashish@hospital.com', password: '1234', role: 'doctor' },
  { name: 'Dr. Pranav Khonde', email: 'pranav@hospital.com', password: '1234', role: 'doctor' },
  { name: 'Dr. Pushpak Patil', email: 'pushpak@hospital.com', password: '1234', role: 'doctor' },
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb+srv://bhumikrane05:ZxhhXmDqtyX0w65D@cluster0.d69s7dl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB successfully!');

    // Clear existing users
    console.log('Clearing existing users...');
    await User.deleteMany({});
    console.log('Existing users cleared successfully!');

    // Hash passwords and prepare users for insertion
    console.log('Hashing passwords and preparing users...');
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );

    // Insert users
    console.log('Inserting users into database...');
    const result = await User.insertMany(hashedUsers);
    console.log(`Successfully inserted ${result.length} users!`);

    // Log the created users
    console.log('\nCreated users:');
    result.forEach(user => {
      console.log(`- ${user.name} (${user.role}): ${user.email}`);
    });

    console.log('\nSeeding completed successfully! 🎉');
    
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    // Close connection and exit
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

// Run the seeding function
seedUsers();
