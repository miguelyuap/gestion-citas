import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Profesionales from '@/components/figma-make/pages/Profesionales';

export default async function StaffPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <Profesionales />;
}
