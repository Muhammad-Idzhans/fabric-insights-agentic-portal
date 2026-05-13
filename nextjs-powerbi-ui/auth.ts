import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER!,
            authorization: {
                params: {
                    scope: "openid profile email offline_access https://analysis.windows.net/powerbi/api/Report.Read.All",
                },
            },
        }),
    ],
    pages: {
        signIn: "/",
    },
    callbacks: {
        authorized({ auth, request }) {
            const isProtected = request.nextUrl.pathname.startsWith("/dashboard");
            if (isProtected && !auth) return false;
            return true;
        },
        async jwt({ token, account, profile }) {
            if (profile) {
                token.name = profile.name as string;
                token.email = (profile.email || profile.preferred_username || profile.upn) as string;
            }
            // On first sign-in, persist the access token
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.name = token.name as string;
                session.user.email = token.email as string;
            }
            session.accessToken = token.accessToken as string;
            return session;
        },
    },
});