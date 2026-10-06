const fs = require('fs');
const readline = require('readline');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function importDataset() {
  const datasetPath = "C:/Users/priya/Downloads/food_nutrition_dataset (1)/food_nutrition_dataset/data/test.jsonl";
  
  if (!fs.existsSync(datasetPath)) {
    console.error(`Dataset not found at path: ${datasetPath}`);
    return;
  }

  console.log("Found custom dataset! Starting import...");

  const fileStream = fs.createReadStream(datasetPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    
    try {
      // Assuming JSONL format has fields like: name, calories, protein, carbs, fat, etc.
      const row = JSON.parse(line);
      const name = row.name || row.Food_Name || row.food || "Unknown Food";
      
      const canonicalName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const calories = parseFloat(row.calories || row.Calories || 0);
      const protein = parseFloat(row.protein || row.Protein || 0);
      const carbs = parseFloat(row.carbs || row.Carbs || row.Carbohydrates || 0);
      const fat = parseFloat(row.fat || row.Fat || 0);

      await prisma.food.upsert({
        where: { canonicalName },
        update: {},
        create: {
          name: name,
          canonicalName,
          category: row.category || row.Category || "Custom",
          source: "custom_dataset",
          defaultServingSize: 100,
          defaultServingUnit: "g",
          nutrition: {
            create: {
              servingBasis: 100,
              calories,
              protein,
              carbs,
              fat,
              fiber: parseFloat(row.fiber || row.Fiber || 0)
            }
          }
        }
      });
      
      count++;
      if (count % 100 === 0) console.log(`Imported ${count} foods...`);
      
    } catch (err) {
      console.warn("Skipped a line due to parsing error:", err.message);
    }
  }

  console.log(`✅ Successfully imported ${count} custom foods into the local database!`);
}

importDataset()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
