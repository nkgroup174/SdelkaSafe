import "next-auth";
import "next-auth/jwt";

type AppRole = "CUSTOMER" | "SUPPLIER" | "ADMIN";

declare module "next-auth" {
  interface User {
    id: string;
    role: AppRole;
  }
  interface Session {
    user: {
      id: string;
      role: AppRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
  }
}
