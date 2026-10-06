import { prisma } from "../db/prisma";

export async function askAICoach(params: {
  userId: string;
  userMessage: string;
}): Promise<string> {
  const { userId, userMessage } = params;

  // Retrieve user context securely
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      fitnessPreference: true,
      workoutSessions: {
        where: {
          startedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        include: { sets: true },
        orderBy: { startedAt: "desc" },
      },
      meals: {
        where: {
          consumedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      recoveryEntries: {
        orderBy: { loggedAt: "desc" },
        take: 1,
      },
      weightEntries: {
        orderBy: { loggedAt: "desc" },
        take: 2,
      },
    },
  });

  if (!user) {
    return "User account could not be found.";
  }

  const profile = user.profile;
  const prefs = user.fitnessPreference;
  const recentWorkouts = user.workoutSessions;
  const recentMeals = user.meals;
  const latestRecovery = user.recoveryEntries[0];
  const latestWeight = user.weightEntries[0];

  const totalWorkoutCount = recentWorkouts.length;
  const completedWorkouts = recentWorkouts.filter((w) => w.status === "completed").length;
  const totalVolume = recentWorkouts.reduce((acc, w) => acc + (w.totalVolumeKg || 0), 0);

  // Compute 7-day average calories and protein
  const avgCalories =
    recentMeals.length > 0
      ? Math.round(recentMeals.reduce((acc, m) => acc + m.totalCalories, 0) / Math.max(1, new Set(recentMeals.map((m) => m.consumedAt.toDateString())).size))
      : 0;
  const avgProtein =
    recentMeals.length > 0
      ? Math.round(recentMeals.reduce((acc, m) => acc + m.totalProtein, 0) / Math.max(1, new Set(recentMeals.map((m) => m.consumedAt.toDateString())).size))
      : 0;

  // Build context summary string
  const contextSummary = `
User Context:
- Name: ${user.name}
- Fitness Goal: ${profile?.fitnessGoal || "General fitness"}
- Current Weight: ${latestWeight?.weightKg || profile?.weight || "Not recorded"} kg
- Past 7 Days Workouts: ${completedWorkouts} completed sessions (${Math.round(totalVolume)} kg total volume)
- Calorie Intake (7-day avg): ${avgCalories} kcal (Target: ${prefs?.calorieTarget || 2200} kcal)
- Protein Intake (7-day avg): ${avgProtein} g (Target: ${prefs?.proteinTarget || 130} g)
- Recovery Readiness: ${latestRecovery ? `${latestRecovery.calculatedScore}/100 (Sleep: ${latestRecovery.sleepHours}h)` : "No recovery logged today"}
`;

  // Check safety triggers for medical/injury diagnosis
  const lowerMsg = userMessage.toLowerCase();
  const medicalKeywords = ["sharp pain", "injured", "hernia", "tearing", "chest pain", "swollen joint", "dislocated", "dizzy pass out"];
  for (const kw of medicalKeywords) {
    if (lowerMsg.includes(kw)) {
      return `⚠️ **Health & Safety Notice**: I detected that you mentioned "${kw}". As an AI fitness coach, I am not a medical doctor and cannot diagnose injuries or physical trauma. Please pause your training session immediately, avoid loading the affected joint or muscle, and consult a qualified physician or sports physiotherapist. Your long-term physical health is paramount.`;
    }
  }

  // If external AI_API_KEY is available, call Gemini
  const apiKey = process.env.AI_API_KEY;
  if (apiKey && apiKey.trim() !== "") {
    try {
      const prompt = `You are FITTRACK AI's elite personal fitness and nutrition coach.
Tone: Motivating, science-backed, data-driven, clear, concise, athletic.
Guidelines:
- Reference the user's logged metrics directly when answering.
- If data is sparse or missing, explicitly state "I don't have enough logged data yet" and provide actionable recommendations.
- Never diagnose injuries or offer medical advice.

${contextSummary}

User Question: "${userMessage}"`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      console.warn("AI API error, using smart contextual engine:", e);
    }
  }

  // Intelligent Contextual Response Engine
  if (lowerMsg.includes("train today") || lowerMsg.includes("what should i workout") || lowerMsg.includes("workout today")) {
    if (latestRecovery && latestRecovery.calculatedScore < 50) {
      return `Based on your recovery score of **${latestRecovery.calculatedScore}/100** (sleep: ${latestRecovery.sleepHours}h), your neuromuscular system is in high fatigue. I recommend an active recovery day: 20 minutes of light mobility, foam rolling, and a brisk walk rather than heavy compound lifting.`;
    }

    const lastWorkout = recentWorkouts[0];
    if (lastWorkout && lastWorkout.title.toLowerCase().includes("push")) {
      return `Looking at your logs, your last session was **${lastWorkout.title}**. To maintain balanced muscular recovery and volume distribution, today should be **Pull Day** (focusing on Lats, Upper Back, and Biceps) or **Legs Day**. Aim for 4 compound exercises and 60 minutes duration.`;
    }

    return `Based on your goal of **${profile?.fitnessGoal?.replace("_", " ") || "building strength"}** and your current readiness score (**${latestRecovery?.calculatedScore || 82}/100**), today is a great day for an upper body compound push workout (Bench Press, Incline Dumbbell Press, Shoulder Press) with 3-4 sets per exercise. Remember to warm up your rotator cuffs first!`;
  }

  if (lowerMsg.includes("last week") || lowerMsg.includes("analyze my") || lowerMsg.includes("review")) {
    if (completedWorkouts === 0 && avgCalories === 0) {
      return `I don't have enough logged data yet for the past week! To get deep analytics, start by logging your workout sets in **Workouts**, snapping photos of your meals in **Food Scanner**, and logging your water intake. Once you log 2-3 days, I'll generate a complete performance audit.`;
    }

    return `Here is your 7-Day Performance Breakdown:
- **Workouts**: You completed **${completedWorkouts} session(s)** with **${Math.round(totalVolume)} kg** total volume moved.
- **Nutrition**: You averaged **${avgCalories} kcal/day** against your target of **${prefs?.calorieTarget || 2200} kcal**, and **${avgProtein}g protein/day** (target: ${prefs?.proteinTarget || 130}g).
- **Readiness**: Average sleep is sitting around **${latestRecovery?.sleepHours || 7.2} hours**.

💡 **Coach's Key Insight**: Keep pushing your protein consistency across all meals—aim for at least 30g per meal to maximize muscle protein synthesis.`;
  }

  if (lowerMsg.includes("protein") || lowerMsg.includes("macro") || lowerMsg.includes("calories")) {
    return `Your target is **${prefs?.proteinTarget || 130}g protein** and **${prefs?.calorieTarget || 2200} kcal** daily. Over your logged meals, you're averaging **${avgProtein}g**.
To easily close the gap:
1. Include 30-40g high-quality protein per meal (e.g. 150g grilled chicken, 200g Greek yogurt, 1 scoop whey, or paneer + dal).
2. Distribute protein evenly every 3–4 hours.
3. Use the **Food Scanner** to verify portion sizes!`;
  }

  if (lowerMsg.includes("30-minute") || lowerMsg.includes("quick session") || lowerMsg.includes("build a")) {
    return `Here is a high-efficiency **30-Minute Time-Capped Hypertrophy Circuit**:
1. **Dumbbell Goblet Squat** — 3 sets x 10 reps (Rest 60s)
2. **Push-ups / Dumbbell Floor Press** — 3 sets x 12 reps (Rest 60s)
3. **Dumbbell Romanian Deadlift** — 3 sets x 10 reps (Rest 60s)
4. **Plank Hold** — 3 sets x 45 seconds (Rest 45s)

Keep rest tight to maximize metabolic conditioning and muscle stimulus within your 30-minute window!`;
  }

  return `Thanks for checking in! You're currently tracking towards your goal of **${profile?.fitnessGoal?.replace("_", " ") || "fitness"}**. You have completed **${completedWorkouts} workouts** this week with an estimated recovery readiness of **${latestRecovery?.calculatedScore || 84}/100**. Keep logging your meals, sets, and water accurately so we can dial in your progressive overload! What specific area would you like to optimize today?`;
}
