import { ReactElement } from "react";

import AuthenticatedViewLayout from "@/components/AuthenticatedViewLayout";

function BaseLayout({ children }: { children: ReactElement }) {
  return <AuthenticatedViewLayout>{children}</AuthenticatedViewLayout>;
}

export default BaseLayout;
