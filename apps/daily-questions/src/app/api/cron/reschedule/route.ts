import { NextResponse } from 'next/server';
import { rescheduleAllNotifications } from '@/lib/actions';

export async function GET(request: Request) {
  try {
    await rescheduleAllNotifications();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reschedule notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reschedule notifications' },
      { status: 500 }
    );
  }
}
