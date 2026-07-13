"use client";

import { useTheme } from "next-themes";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const THEME_ITEMS: Record<string, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function AppearanceCard() {
  // `theme` is undefined until after hydration, so the select shows its
  // placeholder on the server and first client render — no mismatch.
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Personal display preferences for this device.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-6">
        <Field>
          <FieldLabel htmlFor="appearance-theme">Theme</FieldLabel>
          <Select
            items={THEME_ITEMS}
            value={theme ?? null}
            onValueChange={(value) => value && setTheme(value)}
          >
            <SelectTrigger id="appearance-theme" className="w-48">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(THEME_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            System follows your operating system setting.
          </FieldDescription>
        </Field>
      </CardContent>
    </Card>
  );
}
