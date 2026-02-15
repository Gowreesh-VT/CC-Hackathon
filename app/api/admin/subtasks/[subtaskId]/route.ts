import { NextResponse } from "next/server";

// PUT: Update a subtask
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ subtaskId: string }> },
) {
  const { subtaskId } = await params;
  const body = await request.json();

  return NextResponse.json({
    message: `Subtask ${subtaskId} updated`,
    updatedData: body,
  });
}

// DELETE: Remove a subtask
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ subtaskId: string }> },
) {
  const { subtaskId } = await params;

  return NextResponse.json({
    message: `Subtask ${subtaskId} deleted successfully`,
  });
}
