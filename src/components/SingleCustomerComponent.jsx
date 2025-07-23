import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";

function SingleCustomerComponent() {
	const [customer, setCustomer] = useState(null);
	console.log(customer);

	useEffect(() => {
		const selectedCustomer = JSON.parse(
			localStorage.getItem("SELECTED_CUSTOMER")
		);
		setCustomer(selectedCustomer);
	}, []);

	if (!customer) return <p>Loading customer details...</p>;

	return (
		<div>
			<Navbar />
			<div className="container mt-5">
				<h3>Customer Details</h3>
				<div className="card p-4 shadow mt-3">
					{customer.carImages && customer.carImages.length > 0 && (
						<div className="text-center mb-3">
							<h5>Images</h5>
							<div className="d-flex flex-wrap gap-3 justify-content-center">
								{customer.carImages.map((ele, index) => (
									<img
										key={index}
										src={ele}
										alt={`Vehicle ${index + 1}`}
										style={{
											maxWidth: "200px",
											maxHeight: "150px",
											borderRadius: "10px",
											objectFit: "cover",
										}}
									/>
								))}
							</div>
						</div>
					)}

					<h1>
						<strong>Name:</strong> {customer.customerName}
					</h1>
					<h1>
						<strong>Vehicle Number:</strong> {customer.vehicleNumber}
					</h1>
					<h1>
						<strong>Contact:</strong> {customer.contactNumber}
					</h1>
					<h1>
						<strong>Vehicle Type:</strong> {customer.vehicleType}
					</h1>
					{/* Add more fields if required */}
				</div>
			</div>
		</div>
	);
}

export default SingleCustomerComponent;
