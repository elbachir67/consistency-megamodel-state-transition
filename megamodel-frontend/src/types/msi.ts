// MSI Protocol States
export enum ComponentState {
  MODIFIED = "MODIFIED",
  SHARED_PLUS = "SHARED_PLUS",
  SHARED_MINUS = "SHARED_MINUS",
  INVALID = "INVALID",
}

export enum ConsistencyType {
  STRONG = "STRONG",
  EVENTUAL = "EVENTUAL",
  BOUNDED_STALENESS = "BOUNDED_STALENESS",
  READ_MY_WRITES = "READ_MY_WRITES",
  MONOTONIC_READS = "MONOTONIC_READS",
}

export interface ComponentModel {
  id: string;
  name: string;
  metamodel: string;
  description: string;
  state?: ComponentState;
  version?: number;
  consistencyType?: ConsistencyType;
  microserviceId?: string;
}

export interface MicroserviceComponent {
  id: string;
  microservice_id: string;
  component_id: string;
  state: ComponentState;
  consistency_type: ConsistencyType;
  version: number;
  timestamp: string;
  staleness_bound?: string;
}
