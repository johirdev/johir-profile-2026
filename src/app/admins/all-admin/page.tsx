
import { AllAdmin } from '@/app/components/Admins/AllAdmin/AllAdmin'
import BreadcrumbLink from '@/app/Layout/Admin/BreadcrumbLink/BreadcrumbLink'

const AllAdminsPage = () => {
  return (
    <>
   <BreadcrumbLink items={[{ label: "Admins", href: "/admins" }, { label: "All Admin" }]} />
   <AllAdmin/>
   </>
  )
}

export default AllAdminsPage