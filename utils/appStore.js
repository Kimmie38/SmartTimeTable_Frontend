import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  MOCK_TIMETABLE,
  MOCK_HISTORY,
  MOCK_TESTS,
  MOCK_USERS,
  DEPARTMENT,
  nextId,
} from "./mockData";

const AppStoreContext = createContext(null);

function matchId(a, b) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function AppStoreProvider({ children }) {
  const [users, setUsers] = useState(MOCK_USERS);
  const [student, setStudent] = useState(null); // active student session
  const [adminUser, setAdminUser] = useState(null); // active admin session
  const [isAdmin, setIsAdmin] = useState(false);

  const [timetable, setTimetable] = useState(MOCK_TIMETABLE);
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [tests, setTests] = useState(MOCK_TESTS);

  const findUserIndex = useCallback((id) => users.findIndex((u) => matchId(u.matricNumber, id)), [users]);

  // ---------- Student auth ----------
  const loginStudent = useCallback(
    (matricNumber, password) => {
      const found = users.find((u) => matchId(u.matricNumber, matricNumber) && u.password === password);
      if (!found) return { ok: false, error: "Invalid matric number or password." };
      if (!found.roles.includes("student")) {
        return { ok: false, error: "This account doesn't have student access." };
      }
      setStudent(found);
      return { ok: true };
    },
    [users]
  );

  const registerStudent = useCallback(
    (data) => {
      const idx = findUserIndex(data.matricNumber);
      if (idx > -1) {
        const existing = users[idx];
        if (existing.roles.includes("student")) {
          return { ok: false, error: "An account with this matric number already exists." };
        }
        if (existing.password !== data.password) {
          return {
            ok: false,
            error: "This ID is already registered (as admin) with a different password. Use that password to link student access.",
          };
        }
        const merged = { ...existing, ...data, department: DEPARTMENT, roles: [...existing.roles, "student"] };
        setUsers((prev) => prev.map((u, i) => (i === idx ? merged : u)));
        setStudent(merged);
        return { ok: true };
      }
      const newUser = { ...data, department: DEPARTMENT, title: "", roles: ["student"] };
      setUsers((prev) => [...prev, newUser]);
      setStudent(newUser);
      return { ok: true };
    },
    [users, findUserIndex]
  );

  const logoutStudent = useCallback(() => setStudent(null), []);

  // ---------- Admin auth ----------
  const loginAdmin = useCallback(
    (idNumber, password) => {
      const found = users.find((u) => matchId(u.matricNumber, idNumber) && u.password === password);
      if (!found) return { ok: false, error: "Invalid ID or password." };
      if (!found.roles.includes("admin")) {
        return { ok: false, error: "This account doesn't have admin access." };
      }
      setAdminUser(found);
      setIsAdmin(true);
      return { ok: true };
    },
    [users]
  );

  const registerAdmin = useCallback(
    (data) => {
      const idx = findUserIndex(data.matricNumber);
      if (idx > -1) {
        const existing = users[idx];
        if (existing.roles.includes("admin")) {
          return { ok: false, error: "An admin account with this ID already exists." };
        }
        if (existing.password !== data.password) {
          return {
            ok: false,
            error: "This ID is already registered (as student) with a different password. Use that password to link admin access.",
          };
        }
        const merged = { ...existing, ...data, roles: [...existing.roles, "admin"] };
        setUsers((prev) => prev.map((u, i) => (i === idx ? merged : u)));
        setAdminUser(merged);
        setIsAdmin(true);
        return { ok: true };
      }
      const newUser = { ...data, department: DEPARTMENT, level: "", semester: "", roles: ["admin"] };
      setUsers((prev) => [...prev, newUser]);
      setAdminUser(newUser);
      setIsAdmin(true);
      return { ok: true };
    },
    [users, findUserIndex]
  );

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    setAdminUser(null);
  }, []);

  // ---------- Timetable / history / tests ----------
  const updateLectureStatus = useCallback((day, id, status) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: prev[day].map((l) => (l.id === id ? { ...l, status } : l)),
    }));
  }, []);

  const completeLecture = useCallback((day, lecture, attachment) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: prev[day].filter((l) => l.id !== lecture.id),
    }));
    setHistory((prev) => [
      {
        id: nextId(),
        date: new Date().toISOString().slice(0, 10),
        courseCode: lecture.courseCode,
        courseTitle: lecture.courseTitle,
        lecturerName: lecture.lecturerName,
        venue: lecture.venue,
        startTime: lecture.startTime,
        endTime: lecture.endTime,
        attachment: attachment || null,
      },
      ...prev,
    ]);
  }, []);

  const addLecture = useCallback((day, lecture) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { ...lecture, id: nextId(), status: "Pending" }],
    }));
  }, []);

  const addTest = useCallback((test) => {
    setTests((prev) => [{ ...test, id: nextId() }, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      student,
      adminUser,
      isAdmin,
      timetable,
      history,
      tests,
      loginStudent,
      registerStudent,
      logoutStudent,
      loginAdmin,
      registerAdmin,
      logoutAdmin,
      updateLectureStatus,
      completeLecture,
      addLecture,
      addTest,
    }),
    [
      student,
      adminUser,
      isAdmin,
      timetable,
      history,
      tests,
      loginStudent,
      registerStudent,
      logoutStudent,
      loginAdmin,
      registerAdmin,
      logoutAdmin,
      updateLectureStatus,
      completeLecture,
      addLecture,
      addTest,
    ]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
