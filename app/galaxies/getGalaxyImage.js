export function getGalaxyImage(type) {
  if (!type) return '/images/galaxies/stardust.jpeg'; // default image
  
  // Normalize the type to match image filenames
  const normalizedType = type.toLowerCase().trim();
  
  // Map galaxy types to image paths
  const imageMap = {
    'spiral': '/images/galaxies/spiral.jpeg',
    'barred spiral': '/images/galaxies/barredspiral.jpeg',
    'barredspiral': '/images/galaxies/barredspiral.jpeg',
    'barred spiral galaxy': '/images/galaxies/barredspiral.jpeg',
    'elliptical': '/images/galaxies/elliptical.jpeg',
    'elliptical cluster': '/images/galaxies/ellipticalcluster.jpeg',
    'ellipticalcluster': '/images/galaxies/ellipticalcluster.jpeg',
    'irregular': '/images/galaxies/irregular.jpeg',
    'ring': '/images/galaxies/ring.jpeg',
    'ring galaxy': '/images/galaxies/ring.jpeg',
  };
  
  // Check for exact match first
  if (imageMap[normalizedType]) {
    return imageMap[normalizedType];
  }
  
  // Check for partial matches
  if (normalizedType.includes('spiral') && normalizedType.includes('barred')) {
    return '/images/galaxies/barredspiral.jpeg';
  }
  if (normalizedType.includes('spiral')) {
    return '/images/galaxies/spiral.jpeg';
  }
  if (normalizedType.includes('elliptical') && normalizedType.includes('cluster')) {
    return '/images/galaxies/ellipticalcluster.jpeg';
  }
  if (normalizedType.includes('elliptical')) {
    return '/images/galaxies/elliptical.jpeg';
  }
  if (normalizedType.includes('irregular')) {
    return '/images/galaxies/irregular.jpeg';
  }
  if (normalizedType.includes('ring')) {
    return '/images/galaxies/ring.jpeg';
  }
  
  // Default fallback
  return '/images/galaxies/stardust.jpeg';
}

