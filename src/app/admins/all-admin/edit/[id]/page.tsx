import { EditAdmin } from '@/app/components/Admins/AllAdmin/EditAdmin/EditAdmin'
import BreadcrumbLink from '@/app/Layout/Admin/BreadcrumbLink/BreadcrumbLink'
import React from 'react'

const EditAdminPage = () => {
  return (
    <div>

         <BreadcrumbLink items={[{ label: "Admins", href: "/admins" },{ label: "All Admins", href: "/admins/all-admin" }, { label: "Edit Admin" }]} />
          <EditAdmin/>
    </div>
  )
}

export default EditAdminPage