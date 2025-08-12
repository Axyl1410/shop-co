export interface Review {
	id: number;
	productId: number;
	userId: number;
	orderId: number;
	rating: number;
	title: string;
	content: string;
	images: string[];
	isVerified: boolean;
	isHelpful: number;
	createdAt: string;
	reply?: string; // Optional reply from admin or support
	replyDate?: string; // Date when the reply was made
}
