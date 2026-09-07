/**
 * DEDICATED SINGLE-SCHOOL DATABASE CONNECTOR & REPOSITORY
 * 
 * Provides database connection interfaces, schema type declarations, and seed utilities
 * customized for a single school instance without multi-tenant school_id columns.
 */

import {
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_TIMETABLE,
  INITIAL_COURSES,
  INITIAL_EXAMS,
  INITIAL_INVOICES,
  INITIAL_HOSTEL,
  INITIAL_LIBRARY_BOOKS,
  INITIAL_BOOK_ISSUES,
  INITIAL_USERS,
} from '../data/mockData'

export interface InstitutionConfig {
  institutionName: string
  campusCode: string
  address: string
  phone: string
  email: string
  academicYear: string
  principalName: string
  managingDirector: string
}

export const DEDICATED_SCHOOL_CONFIG: InstitutionConfig = {
  institutionName: 'Greenwood International School',
  campusCode: 'GWIS',
  address: 'Greenwood Campus, Outer Ring Road, Bengaluru',
  phone: '+91 80 2843 9000',
  email: 'office@greenwood.edu.in',
  academicYear: '2024-2025',
  principalName: 'Dr. Anita Sharma',
  managingDirector: 'Dr. Rajesh Kumar',
}

/**
 * Single-School Database Service helper interface.
 * Connects directly to dedicated PostgreSQL / MySQL / SQLite database instance.
 */
export class DedicatedSchoolDatabase {
  private static instance: DedicatedSchoolDatabase

  public static getInstance(): DedicatedSchoolDatabase {
    if (!DedicatedSchoolDatabase.instance) {
      DedicatedSchoolDatabase.instance = new DedicatedSchoolDatabase()
    }
    return DedicatedSchoolDatabase.instance
  }

  public getConfig(): InstitutionConfig {
    return DEDICATED_SCHOOL_CONFIG
  }

  /**
   * Export complete seed dataset for populating a newly provisioned single-school database.
   */
  public getInitialSeedData() {
    return {
      config: DEDICATED_SCHOOL_CONFIG,
      users: INITIAL_USERS,
      students: INITIAL_STUDENTS,
      faculty: INITIAL_FACULTY,
      courses: INITIAL_COURSES,
      timetable: INITIAL_TIMETABLE,
      exams: INITIAL_EXAMS,
      invoices: INITIAL_INVOICES,
      hostel: INITIAL_HOSTEL,
      libraryBooks: INITIAL_LIBRARY_BOOKS,
      libraryBookIssues: INITIAL_BOOK_ISSUES,
    }
  }
}

export const schoolDb = DedicatedSchoolDatabase.getInstance()
