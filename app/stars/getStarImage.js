export function getStarImage(starType) {
  if (!starType) return '/images/star/mainsequencestar.jpeg'; // default image
  
  // Normalize the type to match image filenames
  const normalizedType = starType.toLowerCase().trim();
  
  // Map star types to image paths
  const imageMap = {
    'main sequence': '/images/star/mainsequencestar.jpeg',
    'mainsequence': '/images/star/mainsequencestar.jpeg',
    'main sequence star': '/images/star/mainsequencestar.jpeg',
    'blue giant': '/images/star/bluegiant.jpeg',
    'bluegiant': '/images/star/bluegiant.jpeg',
    'blue giant star': '/images/star/bluegiant.jpeg',
    'blue supergiant': '/images/star/bluesupergiant.jpeg',
    'bluesupergiant': '/images/star/bluesupergiant.jpeg',
    'blue supergiant star': '/images/star/bluesupergiant.jpeg',
    'giant': '/images/star/giant.jpeg',
    'giant star': '/images/star/giant.jpeg',
    'binary giant': '/images/star/binarygiant.jpeg',
    'binarygiant': '/images/star/binarygiant.jpeg',
    'binary giant star': '/images/star/binarygiant.jpeg',
    'luminous blue variable': '/images/star/luminousbluevariable.jpeg',
    'luminousbluevariable': '/images/star/luminousbluevariable.jpeg',
    'lbv': '/images/star/luminousbluevariable.jpeg',
  };
  
  // Check for exact match first
  if (imageMap[normalizedType]) {
    return imageMap[normalizedType];
  }
  
  // Check for partial matches
  if (normalizedType.includes('main sequence') || normalizedType.includes('mainsequence')) {
    return '/images/star/mainsequencestar.jpeg';
  }
  if (normalizedType.includes('blue') && normalizedType.includes('supergiant')) {
    return '/images/star/bluesupergiant.jpeg';
  }
  if (normalizedType.includes('blue') && normalizedType.includes('giant')) {
    return '/images/star/bluegiant.jpeg';
  }
  if (normalizedType.includes('binary') && normalizedType.includes('giant')) {
    return '/images/star/binarygiant.jpeg';
  }
  if (normalizedType.includes('luminous') && normalizedType.includes('blue')) {
    return '/images/star/luminousbluevariable.jpeg';
  }
  if (normalizedType.includes('giant') && !normalizedType.includes('blue') && !normalizedType.includes('binary')) {
    return '/images/star/giant.jpeg';
  }
  
  // Default fallback
  return '/images/star/mainsequencestar.jpeg';
}

