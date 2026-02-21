"use client";

import PassThroughSettings from "@/components/pass_through_settings";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";

export default function AIServicesPage() {
  const { accessToken, userRole, userId, premiumUser } = useAuthorized();

  if (!accessToken) return null;

  return (
    <PassThroughSettings
      accessToken={accessToken}
      userRole={userRole}
      userID={userId}
      modelData={{}}
      premiumUser={premiumUser}
    />
  );
}
