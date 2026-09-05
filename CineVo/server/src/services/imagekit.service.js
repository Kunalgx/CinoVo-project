import ImageKit from "imagekit";

let imagekit;

function getImageKit() {
  if (imagekit) return imagekit;
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    return null;
  }
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
  return imagekit;
}

export function imageKitConfig() {
  const client = getImageKit();
  if (!client) return null;
  return {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    ...client.getAuthenticationParameters(),
  };
}

export function isImageKitUrl(value) {
  if (!value || !process.env.IMAGEKIT_URL_ENDPOINT) return false;
  try {
    return new URL(value).host === new URL(process.env.IMAGEKIT_URL_ENDPOINT).host;
  } catch {
    return false;
  }
}