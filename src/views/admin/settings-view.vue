<script setup lang="ts">
// Admin Settings View
</script>

<template>
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<h1 class="text-2xl font-bold text-gray-900">Settings</h1>
		</div>

		<!-- Settings Form -->
		<div class="rounded-lg bg-white shadow">
			<div class="px-4 py-5 sm:p-6">
				<form class="space-y-6">
					<div>
						<h3 class="mb-4 text-lg leading-6 font-medium text-gray-900">General Settings</h3>

						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<div>
								<label class="block text-sm font-medium text-gray-700">Store Name</label>
								<input
									type="text"
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
									placeholder="My Store"
								/>
							</div>

							<div>
								<label class="block text-sm font-medium text-gray-700">Store Email</label>
								<input
									type="email"
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
									placeholder="contact@mystore.com"
								/>
							</div>

							<div>
								<label class="block text-sm font-medium text-gray-700">Currency</label>
								<select
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
								>
									<option>USD ($)</option>
									<option>EUR (€)</option>
									<option>GBP (£)</option>
								</select>
							</div>

							<div>
								<label class="block text-sm font-medium text-gray-700">Timezone</label>
								<select
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
								>
									<option>UTC</option>
									<option>America/New_York</option>
									<option>Europe/London</option>
								</select>
							</div>
						</div>
					</div>

					<div>
						<h3 class="mb-4 text-lg leading-6 font-medium text-gray-900">Email Settings</h3>

						<div class="space-y-4">
							<div>
								<label class="block text-sm font-medium text-gray-700">SMTP Host</label>
								<input
									type="text"
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
									placeholder="smtp.gmail.com"
								/>
							</div>

							<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<label class="block text-sm font-medium text-gray-700">SMTP Port</label>
									<input
										type="number"
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
										placeholder="587"
									/>
								</div>

								<div>
									<label class="block text-sm font-medium text-gray-700">SMTP Username</label>
									<input
										type="text"
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
										placeholder="your-email@gmail.com"
									/>
								</div>
							</div>
						</div>
					</div>

					<div class="flex justify-end">
						<button
							type="submit"
							class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
						>
							Save Settings
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>
