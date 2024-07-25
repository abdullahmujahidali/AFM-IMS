import { Suspense } from "react";
import { Outlet } from "react-router-dom";

// import Sidebar from 'components/Sidebar';

import BaseLayout from "./BaseLayout";

export default function DashboardLayout() {
  return (
    <BaseLayout>
      <>
        {/* <Sidebar /> */}

        <Suspense fallback={<span />}>
          <div className="animate-in fade-in slide-in-from-bottom-1 mt-[--top-spacing] h-[calc(100%-var(--top-spacing))] ps-[240px]">
            <Outlet />
          </div>
        </Suspense>
      </>
    </BaseLayout>
  );
}
