"use client";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import './globals.css'
import { dark } from '@clerk/themes'

export default function RootLayout({children,}) {
  return (
    <ClerkProvider  
      appearance={{
      baseTheme: dark,
    }}>
      <html lang="en" webcrx="">
        <body>
          
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}