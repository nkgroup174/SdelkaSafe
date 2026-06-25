import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/** Текущая сессия на сервере (RSC, route handlers). */
export function getSession() {
  return getServerSession(authOptions);
}
