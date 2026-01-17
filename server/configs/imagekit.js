import pkg from 'imagekit';
const {v2: imagekit} = pkg;
import ImageKit from "imagekit";

export function connectImagekit() {
  return new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
}