import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
// session: { strategy: "jwt" },
// secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    
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
