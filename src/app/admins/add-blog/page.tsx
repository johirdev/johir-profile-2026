import AddBlog from "@/app/components/Admins/AddBlog/AddBlog";
import BreadcrumbLink from "@/app/Layout/Admin/BreadcrumbLink/BreadcrumbLink";


const AddBlogPage = () => {
  return (
    <div>
      <BreadcrumbLink
        items={[{ label: "Admins", href: "/admins" }, { label: "Add Blog" }]}
      />
      <AddBlog />
    </div>
  );
};

export default AddBlogPage;
