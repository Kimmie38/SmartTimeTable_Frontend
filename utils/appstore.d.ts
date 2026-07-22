export interface StudentSession {
  _id: string;
  fullName: string;
  email: string;
  matricNumber: string;
  department: string;
  level: number;
  semester: "First" | "Second";
  isStudent: boolean;
  isAdmin: boolean;
  token?: string;
}

export interface LectureEntry {
  id: string;
  courseCode: string;
  courseTitle: string;
  lecturer: string;
  venue: string;
  startTime: string;
  endTime: string;
  status: "Pending" | "Ongoing" | "Cancelled" | "Completed";
}

export interface HistoryEntry {
  id: string;
  date: string;
  courseCode: string;
  courseTitle: string;
  lecturer: string;
  venue: string;
  time: string;
  attachment: { url: string; fileType: "pdf" | "image"; fileName: string } | null;
}

export interface TestExamEntry {
  id: string;
  type: "Test" | "Exam";
  courseCode: string;
  courseTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  instructions: string;
}

export type AuthResult = { ok: true } | { ok: false; error: string };

export interface AppStoreValue {
  student: StudentSession | null;
  adminUser: any;
  isAdmin: boolean;

  timetable: Record<string, LectureEntry[]>;
  isTimetableLoading: boolean;
  timetableError: string | null;
  fetchTimetable: () => Promise<void>;

  history: HistoryEntry[];
  isHistoryLoading: boolean;
  historyError: string | null;
  fetchHistory: () => Promise<void>;

  tests: TestExamEntry[];
  isTestsLoading: boolean;
  testsError: string | null;
  fetchTests: () => Promise<void>;

  loadStudentData: () => void;
  updateProfile: (updates: Partial<{ fullName: string; email: string; password: string; fcmToken: string }>) => Promise<AuthResult>;

  loginStudent: (matricNumber: string, password: string) => Promise<AuthResult>;
  registerStudent: (formData: {
    fullName: string;
    email: string;
    matricNumber: string;
    level: number;
    semester: "First" | "Second";
    password: string;
  }) => Promise<AuthResult>;
  logoutStudent: () => Promise<void>;
  restoreStudentSession: () => Promise<void>;

  loginAdmin: (idNumber: string, password: string) => AuthResult;
  logoutAdmin: () => void;
}

export function AppStoreProvider(props: { children: React.ReactNode }): JSX.Element;
export function useAppStore(): AppStoreValue;