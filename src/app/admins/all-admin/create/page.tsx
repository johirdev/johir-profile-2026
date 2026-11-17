import { AdminCreate } from '@/app/components/Admins/create/AdminCreate'
import BreadcrumbLink from '@/app/Layout/Admin/BreadcrumbLink/BreadcrumbLink'

const AdminCreatePage = () => {
  return (
    <>
    <BreadcrumbLink items={[{ label: "Admins", href: "/admins" }, { label: "Create Admin" }]} />
   <AdminCreate/>
    </>
  )
}

export default AdminCreatePage