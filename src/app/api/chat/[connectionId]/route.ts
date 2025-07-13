import { NextResponse } from 'next/server';

type RouteContext = {
  params: {
    connectionId: string;
  };
};

export async function GET(request: Request, context: RouteContext) {
  const connectionId = context.params.connectionId;
  // This is a test to ensure the route signature is valid.
  // The original logic has been temporarily removed.
  return NextResponse.json({ message: `Test response for connection ${connectionId}` });
}

export async function POST(request: Request, context: RouteContext) {
    const connectionId = context.params.connectionId;
    const body = await request.json();
    // This is a test to ensure the route signature is valid.
    return NextResponse.json({ message: `Test POST response for connection ${connectionId}`, body });
}