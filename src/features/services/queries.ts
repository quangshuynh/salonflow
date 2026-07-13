import "server-only";

import { getSupabaseEnv } from "@/lib/db/env";
import { mapService, type ServiceRow } from "@/lib/db/mappers";
import { MOCK_SERVICES } from "@/lib/mock-data";
import { createClient } from "@/lib/db/server";
import type { Service } from "@/types";

export async function getServices(): Promise<Service[]> {
  if (!getSupabaseEnv()) {
    return [...MOCK_SERVICES].sort((a, b) => a.name.localeCompare(b.name));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data as ServiceRow[]).map(mapService);
}
