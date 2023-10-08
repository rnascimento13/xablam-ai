import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
// import DiscordProvider from "next-auth/providers/discord";
// import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
// import InstagramProvider from "next-auth/providers/instagram";
// import CredentialsProvider from 'next-auth/providers/credentials';

// const scopes = ['identify'].join(' ')

export const authOptions: NextAuthOptions = {
// session: { strategy: "jwt" },
// secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    // DiscordProvider({
    //   clientId: process.env.DISCORD_CLIENT_ID ?? "",
    //   clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    //   // authorization: {params: {scope: scopes}},
    //   // checks: ["none"], // solve error 'State cookie was missing.'
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
    // }),
    // InstagramProvider({
    //   clientId: process.env.INSTAGRAM_CLIENT_ID ?? "",
    //   clientSecret: process.env.INSTAGRAM_CLIENT_SECRET ?? "",
    // }),
  //   CredentialsProvider({
  //     name: "Credentials",
  //     credentials: {
  //         username: {
  //             label: "Username:",
  //             type: "text",
  //             placeholder: "your-cool-username"
  //         },
  //         password: {
  //             label: "Password:",
  //             type: "password",
  //             placeholder: "your-awesome-password"
  //         }
  //     },
  //     async authorize(credentials) {
  //         // This is where you need to retrieve user data 
  //         // to verify with credentials
  //         // Docs: https://next-auth.js.org/configuration/providers/credentials
  //         const user = { id: "42", name: "user", password: "user1" }

  //         if (credentials?.username === user.name && credentials?.password === user.password) {
  //             return user
  //         } else {
  //             return null
  //         }
  //     }
  // })
  ],
  
};
