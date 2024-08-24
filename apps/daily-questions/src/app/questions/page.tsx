import { Button, List } from '@mantine/core';
import { Questions } from '../../components/Questions/Questions';
import prisma from '../../lib/prisma';

export default async function Question() {
  const questions = await prisma.question.findMany();

  return (
    <main className="flex min-h-screen justify-center items-center bg-slate-50">
      <div className="bg-slate-300 rounded-3xl py-6 h-[400px] w-[450px] flex flex-col text-slate-800">
        <h1 className="text-3xl text-center">My Questions</h1>
        <Button component="a" href="/questions/create">
          Add question
        </Button>
        <Questions questions={questions} />
      </div>
    </main>
  );
}
