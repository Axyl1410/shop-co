export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: number
  productId: number
  quantity: number
  size: string
  color: string
  price: number
  productTitle: string
  productImage: string
}

export interface Order {
  id: number
  userId: number
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  orderDate: string
  shippingAddress: {
    fullName: string
    address: string
    city: string
    postalCode: string
    phone: string
  }
  paymentMethod: 'credit_card' | 'paypal' | 'cash_on_delivery'
  trackingNumber?: string
  estimatedDelivery?: string
}
