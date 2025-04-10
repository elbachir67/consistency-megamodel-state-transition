import { create } from "zustand";
import {
  ComponentModel,
  ComponentState,
  MicroserviceComponent,
} from "../types/msi";

interface ComponentStore {
  components: (ComponentModel & { microserviceId: string })[];
  setComponents: (
    components: ComponentModel[],
    states: MicroserviceComponent[]
  ) => void;
  updateComponent: (id: string, component: ComponentModel) => void;
}

export const useComponentStore = create<ComponentStore>(set => ({
  components: [],
  setComponents: (components, states) => {
    const enrichedComponents = components.map(component => {
      const state = states.find(s => s.component_id === component.id);
      return {
        ...component,
        state: state?.state || ComponentState.INVALID,
        version: state?.version || 0,
        consistencyType: state?.consistency_type,
        microserviceId: state?.microservice_id || "",
      };
    });
    set({ components: enrichedComponents });
  },
  updateComponent: (id, component) =>
    set(state => ({
      components: state.components.map(c =>
        c.id === id ? { ...c, ...component } : c
      ),
    })),
}));
