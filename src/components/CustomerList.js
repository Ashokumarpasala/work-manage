// customerList.js
const STORAGE_KEY = "CUSTOMER_LIST";

export function getCustomers() {
	const saved = localStorage.getItem(STORAGE_KEY);
	return saved ? JSON.parse(saved) : [];
}

export function saveCustomers(customers) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export function addCustomer(customer) {
	const current = getCustomers();
	current.push(customer);
	saveCustomers(current);
}
