import React, { createContext, useContext, useState, useEffect } from 'react'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'Super Admin' | 'Principal' | 'Teacher' | 'Student' | 'Parent'
  avatarText: string
  institutionName: string
  campusCode: string
  designation?: string
  assignedClass?: string // For teachers and students
  rollNumber?: string // For students
}

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  activeInstitution: string
  institutions: string[]
  login: (email: string, role?: UserProfile['role']) => boolean
  logout: () => void
  switchRole: (role: UserProfile['role']) => void
  setInstitution: (inst: string) => void
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-admin',
  name: 'Dr. Rajesh Kumar',
  email: 'admin@demo.com',
  role: 'Super Admin',
  avatarText: 'DR',
  institutionName: 'Greenwood International School',
  campusCode: 'GWIS',
  designation: 'Managing Director & System Administrator',
}

const INSTITUTIONS = [
  'Greenwood International School (GWIS)',
  'Heritage Public Senior Secondary School',
  'St. Jude Model Academy Campus',
]

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('bluke_auth_user_v2')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return DEFAULT_USER
      }
    }
    return DEFAULT_USER
  })

  const [activeInstitution, setActiveInstitution] = useState<string>('Greenwood International School')

  useEffect(() => {
    if (user) {
      localStorage.setItem('bluke_auth_user_v2', JSON.stringify(user))
    } else {
      localStorage.removeItem('bluke_auth_user_v2')
    }
  }, [user])

  const login = (email: string, role: UserProfile['role'] = 'Super Admin') => {
    let name = 'Dr. Rajesh Kumar'
    let avatarText = 'DR'
    let designation = 'Managing Director & Administrator'
    let assignedClass: string | undefined = undefined
    let rollNumber: string | undefined = undefined

    if (role === 'Principal') {
      name = 'Dr. Anita Sharma'
      avatarText = 'AS'
      designation = 'Principal & Head of School'
    } else if (role === 'Teacher') {
      name = 'Prof. Vikram Singh'
      avatarText = 'VS'
      designation = 'Senior Mathematics Faculty & Class Teacher (8-A)'
      assignedClass = 'Class 8-A'
    } else if (role === 'Student') {
      name = 'Rahul Sharma'
      avatarText = 'RS'
      designation = 'Student — Class 8-A'
      assignedClass = 'Class 8-A'
      rollNumber = 'SCH-8A-01'
    } else if (role === 'Parent') {
      name = 'Mr. Suresh Sharma'
      avatarText = 'SS'
      designation = 'Parent of Rahul Sharma (Class 8-A)'
      assignedClass = 'Class 8-A'
      rollNumber = 'SCH-8A-01'
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      email: email || `${name.toLowerCase().replace(/[\s.]+/g, '.')}@demo.com`,
      role,
      avatarText,
      institutionName: activeInstitution,
      campusCode: 'GWIS',
      designation,
      assignedClass,
      rollNumber,
    }

    setUser(newUser)
    return true
  }

  const logout = () => {
    setUser(null)
  }

  const switchRole = (role: UserProfile['role']) => {
    if (!user) {
      login('admin@demo.com', role)
      return
    }
    login(user.email, role)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        activeInstitution,
        institutions: INSTITUTIONS,
        login,
        logout,
        switchRole,
        setInstitution: setActiveInstitution,
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
