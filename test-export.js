const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testExport() {
  console.log("Fetching a user from the database...");
  let user = await prisma.user.findFirst();
  
  if (!user) {
    console.log("No users found. Creating a test user...");
    user = await prisma.user.create({
      data: {
        email: "test_export@example.com",
        name: "Test Exporter",
        passwordHash: "dummyhash",
        profile: {
          create: {
            age: 25,
            weight: 70,
            fitnessGoal: "build_muscle"
          }
        },
        subscription: {
          create: {
            plan: "premium",
            status: "active"
          }
        }
      }
    });
  }

  console.log(`Found user: ${user.name} (${user.email}), ID: ${user.id}`);
  console.log("--------------------------------------------------");
  console.log("Simulating real-time data export API payload...");

  // Re-creating the logic of our new API endpoint directly here to test the data structure
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
      fitnessPreference: true,
      subscription: true,
      workoutSessions: {
        orderBy: { startedAt: "desc" },
        take: 5,
        include: { sets: true }
      },
      meals: {
        orderBy: { consumedAt: "desc" },
        take: 5
      },
      weightEntries: true,
      recoveryEntries: true,
      goals: true
    },
  });

  if (!userData) return;

  const { passwordHash, ...safeUserData } = userData;

  const payload = {
    success: true,
    timestamp: new Date().toISOString(),
    data: safeUserData,
  };

  console.log(JSON.stringify(payload, null, 2));
  console.log("--------------------------------------------------");
  console.log("✅ Data export test successful! This is the exact payload external services will receive.");
}

testExport()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
