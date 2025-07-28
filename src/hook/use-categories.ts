import { ServerAxiosConfig } from "@/constant";
import type {}  from "@/types";
import type { Category } from "@/types/category";
import { useQuery } from "@tanstack/vue-query";
import axios from "axios";
import { watch } from "vue";
import { toast } from "vue-sonner";

export function useCategories() {
    const query = useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: async (): Promise<Category[]> => {
            const response = await axios(`${ServerAxiosConfig.baseURL}/categories`);
            return response.data;
        },
    });

    watch([query.isError], ([newIsError]) => {
        if (newIsError) {
            toast.error("Failed to fetch categories");
        }
    });

    return {
        ...query,
        categories: query.data,
    };
}
