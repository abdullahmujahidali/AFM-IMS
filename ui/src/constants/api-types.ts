export interface ProductTypes {
  id: string;
  name: string;
  price: number;
  product_types: string;
  dimensions: string;
  stock_quantity: number;
  size: string;
  description: string;
}

export interface CustomerTypes {
  id: string;
  name: string;
  balance: number;
  phone_number: string;
}

export interface SalesTypes {
  id: string;
  comments: string;
  customer: CustomerTypes;
  phone_number: string;
  products: ProductTypes[];
  total_amount: string;
  amount_paid: number;
  created_at: string;
}

export interface UserType {
  id: string;
  first_name: string;
  phone_number: string;
  email: string;
}

export interface CompanyType {
  id: string;
  name: string;
  slug: string;
  status: boolean;
  owner: UserType;
}

export interface MeType {
  id: string;
  first_name: string;
  phone_number: string;
  email: string;
  company: CompanyType;
}
