import { create } from 'zustand';

export interface Race {
  id: number;
  entryFee: string;
  maxPlayers: number;
  currentPlayers: number;
  totalPot: string;
  players: string[];
  cockroachIds: number[];
  winner: number;
  started: boolean;
  finalized: boolean;
  createdAt: number;
  startedAt: number;
  finalizedAt: number;
}

interface RaceState {
  races: Race[];
  currentRace: Race | null;
  userBalance: string;
  setRaces: (races: Race[]) => void;
  setCurrentRace: (race: Race | null) => void;
  updateRace: (raceId: number, updates: Partial<Race>) => void;
  setUserBalance: (balance: string) => void;
}

export const useRaceStore = create<RaceState>((set) => ({
  races: [],
  currentRace: null,
  userBalance: '0',

  setRaces: (races) => set({ races }),
  
  setCurrentRace: (race) => set({ currentRace: race }),
  
  updateRace: (raceId, updates) => 
    set((state) => ({
      races: state.races.map((race) =>
        race.id === raceId ? { ...race, ...updates } : race
      ),
      currentRace: state.currentRace?.id === raceId
        ? { ...state.currentRace, ...updates }
        : state.currentRace
    })),
  
  setUserBalance: (balance) => set({ userBalance: balance })
}));
