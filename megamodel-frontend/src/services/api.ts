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

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }
  return response;
}

export const api = {
  async fetchComponents(): Promise<ComponentModel[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/components`, {
        headers: defaultHeaders,
        mode: "cors",
        credentials: "include",
      });
      await handleResponse(response);
      return response.json();
    } catch (error) {
      console.error("Error fetching components:", error);
      throw new Error("Failed to fetch components");
    }
  },

  async fetchComponentStates(): Promise<MicroserviceComponent[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/states`, {
        headers: defaultHeaders,
        mode: "cors",
        credentials: "include",
      });
      await handleResponse(response);

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
    try {
      const response = await fetch(`${API_BASE_URL}/components`, {
        method: "POST",
        headers: defaultHeaders,
        mode: "cors",
        credentials: "include",
        body: JSON.stringify(component),
      });
      await handleResponse(response);
      return response.json();
    } catch (error) {
      console.error("Error creating component:", error);
      throw new Error("Failed to create component");
    }
  },

  async updateComponentState(
    microserviceId: string,
    componentId: string,
    consistencyType: ConsistencyType
  ): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/states/${microserviceId}/${componentId}`,
        {
          method: "PUT",
          headers: defaultHeaders,
          mode: "cors",
          credentials: "include",
          body: JSON.stringify({ consistencyType }),
        }
      );
      await handleResponse(response);
    } catch (error) {
      console.error("Error updating component state:", error);
      throw new Error("Failed to update component state");
    }
  },

  async triggerReadOperation(
    microserviceId: string,
    componentId: string
  ): Promise<void> {
    try {
      const params = new URLSearchParams({
        microserviceId,
        componentId,
      });

      const response = await fetch(
        `${API_BASE_URL}/states/operations/read?${params}`,
        {
          method: "POST",
          headers: defaultHeaders,
          mode: "cors",
          credentials: "include",
        }
      );
      await handleResponse(response);
    } catch (error) {
      console.error("Error triggering read operation:", error);
      throw new Error("Failed to trigger read operation");
    }
  },

  async triggerWriteOperation(
    microserviceId: string,
    componentId: string
  ): Promise<void> {
    try {
      const params = new URLSearchParams({
        microserviceId,
        componentId,
      });

      const response = await fetch(
        `${API_BASE_URL}/states/operations/write?${params}`,
        {
          method: "POST",
          headers: defaultHeaders,
          mode: "cors",
          credentials: "include",
        }
      );
      await handleResponse(response);
    } catch (error) {
      console.error("Error triggering write operation:", error);
      throw new Error("Failed to trigger write operation");
    }
  },
};
