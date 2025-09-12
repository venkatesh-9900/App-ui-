// Using local images from the image-generation folder
const LOCAL_IMAGES = [
  '/assets/images/image-generation/image-generation1.jpg',
  '/assets/images/image-generation/image-generation2.jpg',
  '/assets/images/image-generation/image-generation3.webp'
];

export const getRandomImage = () => {
  const randomId = LOCAL_IMAGES[Math.floor(Math.random() * LOCAL_IMAGES.length)];
  return randomId;
};