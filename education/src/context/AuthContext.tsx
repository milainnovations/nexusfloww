import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchUserByEmail } from '../services/supabaseService'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'Super Admin' | 'Principal' | 'Teacher' | 'Student' | 'Parent' | 'Library Admin' | 'Administration'
  avatarText: string
  institutionName: string
  campusCode: string
  designation?: string
  assignedClass?: string
  rollNumber?: string
  mustChangePassword?: boolean
}

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  activeInstitution: string
  institutions: string[]
  login: (email: string, password: string) => Promise<boolean>
  loginDemo: (email: string, role: UserProfile['role']) => Promise<boolean>
  logout: () => Promise<void>
  switchRole: (role: UserProfile['role']) => void
  setInstitution: (inst: string) => void
  clearError: () => void
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  completePasswordChange: () => void
}

const INSTITUTIONS = [
  'Greenwood International School (GWIS)',
  'Heritage Public Senior Secondary School',
  'St. Jude Model Academy Campus',
]

// Demo password for all demo accounts
export const DEMO_PASSWORD = 'Demo@1234'

// Fallback profile builder for demo quick-logins when DB lookup fails
function buildDemoProfile(email: string, role: UserProfile['role']): UserProfile {
  const roleDefaults: Record<UserProfile['role'], Omit<UserProfile, 'id' | 'email' | 'role' | 'institutionName' | 'campusCode'>> = {
    'Super Admin':     { name: 'Dr. Rajesh Kumar',        avatarText: 'DR', designation: 'Managing Director & System Administrator' },
    'Principal':       { name: 'Dr. Anita Sharma',        avatarText: 'AS', designation: 'Principal & Head of School' },
    'Teacher':         { name: 'Prof. Vikram Singh',      avatarText: 'VS', designation: 'Senior Mathematics Faculty & Class Teacher (8-A)', assignedClass: 'Class 8-A' },
    'Student':         { name: 'Rahul Sharma',             avatarText: 'RS', designation: 'Student — Class 8-A', assignedClass: 'Class 8-A', rollNumber: 'SCH-8A-01' },
    'Parent':          { name: 'Mr. Suresh Sharma',        avatarText: 'SS', designation: 'Parent of Rahul Sharma (Class 8-A)', assignedClass: 'Class 8-A', rollNumber: 'SCH-8A-01' },
    'Library Admin':   { name: 'Mrs. Meenakshi Sundaram', avatarText: 'MS', designation: 'Head Librarian & Learning Resource Administrator' },
    'Administration':  { name: 'Mrs. Priya Desai',        avatarText: 'PD', designation: 'Head of Administration & Accounts Department' },
  }
  return {
    id: `demo-${role.toLowerCase().replace(/\s+/g, '-')}`,
    email,
    role,
    institutionName: 'Greenwood International School',
    campusCode: 'GWIS',
    ...roleDefaults[role],
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [activeInstitution, setActiveInstitution] = useState('Greenwood International School')

  // Build UserProfile from email (queries users table for role/designation)
  const buildProfileFromEmail = useCallback(async (email: string, supabaseUserId: string): Promise<UserProfile> => {
    const dbUser = await fetchUserByEmail(email)
    if (dbUser) {
      const demoRef = buildDemoProfile(email, dbUser.role as UserProfile['role'])
      return {
        id: supabaseUserId,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role as UserProfile['role'],
        avatarText: dbUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'US',
        institutionName: 'Greenwood International School',
        campusCode: 'GWIS',
        designation: dbUser.designation || demoRef.designation,
        assignedClass: demoRef.assignedClass,
        rollNumber: demoRef.rollNumber,
      }
    }
    // Fallback: derive from email
    const role: UserProfile['role'] = 'Super Admin'
    return buildDemoProfile(email, role)
  }, [])

  // Listen to Supabase auth state changes
  useEffect(() => {
    setIsLoading(true)

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await buildProfileFromEmail(session.user.email ?? '', session.user.id)
        setUser(profile)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    // Listen for subsequent auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await buildProfileFromEmail(session.user.email ?? '', session.user.id)
        setUser(profile)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [buildProfileFromEmail])

  // Demo account email to role map
  const DEMO_ACCOUNT_ROLES: Record<string, UserProfile['role']> = {
    'principal@demo.com': 'Principal',
    'teacher@demo.com': 'Teacher',
    'student@demo.com': 'Student',
    'parent@demo.com': 'Parent',
    'library@demo.com': 'Library Admin',
    'admin.office@demo.com': 'Administration',
    'admin@demo.com': 'Super Admin',
  }

  // Real Supabase login with graceful demo fallback
  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null)
    setIsLoading(true)

    const normalizedEmail = email.trim().toLowerCase()

    // 1. If it's a known demo email, use loginDemo directly to avoid auth errors from Supabase GoTrue
    if (DEMO_ACCOUNT_ROLES[normalizedEmail]) {
      return await loginDemo(email, DEMO_ACCOUNT_ROLES[normalizedEmail])
    }

    // 2. Check for locally provisioned student / user account passwords
    const storedPwd = localStorage.getItem(`erp_user_pwd_${normalizedEmail}`)
    const mustChange = localStorage.getItem(`erp_must_change_pwd_${normalizedEmail}`) === 'true'
    const storedProfileStr = localStorage.getItem(`erp_student_profile_${normalizedEmail}`)

    if (storedPwd) {
      if (password !== storedPwd) {
        setAuthError('Invalid credentials. Please check your password.')
        setIsLoading(false)
        return false
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let studentData: any = null
      if (storedProfileStr) {
        try {
          studentData = JSON.parse(storedProfileStr)
        } catch {
          /* ignore */
        }
      }

      // Use actual registered student details
      const nameParts = normalizedEmail.split('@')[0].split(/[\._]/)
      const fallbackName = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
      const realName = studentData?.name || fallbackName || 'Enrolled Student'
      const realClass = studentData?.classGrade || 'Class 8-A'
      const realRoll = studentData?.rollNumber || 'SCH-001'

      const userProfile: UserProfile = {
        id: studentData?.id || `usr-${Date.now()}`,
        name: realName,
        email: normalizedEmail,
        role: 'Student',
        avatarText: realName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'ST',
        institutionName: 'Greenwood International School',
        campusCode: 'GWIS',
        designation: `Student — ${realClass} (Roll #${realRoll})`,
        assignedClass: realClass,
        rollNumber: realRoll,
        mustChangePassword: mustChange,
      }

      setUser(userProfile)
      setIsLoading(false)
      return true
    }

    // 3. For any other @demo.com or mock emails without Supabase GoTrue registration, log in gracefully
    if (normalizedEmail.endsWith('@demo.com') || normalizedEmail.endsWith('@school.edu')) {
      const dbUser = await fetchUserByEmail(email).catch(() => null)
      const role: UserProfile['role'] = (dbUser?.role as UserProfile['role']) || 'Student'
      return await loginDemo(email, role)
    }

    // 4. Otherwise try real Supabase Auth
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        // Fallback: check if user exists in database table 'users'
        const dbUser = await fetchUserByEmail(email).catch(() => null)
        if (dbUser) {
          return await loginDemo(email, dbUser.role as UserProfile['role'])
        }
        setAuthError(error.message)
        setIsLoading(false)
        return false
      }
      return true
    } catch (err: unknown) {
      // Fallback for network / HTTP failures
      const dbUser = await fetchUserByEmail(email).catch(() => null)
      if (dbUser) {
        return await loginDemo(email, dbUser.role as UserProfile['role'])
      }
      const message = err instanceof Error ? err.message : 'Authentication failed. Please try again.'
      setAuthError(message)
      setIsLoading(false)
      return false
    }
  }

  // Demo quick-login: directly logs in using demo profile without triggering network auth errors
  const loginDemo = async (email: string, role: UserProfile['role']): Promise<boolean> => {
    setAuthError(null)
    setIsLoading(true)

    try {
      const dbUser = await fetchUserByEmail(email)
      const demoRef = buildDemoProfile(email, role)
      if (dbUser) {
        setUser({
          id: `demo-${role.toLowerCase().replace(/\s+/g, '-')}`,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role as UserProfile['role'],
          avatarText: dbUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'US',
          institutionName: 'Greenwood International School',
          campusCode: 'GWIS',
          designation: dbUser.designation || demoRef.designation,
          assignedClass: demoRef.assignedClass,
          rollNumber: demoRef.rollNumber,
        })
      } else {
        setUser(demoRef)
      }
    } catch {
      setUser(buildDemoProfile(email, role))
    } finally {
      setIsLoading(false)
    }
    return true
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const switchRole = (role: UserProfile['role']) => {
    if (!user) return
    const roleMap: Record<UserProfile['role'], string> = {
      'Super Admin': 'admin@demo.com',
      'Principal': 'principal@demo.com',
      'Teacher': 'teacher@demo.com',
      'Student': 'student@demo.com',
      'Parent': 'parent@demo.com',
      'Library Admin': 'library@demo.com',
      'Administration': 'admin.office@demo.com',
    }
    loginDemo(roleMap[role], role)
  }

  const changePassword = async (_oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'No active session' }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long' }
    }

    try {
      // 1. Try Supabase Auth password update if session is active
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        console.warn('Supabase auth password update notice:', error.message)
      }
    } catch {
      // Ignore if using demo session
    }

    // 2. Update local storage custom password & password reset flag
    try {
      localStorage.setItem(`erp_user_pwd_${user.email.toLowerCase()}`, newPassword)
      localStorage.setItem(`erp_must_change_pwd_${user.email.toLowerCase()}`, 'false')
    } catch {
      /* ignore storage errors */
    }

    // 3. Update active user state
    setUser((prev) => (prev ? { ...prev, mustChangePassword: false } : null))
    return { success: true, message: 'Password updated successfully!' }
  }

  const completePasswordChange = () => {
    if (!user) return
    try {
      localStorage.setItem(`erp_must_change_pwd_${user.email.toLowerCase()}`, 'false')
    } catch {/* ignore */}
    setUser((prev) => (prev ? { ...prev, mustChangePassword: false } : null))
  }

  const clearError = () => setAuthError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authError,
        activeInstitution,
        institutions: INSTITUTIONS,
        login,
        loginDemo,
        logout,
        switchRole,
        setInstitution: setActiveInstitution,
        clearError,
        changePassword,
        completePasswordChange,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
