import React, { useEffect, useState } from "react";
import { BarChart, Activity, Clock, AlertCircle } from "lucide-react";
import { ComponentState } from "../types/msi";

interface Metrics {
  stateDistribution: Record<ComponentState, number>;
  totalOperations: number;
  transitionCounts: Record<ComponentState, number>;
  recentTransitions: Array<{
    componentId: string;
    microserviceId: string;
    fromState: ComponentState;
    toState: ComponentState;
    timestamp: string;
  }>;
}

export function MetricsPanel() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchMetrics() {
    try {
      const [distribution, operations, transitions, recent] = await Promise.all(
        [
          fetch("http://localhost:8080/api/metrics/state-distribution").then(
            res => res.json()
          ),
          fetch("http://localhost:8080/api/metrics/total-operations").then(
            res => res.json()
          ),
          fetch("http://localhost:8080/api/metrics/transition-counts").then(
            res => res.json()
          ),
          fetch("http://localhost:8080/api/metrics/recent-transitions").then(
            res => res.json()
          ),
        ]
      );

      setMetrics({
        stateDistribution: distribution,
        totalOperations: operations,
        transitionCounts: transitions,
        recentTransitions: recent,
      });
      setError(null);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setError("Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  }

  const getStateColor = (state: ComponentState) => {
    switch (state) {
      case ComponentState.MODIFIED:
        return "bg-yellow-100 text-yellow-800";
      case ComponentState.SHARED_PLUS:
        return "bg-green-100 text-green-800";
      case ComponentState.SHARED_MINUS:
        return "bg-orange-100 text-orange-800";
      case ComponentState.INVALID:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-lg shadow p-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        {error}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            System Metrics
          </h3>
          <span className="text-sm text-gray-500">
            Total Operations: {metrics.totalOperations}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <BarChart className="h-4 w-4 text-gray-400" />
              Current State Distribution
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(metrics.stateDistribution).map(
                ([state, count]) => (
                  <div
                    key={state}
                    className={`px-4 py-3 rounded-lg flex items-center justify-between ${getStateColor(
                      state as ComponentState
                    )}`}
                  >
                    <span className="font-medium">{state}</span>
                    <span>{count}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Recent State Transitions
            </h4>
            <div className="space-y-2">
              {metrics.recentTransitions.map((transition, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {transition.microserviceId} → {transition.componentId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(
                        transition.fromState
                      )}`}
                    >
                      {transition.fromState}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(
                        transition.toState
                      )}`}
                    >
                      {transition.toState}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              State Transition Counts
            </h4>
            <div className="space-y-2">
              {Object.entries(metrics.transitionCounts).map(
                ([state, count]) => (
                  <div key={state} className="flex items-center">
                    <span className="flex-1 text-sm text-gray-600">
                      {state}
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500"
                        style={{
                          width: `${(count / metrics.totalOperations) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-500">{count}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
