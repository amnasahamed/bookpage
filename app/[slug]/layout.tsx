import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Property - BookPage',
  description: 'Book your stay on BookPage',
}

export default function PropertyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  )
}
