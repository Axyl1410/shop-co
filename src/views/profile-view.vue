<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/use-auth-store";
import {
	ArrowRight,
	Crown,
	HelpCircle,
	History,
	LogOut,
	MapPin,
	PencilLine,
	Phone,
	ShoppingBag,
	Star,
} from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const ordersCount = ref(0);

onMounted(async () => {
	if (!user.value) {
		await authStore.refreshUser();
	}
});

const displayName = computed(() => {
	if (!user.value) return "";
	const full = `${user.value.firstName ?? ""} ${user.value.lastName ?? ""}`.trim();
	return full || user.value.username;
});

const initials = computed(() => {
	if (!user.value) return "";
	const first = user.value.firstName?.[0] ?? user.value.username?.[0] ?? "U";
	const last = user.value.lastName?.[0] ?? "";
	return `${first}${last}`.toUpperCase();
});

const formattedJoinDate = computed(() => {
	if (!user.value?.createdAt) return "—";
	const d = new Date(user.value.createdAt);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleDateString();
});

const vipLevel = computed(() => {
	if (ordersCount.value >= 20) return "Gold";
	if (ordersCount.value >= 10) return "Silver";
	return "Bronze";
});

const vipBadgeClass = computed(() => {
	switch (vipLevel.value) {
		case "Gold":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200";
		case "Silver":
			return "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-200";
		default:
			return "bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200";
	}
});

function handleLogout() {
	authStore.logout();
	router.push({ name: "home" });
}
</script>

<template>
	<div class="container mx-auto max-w-5xl px-4 py-10">
		<h1 class="mb-6 text-3xl font-bold">Tài khoản</h1>

		<div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
			<!-- Profile card -->
			<Card class="overflow-hidden">
				<CardHeader class="border-b">
					<div v-if="user" class="flex items-center gap-4">
						<Avatar class="h-14 w-14 rounded-xl">
							<AvatarImage :src="user.avatar" :alt="displayName" />
							<AvatarFallback class="rounded-xl">{{ initials }}</AvatarFallback>
						</Avatar>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<span class="text-xl font-semibold">{{ displayName }}</span>
								<span
									:class="[
										'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
										vipBadgeClass,
									]"
								>
									<Crown class="size-3" />
									{{ vipLevel }}
								</span>
							</div>
							<p class="text-muted-foreground text-sm">{{ user.email }}</p>
						</div>
						<Button variant="outline" size="sm" class="hidden md:inline-flex">
							<PencilLine class="size-4" />
							Chỉnh sửa
						</Button>
					</div>
					<div v-else class="flex items-center gap-4">
						<Skeleton class="h-14 w-14 rounded-xl" />
						<div class="flex-1 space-y-2">
							<Skeleton class="h-4 w-40" />
							<Skeleton class="h-3 w-64" />
						</div>
					</div>
				</CardHeader>

				<CardContent class="py-6">
					<!-- quick stats -->
					<div class="grid gap-4 sm:grid-cols-3">
						<div class="rounded-lg border p-4">
							<div class="text-muted-foreground flex items-center gap-2 text-sm">
								<Phone class="size-4" />
								Số điện thoại
							</div>
							<div class="mt-1 font-medium">{{ user?.phone || "—" }}</div>
						</div>
						<div class="rounded-lg border p-4">
							<div class="text-muted-foreground flex items-center gap-2 text-sm">
								<ShoppingBag class="size-4" />
								Đơn hàng
							</div>
							<div class="mt-1 font-medium">{{ ordersCount }}</div>
						</div>
						<div class="rounded-lg border p-4">
							<div class="text-muted-foreground flex items-center gap-2 text-sm">
								<Star class="size-4" />
								Hạng VIP
							</div>
							<div class="mt-1 font-medium">{{ vipLevel }}</div>
						</div>
					</div>

					<Separator class="my-6" />

					<!-- actions -->
					<div class="flex flex-col gap-3">
						<Button variant="outline" class="justify-between">
							<span class="inline-flex items-center gap-2">
								<History class="size-4" />
								Lịch sử đơn hàng
							</span>
							<ArrowRight class="size-4 opacity-60" />
						</Button>
						<Button variant="outline" class="justify-between">
							<span class="inline-flex items-center gap-2">
								<MapPin class="size-4" />
								Sổ địa chỉ
							</span>
							<ArrowRight class="size-4 opacity-60" />
						</Button>
						<Button variant="outline" class="justify-between">
							<span class="inline-flex items-center gap-2">
								<HelpCircle class="size-4" />
								Câu hỏi & chính sách
							</span>
							<ArrowRight class="size-4 opacity-60" />
						</Button>
						<Button variant="destructive" class="justify-between" @click="handleLogout">
							<span class="inline-flex items-center gap-2">
								<LogOut class="size-4" />
								Đăng xuất
							</span>
							<ArrowRight class="size-4 opacity-60" />
						</Button>
					</div>
				</CardContent>
			</Card>

			<!-- Sidebar card -->
			<Card class="h-fit">
				<CardHeader class="border-b">
					<CardTitle>Thông tin nhanh</CardTitle>
				</CardHeader>
				<CardContent class="py-6">
					<div class="space-y-2 text-sm">
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">Tên đăng nhập</span>
							<span class="font-medium">{{ user?.username || "—" }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">Ngày tham gia</span>
							<span class="font-medium">{{ formattedJoinDate }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">Trạng thái</span>
							<span class="font-medium" :class="user?.isActive ? 'text-green-600' : 'text-red-600'">
								{{ user?.isActive ? "Đang hoạt động" : "Ngừng hoạt động" }}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</template>

<style scoped></style>
