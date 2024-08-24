import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function PATCH(
  req: Request,
  { params: { id } }: { params: { id: string } }
) {
  const { title } = await req.json();

  await prisma.question.update({
    where: {
      id: id,
    },
    data: {
      title: title,
    },
  });
  return NextResponse.json({ message: "Updated question" }, { status: 200 });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.question.delete({
    where: {
      id: id,
    },
  });
  return NextResponse.json({ message: "Deleted question" }, { status: 200 });
}
