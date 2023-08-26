"use client";
import Navbar from '../Components/Navbar'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

const metadata = {
  title: 'Esp32 Controller',
  description: 'A simple web app to control an esp32 microcontroller',
  colorScheme: 'light only',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className='bg-white dark:bg-gray-950'>
      <head>
        <meta charSet="utf-8" />
        <title>{metadata.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />

      </head>
      <body className={inter.className}>
          <Navbar />
          {children}
      </body>
    </html>
  )
}
