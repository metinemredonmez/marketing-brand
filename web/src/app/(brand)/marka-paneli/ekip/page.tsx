import { brandApi } from "@/lib/api/brand";
import { Card } from "@/components/ui/card";
import { getTranslations } from "@/lib/i18n/server";
import { InviteForm } from "./_invite";

export default async function TeamPage() {
  const accounts = await brandApi.myAccounts();
  const account = accounts[0].brandAccount;
  const t = await getTranslations();

  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wide text-accent">
        {t("brandPortal.nav.team")}
      </div>
      <h1 className="text-2xl font-bold text-foreground">
        {t("brandPortal.team.title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("brandPortal.team.subtitle")}
      </p>

      <Card className="mt-6 p-5">
        <h3 className="text-sm font-semibold text-foreground">
          {t("brandPortal.team.inviteTitle")}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("brandPortal.team.inviteHint")}
        </p>
        <div className="mt-4">
          <InviteForm brandAccountId={account.id} />
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h3 className="text-sm font-semibold text-foreground">
          {t("brandPortal.team.rolesTitle")}
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-foreground/80">
          <li>{t("brandPortal.team.roles.owner")}</li>
          <li>{t("brandPortal.team.roles.manager")}</li>
          <li>{t("brandPortal.team.roles.editor")}</li>
          <li>{t("brandPortal.team.roles.viewer")}</li>
        </ul>
      </Card>
    </div>
  );
}
