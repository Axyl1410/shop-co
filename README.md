# Shop-Co - E-commerce Admin Panel

## Overview

Shop-Co is a modern e-commerce application built with Vue 3, TypeScript, and Tailwind CSS. This project includes a comprehensive admin panel for managing products, categories, and user data.

## Features

### Product Management

- **Create Products**: Add new products with detailed information including images, pricing, and variants
- **Edit Products**: Modify existing product details, pricing, and specifications
- **Soft Delete**: Products are marked as inactive instead of being permanently removed
- **Product Variants**: Manage different sizes, colors, and stock levels for each product
- **Product Status**: Toggle between active/inactive states

### Category Management

- **Product Categories**: Organize products by categories
- **Category CRUD**: Create, read, update, and delete product categories

### User Management

- **User Roles**: Admin and customer role management
- **User Authentication**: Secure login and registration system

## Technology Stack

- **Frontend**: Vue 3 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **HTTP Client**: Axios
- **UI Components**: Custom component library
- **API**: JSON Server (localhost:3000)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd shop-co
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the JSON Server (API):

```bash
pnpm server
```

4. Start the development server:

```bash
pnpm dev
```

5. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

The application uses JSON Server running on `localhost:3000` with the following endpoints:

### Products

- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Soft delete product (sets isActive to false)

### Product Variants

- `GET /product_variants?productId=:id` - Get variants for a product
- `POST /product_variants` - Create new variant
- `PATCH /product_variants/:id` - Update variant
- `DELETE /product_variants/:id` - Delete variant

### Categories

- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `POST /categories` - Create new category
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Admin Panel Usage

### Product Management

1. **Adding a New Product**:

   - Navigate to Admin > Products
   - Click "Add Product" button
   - Fill in product details (name, description, price, category, etc.)
   - Add product variants (sizes, colors, stock)
   - Set product flags (active, featured, new)
   - Click "Create Product"

2. **Editing a Product**:

   - Click "Edit" button on any product row
   - Modify product information
   - Update variants as needed
   - Click "Update Product"

3. **Deleting a Product**:
   - Click "Delete" button on any product row
   - Confirm deletion (product will be marked as inactive)
   - To reactivate, find the product in the "Inactive Products" section and click "Activate"

### Product Variants

- **Adding Variants**: Use the Product Variants section in the product form
- **Variant Fields**: Size, Color, Color Code, SKU, Sale Price, Stock Quantity
- **Dynamic SKU Generation**: SKUs are automatically generated based on product ID, size, and color

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── section/        # Section-specific components
│   └── layout/         # Layout components
├── hooks/              # Custom Vue composition functions
├── services/           # API service classes
├── stores/             # Pinia state management
├── types/              # TypeScript type definitions
├── views/              # Page components
└── router/             # Vue Router configuration
```

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm server` - Start JSON Server API
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

### Code Style

- Use TypeScript for type safety
- Follow Vue 3 Composition API patterns
- Use Tailwind CSS for styling
- Implement proper error handling
- Use Vue Query for server state management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
