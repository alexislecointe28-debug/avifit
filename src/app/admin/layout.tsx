import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 md:p-8 pt-20 md:pt-8">{children}</main>
    </div>
  )
}
