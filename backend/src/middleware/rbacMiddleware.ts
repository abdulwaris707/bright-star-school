import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import store from "../services/store";

/**
 * Restricts endpoint to specific roles (e.g. ['admin'], ['admin', 'teacher'])
 */
export function requireRoles(allowedRoles: Array<"admin" | "teacher" | "student">) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: `Forbidden. Action restricted to ${allowedRoles.join(" or ")}.`,
      });
      return;
    }

    next();
  };
}

/**
 * Enforces that ONLY the designated Class Teacher In-Charge (or Admin) can mark or modify student attendance
 */
export function requireClassInchargeOrAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  // Admins always have oversight privileges
  if (req.user.role === "admin") {
    next();
    return;
  }

  if (req.user.role !== "teacher") {
    res.status(403).json({ message: "Forbidden. Student cannot modify attendance." });
    return;
  }

  // Extract classId from params, body, or records
  let classId: number | undefined;
  if (req.params.classId) {
    const raw = req.params.classId;
    classId = parseInt(Array.isArray(raw) ? raw[0] : (raw as string), 10);
  } else if (req.body.classId) {
    classId = parseInt(req.body.classId, 10);
  } else if (req.query.classId) {
    classId = parseInt(req.query.classId as string, 10);
  } else if (Array.isArray(req.body.records) && req.body.records.length > 0) {
    classId = parseInt(req.body.records[0].classId, 10);
  }

  if (!classId) {
    res.status(400).json({ message: "Class ID is required to verify in-charge authorization." });
    return;
  }

  const isIncharge = store.isTeacherClassIncharge(req.user.id, classId);
  if (!isIncharge) {
    const classRecord = store.getClass(classId);
    res.status(403).json({
      message: `Access denied. Only the designated Class Teacher In-Charge (${classRecord?.classTeacherName || "Assigned Faculty"}) can record attendance for ${classRecord?.name || "this class"}.`,
      classInchargeName: classRecord?.classTeacherName,
    });
    return;
  }

  next();
}

/**
 * Enforces that a teacher can only assign or modify homework for classes & subjects mapped to them
 */
export function requireAssignedTeacherOrAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  if (req.user.role === "admin") {
    next();
    return;
  }

  if (req.user.role !== "teacher") {
    res.status(403).json({ message: "Forbidden. Only teachers can assign homework." });
    return;
  }

  const classId = req.body.classId ? parseInt(req.body.classId, 10) : undefined;
  const subjectId = req.body.subjectId ? parseInt(req.body.subjectId, 10) : undefined;

  if (classId && subjectId) {
    const isAssigned = store.isTeacherAssignedToClassSubject(req.user.id, classId, subjectId);
    if (!isAssigned) {
      res.status(403).json({
        message: "Forbidden. You are not assigned to teach this subject in this class.",
      });
      return;
    }
  }

  next();
}
