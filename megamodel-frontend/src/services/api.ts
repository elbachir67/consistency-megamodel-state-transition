import {
  ComponentModel,
  ComponentState,
  ConsistencyType,
  MicroserviceComponent,
} from "../types/msi";

const API_BASE_URL = "http://localhost:8080/api";

const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const api = {
  async fetchComponents(): Promise<ComponentModel[]> {
    const response = await fetch(`${API_BASE_URL}/components`, {
      headers: defaultHeaders,
      mode: "cors", // Added explicit CORS mode
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch components");
    return response.json();
  },

  async fetchComponentStates(): Promise<MicroserviceComponent[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/states`, {
        headers: defaultHeaders,
        mode: "cors", // Added explicit CORS mode
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.map((state: any) => ({
        id: state.id.toString(),
        microservice_id: state.microservice.id,
        component_id: state.componentModel.id,
        state: state.state as ComponentState,
        consistency_type: state.consistencyType as ConsistencyType,
        version: state.version,
        timestamp: state.timestamp,
        staleness_bound: state.stalenessBound,
      }));
    } catch (error) {
      console.error("Error fetching component states:", error);
      throw new Error("Failed to fetch component states");
    }
  },

  async createComponent(
    component: Partial<ComponentModel>
  ): Promise<ComponentModel> {
    const response = await fetch(`${API_BASE_URL}/components`, {
      method: "POST",
      headers: defaultHeaders,
      mode: "cors", // Added explicit CORS mode
      credentials: "include",
      body: JSON.stringify(component),
    });
    if (!response.ok) throw new Error("Failed to create component");
    return response.json();
  },

  async updateComponentState(
    microserviceId: string,
    componentId: string,
    consistencyType: ConsistencyType
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/states/${microserviceId}/${componentId}`,
      {
        method: "PUT",
        headers: defaultHeaders,
        mode: "cors", // Added explicit CORS mode
        credentials: "include",
        body: JSON.stringify({ consistencyType }),
      }
    );
    if (!response.ok) throw new Error("Failed to update component state");
  },

  async triggerReadOperation(
    microserviceId: string,
    componentId: string
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/states/operations/read?microserviceId=${microserviceId}&componentId=${componentId}`,
      {
        method: "POST",
        headers: defaultHeaders,
        mode: "cors", // Added explicit CORS mode
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to trigger read operation");
  },

  async triggerWriteOperation(
    microserviceId: string,
    componentId: string
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/states/operations/write?microserviceId=${microserviceId}&componentId=${componentId}`,
      {
        method: "POST",
        headers: defaultHeaders,
        mode: "cors", // Added explicit CORS mode
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to trigger write operation");
  },
};
