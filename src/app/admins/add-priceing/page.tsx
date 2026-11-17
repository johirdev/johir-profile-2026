import AddPriceing from "@/app/components/Admins/AddPriceing/AddPriceing";
import BreadcrumbLink from "@/app/Layout/Admin/BreadcrumbLink/BreadcrumbLink";


const AddPriceingPage = () => {
  return (
    <div>
      <BreadcrumbLink
        items={[{ label: "Admins", href: "/admins" }, { label: "Add Pricing" }]}
      />
      <AddPriceing />
    </div>
  );
};

export default AddPriceingPage;
