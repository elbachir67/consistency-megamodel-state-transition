import React, { useState, useEffect } from "react";
import {
  GlobalOperationModel,
  MicroserviceRequirement,
  ComponentRequirement,
} from "../types/gom";
import { ConsistencyType } from "../types/msi";
import { ComponentModel } from "../types/msi";
import { Microservice } from "../types/microservice";
import { Plus, Trash2 } from "lucide-react";
import { microserviceApi } from "../services/microserviceApi";
import { api } from "../services/api";

interface GomFormProps {
  gom?: GlobalOperationModel;
  onSubmit: (gom: Omit<GlobalOperationModel, "id">) => void;
  onCancel: () => void;
}

export function GomForm({ gom, onSubmit, onCancel }: GomFormProps) {
  const [formData, setFormData] = useState<Omit<GlobalOperationModel, "id">>({
    name: gom?.name ?? "",
    description: gom?.description ?? "",
    microserviceRequirements: gom?.microserviceRequirements ?? [],
  });

  const [microservices, setMicroservices] = useState<Microservice[]>([]);
  const [components, setComponents] = useState<ComponentModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedMicroservices, fetchedComponents] = await Promise.all([
          microserviceApi.fetchMicroservices(),
          api.fetchComponents(),
        ]);
        setMicroservices(fetchedMicroservices);
        setComponents(fetchedComponents);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load microservices and components");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addMicroserviceRequirement = () => {
    setFormData(prev => ({
      ...prev,
      microserviceRequirements: [
        ...prev.microserviceRequirements,
        {
          microserviceId: "",
          requiredComponents: [],
        },
      ],
    }));
  };

  const addComponentRequirement = (microserviceIndex: number) => {
    setFormData(prev => {
      const newRequirements = [...prev.microserviceRequirements];
      newRequirements[microserviceIndex].requiredComponents.push({
        componentId: "",
        consistencyType: ConsistencyType.EVENTUAL,
      });
      return { ...prev, microserviceRequirements: newRequirements };
    });
  };

  const updateMicroserviceRequirement = (
    index: number,
    microserviceId: string
  ) => {
    setFormData(prev => {
      const newRequirements = [...prev.microserviceRequirements];
      newRequirements[index].microserviceId = microserviceId;
      return { ...prev, microserviceRequirements: newRequirements };
    });
  };

  const updateComponentRequirement = (
    microserviceIndex: number,
    componentIndex: number,
    field: keyof ComponentRequirement,
    value: string
  ) => {
    setFormData(prev => {
      const newRequirements = [...prev.microserviceRequirements];
      const component =
        newRequirements[microserviceIndex].requiredComponents[componentIndex];
      if (field === "consistencyType") {
        component.consistencyType = value as ConsistencyType;
      } else {
        component[field] = value;
      }
      return { ...prev, microserviceRequirements: newRequirements };
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Microservice Requirements
          </label>
          <button
            type="button"
            onClick={addMicroserviceRequirement}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Microservice
          </button>
        </div>

        <div className="space-y-4">
          {formData.microserviceRequirements.map((requirement, mIndex) => (
            <div key={mIndex} className="border rounded-lg p-4 bg-gray-50">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Microservice
                </label>
                <select
                  value={requirement.microserviceId}
                  onChange={e =>
                    updateMicroserviceRequirement(mIndex, e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select a microservice...</option>
                  {microservices.map(ms => (
                    <option key={ms.id} value={ms.id}>
                      {ms.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                {requirement.requiredComponents.map((component, cIndex) => (
                  <div key={cIndex} className="flex gap-2">
                    <select
                      value={component.componentId}
                      onChange={e =>
                        updateComponentRequirement(
                          mIndex,
                          cIndex,
                          "componentId",
                          e.target.value
                        )
                      }
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select a component...</option>
                      {components.map(comp => (
                        <option key={comp.id} value={comp.id}>
                          {comp.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={component.consistencyType}
                      onChange={e =>
                        updateComponentRequirement(
                          mIndex,
                          cIndex,
                          "consistencyType",
                          e.target.value
                        )
                      }
                      className="w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      {Object.values(ConsistencyType).map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData(prev => {
                          const newRequirements = [
                            ...prev.microserviceRequirements,
                          ];
                          newRequirements[mIndex].requiredComponents.splice(
                            cIndex,
                            1
                          );
                          return {
                            ...prev,
                            microserviceRequirements: newRequirements,
                          };
                        })
                      }
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addComponentRequirement(mIndex)}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Component
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save
        </button>
      </div>
    </form>
  );
}
