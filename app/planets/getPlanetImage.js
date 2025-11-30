export function getPlanetImage(planetType) {
  if (!planetType) return '/images/planets/placeholderimage.jpeg'; // default image
  
  // Normalize the type to match image filenames
  const normalizedType = planetType.toLowerCase().trim();
  
  // Map planet types to image paths
  const imageMap = {
    'gas giant': '/images/planets/gasgiant.jpeg',
    'gasgiant': '/images/planets/gasgiant.jpeg',
    'gas giant planet': '/images/planets/gasgiant.jpeg',
    'super earth': '/images/planets/superearth.jpeg',
    'superearth': '/images/planets/superearth.jpeg',
    'super earth planet': '/images/planets/superearth.jpeg',
    'terrestrial': '/images/planets/terrestrialplanet.jpeg',
    'terrestrial planet': '/images/planets/terrestrialplanet.jpeg',
    'terrestrialplanet': '/images/planets/terrestrialplanet.jpeg',
    'rocky planet': '/images/planets/terrestrialplanet.jpeg',
    'unconfirmed exoplanet': '/images/planets/unconfirmedexoplanet.jpeg',
    'unconfirmedexoplanet': '/images/planets/unconfirmedexoplanet.jpeg',
  };
  
  // Check for exact match first
  if (imageMap[normalizedType]) {
    return imageMap[normalizedType];
  }
  
  // Check for partial matches
  if (normalizedType.includes('gas') && normalizedType.includes('giant')) {
    return '/images/planets/gasgiant.jpeg';
  }
  if (normalizedType.includes('super') && normalizedType.includes('earth')) {
    return '/images/planets/superearth.jpeg';
  }
  if (normalizedType.includes('terrestrial') || normalizedType.includes('rocky')) {
    return '/images/planets/terrestrialplanet.jpeg';
  }
  if (normalizedType.includes('unconfirmed') || normalizedType.includes('exoplanet')) {
    return '/images/planets/unconfirmedexoplanet.jpeg';
  }
  
  // Default fallback
  return '/images/planets/placeholderimage.jpeg';
}

