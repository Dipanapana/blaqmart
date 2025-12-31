import { create } from "zustand"
import { persist } from "zustand/middleware"

interface School {
  id: string
  name: string
  slug: string
}

interface Grade {
  id: string
  name: string
  slug: string
}

interface UserPreferences {
  // Selected school and grade
  selectedSchool: School | null
  selectedGrade: Grade | null

  // Recent schools viewed (for quick access)
  recentSchools: School[]

  // User's town (for delivery estimates and social proof)
  town: string | null

  // Onboarding completed
  hasCompletedOnboarding: boolean

  // Last visit timestamp
  lastVisit: number | null

  // Actions
  setSchool: (school: School | null) => void
  setGrade: (grade: Grade | null) => void
  setSchoolAndGrade: (school: School, grade: Grade) => void
  addRecentSchool: (school: School) => void
  setTown: (town: string | null) => void
  completeOnboarding: () => void
  updateLastVisit: () => void
  clearPreferences: () => void
}

export const usePreferences = create<UserPreferences>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedSchool: null,
      selectedGrade: null,
      recentSchools: [],
      town: null,
      hasCompletedOnboarding: false,
      lastVisit: null,

      // Actions
      setSchool: (school) => {
        set({ selectedSchool: school })
        if (school) {
          get().addRecentSchool(school)
        }
      },

      setGrade: (grade) => {
        set({ selectedGrade: grade })
      },

      setSchoolAndGrade: (school, grade) => {
        set({
          selectedSchool: school,
          selectedGrade: grade,
        })
        get().addRecentSchool(school)
      },

      addRecentSchool: (school) => {
        const current = get().recentSchools
        // Remove if already exists, then add to front
        const filtered = current.filter((s) => s.id !== school.id)
        const updated = [school, ...filtered].slice(0, 5) // Keep max 5
        set({ recentSchools: updated })
      },

      setTown: (town) => {
        set({ town })
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true })
      },

      updateLastVisit: () => {
        set({ lastVisit: Date.now() })
      },

      clearPreferences: () => {
        set({
          selectedSchool: null,
          selectedGrade: null,
          recentSchools: [],
          town: null,
          hasCompletedOnboarding: false,
          lastVisit: null,
        })
      },
    }),
    {
      name: "blaqmart-preferences",
      version: 1,
    }
  )
)

// Hook to check if user is returning (for personalized welcome)
export function useReturningUser() {
  const lastVisit = usePreferences((state) => state.lastVisit)
  const updateLastVisit = usePreferences((state) => state.updateLastVisit)

  const isReturning = lastVisit !== null
  const daysSinceLastVisit = lastVisit
    ? Math.floor((Date.now() - lastVisit) / (1000 * 60 * 60 * 24))
    : null

  return {
    isReturning,
    daysSinceLastVisit,
    updateLastVisit,
  }
}

// Hook to get personalized greeting
export function usePersonalizedGreeting() {
  const selectedSchool = usePreferences((state) => state.selectedSchool)
  const selectedGrade = usePreferences((state) => state.selectedGrade)
  const town = usePreferences((state) => state.town)

  if (selectedSchool && selectedGrade) {
    return {
      hasPreferences: true,
      greeting: `Welcome back! Shopping for ${selectedGrade.name} at ${selectedSchool.name}`,
      shortGreeting: `${selectedGrade.name} @ ${selectedSchool.name}`,
    }
  }

  if (selectedSchool) {
    return {
      hasPreferences: true,
      greeting: `Welcome back! Shopping for ${selectedSchool.name}`,
      shortGreeting: selectedSchool.name,
    }
  }

  if (town) {
    return {
      hasPreferences: true,
      greeting: `Welcome! Delivering to ${town}`,
      shortGreeting: `Delivering to ${town}`,
    }
  }

  return {
    hasPreferences: false,
    greeting: "Welcome to Blaqmart Stationery!",
    shortGreeting: "Shop Now",
  }
}

// Hook for quick school/grade selection
export function useQuickSelect() {
  const selectedSchool = usePreferences((state) => state.selectedSchool)
  const selectedGrade = usePreferences((state) => state.selectedGrade)
  const recentSchools = usePreferences((state) => state.recentSchools)
  const setSchoolAndGrade = usePreferences((state) => state.setSchoolAndGrade)

  return {
    selectedSchool,
    selectedGrade,
    recentSchools,
    setSchoolAndGrade,
    hasSelection: selectedSchool !== null,
    getListUrl: () => {
      if (selectedSchool && selectedGrade) {
        return `/schools/${selectedSchool.slug}/grade/${selectedGrade.slug}`
      }
      if (selectedSchool) {
        return `/schools/${selectedSchool.slug}`
      }
      return "/schools"
    },
  }
}
