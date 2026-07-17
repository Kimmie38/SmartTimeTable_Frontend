// Mock data layer for the Faculty of Computing Timetable App (Computer Science dept only).
// Lectures are organized by weekday so Today/Schedule screens can filter by the real
// current day. In a real backend this would come from what the admin uploads.

export const DEPARTMENT = "Computer Science";
export const LEVELS = ["100", "200", "300", "400"];
export const SEMESTERS = ["1st Semester", "2nd Semester"];

let idCounter = 1000;
export function nextId() {
  idCounter += 1;
  return String(idCounter);
}

// Full Monday - Friday timetable. "status" is set by the admin (Ongoing / Pending / Cancelled).
export const MOCK_TIMETABLE = {
  Monday: [
    {
      id: "1",
      courseCode: "CSC101",
      courseTitle: "Introduction to Computer Science",
      lecturerName: "Dr. Emily Carter",
      venue: "Auditorium A",
      startTime: "08:00 AM",
      endTime: "10:00 AM",
      status: "Pending",
    },
    {
      id: "2",
      courseCode: "GST111",
      courseTitle: "Communication in English",
      lecturerName: "Mrs. Sarah Benson",
      venue: "Hall 4",
      startTime: "11:00 AM",
      endTime: "12:00 PM",
      status: "Pending",
    },
  ],
  Tuesday: [
    {
      id: "3",
      courseCode: "CSC103",
      courseTitle: "Discrete Structures",
      lecturerName: "Prof. Mark Johnson",
      venue: "Lab 2",
      startTime: "09:00 AM",
      endTime: "11:00 AM",
      status: "Pending",
    },
    {
      id: "4",
      courseCode: "MAT101",
      courseTitle: "General Mathematics I",
      lecturerName: "Dr. Felix Obi",
      venue: "Hall 2",
      startTime: "01:00 PM",
      endTime: "03:00 PM",
      status: "Pending",
    },
  ],
  Wednesday: [
    {
      id: "5",
      courseCode: "CSC101",
      courseTitle: "Introduction to Computer Science",
      lecturerName: "Dr. Emily Carter",
      venue: "Auditorium A",
      startTime: "08:00 AM",
      endTime: "10:00 AM",
      status: "Ongoing",
    },
    {
      id: "6",
      courseCode: "PHY101",
      courseTitle: "General Physics I",
      lecturerName: "Dr. Ngozi Eze",
      venue: "Lab 1",
      startTime: "10:30 AM",
      endTime: "12:30 PM",
      status: "Pending",
    },
    {
      id: "7",
      courseCode: "CSC102",
      courseTitle: "Logic and Digital Circuit",
      lecturerName: "Engr. David Smith",
      venue: "Hall 1",
      startTime: "02:00 PM",
      endTime: "04:00 PM",
      status: "Cancelled",
    },
  ],
  Thursday: [
    {
      id: "8",
      courseCode: "GST111",
      courseTitle: "Communication in English",
      lecturerName: "Mrs. Sarah Benson",
      venue: "Hall 4",
      startTime: "09:00 AM",
      endTime: "10:00 AM",
      status: "Pending",
    },
    {
      id: "9",
      courseCode: "CSC103",
      courseTitle: "Discrete Structures",
      lecturerName: "Prof. Mark Johnson",
      venue: "Lab 2",
      startTime: "11:00 AM",
      endTime: "01:00 PM",
      status: "Pending",
    },
  ],
  Friday: [
    {
      id: "10",
      courseCode: "CSC104",
      courseTitle: "Intro to Problem Solving",
      lecturerName: "Dr. Amara Chukwu",
      venue: "Lab 3",
      startTime: "08:00 AM",
      endTime: "10:00 AM",
      status: "Pending",
    },
    {
      id: "11",
      courseCode: "ENT101",
      courseTitle: "Entrepreneurship Studies",
      lecturerName: "Mr. Tunde Bakare",
      venue: "Hall 3",
      startTime: "12:00 PM",
      endTime: "01:00 PM",
      status: "Pending",
    },
  ],
};

// Records the admin has marked "Completed" — includes an optional attachment (PDF/image)
// the admin uploaded, e.g. lecture notes or attendance sheet.
export const MOCK_HISTORY = [
  {
    id: "101",
    date: "2026-07-10",
    courseCode: "MAT101",
    courseTitle: "General Mathematics I",
    lecturerName: "Dr. Felix Obi",
    venue: "Hall 2",
    startTime: "09:00 AM",
    endTime: "11:00 AM",
    attachment: { type: "pdf", name: "MAT101_Notes_Wk9.pdf" },
  },
  {
    id: "102",
    date: "2026-07-09",
    courseCode: "CSC102",
    courseTitle: "Logic and Digital Circuit",
    lecturerName: "Engr. David Smith",
    venue: "Hall 1",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    attachment: { type: "image", name: "attendance_sheet.jpg" },
  },
  {
    id: "103",
    date: "2026-07-08",
    courseCode: "CSC101",
    courseTitle: "Introduction to Computer Science",
    lecturerName: "Dr. Emily Carter",
    venue: "Auditorium A",
    startTime: "08:00 AM",
    endTime: "10:00 AM",
    attachment: null,
  },
];

// Upcoming tests / exams posted by the admin.
export const MOCK_TESTS = [
  {
    id: "201",
    courseCode: "CSC101",
    courseTitle: "Introduction to Computer Science",
    type: "Test",
    date: "2026-07-17",
    startTime: "09:00 AM",
    venue: "Auditorium A",
    notes: "Covers chapters 1 - 4. Bring your student ID.",
  },
  {
    id: "202",
    courseCode: "MAT101",
    courseTitle: "General Mathematics I",
    type: "Exam",
    date: "2026-07-24",
    startTime: "10:00 AM",
    venue: "Main Exam Hall",
    notes: "First semester examination. 2 hours duration.",
  },
  {
    id: "203",
    courseCode: "GST111",
    courseTitle: "Communication in English",
    type: "Test",
    date: "2026-07-15",
    startTime: "11:00 AM",
    venue: "Hall 4",
    notes: "Continuous assessment 2 — essay format.",
  },
];

// Registered accounts (mock "backend"). A single account can hold one or more
// roles ("student", "admin") — matching a backend where one user may be both
// a student and a course administrator. Sign-in uses matric/staff ID + password.
export const MOCK_USERS = [
  {
    matricNumber: "U12/CSC/1001",
    password: "password123",
    fullName: "John Doe",
    email: "john.doe@university.edu",
    department: DEPARTMENT,
    level: "100",
    semester: "1st Semester",
    title: "",
    roles: ["student", "admin"], // dual-role demo account
  },
  {
    matricNumber: "ADM/CSC/001",
    password: "admin123",
    fullName: "Dr. Ada Obiora",
    email: "ada.obiora@fct.edu",
    department: DEPARTMENT,
    level: "",
    semester: "",
    title: "Course Coordinator",
    roles: ["admin"], // admin-only demo account
  },
];

