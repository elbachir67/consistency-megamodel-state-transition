import { GlobalOperationModel, GomInstance } from "../types/gom";

const API_BASE_URL = "http://localhost:8080/api";

const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const gomApi = {
  async fetchGoms(): Promise<GlobalOperationModel[]> {
    const response = await fetch(`${API_BASE_URL}/goms`, {
      headers: defaultHeaders,
      mode: "cors",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch GOMs");
    return response.json();
  },

  async createGom(
    gom: Omit<GlobalOperationModel, "id">
  ): Promise<GlobalOperationModel> {
    const response = await fetch(`${API_BASE_URL}/goms`, {
      method: "POST",
      headers: defaultHeaders,
      mode: "cors",
      credentials: "include",
      body: JSON.stringify(gom),
    });
    if (!response.ok) throw new Error("Failed to create GOM");
    return response.json();
  },

  async updateGom(
    id: string,
    gom: GlobalOperationModel
  ): Promise<GlobalOperationModel> {
    const response = await fetch(`${API_BASE_URL}/goms/${id}`, {
      method: "PUT",
      headers: defaultHeaders,
      mode: "cors",
      credentials: "include",
      body: JSON.stringify(gom),
    });
    if (!response.ok) throw new Error("Failed to update GOM");
    return response.json();
  },

  async deleteGom(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/goms/${id}`, {
      method: "DELETE",
      headers: defaultHeaders,
      mode: "cors",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to delete GOM");
  },

  async createInstance(gomId: string, name: string): Promise<GomInstance> {
    const response = await fetch(`${API_BASE_URL}/goms/${gomId}/instances`, {
      method: "POST",
      headers: defaultHeaders,
      mode: "cors",
      credentials: "include",
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error("Failed to create GOM instance");
    return response.json();
  },

  async fetchInstances(gomId: string): Promise<GomInstance[]> {
    const response = await fetch(`${API_BASE_URL}/goms/${gomId}/instances`, {
      headers: defaultHeaders,
      mode: "cors",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch GOM instances");
    return response.json();
  },

  async getInstance(instanceId: string): Promise<GomInstance> {
    const response = await fetch(
      `${API_BASE_URL}/gom-instances/${instanceId}`,
      {
        headers: defaultHeaders,
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch GOM instance");
    return response.json();
  },

  async deleteInstance(instanceId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/gom-instances/${instanceId}`,
      {
        method: "DELETE",
        headers: defaultHeaders,
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to delete GOM instance");
  },
};
