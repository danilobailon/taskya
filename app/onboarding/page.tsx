import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Wizard } from "./Wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/onboarding");

  const [{ data: profile }, { data: pro }] = await Promise.all([
    supabase.from("profiles").select("full_name, city, phone, avatar_url").eq("id", user.id).single(),
    supabase.from("professionals").select("*").eq("id", user.id).maybeSingle(),
  ]);

  const initial = {
    full_name: profile?.full_name ?? "",
    city: profile?.city ?? "",
    phone: profile?.phone ?? "",
    avatar_url: profile?.avatar_url ?? "",
    profession: pro?.profession ?? "",
    headline: pro?.headline ?? "",
    experience: pro?.experience ?? "",
    bio: pro?.bio ?? "",
    categories: (pro?.categories ?? []) as string[],
    languages: ((pro?.languages ?? []) as string[]).join(", "),
    skills: ((pro?.skills ?? []) as string[]).join(", "),
  };

  return <Wizard userId={user.id} initial={initial} />;
}
