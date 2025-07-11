export interface Discount {
  amount: number
  percentage: number
}

export interface Product {
  id: number
  title: string
  srcUrl: string
  gallery: string[]
  price: number
  discount: Discount
  rating: number
  sizes: string[]
  colors: string[]
  description: string
  category: string
  inStock: boolean
}

export type ProductCategory = 'T-shirt' | 'Jeans' | 'Shirt' | 'Polo' | 'Shorts'
