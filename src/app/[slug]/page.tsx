import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getLinkPageBySlug } from '@/lib/api/linkPages';
import { getLinksByPageId } from '@/lib/api/links';
import { getLinkPageThemeConfig } from '@/lib/api/themes';
import { BlockBasedPublicPage } from '@/components/public/BlockBasedPublicPage';
import { EnhancedPublicLinkPage } from '@/components/public/EnhancedPublicLinkPage';
import type { LinkPage, Link } from '@/types';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await getLinkPageBySlug(slug);
  
  if (!response.success || !response.data) {
    return {
      title: 'Page Not Found - Lilylink',
      description: 'The requested link page could not be found.',
    };
  }

  const page = response.data;
  
  return {
    title: page.seo_title || `${page.title} - Lilylink`,
    description: page.seo_description || page.description || `Check out ${page.title} on Lilylink`,
    openGraph: {
      title: page.seo_title || page.title,
      description: page.seo_description || page.description || `Check out ${page.title} on Lilylink`,
      url: `https://lilylink.com/${page.slug}`,
      siteName: 'Lilylink',
      images: page.og_image_url ? [
        {
          url: page.og_image_url,
          width: 1200,
          height: 630,
          alt: page.title,
        }
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seo_title || page.title,
      description: page.seo_description || page.description || `Check out ${page.title} on Lilylink`,
      images: page.og_image_url ? [page.og_image_url] : [],
    },
    alternates: {
      canonical: `https://lilylink.com/${page.slug}`,
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  // Fetch the link page
  const { slug } = await params;
  const pageResponse = await getLinkPageBySlug(slug);
  
  if (!pageResponse.success || !pageResponse.data) {
    notFound();
  }

  const linkPage = pageResponse.data;

  // Fetch the links for this page
  const linksResponse = await getLinksByPageId(linkPage.id);
  const links = linksResponse.success && linksResponse.data ? linksResponse.data : [];

  // Fetch theme configuration to determine layout type
  const themeResponse = await getLinkPageThemeConfig(linkPage.id);
  const themeConfig = themeResponse.success && themeResponse.data ? themeResponse.data : null;

  // Use block-based layout if configured, otherwise fall back to enhanced layout
  const useBlockLayout = themeConfig?.layout?.type === 'blocks' && themeConfig.layout.blocks;

  if (useBlockLayout) {
    return <BlockBasedPublicPage linkPage={linkPage} links={links} themeConfig={themeConfig} />;
  } else {
    return <EnhancedPublicLinkPage linkPage={linkPage} links={links} themeConfig={themeConfig} />;
  }
} 