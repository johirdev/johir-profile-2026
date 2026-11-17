import AddPortfolio from "@/app/components/Admins/addPortfolio/addPortfolio";
import BreadcrumbLink from "@/app/Layout/Admin/BreadcrumbLink/BreadcrumbLink";


const AddPortfolioPage = () => {
  return (
    <div>
      <BreadcrumbLink
        items={[{ label: "Admins", href: "/admins" }, { label: "Add Portfolio" }]}
      />
      <AddPortfolio />
    </div>
  );
};

export default AddPortfolioPage;
