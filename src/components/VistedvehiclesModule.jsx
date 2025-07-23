import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { Link } from "react-router";

function VisitedVehiclesModule() {
	const [customers, setCustomers] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	console.log(customers);

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

	// Filter customers based on searchTerm
	const filteredCustomers = customers.filter((customer) => {
		const fullData = Object.values(customer).join(" ").toLowerCase();
		return fullData.includes(searchTerm.toLowerCase());
	});

	return (
		<div>
			<Navbar />
			<div className="container mt-5">
				<Link to="/">
					<button className="btn btn-primary m-3">Back to Dashboard</button>
				</Link>
				<div className="row">
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

								<input
									type="text"
									className="form-control mb-3"
									placeholder="Search by any detail..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>

								{filteredCustomers.length === 0 ? (
									<p>No matching customers found.</p>
								) : (
									<ul className="list-group">
										{filteredCustomers.map((customer) => (
											<>
												<li
													key={customer.id}
													className="list-group-item d-flex justify-content-between align-items-center"
													onClick={() =>
														localStorage.setItem(
															"SELECTED_CUSTOMER",
															JSON.stringify(customer)
														)
													}
												>
													<Link to="/singlecustomer">
														<div>
															<strong>{customer.customerName}</strong> -{" "}
															{customer.vehicleNumber}
														</div>
													</Link>
													<button
														className="btn btn-danger btn-sm"
														onClick={() => handleDelete(customer.id)}
													>
														Delete
													</button>
												</li>
											</>
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
