import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> }
) {
  const { origin } = new URL(request.url);
  const { locale } = await context.params; // Destructure หลัง await

  // Logic: Clear cookies/session here
  
  return NextResponse.redirect(`${origin}/${locale}/login`);
}