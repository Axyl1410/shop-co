<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-vue-next";
</script>

<template>
	<Sheet>
		<SheetTrigger as-child>
			<Menu class="size-5 md:hidden" />
		</SheetTrigger>
		<SheetContent>
			<SheetHeader>
				<SheetTitle>Edit profile</SheetTitle>
				<SheetDescription>
					Make changes to your profile here. Click save when you're done.
				</SheetDescription>
			</SheetHeader>

			<SheetFooter>
				<SheetClose as-child>
					<Button type="submit"> Save changes </Button>
				</SheetClose>
			</SheetFooter>
		</SheetContent>
	</Sheet>
</template>
