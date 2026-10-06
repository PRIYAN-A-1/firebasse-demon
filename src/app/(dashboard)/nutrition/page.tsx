"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Camera,
  Plus,
  Trash2,
  Flame,
  Zap,
  Apple,
  Search,
  Check,
  ChevronRight,
  Mic,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar, ProgressRing } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/MetricCard";
import { useToast } from "@/components/ui/Toast";

export default function NutritionPage() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<any[]>([]);
  const [dayTotals, setDayTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  });

  // Manual Add Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [customFoodName, setCustomFoodName] = useState("");
  const [customQuantity, setCustomQuantity] = useState(100);
  const [customCalories, setCustomCalories] = useState(150);
  const [customProtein, setCustomProtein] = useState(10);
  const [customCarbs, setCustomCarbs] = useState(20);
  const [customFat, setCustomFat] = useState(5);
  const [customFiber, setCustomFiber] = useState(2);
  const [isSubmittingMeal, setIsSubmittingMeal] = useState(false);

  // Targets (default or from preference)
  const calorieTarget = 2200;
  const proteinTarget = 130;
  const carbsTarget = 250;
  const fatTarget = 70;
  const fiberTarget = 30;

  const fetchMeals = async () => {
    try {
      const res = await fetch("/api/meals");
      if (res.ok) {
        const data = await res.json();
        setMeals(data.meals || []);
        if (data.dayTotals) {
          setDayTotals(data.dayTotals);
        }
      }
    } catch (err) {
      console.error("Meals fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleSearchFoods = async (q: string) => {
    setFoodSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.foods || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectSearchedFood = (food: any) => {
    const nut = food.nutrition || { calories: 150, protein: 5, carbs: 20, fat: 5, fiber: 2 };
    setCustomFoodName(food.name);
    setCustomQuantity(food.defaultServingSize || 100);
    setCustomCalories(nut.calories);
    setCustomProtein(nut.protein);
    setCustomCarbs(nut.carbs);
    setCustomFat(nut.fat);
    setCustomFiber(nut.fiber || 0);
    setSearchResults([]);
  };

  const handleAddMeal = async () => {
    if (!customFoodName.trim()) {
      toastError("Error", "Please enter food name");
      return;
    }

    setIsSubmittingMeal(true);
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType: selectedMealType,
          items: [
            {
              foodName: customFoodName,
              quantity: Number(customQuantity),
              unit: "g",
              calories: Number(customCalories),
              protein: Number(customProtein),
              carbs: Number(customCarbs),
              fat: Number(customFat),
              fiber: Number(customFiber),
            },
          ],
        }),
      });

      if (res.ok) {
        toastSuccess("Meal Logged", `Added ${customFoodName} to ${selectedMealType.toUpperCase()}`);
        setAddModalOpen(false);
        setCustomFoodName("");
        fetchMeals();
      } else {
        toastError("Error", "Failed to save meal");
      }
    } catch (err) {
      toastError("Error", "Network error");
    } finally {
      setIsSubmittingMeal(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const res = await fetch(`/api/meals/${mealId}`, { method: "DELETE" });
      if (res.ok) {
        toastSuccess("Meal Deleted", "Recalculated daily calorie and macro totals.");
        fetchMeals();
      } else {
        toastError("Error", "Could not delete meal");
      }
    } catch (err) {
      toastError("Error", "Network error");
    }
  };

  const remainingCalories = Math.max(0, calorieTarget - dayTotals.calories);

  const mealTypes = [
    { id: "breakfast", label: "Breakfast" },
    { id: "lunch", label: "Lunch" },
    { id: "dinner", label: "Dinner" },
    { id: "snack", label: "Snacks" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="warning" size="sm">NUTRITION INTELLIGENCE</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Nutrition & Macro Dashboard
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time calorie accounting, food recognition, and Indian & global macro tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="glass"
            onClick={() => {
              setSelectedMealType("breakfast");
              setAddModalOpen(true);
            }}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Manual Add
          </Button>
          <Link href="/nutrition/scan">
            <Button size="sm" variant="primary" icon={<Camera className="w-3.5 h-3.5" />}>
              Scan Meal Plate
            </Button>
          </Link>
        </div>
      </div>

      {/* ================= CALORIES & MACRO PROGRESS (Section 32, 33, 34) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Calorie Card (Section 33) */}
        <div className="lg:col-span-5">
          <GlassCard intensity="high" className="p-6 h-full flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Daily Energy Balance
              </span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>

            <div className="flex items-center justify-around py-2">
              <ProgressRing
                value={dayTotals.calories}
                max={calorieTarget}
                size={130}
                strokeWidth={10}
                color="amber"
              >
                <span className="text-2xl font-black text-white">{dayTotals.calories}</span>
                <span className="text-[10px] text-neutral-400 uppercase font-bold">KCAL EATEN</span>
              </ProgressRing>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-neutral-400 text-[11px]">Calorie Target</div>
                  <div className="text-base font-bold text-white">{calorieTarget} kcal</div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[11px]">Remaining</div>
                  <div className="text-base font-bold text-emerald-400">{remainingCalories} kcal</div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 border-t border-white/[0.06] pt-2">
              Calorie adherence is optimal for preserving lean mass while maintaining fat oxidation.
            </p>
          </GlassCard>
        </div>

        {/* Macros Breakdown (Section 34) */}
        <div className="lg:col-span-7">
          <GlassCard intensity="high" className="p-6 h-full flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Macronutrient Distribution
              </span>
              <Badge variant="emerald" size="sm">SCALED METRICS</Badge>
            </div>

            <div className="space-y-3.5">
              <ProgressBar
                label="Protein"
                sublabel="Muscle Synthesis"
                value={dayTotals.protein}
                max={proteinTarget}
                unit="g"
                color="emerald"
              />

              <ProgressBar
                label="Carbohydrates"
                sublabel="Glycogen Energy"
                value={dayTotals.carbs}
                max={carbsTarget}
                unit="g"
                color="cyan"
              />

              <ProgressBar
                label="Fats"
                sublabel="Hormone Support"
                value={dayTotals.fat}
                max={fatTarget}
                unit="g"
                color="amber"
              />

              <ProgressBar
                label="Dietary Fiber"
                sublabel="Gut Health"
                value={dayTotals.fiber}
                max={fiberTarget}
                unit="g"
                color="rose"
              />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ================= MEAL SECTIONS: Breakfast, Lunch, Dinner, Snacks (Section 35) ================= */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white tracking-tight">Today&apos;s Meals</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealTypes.map((type) => {
            const typeMeals = meals.filter(
              (m) => m.mealType.toLowerCase() === type.id.toLowerCase()
            );

            const typeCalories = typeMeals.reduce((acc, m) => acc + m.totalCalories, 0);
            const typeProtein = typeMeals.reduce((acc, m) => acc + m.totalProtein, 0);

            return (
              <GlassCard key={type.id} intensity="high" className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div>
                    <h3 className="text-base font-extrabold text-white">{type.label}</h3>
                    <p className="text-xs text-neutral-400">
                      {typeCalories} kcal • {typeProtein}g protein
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="glass"
                      className="px-2.5 py-1 text-xs"
                      onClick={() => {
                        setSelectedMealType(type.id);
                        setAddModalOpen(true);
                      }}
                      icon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add
                    </Button>
                    <Link href={`/nutrition/scan?mealType=${type.id}`}>
                      <Button size="sm" variant="glass" className="px-2.5 py-1 text-xs" icon={<Camera className="w-3.5 h-3.5 text-emerald-400" />}>
                        Scan
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Items in this meal type */}
                {typeMeals.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-3 text-center italic">
                    No food logged for {type.label.toLowerCase()} yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {typeMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2"
                      >
                        {meal.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-white">{item.foodName}</span>
                              <span className="text-neutral-500 ml-2">
                                ({item.quantity} {item.unit})
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-emerald-400 font-bold">{item.calories} kcal</span>
                              <span className="text-neutral-400">{item.protein}g P</span>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="text-neutral-500 hover:text-rose-400 p-1 text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Manual Food Add Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={`Add Food to ${selectedMealType.toUpperCase()}`}
        description="Search from the food database or enter custom nutrition per serving."
      >
        <div className="space-y-4">
          <Select
            label="Meal Type"
            value={selectedMealType}
            onChange={(e) => setSelectedMealType(e.target.value)}
            options={[
              { label: "Breakfast", value: "breakfast" },
              { label: "Lunch", value: "lunch" },
              { label: "Dinner", value: "dinner" },
              { label: "Snack", value: "snack" },
            ]}
          />

          {/* Quick Database Search */}
          <div className="space-y-1 relative">
            <Input
              label="Search Food Database"
              placeholder="e.g. Idli, Dosa, Chicken Biryani, Boiled Egg, Oats..."
              value={foodSearchQuery}
              onChange={(e) => handleSearchFoods(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl bg-[#141824] border border-white/10 shadow-2xl p-1.5 space-y-1">
                {searchResults.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => selectSearchedFood(f)}
                    className="p-2 rounded-lg hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <strong className="text-white">{f.name}</strong>
                      <span className="text-neutral-400 text-[10px] ml-2">({f.category})</span>
                    </div>
                    <span className="text-emerald-400 font-bold">
                      {f.nutrition?.calories || 150} kcal / 100g
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Food Name"
            placeholder="e.g. Scrambled Eggs with Toast"
            value={customFoodName}
            onChange={(e) => setCustomFoodName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity (g or pieces)"
              type="number"
              value={customQuantity}
              onChange={(e) => setCustomQuantity(Number(e.target.value))}
            />
            <Input
              label="Calories (kcal)"
              type="number"
              value={customCalories}
              onChange={(e) => setCustomCalories(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Input
              label="Protein (g)"
              type="number"
              value={customProtein}
              onChange={(e) => setCustomProtein(Number(e.target.value))}
            />
            <Input
              label="Carbs (g)"
              type="number"
              value={customCarbs}
              onChange={(e) => setCustomCarbs(Number(e.target.value))}
            />
            <Input
              label="Fat (g)"
              type="number"
              value={customFat}
              onChange={(e) => setCustomFat(Number(e.target.value))}
            />
            <Input
              label="Fiber (g)"
              type="number"
              value={customFiber}
              onChange={(e) => setCustomFiber(Number(e.target.value))}
            />
          </div>

          <Button
            variant="primary"
            className="w-full mt-4"
            isLoading={isSubmittingMeal}
            onClick={handleAddMeal}
            icon={<Check className="w-4 h-4" />}
          >
            Confirm & Save Meal
          </Button>
        </div>
      </Modal>
    </div>
  );
}
