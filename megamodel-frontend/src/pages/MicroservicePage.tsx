import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Activity, Book, Edit3, ChevronDown, ChevronRight } from 'lucide-react';
import { Microservice } from '../types/microservice';
import { ComponentState, ConsistencyType } from '../types/msi';
import { useMicroserviceStore } from '../stores/microserviceStore';
import { microserviceApi } from '../services/microserviceApi';
import { api } from '../services/api';

interface MicroserviceComponentDetails {
  componentId: string;
  componentName: string;
  state: ComponentState;
  consistencyType: ConsistencyType;
  version: number;
  timestamp: string;
  stalenessBound?: string;
}

interface MicroserviceDetails extends Microservice {
  components: MicroserviceCompon