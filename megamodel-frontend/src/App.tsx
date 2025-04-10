import React, { useEffect, useState } from "react";
import { Activity, Plus, RefreshCw, Settings, Edit3, Book } from "lucide-react";
import { ComponentModel, ComponentState } from "./types/msi";
import { useComponentStore } from "./stores/componentStore";
import { api } from "./services/api";

export default function App() {
  const [loading, setLoading] = useState(true);
  const { components, setComponents, updateComponent } = useComponentStore();
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newComponent, setNewComponent] = useState({
    name: "",
    metamodel: "",
    description: "",
  });

  useEffect(() => {
    fetchComponents();
    const interval = setInterval(fetchComponents, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchComponents() {
    try {
      setError(null);
      const [components, states] = await Promise.all([
        api.fetchComponents(),
        api.fetchComponentStates(),
      ]);
      setComponents(components, states);
    } catch (error) {
      setError("Failed to fetch components. Please try again.");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleOperation(
    type: "read" | "write",
    componentId: string,
    microserviceId: string
  ) {
    try {
      setError(null);
      if (type === "read") {
        await api.triggerReadOperation(microserviceId, componentId);
      } else {
        await api.triggerWriteOperation(microserviceId, componentId);
      }
      await fetchComponents();
    } catch (error) {
      console.error(`Error triggering ${type} operation:`, error);
      setError(`Failed to perform ${type} operation. Please try again.`);
    }
  }

  async function handleCreateComponent() {
    try {
      setError(null);
      await api.createComponent(newComponent);
      setIsCreating(false);
      setNewComponent({ name: "", metamodel: "", description: "" });
      await fetchComponents();
    } catch (error) {
      console.error("Error creating component:", error);
      setError("Failed to create component. Please try again.");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              MSI Consistency Manager
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchComponents}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Component
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            {error}
          </div>
        )}

        {isCreating && (
          <div className="mb-6 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Create New Component
              </h3>
              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={newComponent.name}
                    onChange={e =>
                      setNewComponent({ ...newComponent, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="metamodel"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Metamodel
                  </label>
                  <input
                    type="text"
                    name="metamodel"
                    id="metamodel"
                    value={newComponent.metamodel}
                    onChange={e =>
                      setNewComponent({
                        ...newComponent,
                        metamodel: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={newComponent.description}
                    onChange={e =>
                      setNewComponent({
                        ...newComponent,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateComponent}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {components.map(component => (
              <div
                key={component.id}
                className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center justify-between">
                    {component.name}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(
                        component.state!
                      )}`}
                    >
                      {component.state}
                    </span>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {component.metamodel}
                  </p>
                  {component.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {component.description}
                    </p>
                  )}
                </div>
                <div className="px-4 py-4 sm:px-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Version</span>
                      <span className="font-medium">{component.version}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleOperation(
                            "read",
                            component.id,
                            component.microserviceId!
                          )
                        }
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Book className="h-4 w-4 mr-2" />
                        Read
                      </button>
                      <button
                        onClick={() =>
                          handleOperation(
                            "write",
                            component.id,
                            component.microserviceId!
                          )
                        }
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Write
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
