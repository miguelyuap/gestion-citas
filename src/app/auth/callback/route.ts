import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const error = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const errorDescription = searchParams.get('error_description');

  if (error || errorCode) {
    const desc = errorDescription || 'El enlace de confirmación no es válido o ha expirado.';
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error || errorCode || 'error')}&error_description=${encodeURIComponent(desc)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error('Error al intercambiar código por sesión:', exchangeError);
      return NextResponse.redirect(
        `${origin}/login?error=code_exchange_failed&error_description=${encodeURIComponent(exchangeError.message)}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
