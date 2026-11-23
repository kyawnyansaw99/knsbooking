import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { photoSrcSet, photoUrl } from '../../data/photos.js';

/**
 * Responsive, lazy-loaded photo with a branded fallback if the image fails.
 * `photo` is an entry from data/photos.js ({ id, alt, credit }).
 */
export default function Photo({ photo, sizes = '(min-width: 1024px) 33vw, 100vw', eager = false, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (!photo || failed) {
    return (
      <div
        className={`grid place-items-center bg-linear-to-br from-ink-700 via-ink-800 to-ink-950 text-ink-300 ${className}`}
        role="img"
        aria-label={photo?.alt ?? 'Photo unavailable'}
      >
        <ImageOff className="size-6 opacity-60" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={photoUrl(photo.id)}
      srcSet={photoSrcSet(photo.id)}
      sizes={sizes}
      alt={photo.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`bg-sand-200 object-cover ${className}`}
    />
  );
}
