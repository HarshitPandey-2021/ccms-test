// backend/seedStudents.js
// Run ONCE to add all 140 students to database
// Command: node seedStudents.js

require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

// Your 140 students data
const studentsData = [
  { rollNo: "2210013155002", name: "ABHISHEK KUMAR" },
  { rollNo: "2210013155006", name: "AJEET BHARTI" },
  { rollNo: "2210013155026", name: "DEV PRAKASH RAI" },
  { rollNo: "2210013155029", name: "KARANDEEP MISHRA" },
  { rollNo: "2210013155044", name: "RAJEEV" },
  { rollNo: "2310013125009", name: "ANUBHAV SHUKLA" },
  { rollNo: "2310013125058", name: "VAIBHAVI KESHARI" },
  { rollNo: "2310013155001", name: "ABDUL MUQTADIR ANSARI" },
  { rollNo: "2310013155002", name: "ABHAY SHEKHAR" },
  { rollNo: "2310013155003", name: "ABHINAV MISHRA" },
  { rollNo: "2310013155004", name: "ABHINAV VERMA" },
  { rollNo: "2310013155005", name: "ADITI CHAUDHARY" },
  { rollNo: "2310013155006", name: "ADITYA GUPTA" },
  { rollNo: "2310013155007", name: "ADITYA TIWARI" },
  { rollNo: "2310013155008", name: "ADITYA YADAV" },
  { rollNo: "2310013155009", name: "ADITYA YADAV" },
  { rollNo: "2310013155010", name: "ADITYA KUMAR MISHRA" },
  { rollNo: "2310013155011", name: "AHMAD TARIQUE" },
  { rollNo: "2310013155012", name: "AKSHAT CHOWDHARY" },
  { rollNo: "2310013155014", name: "AKSHAY PRATAP SINGH" },
  { rollNo: "2310013155015", name: "AKSHITA SRIVASTAVA" },
  { rollNo: "2310013155017", name: "AMAN KUMAR" },
  { rollNo: "2310013155018", name: "AMAN PATHAK" },
  { rollNo: "2310013155019", name: "AMAN VERMA" },
  { rollNo: "2310013155020", name: "AMIT CHAUHAN" },
  { rollNo: "2310013155021", name: "AMIT KUMAR PRAJAPATI" },
  { rollNo: "2310013155022", name: "AMRETESH MISHRA" },
  { rollNo: "2310013155024", name: "ANSHUMAN GUPTA" },
  { rollNo: "2310013155025", name: "ANUBHAV RATHORE" },
  { rollNo: "2310013155026", name: "ANUJ KUMAR" },
  { rollNo: "2310013155027", name: "ANUP KUMAR" },
  { rollNo: "2310013155028", name: "ANURAG SHUKLA" },
  { rollNo: "2310013155029", name: "ARJIT SHUKLA" },
  { rollNo: "2310013155030", name: "ARYAN SINGH" },
  { rollNo: "2310013155031", name: "ARYAN SINGH" },
  { rollNo: "2310013155032", name: "AVANTIKA DHAR DUBEY" },
  { rollNo: "2310013155034", name: "AYUSH SINGH" },
  { rollNo: "2310013155035", name: "AYUSHI MAURYA" },
  { rollNo: "2310013155036", name: "AYUSHMAN LOHANI" },
  { rollNo: "2310013155037", name: "DEVESH KUMAR PANDEY" },
  { rollNo: "2310013155038", name: "DHATRI NAITHANI" },
  { rollNo: "2310013155041", name: "DIVYANSH MAURYA" },
  { rollNo: "2310013155042", name: "FAIZA ANSARI" },
  { rollNo: "2310013155043", name: "FIROZ ANSARI" },
  { rollNo: "2310013155044", name: "GOVIND JHA" },
  { rollNo: "2310013155045", name: "HARSH PRAJAPATI" },
  { rollNo: "2310013155046", name: "HARSH VARDHAN SINGH" },
  { rollNo: "2310013155047", name: "HIMANSHU BHASKAR" },
  { rollNo: "2310013155048", name: "IRSHAD AHMAD" },
  { rollNo: "2310013155049", name: "JAGRITI YADAV" },
  { rollNo: "2310013155050", name: "JANHVI NARAYAN" },
  { rollNo: "2310013155051", name: "JASMINE SINGH" },
  { rollNo: "2310013155052", name: "JATIN PANDEY" },
  { rollNo: "2310013155053", name: "KHUSHI RAWAT" },
  { rollNo: "2310013155054", name: "KRISHNA CHAND PANDEY" },
  { rollNo: "2310013155055", name: "KUSHAGRA SINGH" },
  { rollNo: "2310013155056", name: "KUWAR PRINCE KUMAR" },
  { rollNo: "2310013155057", name: "LAVANYA" },
  { rollNo: "2310013155058", name: "LAVKUSH PRASAD" },
  { rollNo: "2310013155059", name: "MAHENDRA MISHRA" },
  { rollNo: "2310013155060", name: "MAYANK KUMAR SINGH" },
  { rollNo: "2310013155061", name: "MOHAMMAD MAAZ KHAN" },
  { rollNo: "2310013155062", name: "MOHD AYAN" },
  { rollNo: "2310013155063", name: "MOHD UBAID" },
  { rollNo: "2310013155064", name: "NAINSI KUSHWAHA" },
  { rollNo: "2310013155065", name: "NAITIK KATIYAR" },
  { rollNo: "2310013155068", name: "NIHAL GUPTA" },
  { rollNo: "2310013155069", name: "NILMONI PANGAS" },
  { rollNo: "2310013155070", name: "PRAGATI DIKSHIT" },
  { rollNo: "2310013155071", name: "PRAKHAR SINGH" },
  { rollNo: "2310013155072", name: "PRANAV PANDEY" },
  { rollNo: "2310013155073", name: "PRANAV SINGH" },
  { rollNo: "2310013155074", name: "PRASHANT" },
  { rollNo: "2310013155075", name: "PRASHANT KUMAR" },
  { rollNo: "2310013155076", name: "PRAVEK" },
  { rollNo: "2310013155077", name: "PRIYA KUMARI" },
  { rollNo: "2310013155078", name: "PRIYANSHU MISHRA" },
  { rollNo: "2310013155079", name: "PRIYANSHU TIWARI" },
  { rollNo: "2310013155080", name: "RAHUL KUMAR" },
  { rollNo: "2310013155081", name: "RAHUL TIWARI" },
  { rollNo: "2310013155082", name: "REMMY SINGH" },
  { rollNo: "2310013155083", name: "RISHI KUMAR SRIVASTAV" },
  { rollNo: "2310013155084", name: "RIYA SHARMA" },
  { rollNo: "2310013155085", name: "ROHIT VERMA" },
  { rollNo: "2310013155086", name: "ROLI KUMARI" },
  { rollNo: "2310013155087", name: "RUBY SHAH SOLANKI" },
  { rollNo: "2310013155088", name: "SACHIN PAL" },
  { rollNo: "2310013155089", name: "SAKSHAM MISHRA" },
  { rollNo: "2310013155090", name: "SAMARTH MAURYA" },
  { rollNo: "2310013155091", name: "SAMEER ANSARI" },
  { rollNo: "2310013155092", name: "SANTOSH KUMAR MAURYA" },
  { rollNo: "2310013155093", name: "SARANSH KUMAR" },
  { rollNo: "2310013155094", name: "SARTHAK NAG" },
  { rollNo: "2310013155095", name: "SAUMYA SINGH" },
  { rollNo: "2310013155096", name: "SAURABH RAUNIYAR" },
  { rollNo: "2310013155097", name: "SEJAL MAURYA" },
  { rollNo: "2310013155098", name: "SEMMY SINGH" },
  { rollNo: "2310013155099", name: "SHAGUN AWASTHI" },
  { rollNo: "2310013155100", name: "SHAKTI ISHAN" },
  { rollNo: "2310013155101", name: "SHASHANK SINGH" },
  { rollNo: "2310013155102", name: "SHAURYA TRIPATHI" },
  { rollNo: "2310013155103", name: "SHIVAM GUPTA" },
  { rollNo: "2310013155104", name: "SHIVANAND" },
  { rollNo: "2310013155105", name: "SHIVANK SINGH" },
  { rollNo: "2310013155107", name: "SHUAIB ASHRAF" },
  { rollNo: "2310013155108", name: "SHUBHAM KUMAR GAUTAM" },
  { rollNo: "2310013155109", name: "SHUBHI SINGH" },
  { rollNo: "2310013155110", name: "SIDDHARTH TEWARI" },
  { rollNo: "2310013155111", name: "SNEHA SINGH" },
  { rollNo: "2310013155112", name: "SOMIL SRIVASTAVA" },
  { rollNo: "2310013155113", name: "SPARSH MISHRA" },
  { rollNo: "2310013155114", name: "SUJAL KUMAR" },
  { rollNo: "2310013155115", name: "SURBHI SHAW" },
  { rollNo: "2310013155116", name: "TANUSHIKHA" },
  { rollNo: "2310013155117", name: "TRISHYA GUPTA" },
  { rollNo: "2310013155118", name: "UTKARSH DIXIT" },
  { rollNo: "2310013155119", name: "VIKAS KUMAR" },
  { rollNo: "2310013155120", name: "VIRAT VITTHAL AWASTHI" },
  { rollNo: "2310013155121", name: "VIVEK KUMAR" },
  { rollNo: "2310013155122", name: "VIVEK MISHRA" },
  { rollNo: "2310013155123", name: "VIVEK KUMAR YADAV" },
  { rollNo: "2310013155124", name: "YASH KASHYAP" },
  { rollNo: "2310013155125", name: "YASH KUMAR" },
  { rollNo: "2310013155126", name: "YASH VERMA" },
  { rollNo: "2310013155127", name: "YASH RAJ SRIVASTAVA" },
  { rollNo: "2310013155128", name: "YASH JAIN" },
  { rollNo: "2410013155301", name: "ADITYA KUSHWAHA" },
  { rollNo: "2410013155302", name: "AYUSH SRIVASTAVA" },
  { rollNo: "2410013155303", name: "MOHIT KUMAR" },
  { rollNo: "2410013155304", name: "MOHIT KUMAR" },
  { rollNo: "2410013155305", name: "SOMESH PANDEY" },
  { rollNo: "2410013155306", name: "ANANYA GUPTA" },
  { rollNo: "2410013155307", name: "SHIVA SINGH" },
  { rollNo: "2410013155308", name: "SAURABH KUMAR RANJAN" },
  { rollNo: "2410013155309", name: "ANANYA PATEL" },
  { rollNo: "2410013155311", name: "ANKIT YADAV" },
  { rollNo: "2410013155312", name: "ABHISHEK YADAV" },
  { rollNo: "2410013155314", name: "POORVI BAJPAI" },
  { rollNo: "2410013155315", name: "HARSHIT PANDEY" },
  { rollNo: "2410013155316", name: "HIMALAYA TIWARI" },
];

// Helper function to get batch info
function getBatchInfo(rollNo) {
  const year = rollNo.substring(0, 2);
  if (year === "22") {
    return { batch: "2022-27", type: "Year Back", emoji: "📚" };
  } else if (year === "23") {
    return { batch: "2023-27", type: "Regular", emoji: "🎓" };
  } else if (year === "24") {
    return { batch: "2024-27", type: "Lateral Entry", emoji: "🚀" };
  }
  return { batch: "Unknown", type: "Unknown", emoji: "📖" };
}

// Helper function to format name properly (Title Case)
function formatName(name) {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}

async function seedStudents() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);
    const AllowedStudents = db.collection("AllowedStudents");

    // Check if already seeded
    const existingCount = await AllowedStudents.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️ AllowedStudents already has ${existingCount} records.`);
      console.log("Do you want to reset and re-seed? (This will delete existing data)");
      console.log("To reset, run: node seedStudents.js --reset");

      if (process.argv.includes("--reset")) {
        await AllowedStudents.deleteMany({});
        console.log("🗑️ Cleared existing data");
      } else {
        console.log("Exiting without changes.");
        return;
      }
    }

    // Prepare documents
    const now = new Date();
    const documents = studentsData.map((student) => {
      const batchInfo = getBatchInfo(student.rollNo);
      return {
        rollNo: student.rollNo.trim(),
        name: formatName(student.name),
        originalName: student.name.trim(), // Keep original for reference
        batch: batchInfo.batch,
        batchType: batchInfo.type,
        isRegistered: false,
        registeredAt: null,
        registeredEmail: null,
        createdAt: now,
      };
    });

    // Insert all students
    const result = await AllowedStudents.insertMany(documents);
    console.log(`✅ Successfully inserted ${result.insertedCount} students!`);

    // Create index
    await AllowedStudents.createIndex({ rollNo: 1 }, { unique: true });
    console.log("✅ Created unique index on rollNo");

    // Summary
    const batchSummary = {
      "2022-27 (Year Back)": documents.filter((d) => d.batch === "2022-27").length,
      "2023-27 (Regular)": documents.filter((d) => d.batch === "2023-27").length,
      "2024-27 (Lateral)": documents.filter((d) => d.batch === "2024-27").length,
    };

    console.log("\n📊 Batch Summary:");
    Object.entries(batchSummary).forEach(([batch, count]) => {
      console.log(`   ${batch}: ${count} students`);
    });

    console.log("\n🎉 Seeding complete! Students can now register.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedStudents();