<script setup lang="ts">
import AppSidebar from "@/components/AppSidebar.vue";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import { storeToRefs } from "pinia";
import { computed, watch } from "vue";
import { RouterView, useRoute } from "vue-router";
import "vue-sonner/style.css";

const authStore = useAuthStore();
const route = useRoute();
const { user } = storeToRefs(authStore);

// Check if user is admin
const isAdmin = computed(() => user.value?.role === "admin");

watch(
	() => route.params.id,
	() => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});

		authStore.initializeAuth();
	},
	{ immediate: true },
);
</script>

<template>
	<div vaul-drawer-wrapper id="admin-app" class="min-h-screen bg-white">
		<Toaster close-button />

		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header
					class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-white transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
				>
					<div class="flex items-center gap-2 px-4">
						<SidebarTrigger class="-ml-1" />
						<Separator orientation="vertical" class="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem class="hidden md:block">
									<BreadcrumbLink href="#"> Building Your Application </BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator class="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Data Fetching</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div class="container mx-auto px-4">
					<RouterView />
				</div>
			</SidebarInset>
		</SidebarProvider>
	</div>
</template>
