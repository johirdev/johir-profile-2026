import AddBlog from "@/app/components/Admins/AddBlog/AddBlog";
import Contacts from "@/app/components/Admins/Contacts/Contacts";
import BreadcrumbLink from "@/app/Layout/Admin/BreadcrumbLink/BreadcrumbLink";


const AddBlogPage = () => {
  return (
    <div>
      <BreadcrumbLink
        items={[{ label: "Admins", href: "/admins" }, { label: "Contact List" }]}
      />
      <Contacts />
    </div>
  );
};

export default AddBlogPage;
