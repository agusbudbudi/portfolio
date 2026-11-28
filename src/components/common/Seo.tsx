import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULT_OG_IMAGE, SITE_URL } from '../../lib/pageSeo';

interface SeoProps {
  title: string;
  description: string;
  /** Path starting with "/", e.g. "/portfolio" */
  path: string;
  image?: string;
  /** og:/twitter: copy for link previews; falls back to title/description. */
  shareTitle?: string;
  shareDescription?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const Seo: React.FC<SeoProps> = ({
  title, description, path, image = DEFAULT_OG_IMAGE, shareTitle, shareDescription, noindex = false, jsonLd,
}) => {
  const url = `${SITE_URL}${path}`;
  const ogTitle = shareTitle ?? title;
  const ogDescription = shareDescription ?? description;
  const jsonLdList = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  // index.html ships the home page's title/description/OG tags (marked
  // data-static-seo) for non-JS clients. React 19 hoists ours next to them
  // instead of replacing them, so drop the static set once a page sets its own;
  // otherwise crawlers that render JS see two descriptions and read the home one.
  useEffect(() => {
    document.querySelectorAll('[data-static-seo]').forEach((el) => el.remove());
  }, []);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="id_ID" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={image} />

      {jsonLdList.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
