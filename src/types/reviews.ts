export interface Review {
	id: string;
	productId: string;
	userId: string;
	orderId: string;
	rating: number;
	title: string;
	content: string;
	images?: string[];
	isVerified: boolean;
	isHelpful: number;
	createdAt: string;
	reply?: string; // Optional reply from admin or support
	replyDate?: string; // Date when the reply was made
	variantId?: number; // Thêm trường variantId để lưu phân loại
	variantName?: string;
	 color?: string;   // thêm
  size?: string;  
}

