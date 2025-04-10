import React, { useState } from "react";
import {
  Play,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { GlobalOperationModel, GomInstance } from "../types/gom";
import { useGomStore } from "../stores/gomStore";
import { gomApi } from "../services/gomApi";

interface GomListProps {
  onEdit: (gom: GlobalOperationModel) => void;
}

export function GomList({ onEdit }: GomListProps) {
  const { goms, removeGom } = useGomStore();
  const [expandedGoms, setExpandedGoms] = useState<Set<string>>(new Set());
  const [instances, setInstances] = useState<Record<string, GomInstance[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const toggleGom = async (gomId: string) => {
    const newExpanded = new Set(expandedGoms);
    if (expandedGoms.has(gomId)) {
      newExpanded.delete(gomId);
    } else {
      newExpanded.add(gomId);
      if (!instances[gomId]) {
        await fetchInstances(gomId);
      }
    }
    setExpandedGoms(newExpanded);
  };

  const fetchInstances = async (gomId: string) => {
    try {
      setLoading(prev => ({ ...prev, [gomId]: true }));
      const fetchedInstances = await gomApi.fetchInstances(gomId);
      setInstances(prev => ({ ...prev, [gomId]: fetchedInstances }));
      setError(null);
    } catch (error) {
      console.error("Failed to fetch instances:", error);
      setError("Failed to fetch GOM instances");
    } finally {
      setLoading(prev => ({ ...prev, [gomId]: false }));
    }
  };

  const handleCreateInstance = async (gomId: string) => {
    try {
      const name = `Instance-${Date.now()}`;
      await gomApi.createInstance(gomId, name);
      await fetchInstances(gomId);
    } catch (error) {
      console.error("Failed to create instance:", error);
      setError("Failed to create GOM instance");
    }
  };

  const handleDeleteInstance = async (gomId: string, instanceId: string) => {
    try {
      await gomApi.deleteInstance(instanceId);
      await fetchInstances(gomId);
    } catch (error) {
      console.error("Failed to delete instance:", error);
      setError("Failed to delete GOM instance");
    }
  };

  const handleDelete = async (gom: GlobalOperationModel) => {
    try {
      await gomApi.deleteGom(gom.id);
      removeGom(gom.id);
    } catch (error) {
      setError("Failed to delete GOM");
      console.error("Error deleting GOM:", error);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}

      {goms.map(gom => (
        <div
          key={gom.id}
          className="bg-white shadow rounded-lg overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleGom(gom.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {expandedGoms.has(gom.id) ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {gom.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {gom.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCreateInstance(gom.id)}
                  className="p-2 text-green-600 hover:text-green-700 focus:outline-none"
                >
                  <Play className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onEdit(gom)}
                  className="p-2 text-blue-600 hover:text-blue-700 focus:outline-none"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(gom)}
                  className="p-2 text-red-600 hover:text-red-700 focus:outline-none"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {expandedGoms.has(gom.id) && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Instances
                </h4>
                {loading[gom.id] ? (
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ) : instances[gom.id]?.length ? (
                  <div className="space-y-2">
                    {instances[gom.id].map(instance => (
                      <div
                        key={instance.id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div>
                          <span className="font-medium">{instance.name}</span>
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              instance.status === "RUNNING"
                                ? "bg-green-100 text-green-800"
                                : instance.status === "COMPLETED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {instance.status}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleDeleteInstance(gom.id, instance.id)
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No instances available
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
