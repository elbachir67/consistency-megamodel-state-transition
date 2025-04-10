import React from "react";
import App from "../App";
import { MetricsPanel } from "../components/MetricsPanel";

export function ComponentPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <MetricsPanel />
      <App />
    </div>
  );
}
