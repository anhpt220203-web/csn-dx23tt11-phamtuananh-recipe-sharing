import { betterAuth } from "better-auth";
import type { User } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { prisma } from "./prisma";

const accountManagementAcl = createAccessControl({
  user: ["create", "list", "set-role", "ban", "impersonate", "impersonate-admins", "delete", "set-password", "set-email", "get", "update"],
  session: ["list", "revoke", "delete"],
} as const);

const restrictedUserRole = accountManagementAcl.newRole({ user: [], session: [] });
const restrictedAdminRole = accountManagementAcl.newRole({ user: [], session: [] });

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user: User) => ({
          data: { ...user, email: user.email.trim().toLowerCase(), role: "user" },
        }),
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      ac: accountManagementAcl,
      roles: { user: restrictedUserRole, admin: restrictedAdminRole },
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET!,
});
