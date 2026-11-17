import AddReview from "@/app/components/Admins/AddReview/AddReview";
import BreadcrumbLink from "@/app/Layout/Admin/BreadcrumbLink/BreadcrumbLink";


const AddReviewPage = () => {
  return (
    <div>
      <BreadcrumbLink
        items={[{ label: "Admins", href: "/admins" }, { label: "Add Review" }]}
      />
      <AddReview />
    </div>
  );
};

export default AddReviewPage;
