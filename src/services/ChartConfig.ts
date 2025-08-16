import { ServerAxiosConfig } from "@/constant";
import axios from "axios";

// Interface for order data
interface Order {
	id: string;
	orderNumber: string;
	total: number;
	createdAt: string;
	status: string;
}

// Interface for monthly sales data
interface MonthlySales {
	month: string;
	total: number;
}

// Function to get current year's 12 months
const getCurrentYearMonths = () => {
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	return months.map((month) => `${month}`);
};

// Function to fetch and process orders data
export const fetchOrdersData = async (): Promise<MonthlySales[]> => {
	try {
		const baseURL = ServerAxiosConfig.baseURL || "http://localhost:3000";
		const response = await axios.get(`${baseURL}/orders`);
		const orders: Order[] = response.data;

		// Initialize monthly data with zeros
		const monthlyData: MonthlySales[] = getCurrentYearMonths().map((month) => ({
			month,
			total: 0,
		}));

		// Process orders and group by month
		orders.forEach((order) => {
			const orderDate = new Date(order.createdAt);
			const currentYear = new Date().getFullYear();

			// Only process orders from current year
			if (orderDate.getFullYear() === currentYear) {
				const monthIndex = orderDate.getMonth();
				monthlyData[monthIndex].total += order.total;
			}
		});

		return monthlyData;
	} catch (error) {
		console.error("Error fetching orders data:", error);
		// Return empty data if API fails
		return getCurrentYearMonths().map((month) => ({
			month,
			total: 0,
		}));
	}
};

// Default data structure
export const getDefaultData = () => ({
	labels: getCurrentYearMonths(),
	datasets: [
		{
			label: "Total Sales",
			backgroundColor: "#00a6f4",
			borderColor: "#00a6f4",
			borderWidth: 2,
			fill: false,
			tension: 0.4,
			data: new Array(12).fill(0),
		},
	],
});

// Default options
export const getDefaultOptions = () => ({
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			display: true,
			position: "bottom" as const,
		},
		title: {
			display: true,
			text: `Monthly Sales Overview - ${new Date().getFullYear()}`,
			font: {
				size: 16,
				weight: "bold" as const,
			},
		},
		tooltip: {
			callbacks: {
				label: function (context: { parsed: { y: number } }) {
					return "Sales: $" + context.parsed.y.toLocaleString();
				},
			},
		},
	},
	scales: {
		y: {
			beginAtZero: true,
			title: {
				display: true,
				text: "Sales Amount ($)",
			},
			ticks: {
				callback: function (tickValue: string | number) {
					const value = typeof tickValue === "string" ? parseFloat(tickValue) : tickValue;
					return "$" + value.toLocaleString();
				},
			},
		},
		x: {
			title: {
				display: true,
				text: "Month",
			},
		},
	},
	interaction: {
		intersect: false,
		mode: "index" as const,
	},
});

// Legacy data and options for backward compatibility
export const data = getDefaultData();
export const options = getDefaultOptions();
