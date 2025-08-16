<template>
	<div class="p-6 bg-white rounded-lg shadow">
		<h2 class="text-xl font-bold mb-4">Test Refund System</h2>
		
		<div class="space-y-4">
			<!-- Test Refund Request -->
			<div class="border rounded-lg p-4">
				<h3 class="font-semibold mb-2">Test Refund Request</h3>
				<div class="space-y-2">
					<input 
						v-model="testOrderId" 
						placeholder="Order ID to test"
						class="w-full p-2 border rounded"
					/>
					<textarea 
						v-model="testReason" 
						placeholder="Refund reason"
						class="w-full p-2 border rounded"
						rows="3"
					></textarea>
					<button 
						@click="testRefundRequest"
						class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
					>
						Test Refund Request
					</button>
				</div>
			</div>
			
			<!-- Test Process Refund -->
			<div class="border rounded-lg p-4">
				<h3 class="font-semibold mb-2">Test Process Refund (Admin)</h3>
				<div class="space-y-2">
					<input 
						v-model="testProcessOrderId" 
						placeholder="Order ID to process"
						class="w-full p-2 border rounded"
					/>
					<select v-model="testAction" class="w-full p-2 border rounded">
						<option value="approve">Approve</option>
						<option value="reject">Reject</option>
					</select>
					<textarea 
						v-model="testAdminResponse" 
						placeholder="Admin response"
						class="w-full p-2 border rounded"
						rows="3"
					></textarea>
					<button 
						@click="testProcessRefund"
						class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
					>
						Test Process Refund
					</button>
				</div>
			</div>
			
			<!-- Results -->
			<div v-if="testResults.length > 0" class="border rounded-lg p-4">
				<h3 class="font-semibold mb-2">Test Results</h3>
				<div class="space-y-2">
					<div 
						v-for="(result, index) in testResults" 
						:key="index"
						:class="[
							'p-2 rounded text-sm',
							result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
						]"
					>
						<strong>{{ result.action }}:</strong> {{ result.message }}
						<span class="text-xs text-gray-600 ml-2">{{ result.timestamp }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useOrders } from '@/hook/use-orders';

const { submitRefundRequest, processRefundRequest } = useOrders();

// Test data
const testOrderId = ref('');
const testReason = ref('Test refund reason');
const testProcessOrderId = ref('');
const testAction = ref<'approve' | 'reject'>('approve');
const testAdminResponse = ref('Test admin response');
const testResults = ref<Array<{
	action: string;
	message: string;
	success: boolean;
	timestamp: string;
}>>([]);

// Test functions
async function testRefundRequest() {
	if (!testOrderId.value || !testReason.value) {
		addResult('Refund Request', 'Please fill in all fields', false);
		return;
	}
	
	try {
		const success = await submitRefundRequest(testOrderId.value, {
			reason: testReason.value,
			images: []
		});
		
		addResult('Refund Request', 
			success ? 'Successfully submitted refund request' : 'Failed to submit refund request',
			success
		);
	} catch (error) {
		addResult('Refund Request', `Error: ${error}`, false);
	}
}

async function testProcessRefund() {
	if (!testProcessOrderId.value || !testAdminResponse.value) {
		addResult('Process Refund', 'Please fill in all fields', false);
		return;
	}
	
	try {
		const success = await processRefundRequest(
			testProcessOrderId.value,
			testAction.value,
			testAdminResponse.value
		);
		
		addResult('Process Refund', 
			success ? `Successfully ${testAction.value}ed refund request` : `Failed to ${testAction.value} refund request`,
			success
		);
	} catch (error) {
		addResult('Process Refund', `Error: ${error}`, false);
	}
}

function addResult(action: string, message: string, success: boolean) {
	testResults.value.unshift({
		action,
		message,
		success,
		timestamp: new Date().toLocaleTimeString()
	});
	
	// Keep only last 10 results
	if (testResults.value.length > 10) {
		testResults.value = testResults.value.slice(0, 10);
	}
}
</script>
