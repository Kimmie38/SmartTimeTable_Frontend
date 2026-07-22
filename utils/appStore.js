import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { api, setAuthToken, loadStoredToken } from "./api";
import { MOCK_USERS, nextId } from "./mockData";
import { registerForPushNotificationsAsync } from "./notifications";

const AppStoreContext = createContext(null);

export function AppStoreProvider({ children }) {
  // Admin side is still mocked for now
  const [users, setUsers] = useState(MOCK_USERS);
  const [adminUser, setAdminUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [student, setStudent] = useState(null);

  const [timetable, setTimetable] = useState({});
  const [isTimetableLoading, setIsTimetableLoading] = useState(false);
  const [timetableError, setTimetableError] = useState(null);

  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const [tests, setTests] = useState([]);
  const [isTestsLoading, setIsTestsLoading] = useState(false);
  const [testsError, setTestsError] = useState(null);

  // Register the device for push notifications and send the token to the backend.
  const registerPushToken = useCallback(async () => {
    try {
      const token = await registerForPushNotificationsAsync();

      if (token) {
        await api.put("/student/profile", {
          fcmToken: token,
        });
      }
    } catch (err) {
      console.warn("Push registration failed:", err.message);
    }
  }, []);

  // ---------- Student data fetchers ----------
  const fetchTimetable = useCallback(async () => {
    setIsTimetableLoading(true);
    setTimetableError(null);

    try {
      const res = await api.get("/student/timetable");
      setTimetable(res.timetable);
    } catch (err) {
      setTimetableError(err.message);
    } finally {
      setIsTimetableLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      const res = await api.get("/student/history");
      setHistory(res.history);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  const fetchTests = useCallback(async () => {
    setIsTestsLoading(true);
    setTestsError(null);

    try {
      const res = await api.get("/student/tests-exams");
      setTests(res.items);
    } catch (err) {
      setTestsError(err.message);
    } finally {
      setIsTestsLoading(false);
    }
  }, []);

  // Pull everything after login/register/session restore
  const loadStudentData = useCallback(() => {
    fetchTimetable();
    fetchHistory();
    fetchTests();
  }, [fetchTimetable, fetchHistory, fetchTests]);

  const updateProfile = useCallback(async (updates) => {
    try {
      const res = await api.put("/student/profile", updates);

      setStudent((prev) => ({
        ...prev,
        ...res.data,
      }));

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  // ---------- Student auth (real backend) ----------
  const loginStudent = useCallback(
    async (matricNumber, password) => {
      try {
        const res = await api.post(
          "/auth/login",
          { matricNumber, password },
          { auth: false }
        );

        await setAuthToken(res.data.token);

        setStudent(res.data);

        loadStudentData();
        registerPushToken();

        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [loadStudentData, registerPushToken]
  );

  const registerStudent = useCallback(
    async (formData) => {
      try {
        const res = await api.post(
          "/auth/register",
          formData,
          { auth: false }
        );

        await setAuthToken(res.data.token);

        setStudent(res.data);

        loadStudentData();
        registerPushToken();

        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [loadStudentData, registerPushToken]
  );

  const logoutStudent = useCallback(async () => {
    await setAuthToken(null);

    setStudent(null);
    setTimetable({});
    setHistory([]);
    setTests([]);
  }, []);

  const restoreStudentSession = useCallback(
    async () => {
      const token = await loadStoredToken();

      if (!token) return;

      try {
        const res = await api.get("/student/profile");

        setStudent(res.data);

        loadStudentData();
        registerPushToken();
      } catch (err) {
        await setAuthToken(null);
      }
    },
    [loadStudentData, registerPushToken]
  );

  // ---------- Admin auth (still mock) ----------
  const loginAdmin = useCallback(
    (idNumber, password) => {
      const found = users.find(
        (u) =>
          u.matricNumber.trim().toLowerCase() ===
            idNumber.trim().toLowerCase() &&
          u.password === password
      );

      if (!found)
        return {
          ok: false,
          error: "Invalid ID or password.",
        };

      if (!found.roles.includes("admin"))
        return {
          ok: false,
          error: "This account doesn't have admin access.",
        };

      setAdminUser(found);
      setIsAdmin(true);

      return { ok: true };
    },
    [users]
  );

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    setAdminUser(null);
  }, []);

  const value = useMemo(
    () => ({
      student,
      adminUser,
      isAdmin,

      timetable,
      isTimetableLoading,
      timetableError,
      fetchTimetable,

      history,
      isHistoryLoading,
      historyError,
      fetchHistory,

      tests,
      isTestsLoading,
      testsError,
      fetchTests,

      loadStudentData,
      updateProfile,
      registerPushToken,

      loginStudent,
      registerStudent,
      logoutStudent,
      restoreStudentSession,

      loginAdmin,
      logoutAdmin,
    }),
    [
      student,
      adminUser,
      isAdmin,

      timetable,
      isTimetableLoading,
      timetableError,
      fetchTimetable,

      history,
      isHistoryLoading,
      historyError,
      fetchHistory,

      tests,
      isTestsLoading,
      testsError,
      fetchTests,

      loadStudentData,
      updateProfile,
      loginStudent,
      registerStudent,
      logoutStudent,
      restoreStudentSession,

      loginAdmin,
      logoutAdmin,
    ]
  );

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);

  if (!ctx) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }

  return ctx;
}