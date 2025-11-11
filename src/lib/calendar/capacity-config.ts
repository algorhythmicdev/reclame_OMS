import { writable } from 'svelte/store';

export interface CapacityConfig {
  defaultCapacity: number;
  customCapacities: Record<string, number>; // ISO date -> capacity
}

const DEFAULT_CONFIG: CapacityConfig = {
  defaultCapacity: 10,
  customCapacities: {}
};

function createCapacityStore() {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('rf_capacity_config') : null;
  const initial = stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  const { subscribe, set, update } = writable<CapacityConfig>(initial);

  return {
    subscribe,
    setDefaultCapacity: (capacity: number) => {
      update(config => {
        const updated = { ...config, defaultCapacity: capacity };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('rf_capacity_config', JSON.stringify(updated));
        }
        return updated;
      });
    },
    setDayCapacity: (iso: string, capacity: number) => {
      update(config => {
        const updated = {
          ...config,
          customCapacities: { ...config.customCapacities, [iso]: capacity }
        };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('rf_capacity_config', JSON.stringify(updated));
        }
        return updated;
      });
    },
    getDayCapacity: (iso: string): number => {
      let capacity = DEFAULT_CONFIG.defaultCapacity;
      const unsub = subscribe(config => {
        capacity = config.customCapacities[iso] ?? config.defaultCapacity;
      });
      unsub();
      return capacity;
    },
    reset: () => {
      set(DEFAULT_CONFIG);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('rf_capacity_config');
      }
    }
  };
}

export const capacityConfig = createCapacityStore();
