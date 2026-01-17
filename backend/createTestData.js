const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://testUser:test1234@cluster0.gtx3rnw.mongodb.net/ccms-test?retryWrites=true&w=majority';

async function createTestData() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('ccms-test');
    
    console.log('🔄 Creating test data...');

    // 1. Create Admin User
    const adminHash = await bcrypt.hash('Admin@123', 10);
    await db.collection('Users').insertOne({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: adminHash,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Admin user created');

    // 2. Create Test Student
    const studentHash = await bcrypt.hash('Student@123', 10);
    const studentResult = await db.collection('Users').insertOne({
      name: 'Test Student',
      email: 'student@test.com',
      password: studentHash,
      role: 'student',
      roll: 'TEST001',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const studentId = studentResult.insertedId.toString();
    console.log('✅ Student user created');

    // 3. Create Sample Resolved Complaints
    const now = new Date();
    const complaints = [];

    for (let i = 1; i <= 50; i++) {
      const submittedAt = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // i days ago
      const resolvedAt = new Date(submittedAt.getTime() + (Math.random() * 48 * 60 * 60 * 1000)); // Resolved within 48 hours

      complaints.push({
        complaintId: `CMP${String(i).padStart(5, '0')}`,
        userId: studentId,
        submittedBy: 'Test Student',
        email: 'student@test.com',
        subject: `Test Complaint ${i}`,
        title: `Test Complaint ${i}`,
        description: `This is a test complaint number ${i} for testing purposes.`,
        category: ['Academic', 'Hostel', 'Infrastructure', 'Cafeteria', 'Library'][i % 5],
        location: 'Main Campus',
        priority: ['High', 'Medium', 'Low'][i % 3],
        images: [],
        status: 'Resolved',
        adminRemarks: `Resolved complaint ${i}`,
        submittedAt,
        createdAt: submittedAt,
        updatedAt: resolvedAt,
        resolvedAt,
        readByAdmin: true,
        timeline: [
          { status: 'Pending', timestamp: submittedAt, message: 'Complaint submitted' },
          { status: 'Resolved', timestamp: resolvedAt, message: 'Complaint resolved' },
        ],
      });
    }

    // 4. Add 10 Pending Complaints
    for (let i = 51; i <= 60; i++) {
      const submittedAt = new Date(now.getTime() - ((i - 50) * 60 * 60 * 1000)); // Last few hours

      complaints.push({
        complaintId: `CMP${String(i).padStart(5, '0')}`,
        userId: studentId,
        submittedBy: 'Test Student',
        email: 'student@test.com',
        subject: `Pending Complaint ${i}`,
        title: `Pending Complaint ${i}`,
        description: `This is a pending test complaint number ${i}.`,
        category: ['Academic', 'Hostel', 'Infrastructure', 'Cafeteria', 'Library'][i % 5],
        location: 'Main Campus',
        priority: ['High', 'Medium', 'Low'][i % 3],
        images: [],
        status: 'Pending',
        adminRemarks: '',
        submittedAt,
        createdAt: submittedAt,
        updatedAt: submittedAt,
        resolvedAt: null,
        readByAdmin: false,
        timeline: [
          { status: 'Pending', timestamp: submittedAt, message: 'Complaint submitted' },
        ],
      });
    }

    await db.collection('Complaints').insertMany(complaints);
    console.log(`✅ Created ${complaints.length} test complaints`);

    console.log('\n🎉 Test data created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('Admin:   admin@test.com / Admin@123');
    console.log('Student: student@test.com / Student@123');
    console.log('\n📊 Stats:');
    console.log('- 50 Resolved complaints');
    console.log('- 10 Pending complaints');
    console.log('- Total: 60 complaints');

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestData();