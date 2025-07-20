import { ServerAxiosConfig } from "@/constant/axios-config";
import type { Product } from "@/types";
import { useQuery } from "@tanstack/vue-query";
import axios from "axios";
import { watch } from "vue";
import { toast } from "vue-sonner";

export function useProducts() {
	const query = useQuery<Product[]>({
		queryKey: ["products"],
		queryFn: async (): Promise<Product[]> => {
			const response = await axios(`${ServerAxiosConfig.baseURL}/products`);
			return response.data;
		},
	});

	watch([query.isError], ([newIsError]) => {
		if (newIsError) {
			toast.error("Failed to fetch products");
		}
	});

	return {
		...query,
		products: query.data,
	};
}
