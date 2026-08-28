import { create } from 'zustand'

interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  notifications: Notification[]

  // Actions
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  loadThemeFromStorage: () => void
}

export const useUiStore = create<UIState>((set) => ({
  theme: 'dark', // Default to night mode
  sidebarOpen: true,
  notifications: [],

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', newTheme)
      return { theme: newTheme }
    }),

  setSidebarOpen: (open) =>
    set(() => {
      localStorage.setItem('sidebarOpen', JSON.stringify(open))
      return { sidebarOpen: open }
    }),

  toggleSidebar: () =>
    set((state) => {
      const newState = !state.sidebarOpen
      localStorage.setItem('sidebarOpen', JSON.stringify(newState))
      return { sidebarOpen: newState }
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: Date.now().toString(),
        },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),

  loadThemeFromStorage: () => {
    const theme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
    const sidebarOpen =
      JSON.parse(localStorage.getItem('sidebarOpen') ?? 'true') !== false

    set({ theme, sidebarOpen })
  },
}))

export const useUIStore = useUiStore
