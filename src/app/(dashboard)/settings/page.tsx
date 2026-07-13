import { AppearanceCard } from "@/components/settings/appearance-card";
import { BusinessProfileForm } from "@/components/settings/business-profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { MOCK_BUSINESS } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Business details and display preferences."
      />
      <BusinessProfileForm defaultValues={MOCK_BUSINESS} />
      <AppearanceCard />
    </div>
  );
}
