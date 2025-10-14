import { create } from 'zustand';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  setWallet: (address: string, provider: ethers.BrowserProvider) => Promise<void>;
  disconnect: () => void;
  updateBalance: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  provider: null,
  signer: null,
  balance: '0',
  isConnected: false,
  isConnecting: false,

  setWallet: async (address: string, provider: ethers.BrowserProvider) => {
    try {
      const signer = await provider.getSigner();
      const balance = await provider.getBalance(address);
      
      set({
        address,
        provider,
        signer,
        balance: ethers.formatEther(balance),
        isConnected: true,
        isConnecting: false
      });
    } catch (error) {
      console.error('Error setting wallet:', error);
      set({ isConnecting: false });
    }
  },

  disconnect: () => {
    set({
      address: null,
      provider: null,
      signer: null,
      balance: '0',
      isConnected: false,
      isConnecting: false
    });
  },

  updateBalance: async () => {
    const { address, provider } = get();
    if (address && provider) {
      try {
        const balance = await provider.getBalance(address);
        set({ balance: ethers.formatEther(balance) });
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  }
}));
