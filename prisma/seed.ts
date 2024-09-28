import { PrismaClient, QuestionType, Category } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

async function main() {
  const categoriesMap: { [key: string]: Category } = {};

  // Read categories from CSV and ensure they exist in the database
  const libraryQuestions: {
    title: string;
    type: string;
    category: string;
    targetInt: string;
    targetBool: string;
  }[] = [];

  const csvFilePath = path.join(__dirname, 'seed/library_questions.csv');
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on(
        'data',
        (row: {
          title: string;
          type: string;
          category: string;
          targetInt: string;
          targetBool: string;
        }) => {
          libraryQuestions.push({
            title: row.title,
            type: row.type,
            category: row.category,
            targetInt: row.targetInt,
            targetBool: row.targetBool,
          });
        }
      )
      .on('end', () => {
        console.log('CSV file successfully processed');
        resolve();
      })
      .on('error', (error: Error) => {
        reject(error);
      });
  });

  // Create categories if they don't exist
  for (const q of libraryQuestions) {
    if (!categoriesMap[q.category]) {
      const category = await prisma.category.upsert({
        where: { name: q.category },
        update: {},
        create: { name: q.category },
      });
      categoriesMap[q.category] = category;
    }
  }

  // Create LibraryQuestions
  for (const q of libraryQuestions) {
    await prisma.libraryQuestion.createMany({
      data: {
        // id: q.title, // Added 'id' field
        title: q.title,
        type: q.type as QuestionType,
        categoryId: categoriesMap[q.category].id,
        targetInt: q.targetInt ? parseInt(q.targetInt.toString()) : null,
        targetBool:
          q.targetBool === 'true'
            ? true
            : q.targetBool === 'false'
            ? false
            : null,
      },
    });
  }

  console.log('Library questions seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
