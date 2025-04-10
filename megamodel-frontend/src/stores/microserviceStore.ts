import { create } from "zustand";
import { Microservice } from "../types/microservice";

interface MicroserviceStore {
  microservices: Microservice[];
  setMicroservices: (microservices: Microservice[]) => void;
  addMicroservice: (microservice: Microservice) => void;
  updateMicroservice: (id: string, microservice: Microservice) => void;
  removeMicroservice: (id: string) => void;
}

export const useMicroserviceStore = create<MicroserviceStore>(set => ({
  microservices: [],
  setMicroservices: microservices => set({ microservices }),
  addMicroservice: microservice =>
    set(state => ({
      microservices: [...state.microservices, microservice],
    })),
  updateMicroservice: (id, microservice) =>
    set(state => ({
      microservices: state.microservices.map(m =>
        m.id === id ? microservice : m
      ),
    })),
  removeMicroservice: id =>
    set(state => ({
      microservices: state.microservices.filter(m => m.id !== id),
    })),
}));
