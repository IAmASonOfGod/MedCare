import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/notifications/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send test email
    const result = await sendTestEmail(email);
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.MessageId,
      service: 'SES'
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SES Test API - Use POST with email in body to test',
    example: {
      method: 'POST',
      body: { email: 'test@example.com' }
    }
  });
}

