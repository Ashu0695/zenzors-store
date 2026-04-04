export interface Product {
  id: string; name: string; slug: string; description: string;
  price: number; compare_price: number | null; images: string[];
  category_id: string; category?: Category; variants?: ProductVariant[];
  reviews?: Review[]; stock: number; is_active: boolean; is_featured: boolean;
  tags: string[]; sku: string; created_at: string; rating_avg?: number; rating_count?: number;
}
export interface Category {
  id: string; name: string; slug: string; image: string | null;
  description: string | null; parent_id: string | null; product_count?: number;
}
export interface ProductVariant {
  id: string; product_id: string; name: string; value: string;
  price_modifier: number; stock: number;
}
export interface CartItem {
  id: string; product: Product; quantity: number; variant?: ProductVariant;
}
export interface Address {
  name: string; phone: string; line1: string; line2?: string;
  city: string; state: string; pincode: string;
}
export interface Order {
  id: string; user_id: string; items: OrderItem[]; subtotal: number;
  discount: number; shipping: number; total: number;
  status: 'pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled';
  payment_status: 'pending'|'paid'|'failed'|'refunded';
  payment_id: string|null; coupon_code: string|null;
  shipping_address: Address; created_at: string; updated_at: string;
}
export interface OrderItem {
  id: string; order_id: string; product_id: string; product: Product;
  quantity: number; price: number; variant?: string;
}
export interface Review {
  id: string; product_id: string; user_id: string;
  user?: { full_name: string }; rating: number; comment: string; created_at: string;
}
export interface Coupon {
  id: string; code: string; type: 'percentage'|'fixed'; value: number;
  min_order: number; max_uses: number; used_count: number; is_active: boolean; expires_at: string|null;
}
export interface UserProfile {
  id: string; email: string; full_name: string; phone: string|null;
  avatar_url: string|null; addresses: Address[]; created_at: string;
}
