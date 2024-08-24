import { Button } from '@mantine/core';

export const Questions = (questions) => {
  console.log(questions);
  return (
    <ul className="px-6">
      {questions.questions.map((question, index) => (
        <li key={index} className="flex px-4">
          <span className="flex gap-2 flex-1">
            <input
              type="checkbox"
              name="check"
              className="peer cursor-pointer accent-slate-300 "
            />
            <label
              htmlFor=""
              className="peer-checked:line-through peer-checked:text-slate-500 cursor-pointer"
            >
              {question.title}
            </label>
          </span>
          <Button>X</Button>
        </li>
      ))}
    </ul>
  );
};
