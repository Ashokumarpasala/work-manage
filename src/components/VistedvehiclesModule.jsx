import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { Link } from "react-router";

function VisitedVehiclesModule() {
	const [customers, setCustomers] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");

	useEffect(() => {
		const savedCustomers =
			JSON.parse(localStorage.getItem("CUSTOMER_LIST")) || [];
		setCustomers(savedCustomers);
	}, []);

	const handleDelete = (id) => {
		const updatedCustomers = customers.filter((customer) => customer.id !== id);
		setCustomers(updatedCustomers);
		localStorage.setItem("CUSTOMER_LIST", JSON.stringify(updatedCustomers));
	};

	// === Filter Button Handlers ===
	const filterToday = () => {
		const today = new Date().toISOString().split("T")[0];
		setFromDate(today);
		setToDate(today);
	};

	const filterYesterday = () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const yDate = yesterday.toISOString().split("T")[0];
		setFromDate(yDate);
		setToDate(yDate);
	};

	const filterByDate = (e) => {
		setFromDate(e.target.value);
		setToDate(e.target.value);
	};

	const resetFilter = () => {
		setFromDate("");
		setToDate("");
	};

	// === Final Filtered Customers ===
	const filteredCustomers = customers.filter((customer) => {
		const fullData = Object.values(customer).join(" ").toLowerCase();
		const matchesSearch = fullData.includes(searchTerm.toLowerCase());

		if (fromDate || toDate) {
			const createdAt = new Date(customer.createdAt).setHours(0, 0, 0, 0);
			const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
			const to = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;

			if (from && createdAt < from) return false;
			if (to && createdAt > to) return false;
		}

		return matchesSearch;
	});

	return (
		<div>
			<Navbar />
			<div className="container mt-5">
				<div className="row align-items-center">
					<div className="col-12 col-md-6 mb-2 mb-md-0">
						<Link to="/">
							<button className="btn btn-primary  w-md-auto">
								Back to Dashboard
							</button>
						</Link>
					</div>
					<div className="col-12 col-md-6 text-md-end ">
						<Link to="/newcustomer">
							<button className="btn btn-primary px-4  w-md-auto">
								+ New Customer
							</button>
						</Link>
					</div>
				</div>

				<div className="row mt-3">
					{/* Left Side Module Card */}
					<div className="col-md-6">
						<div className="card shadow h-100 border-0">
							<div className="card-body">
								<img
									src="https://previews.123rf.com/images/classicvector/classicvector2006/classicvector200600160/150122570-seller-talking-to-customer-about-car-dealer-and-future-vehicle-owner-rental-center-service.jpg"
									alt="Visited Vehicles"
									className="img-fluid mb-3"
								/>
								<h4 className="card-title mb-3">Visited Vehicles</h4>
								<p className="card-text">
									View all vehicles that have visited recently. This helps in
									follow-up and service reminders.
								</p>
							</div>
						</div>
					</div>

					{/* Right Side - List of Customers */}
					<div className="col-md-6">
						<div className="card shadow border-0 h-100 overflow-auto">
							<div className="card-body">
								<h4 className="card-title mb-3">Customer List</h4>

								{/* Search */}
								<input
									type="text"
									className="form-control mb-3"
									placeholder="Search by any detail..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>

								{/* === Filter Buttons === */}
								<div className="mt-3 mb-3 flex gap-2 items-center">
									<button
										onClick={filterToday}
										className="bg-green-500 text-white px-3 py-1 rounded shadow"
									>
										Today
									</button>
									<button
										onClick={filterYesterday}
										className="bg-yellow-500 text-white px-3 py-1 rounded shadow"
									>
										Yesterday
									</button>
									<input
										type="date"
										onChange={filterByDate}
										className="border p-2 rounded shadow"
									/>
									<button
										onClick={resetFilter}
										className="bg-gray-500 text-white px-3 py-1 rounded shadow"
									>
										Reset
									</button>
								</div>

								{/* Customer List */}
								{filteredCustomers.length === 0 ? (
									<p>No matching customers found.</p>
								) : (
									<ul className="list-group">
										{filteredCustomers.map((customer) => (
											<li
												key={customer.id}
												className="list-group-item d-flex justify-content-between align-items-center"
											>
												<Link
													to="/singlecustomer"
													onClick={() =>
														localStorage.setItem(
															"SELECTED_CUSTOMER",
															JSON.stringify(customer)
														)
													}
													className="text-decoration-none text-dark flex-grow-1"
												>
													<div>
														<strong>
															{customer.customerName.toUpperCase()}
														</strong>{" "}
														- {customer.vehicleNumber.toUpperCase()}
														<br />
														<small className="text-muted">
															Visited:{" "}
															{new Date(
																customer.createdAt
															).toLocaleDateString()}
														</small>
													</div>
												</Link>

												<Link
													to="/newcustomer"
													onClick={() => {
														localStorage.setItem(
															"EDIT_CUSTOMER",
															JSON.stringify(customer)
														);
													}}
													className="btn btn-success btn-sm px-3 mx-3"
												>
													Edit
												</Link>

												<button
													className="btn  btn-danger btn-sm shadow"
													onClick={(e) => {
														e.stopPropagation();
														handleDelete(customer.id);
													}}
												>
													Delete
												</button>
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default VisitedVehiclesModule;
