<script setup lang="ts">
// Admin Users View
</script>

<template>
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<h1 class="text-2xl font-bold text-gray-900">Users Management</h1>
			<button class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
				Add User
			</button>
		</div>

		<!-- Users Table -->
		<div class="rounded-lg bg-white shadow">
			<div class="px-4 py-5 sm:p-6">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									User
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Email
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Role
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Status
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Joined
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							<tr>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<div class="h-10 w-10 flex-shrink-0">
											<img
												class="h-10 w-10 rounded-full"
												src="https://via.placeholder.com/40"
												alt=""
											/>
										</div>
										<div class="ml-4">
											<div class="text-sm font-medium text-gray-900">John Doe</div>
											<div class="text-sm text-gray-500">johnsmith</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">john@example.com</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">Customer</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span
										class="inline-flex rounded-full bg-green-100 px-2 text-xs leading-5 font-semibold text-green-800"
									>
										Active
									</span>
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">2024-01-01</td>
								<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
									<button class="mr-3 text-blue-600 hover:text-blue-900">Edit</button>
									<button class="text-red-600 hover:text-red-900">Delete</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>
