export interface Order {
    id: string;
    orderNumber: string;
    userId: string; // Changed back to string to match data.json
    status: string; // e.g., 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;
    shippingAddressId: number;
    billingAddressId: number;
    paymentMethod: string; // e.g., 'credit_card', 'paypal'
    paymentStatus: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: number;
    orderId: string; // Changed back to string to match data.json
    productVariantId: number;
    productName: string;
    productSku: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}