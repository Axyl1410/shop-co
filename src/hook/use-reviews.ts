import { ServerAxiosConfig } from "@/constant/axios-config";
import type { Review } from "@/types";
import { useQuery } from "@tanstack/vue-query";
import axios from "axios";
import { watch } from "vue";
import { toast } from "vue-sonner";

export function useReviews() {
	const query = useQuery<Review[]>({
		queryKey: ["reviews"],
		queryFn: async (): Promise<Review[]> => {
			const response = await axios(`${ServerAxiosConfig.baseURL}/reviews`);
			return response.data;
		},
	});

	watch([query.isError], ([newIsError]) => {
		if (newIsError) {
			toast.error("Failed to fetch reviews");
		}
	});

	return {
		...query,
		reviews: query.data,
	};
}
