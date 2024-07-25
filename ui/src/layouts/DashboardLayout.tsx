import Header from "@/components/ui/Header";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import BaseLayout from "./BaseLayout";

export default function DashboardLayout() {
  return (
    <BaseLayout>
      <>
        <Header />
        <Suspense fallback={<span />}>
          <div className="animate-in fade-in slide-in-from-bottom-1 mt-[--top-spacing] h-[calc(100%-var(--top-spacing))] ">
            <Outlet />
          </div>
        </Suspense>
      </>
    </BaseLayout>
  );
}
