import { RequestHandler } from "express";
import { PrismaClient, Role, User } from "@prisma/client";
import { verifyJwt } from "../utils/jwt";

const prisma = new PrismaClient();


export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate: RequestHandler = async (
  req: any,
  res,
  next
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication invalid: No token provided." });
    return;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyJwt(token);

  if (!decoded) {
    res.status(401).json({ message: "Authentication invalid: Invalid token." });
    return;
  }

  const userExists = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });

  if (!userExists) {
    res.status(401).json({ message: "Authentication invalid: User not found." });
    return;
  }

  (req as AuthenticatedRequest).user = userExists;
  next();
};


export const authorize = (allowedRoles: Role[]): RequestHandler => {
  return (req: any, res, next) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user?.role) {
      res.status(403).json({ message: "Forbidden: Role not available." });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ message: "Forbidden: Access denied." });
      return;
    }

    next();
  };
};
