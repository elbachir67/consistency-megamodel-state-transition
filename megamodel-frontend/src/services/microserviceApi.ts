import { Microservice } from "../types/microservice";

const API_BASE_URL = "http://localhost:8080/api";

const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const microserviceApi = {
  async fetchMicroservices(): Promise<Microservice[]> {
    const response = await fetch(`${API_BASE_URL}/microservices`, {
      headers: defaultHeaders,
      mode: "cors", // Added explicit CORS mode
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch microservices");
    return response.json();
  },

  async createMicroservice(
    microservice: Omit<Microservice, "id">
  ): Promise<Microservice> {
    const response = await fetch(`${API_BASE_URL}/microservices`, {
      method: "POST",
      headers: defaultHeaders,
      mode: "cors", // Added explicit CORS mode
      credentials: "include",
      body: JSON.stringify(microservice),
    });
    if (!response.ok) throw new Error("Failed to create microservice");
    return response.json();
  },

  async updateMicroservice(
    id: string,
    microservice: Microservice
  ): Promise<Microservice> {
    const response = await fetch(`${API_BASE_URL}/microservices/${id}`, {
      method: "PUT",
      headers: defaultHeaders,
      mode: "cors", // Added explicit CORS mode
      credentials: "include",
      body: JSON.stringify(microservice),
    });
    if (!response.ok) throw new Error("Failed to update microservice");
    return response.json();
  },

  async deleteMicroservice(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/microservices/${id}`, {
      method: "DELETE",
      headers: defaultHeaders,
      mode: "cors", // Added explicit CORS mode
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to delete microservice");
  },
};
