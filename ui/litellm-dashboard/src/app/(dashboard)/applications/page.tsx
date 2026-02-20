"use client";

import { useEffect, useState } from "react";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import ApplicationsView from "./ApplicationsView";
import {
  applicationConfigCall,
  ApplicationConfig,
} from "@/components/networking";

const ApplicationsPage = () => {
  const { accessToken, userId, userRole } = useAuthorized();
  const [config, setConfig] = useState<ApplicationConfig>({
    departments: [],
    lines_of_business: [],
  });

  useEffect(() => {
    if (!accessToken) return;
    applicationConfigCall(accessToken)
      .then(setConfig)
      .catch(() => {/* silently ignore — config lists are optional */});
  }, [accessToken]);

  return (
    <ApplicationsView
      accessToken={accessToken}
      userID={userId}
      userRole={userRole}
      config={config}
    />
  );
};

export default ApplicationsPage;
