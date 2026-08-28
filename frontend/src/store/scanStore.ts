import { create } from 'zustand'
import type { Scan, ScanResult } from '@/types'

interface ScanState {
  scans: Scan[]
  currentScan: Scan | null
  scanResults: ScanResult[]
  isLoading: boolean
  isScanning: boolean
  scanProgress: number
  error: string | null

  // Actions
  setScans: (scans: Scan[]) => void
  setCurrentScan: (scan: Scan) => void
  setScanResults: (results: ScanResult[]) => void
  setScanProgress: (progress: number) => void
  setScanning: (scanning: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearCurrent: () => void
}

export const useScanStore = create<ScanState>((set) => ({
  scans: [],
  currentScan: null,
  scanResults: [],
  isLoading: false,
  isScanning: false,
  scanProgress: 0,
  error: null,

  setScans: (scans) => set({ scans }),
  setCurrentScan: (scan) => set({ currentScan: scan }),
  setScanResults: (results) => set({ scanResults: results }),
  setScanProgress: (progress) => set({ scanProgress: progress }),
  setScanning: (scanning) => set({ isScanning: scanning }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearCurrent: () =>
    set({
      currentScan: null,
      scanResults: [],
      scanProgress: 0,
      isScanning: false,
    }),
}))
