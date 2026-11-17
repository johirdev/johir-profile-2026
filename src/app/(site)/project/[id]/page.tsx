import type { Metadata } from "next";
import ProjectDetails from "@/app/components/Clients/Home/Projects/ProjectDetails";
import { getProjectById, clampDescription } from "@/lib/content";
import {
  AUTHOR_NAME,
  DEFAULT_DESCRIPTION,
  OG_IMAGE,
  PERSON_ID,
  SITE_URL,
  jsonLd,
} from "@/lib/seo";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return {
      title: "Projects",
      description: DEFAULT_DESCRIPTION,
      alternates: { canonical: `/project/${id}` },
    };
  }

  const description = clampDescription(
    project.description || DEFAULT_DESCRIPTION
  );
  const image = project.image || OG_IMAGE;

  return {
    title: project.title,
    description,
    alternates: { canonical: `/project/${project.id}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/project/${project.id}`,
      title: project.title,
      description,
      images: [{ url: image, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
      images: [image],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);

  // CreativeWork rather than SoftwareApplication: these are delivered client
  // projects, not downloadable apps, and SoftwareApplication requires offer
  // and rating fields we do not have.
  const projectSchema = project && {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${SITE_URL}/project/${project.id}#project`,
    name: project.title,
    description: clampDescription(project.description),
    image: project.image ? [project.image] : [OG_IMAGE],
    dateCreated: project.createdAt.toISOString(),
    dateModified: project.updatedAt.toISOString(),
    creator: { "@id": PERSON_ID },
    author: { "@id": PERSON_ID },
    url: `${SITE_URL}/project/${project.id}`,
    inLanguage: "en-US",
    keywords: ["web development", "software engineering", AUTHOR_NAME],
  };

  return (
    <div>
      {projectSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(projectSchema) }}
        />
      )}
      <ProjectDetails />
    </div>
  );
}
