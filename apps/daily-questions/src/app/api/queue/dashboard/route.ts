import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { notificationQueue } from '@/lib/queue';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Create the adapter and bull board outside of the route handler
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/api/queue/dashboard');

createBullBoard({
  queues: [new BullAdapter(notificationQueue)],
  serverAdapter,
});

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.email !== 'erikcvisser@gmail.com') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Get the pathname from the request URL
  const pathname = new URL(request.url).pathname;
  const relativePath = pathname.replace('/api/queue/dashboard', '');

  try {
    // Use the serverAdapter directly
    const response = await new Promise((resolve) => {
      serverAdapter.getRouter().handle(
        {
          method: request.method,
          url: relativePath,
          headers: Object.fromEntries(request.headers.entries()),
        } as any,
        {
          setHeader: () => {},
          end: (body: string) => resolve(new NextResponse(body)),
          json: (body: any) => resolve(NextResponse.json(body)),
        } as any
      );
    });

    return response;
  } catch (error) {
    console.error('Bull Board Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
