import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isAllowed, isAdmin } from "./roles";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return isAllowed(user.email);
    },
    async session({ session }) {
      if (session.user?.email) {
        (session.user as any).isAdmin = isAdmin(session.user.email);
      }
      return session;
    },
  },
  pages: {
    error: "/auth-error",
  },
};
