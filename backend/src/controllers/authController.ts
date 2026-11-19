import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";
import { AuthRequest } from "../middleware/authMiddleware";
import store from "../services/store";

// Known demo credentials and flexible resolver
const DEMO_USERS: Record<string, { role: "admin" | "teacher" | "student"; pass: string; fullName: string; id: number }> = {
  admin: { role: "admin", pass: "admin123", fullName: "Prof. Tariq Mehmood (Principal)", id: 1 },
  // Teacher 1: Sir Tariq Aziz (Class Teacher In-Charge for Class 10 - Blue)
  teacher: { role: "teacher", pass: "teacher123", fullName: "Sir Tariq Aziz", id: 1 },
  tariq: { role: "teacher", pass: "teacher123", fullName: "Sir Tariq Aziz", id: 1 },
  "tch-001": { role: "teacher", pass: "teacher123", fullName: "Sir Tariq Aziz", id: 1 },
  // Teacher 2: Madam Farzana Kausar (Class Teacher In-Charge for Class 10 - Green, regular teacher elsewhere)
  teacher2: { role: "teacher", pass: "teacher123", fullName: "Madam Farzana Kausar", id: 2 },
  farzana: { role: "teacher", pass: "teacher123", fullName: "Madam Farzana Kausar", id: 2 },
  "tch-002": { role: "teacher", pass: "teacher123", fullName: "Madam Farzana Kausar", id: 2 },
  // Teacher 3: Sir Usman Ali
  teacher3: { role: "teacher", pass: "teacher123", fullName: "Sir Usman Ali", id: 3 },
  usman: { role: "teacher", pass: "teacher123", fullName: "Sir Usman Ali", id: 3 },
  "tch-003": { role: "teacher", pass: "teacher123", fullName: "Sir Usman Ali", id: 3 },
  // Student: Muhammad Hamza
  student: { role: "student", pass: "student123", fullName: "Muhammad Hamza", id: 1 },
};

export function login(req: Request, res: Response): void {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    res.status(400).json({ message: "Username, password, and role are required." });
    return;
  }

  const normalizedUser = username.trim().toLowerCase();
  let user = DEMO_USERS[normalizedUser];

  // Also check if matches any dynamic teacher record in store
  if (!user && role === "teacher") {
    const teacherMatch = store.getTeachers().find(
      (t) => t.employeeId.toLowerCase() === normalizedUser || t.email.toLowerCase() === normalizedUser
    );
    if (teacherMatch && password === "teacher123") {
      user = {
        role: "teacher",
        pass: "teacher123",
        fullName: teacherMatch.fullName,
        id: teacherMatch.id,
      };
    }
  }

  if (!user || user.pass !== password || user.role !== role.toLowerCase()) {
    res.status(401).json({ message: "Invalid username, password, or role." });
    return;
  }

  const tokenPayload = {
    id: user.id,
    username,
    role: user.role,
    fullName: user.fullName,
  };

  const token = jwt.sign(tokenPayload, env.JWT_SECRET, { expiresIn: "7d" });

  res.status(200).json({
    message: "Login successful",
    token,
    user: tokenPayload,
  });
}

export function getCurrentUser(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  res.status(200).json({ user: req.user });
}
