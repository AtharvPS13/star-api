const constellationImages = [
  '/images/constellations/WhatsApp Image 2025-11-30 at 21.45.00.jpeg',
  '/images/constellations/WhatsApp Image 2025-11-30 at 21.45.27.jpeg',
  '/images/constellations/WhatsApp Image 2025-11-30 at 21.47.35.jpeg',
  '/images/constellations/WhatsApp Image 2025-11-30 at 21.49.16.jpeg',
  '/images/constellations/WhatsApp Image 2025-11-30 at 21.50.01.jpeg',
  '/images/constellations/WhatsApp Image 2025-11-30 at 21.50.22.jpeg',
  '/images/constellations/WhatsApp Image 2025-11-30 at 21.50.41.jpeg',
  '/images/constellations/WhatsApp Image 2025-11-30 at 21.51.08.jpeg',
  '/images/constellations/WhatsApp Image 2025-11-30 at 21.51.08(1).jpeg',
  '/images/constellations/WhatsApp Image 2025-11-30 at 21.51.47.jpeg',
];

export function getConstellationImage(index) {
  if (index === undefined || index === null) {
    return constellationImages[0]; 
  }
  
  const imageIndex = index % constellationImages.length;
  return constellationImages[imageIndex];
}

