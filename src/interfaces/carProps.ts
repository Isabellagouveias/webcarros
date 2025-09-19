import type { CarImageProps } from "./carImageProps";

export interface CarProps {
  id: string;
  name: string;
  year: string;
  model?: string;
  description?: string;
  created?: string;
  whatsapp?: string;
  owner?: string;
  uid: string;
  price: string | number;
  city: string;
  km: string;
  images: CarImageProps[];
}
