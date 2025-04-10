import { create } from "zustand";
import { GlobalOperationModel, GomInstance } from "../types/gom";

interface GomStore {
  goms: GlobalOperationModel[];
  instances: Record<string, GomInstance[]>;
  setGoms: (goms: GlobalOperationModel[]) => void;
  setInstances: (gomId: string, instances: GomInstance[]) => void;
  addGom: (gom: GlobalOperationModel) => void;
  updateGom: (id: string, gom: GlobalOperationModel) => void;
  removeGom: (id: string) => void;
  addInstance: (gomId: string, instance: GomInstance) => void;
  removeInstance: (gomId: string, instanceId: string) => void;
}

export const useGomStore = create<GomStore>(set => ({
  goms: [],
  instances: {},
  setGoms: goms => set({ goms }),
  setInstances: (gomId, instances) =>
    set(state => ({
      instances: { ...state.instances, [gomId]: instances },
    })),
  addGom: gom => set(state => ({ goms: [...state.goms, gom] })),
  updateGom: (id, gom) =>
    set(state => ({
      goms: state.goms.map(g => (g.id === id ? gom : g)),
    })),
  removeGom: id =>
    set(state => ({
      goms: state.goms.filter(g => g.id !== id),
      instances: Object.fromEntries(
        Object.entries(state.instances).filter(([key]) => key !== id)
      ),
    })),
  addInstance: (gomId, instance) =>
    set(state => ({
      instances: {
        ...state.instances,
        [gomId]: [...(state.instances[gomId] || []), instance],
      },
    })),
  removeInstance: (gomId, instanceId) =>
    set(state => ({
      instances: {
        ...state.instances,
        [gomId]: state.instances[gomId]?.filter(i => i.id !== instanceId) || [],
      },
    })),
}));
