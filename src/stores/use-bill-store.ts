import { defineStore } from "pinia";

interface Bill {
	total: number;
	content: string;
}

import { ref } from "vue";

export const useBillStore = defineStore(
	"bill",
	() => {
		const bankID = ref<string>("VPB");
		const ACCOUNT_NO = ref<string>("340137148");
		const bankOwner = ref<string>("Nguyen Truong Jiang");

		const getBank = (bill: Bill) => {
			return `https://img.vietqr.io/image/${bankID.value}-${ACCOUNT_NO.value}-print.png?amount=${bill.total}&addInfo=${encodeURIComponent(bill.content)}&accountName=${encodeURIComponent(bankOwner.value)}`;
		};

		return {
			bankID,
			ACCOUNT_NO,
			bankOwner,

			getBank,
		};
	},
	{ persist: true },
);
