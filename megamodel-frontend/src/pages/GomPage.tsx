import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { GomList } from "../components/GomList";
import { GomForm } from "../components/GomForm";
import { useGomStore } from "../stores/gomStore";
import { gomApi } from "../services/gomApi";
import { GlobalOperationModel } from "../types/gom";

export function GomPage() {
  const { goms, setGoms, addGom, updateGom } = useGomStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGom, setEditingGom] = useState<GlobalOperationModel | null>(
    null
  );

  useEffect(() => {
    fetchGoms();
  }, []);

  async function fetchGoms() {
    try {
      setError(null);
      const fetchedGoms = await gomApi.fetchGoms();
      setGoms(fetchedGoms);
    } catch (error) {
      setError("Failed to fetch GOMs. Please try again.");
      console.error("Error fetching GOMs:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateGom = async (gom: Omit<GlobalOperationModel, "id">) => {
    try {
      const newGom = await gomApi.createGom(gom);
      addGom(newGom);
      setIsCreating(false);
    } catch (error) {
      setError("Failed to create GOM. Please try again.");
      console.error("Error creating GOM:", error);
    }
  };

  const handleUpdateGom = async (gom: GlobalOperationModel) => {
    try {
      const updatedGom = await gomApi.updateGom(gom.id, gom);
      updateGom(gom.id, updatedGom);
      setEditingGom(null);
    } catch (error) {
      setError("Failed to update GOM. Please try again.");
      console.error("Error updating GOM:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Global Operation Models
          </h2>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            New GOM
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            {error}
          </div>
        )}

        {isCreating && (
          <div className="mb-6 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Create New GOM
              </h3>
              <div className="mt-5">
                <GomForm
                  onSubmit={handleCreateGom}
                  onCancel={() => setIsCreating(false)}
                />
              </div>
            </div>
          </div>
        )}

        {editingGom && (
          <div className="mb-6 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Edit GOM
              </h3>
              <div className="mt-5">
                <GomForm
                  gom={editingGom}
                  onSubmit={data =>
                    handleUpdateGom({ ...data, id: editingGom.id })
                  }
                  onCancel={() => setEditingGom(null)}
                />
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <GomList onEdit={setEditingGom} />
        )}
      </div>
    </div>
  );
}
