"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  Dumbbell,
  Target,
  Sparkles,
  HeartPulse,
  Flame,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export default function OnboardingPage() {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [age, setAge] = useState(26);
  const [gender, setGender] = useState("male");
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(72);
  const [targetWeightKg, setTargetWeightKg] = useState(70);
  const [activityLevel, setActivityLevel] = useState("moderately_active");

  const [fitnessGoal, setFitnessGoal] = useState("build_muscle");
  const [experience, setExperience] = useState("intermediate");
  const [trainingLocation, setTrainingLocation] = useState("gym");
  const [equipment, setEquipment] = useState<string[]>([
    "Barbell",
    "Dumbbells",
    "Bench",
    "Machines",
  ]);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [sessionDurationMin, setSessionDurationMin] = useState(60);
  const [dietaryPreference, setDietaryPreference] = useState("non_veg");
  const [allergies, setAllergies] = useState("");

  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleFinish = async () => {
    setIsLoading(true);

    try {
      const payload = {
        age: Number(age),
        gender,
        height: Number(heightCm),
        weight: Number(weightKg),
        targetWeight: Number(targetWeightKg) || Number(weightKg),
        activityLevel,
        fitnessGoal,
        experience,
        trainingLocation,
        equipment: equipment.length > 0 ? equipment : ["Bodyweight"],
        daysPerWeek: Number(daysPerWeek),
        sessionDurationMin: Number(sessionDurationMin),
        dietaryPreference,
        allergies,
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toastError("Onboarding Error", data.error || "Failed to save profile");
        setIsLoading(false);
        return;
      }

      toastSuccess(
        "Onboarding Complete!",
        `Targets calculated: ${data.targets.calorieTarget} kcal, ${data.targets.proteinTarget}g protein daily.`
      );
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toastError("Network Error", "Could not complete onboarding");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-white flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[160px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[1px] shadow-glow">
            <div className="w-full h-full bg-[#090A0F] rounded-[10px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            FITTRACK <span className="text-emerald-400">AI</span>
          </span>
        </div>
        <Badge variant="emerald">STEP {step} OF 6</Badge>
      </div>

      {/* Main Content Box */}
      <div className="max-w-2xl mx-auto w-full my-auto">
        {/* Progress Bar */}
        <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        <GlassCard intensity="high" className="p-6 sm:p-10 space-y-6">
          {/* STEP 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-white">Your Biometrics</h2>
                <p className="text-xs text-neutral-400">
                  We use your biometrics to calibrate your BMR, energy expenditure, and baseline macro targets.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Age (Years)"
                  type="number"
                  min="12"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                />

                <Select
                  label="Biological Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  options={[
                    { label: "Male", value: "male" },
                    { label: "Female", value: "female" },
                    { label: "Other", value: "other" },
                  ]}
                />

                <Input
                  label="Height (cm)"
                  type="number"
                  min="50"
                  max="250"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                />

                <Input
                  label="Current Weight (kg)"
                  type="number"
                  step="0.5"
                  min="30"
                  max="300"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                />

                <Input
                  label="Target Weight (kg)"
                  type="number"
                  step="0.5"
                  min="30"
                  max="300"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                />

                <Select
                  label="Daily Activity Level"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  options={[
                    { label: "Sedentary (desk job)", value: "sedentary" },
                    { label: "Lightly Active (1-3 days activity)", value: "lightly_active" },
                    { label: "Moderately Active (3-5 days activity)", value: "moderately_active" },
                    { label: "Very Active (6-7 days intense)", value: "very_active" },
                  ]}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Fitness Goal */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-white">Primary Goal</h2>
                <p className="text-xs text-neutral-400">
                  Select your core fitness focus to shape your training split and calorie balance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { id: "lose_weight", label: "Lose Weight & Fat", icon: Flame, desc: "Deficit calories with muscle-sparing high protein" },
                  { id: "build_muscle", label: "Build Muscle (Hypertrophy)", icon: Dumbbell, desc: "Calorie surplus focused on lean hypertrophy" },
                  { id: "gain_strength", label: "Gain Pure Strength", icon: Award, desc: "Compound movements with heavy progressive overload" },
                  { id: "improve_endurance", label: "Improve Endurance", icon: HeartPulse, desc: "Cardiovascular priming and muscular stamina" },
                  { id: "body_recomp", label: "Body Recomposition", icon: Sparkles, desc: "Simultaneous fat loss and muscle gain" },
                  { id: "maintain", label: "Maintain Fitness", icon: Target, desc: "Energy balance and metabolic health stability" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = fitnessGoal === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setFitnessGoal(item.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-glow"
                          : "bg-white/[0.03] border-white/[0.08] text-neutral-300 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? "text-emerald-400" : "text-neutral-400"}`} />
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div className="font-bold text-sm text-white">{item.label}</div>
                      <p className="text-[11px] text-neutral-400 mt-1">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Experience */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-white">Lifting Experience</h2>
                <p className="text-xs text-neutral-400">
                  Ensures workout volume and complexity match your training age.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "beginner",
                    title: "Beginner",
                    desc: "New to structured lifting or less than 1 year of consistent training. Focus on movement patterns and form.",
                  },
                  {
                    id: "intermediate",
                    title: "Intermediate",
                    desc: "1 to 3 years of consistent barbell/dumbbell training. Familiar with progressive overload and main lifts.",
                  },
                  {
                    id: "advanced",
                    title: "Advanced",
                    desc: "3+ years of dedicated strength or bodybuilding training. High work capacity and periodization needs.",
                  },
                ].map((exp) => {
                  const isSelected = experience === exp.id;
                  return (
                    <div
                      key={exp.id}
                      onClick={() => setExperience(exp.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-glow"
                          : "bg-white/[0.03] border-white/[0.08] text-neutral-300 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-sm text-white">{exp.title}</h4>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xs text-neutral-400">{exp.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Training Setup & Equipment */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-white">Training Location & Gear</h2>
                <p className="text-xs text-neutral-400">
                  Select your primary training environment and all available equipment.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Location
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {["Gym", "Home", "Outdoor", "Mixed"].map((loc) => {
                    const isSelected = trainingLocation.toLowerCase() === loc.toLowerCase();
                    return (
                      <div
                        key={loc}
                        onClick={() => setTrainingLocation(loc.toLowerCase())}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                            : "bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white"
                        }`}
                      >
                        {loc}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Available Equipment (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    "Barbell",
                    "Dumbbells",
                    "Bench",
                    "Machines",
                    "Cable Machine",
                    "Bodyweight",
                    "Resistance Bands",
                    "Pull-up Bar",
                    "Kettlebell",
                  ].map((eq) => {
                    const isSelected = equipment.includes(eq);
                    return (
                      <div
                        key={eq}
                        onClick={() => toggleEquipment(eq)}
                        className={`p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                            : "bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white"
                        }`}
                      >
                        <span>{eq}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Schedule */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-white">Your Training Schedule</h2>
                <p className="text-xs text-neutral-400">
                  How many days per week and how long can you commit to each workout session?
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-neutral-400 uppercase tracking-wider">Workout Frequency</span>
                    <span className="text-emerald-400">{daysPerWeek} Days / Week</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                    <span>1 Day</span>
                    <span>4 Days (Balanced)</span>
                    <span>7 Days</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Session Duration
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[20, 30, 45, 60, 90].map((mins) => {
                      const isSelected = sessionDurationMin === mins;
                      return (
                        <div
                          key={mins}
                          onClick={() => setSessionDurationMin(mins)}
                          className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                              : "bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white"
                          }`}
                        >
                          {mins} min
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Nutrition Preferences */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-white">Dietary Foundation</h2>
                <p className="text-xs text-neutral-400">
                  Tailors meal suggestions and food database recommendations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "vegetarian", label: "Vegetarian", desc: "Plant foods & dairy" },
                  { id: "vegan", label: "Vegan", desc: "100% plant-based" },
                  { id: "eggetarian", label: "Eggetarian", desc: "Vegetarian + eggs" },
                  { id: "non_veg", label: "Non-Vegetarian", desc: "Poultry, fish, meat" },
                ].map((diet) => {
                  const isSelected = dietaryPreference === diet.id;
                  return (
                    <div
                      key={diet.id}
                      onClick={() => setDietaryPreference(diet.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-glow"
                          : "bg-white/[0.03] border-white/[0.08] text-neutral-300 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="font-bold text-sm text-white mb-0.5">{diet.label}</div>
                      <p className="text-[11px] text-neutral-400">{diet.desc}</p>
                    </div>
                  );
                })}
              </div>

              <Input
                label="Food Allergies or Dislikes (Optional)"
                placeholder="e.g. Peanuts, lactose, gluten..."
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>
          )}

          {/* Step Actions */}
          <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <Button
                variant="primary"
                onClick={() => setStep(step + 1)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleFinish}
                isLoading={isLoading}
                icon={<Sparkles className="w-4 h-4" />}
              >
                Launch Dashboard
              </Button>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="text-center text-xs text-neutral-600 mt-6">
        FITTRACK AI • Scientific Energy Balance & Hypertrophy System
      </div>
    </div>
  );
}
