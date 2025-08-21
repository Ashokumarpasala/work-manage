import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { Link } from "react-router";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function SingleCustomerComponent() {
	const [customer, setCustomer] = useState(null);
	const [discountPercent, setDiscountPercent] = useState(0);

	useEffect(() => {
		const selectedCustomer = JSON.parse(
			localStorage.getItem("SELECTED_CUSTOMER")
		);
		setCustomer(selectedCustomer);
	}, []);

	if (!customer) return <p>Loading customer details...</p>;

	// ---- Cost Calculations ----
	const serviceCost = customer.selectedService ? customer.serviceCost || 0 : 0;

	// additional costs: washing + interior + teflon + parts + pickup
	const washingCost = customer.washing === "Yes" ? 300 : 0;
	const interiorCost = customer.interior === "Yes" ? 1000 : 0;
	const teflonCost = customer.teflon === "Yes" ? 2000 : 0;
	const pickupCost = 300;
	const selectedPartsCost = customer.selectedParts
		? customer.selectedParts.reduce((t, p) => t + (p.cost || 0), 0)
		: 0;

	const additionalCost =
		washingCost + interiorCost + teflonCost + pickupCost + selectedPartsCost;

	const discountValue = (serviceCost * discountPercent) / 100;
	const finalTotal = serviceCost - discountValue + additionalCost;

	// ---- PDF Generator ----
	const generateInvoice = async () => {
		const doc = new jsPDF("p", "pt", "a4");

		// Logo
		const logoUrl =
			"https://yt3.googleusercontent.com/ytc/AIdro_lcF6fyaheWBLmNjn3Q3HFtZLEVh-rRQHrhQoW5mvOqEw=s900-c-k-c0x00ffffff-no-rj";
		const logoImg = await fetch(logoUrl)
			.then((res) => res.blob())
			.then(
				(blob) =>
					new Promise((resolve) => {
						const reader = new FileReader();
						reader.onloadend = () => resolve(reader.result);
						reader.readAsDataURL(blob);
					})
			);

		doc.addImage(logoImg, "PNG", 400, 20, 150, 80);

		// Header
		doc.setFontSize(22);
		doc.text("Invoice", 40, 60);

		doc.setFontSize(12);
		doc.text(`Invoice no: ${customer.id}`, 40, 80);
		doc.text(`Invoice date: ${new Date().toLocaleDateString()}`, 40, 100);

		// Customer Info
		doc.text("Customer Info", 40, 130);
		doc.text(`Name: ${customer.customerName}`, 40, 150);
		doc.text(`Vehicle No: ${customer.vehicleNumber}`, 40, 170);
		doc.text(`Service: ${customer.selectedService}`, 40, 190);
		doc.text(`Concerns: ${customer.customerConcerns || "None"}`, 40, 210);

		// Parts Table
		let partsData = [];
		if (customer.selectedParts && customer.selectedParts.length > 0) {
			partsData = customer.selectedParts.map((part, idx) => [
				idx + 1,
				part.label,
				`₹${part.cost}`,
			]);

			autoTable(doc, {
				startY: 240,
				head: [["#", "Part Name", "Cost"]],
				body: partsData,
				styles: { fontSize: 10 },
			});
		}

		const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : 260;

		// Cost Summary
		doc.setFontSize(14);
		doc.text(`Service Cost: ₹${serviceCost}`, 40, finalY);
		doc.text(`Additional Cost: ₹${additionalCost}`, 40, finalY + 20);
		doc.text(
			`Discount (${discountPercent}%): -₹${discountValue}`,
			40,
			finalY + 40
		);
		doc.text(`Grand Total: ₹${finalTotal}`, 40, finalY + 60);

		const pdfUrl = doc.output("bloburl");
		window.open(pdfUrl, "_blank");
	};

	return (
		<div>
			<Navbar />
			<div className="container mt-5">
				<h3>Customer Details</h3>
				<Link to="/customersList">
					<button className="btn btn-primary">Back to Customers List</button>
				</Link>

				<div className="card p-4 shadow mt-3">
					{/* Customer Info */}
					<div className="mb-4 p-3 border rounded bg-light">
						<h4>Customer Info</h4>
						<p>
							<strong>Name:</strong> {customer.customerName}
						</p>
						<p>
							<strong>Vehicle Number:</strong> {customer.vehicleNumber}
						</p>
						<p>
							<strong>Created At:</strong>{" "}
							{new Date(customer.createdAt).toLocaleString()}
						</p>
					</div>

					{/* Service Info */}
					<div className="mb-4 p-3 border rounded bg-light">
						<h4>Service Info</h4>
						<p>
							<strong>Service:</strong> {customer.selectedService}
						</p>
						<p>
							<strong>Concerns:</strong> {customer.customerConcerns}
						</p>
						<p>
							<strong>Washing:</strong> {customer.washing}
						</p>
						<p>
							<strong>Interior Cleaning:</strong> {customer.interior}
						</p>
						<p>
							<strong>Teflon:</strong> {customer.teflon}
						</p>
					</div>

					{/* Parts */}
					<div className="mb-4 p-3 border rounded bg-light">
						<h4>Selected Parts</h4>
						{customer.selectedParts && customer.selectedParts.length > 0 ? (
							<ul className="list-group">
								{customer.selectedParts.map((part, idx) => (
									<li
										key={idx}
										className="list-group-item d-flex justify-content-between"
									>
										{part.label} <span>₹{part.cost}</span>
									</li>
								))}
							</ul>
						) : (
							<p>No parts selected.</p>
						)}
					</div>

					{/* Cost Summary */}
					<div className="p-3 border rounded bg-light">
						<h4>Cost Summary</h4>
						<p>
							<strong>Service Cost:</strong> ₹{serviceCost}
						</p>
						<p>
							<strong>Additional Cost:</strong> ₹{additionalCost}
						</p>
						<p>
							<strong>Discount ({discountPercent}%):</strong> -₹{discountValue}
						</p>
						<h5>
							<strong>Grand Total:</strong> ₹{finalTotal}
						</h5>

						<div className="mt-3">
							<label className="form-label">
								<strong>Apply Discount (%)</strong>
							</label>
							<input
								type="number"
								className="form-control"
								value={discountPercent}
								onChange={(e) => setDiscountPercent(Number(e.target.value))}
								placeholder="Enter discount %"
							/>
						</div>
					</div>

					{/* PDF Button */}
					<button className="btn btn-success mt-3" onClick={generateInvoice}>
						Download Invoice (PDF)
					</button>
				</div>
			</div>
		</div>
	);
}

export default SingleCustomerComponent;
