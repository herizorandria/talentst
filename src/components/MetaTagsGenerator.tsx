import React from 'react';
import { ShortenedUrl } from '@/types/url';

interface MetaTagsGeneratorProps {
  url: ShortenedUrl;
  shortUrl: string;
}

const MetaTagsGenerator = ({ url, shortUrl }: MetaTagsGeneratorProps) => {
  // Générer des meta tags pour tromper les bots de preview
  const generateSafePreview = () => {
    const domain = new URL(url.originalUrl).hostname;
    const title = url.description || `Lien vers ${domain}`;
    const description = `Cliquez pour accéder au contenu sur ${domain}`;
    
    return {
      title,
      description,
      image: 'https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=Lien+Sécurisé',
      url: shortUrl
    };
  };

  const preview = generateSafePreview();

  React.useEffect(() => {
    // Mettre à jour les meta tags dynamiquement
    document.title = preview.title;
    
    // Meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', preview.description);

    // Open Graph tags
    const ogTags = [
      { property: 'og:title', content: preview.title },
      { property: 'og:description', content: preview.description },
      { property: 'og:image', content: preview.image },
      { property: 'og:url', content: preview.url },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'ShortLink Pro' }
    ];

    ogTags.forEach(tag => {
      let element = document.querySelector(`meta[property="${tag.property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', tag.property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });

    // Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: preview.title },
      { name: 'twitter:description', content: preview.description },
      { name: 'twitter:image', content: preview.image }
    ];

    twitterTags.forEach(tag => {
      let element = document.querySelector(`meta[name="${tag.name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', tag.name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });

  }, [preview]);

  return null; // Ce composant ne rend rien visuellement
};

export default MetaTagsGenerator;