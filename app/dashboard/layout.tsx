import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | BookPage',
  description: 'Manage your property bookings, rooms, and settings.',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
