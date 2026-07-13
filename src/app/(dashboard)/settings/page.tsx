import { AppearanceCard } from "@/components/settings/appearance-card";
import { BusinessProfileForm } from "@/components/settings/business-profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { getBusinessProfile } from "@/features/settings/queries";

export default async function SettingsPage() {
  const business = await getBusinessProfile();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Business details and display preferences."
      />
      <BusinessProfileForm defaultValues={business} />
      <AppearanceCard />
    </div>
  );
}
