import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER!,
        }),
    ],
    pages: {
        signIn: "/", // Use our custom login page instead of default NextAuth page
    },
    callbacks: {
        authorized({ auth, request }) {
            // If trying to access /dashboard without a session, deny access
            // The middleware will redirect them to pages.signIn (i.e. "/")
            const isProtected = request.nextUrl.pathname.startsWith("/dashboard");
            if (isProtected && !auth) return false;
            return true;
        },
        async jwt({ token, profile }) {
            // On first sign-in, profile contains the Entra ID user info
            // We persist name and email into the JWT token
            // Entra ID often uses preferred_username or upn instead of email
            if (profile) {
                token.name = profile.name as string;
                token.email = (profile.email || profile.preferred_username || profile.upn) as string;
            }
            return token;
        },
        async session({ session, token }) {
            // Pass the name and email from JWT into the session
            // so the client (dashboard page) can access them
            if (session.user) {
                session.user.name = token.name as string;
                session.user.email = token.email as string;
            }
            return session;
        },
    },
});