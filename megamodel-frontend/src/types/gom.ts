import { ComponentState, ConsistencyType } from "./msi";

export interface ComponentRequirement {
  componentId: string;
  consistencyType: ConsistencyType;
}

export interface MicroserviceRequirement {
  microserviceId: string;
  requiredComponents: ComponentRequirement[];
}

export interface GlobalOperationModel {
  id: string;
  name: string;
  description: string;
  microserviceRequirements: MicroserviceRequirement[];
}

export interface GomInstance {
  id: string;
  gomId: string;
  name: string;
  status: "RUNNING" | "COMPLETED" | "FAILED";
  microserviceStates: MicroserviceComponentState[];
  createdAt: string;
  updatedAt: string;
}

export interface MicroserviceComponentState {
  microserviceId: string;
  componentId: string;
  state: ComponentState;
  consistencyType: ConsistencyType;
  version: number;
  timestamp: string;
}
