import React, { useState, useEffect } from "react";
import Select from "react-select";
import Navbar from "./Navbar";
import additionalPartsList from "./parts";
import { addCustomer } from "./CustomerList";
import { Link, useNavigate } from "react-router";

function NewCustomerComponent() {
	// ----- Service schedules (unchanged) -----
	const carServiceSchedules = [
		{ label: "1st Free Service - 1k km / 1 month", cost: 0 },
		{ label: "2nd Free Service - 5k km / 0.5 Year", cost: 0 },
		{ label: "3rd Free Service - 10k km / 1 Year", cost: 2000 },
		{ label: "20k PMS / 2 Years", cost: 2500 },
		{ label: "30k PMS / 3 Years", cost: 3000 },
		{ label: "40k PMS / 4 Years", cost: 3500 },
		{ label: "50k PMS / 5 Years", cost: 3200 },
		{ label: "60k PMS / 6 Years", cost: 3800 },
		{ label: "70k PMS / 7 Years", cost: 3300 },
		{ label: "80k PMS / 8 Years", cost: 4000 },
		{ label: "90k PMS / 9 Years", cost: 3700 },
		{ label: "100k PMS / 10 Years", cost: 4200 },
	];

	// ----- Form state (your original) -----
	const [selectedServiceIndex, setSelectedServiceIndex] = useState(null);
	const [washing, setWashing] = useState("No");
	const [interior, setInterior] = useState("No");
	const [teflon, setTeflon] = useState("No");
	const [selectedParts, setSelectedParts] = useState([]);
	const [customerName, setCustomerName] = useState("");
	const [vehicleNumber, setVehicleNumber] = useState("");
	const [carImages, setCarImages] = useState([]);
	const [customerConcerns, setCustomerConcerns] = useState("");

	// custom part
	const [customPartName, setCustomPartName] = useState("");
	const [customPartCost, setCustomPartCost] = useState("");
	const [partsOptions, setPartsOptions] = useState(additionalPartsList);

	// ----- Edit mode additions -----
	const [editMode, setEditMode] = useState(false);
	const [editCustomerId, setEditCustomerId] = useState(null);
	const [initialServiceCost, setInitialServiceCost] = useState(0); // used when service not changed during edit
	const [originalCreatedAt, setOriginalCreatedAt] = useState(null);

	const navigate = useNavigate();

	// debug (your original)
	useEffect(() => {
		const savedCustomers =
			JSON.parse(localStorage.getItem("CUSTOMER_LIST")) || [];
		console.log("All Customers:", savedCustomers);
	}, []);

	// ----- Load edit data if present -----
	useEffect(() => {
		const editCustomer = JSON.parse(localStorage.getItem("EDIT_CUSTOMER"));
		if (editCustomer) {
			setEditMode(true);
			setEditCustomerId(editCustomer.id);

			setCustomerName(editCustomer.customerName || "");
			setVehicleNumber(editCustomer.vehicleNumber || "");
			setCustomerConcerns(editCustomer.customerConcerns || "");
			setWashing(editCustomer.washing || "No");
			setInterior(editCustomer.interior || "No");
			setTeflon(editCustomer.teflon || "No");
			setCarImages(
				Array.isArray(editCustomer.carImages) ? editCustomer.carImages : []
			);
			setSelectedParts(
				Array.isArray(editCustomer.selectedParts)
					? editCustomer.selectedParts
					: []
			);
			setOriginalCreatedAt(editCustomer.createdAt || new Date().toISOString());

			// figure out service index from label
			const idx = carServiceSchedules.findIndex(
				(s) => s.label === editCustomer.selectedService
			);
			setSelectedServiceIndex(idx !== -1 ? idx : null);

			// Use the stored serviceCost when user hasn't changed dropdown
			setInitialServiceCost(
				typeof editCustomer.serviceCost === "number"
					? editCustomer.serviceCost
					: 0
			);

			// Ensure any previously selected custom parts are in options so react-select can display them
			const merged = [...additionalPartsList];
			(editCustomer.selectedParts || []).forEach((p) => {
				if (!merged.some((opt) => opt.label === p.label)) {
					merged.push({ label: p.label, cost: Number(p.cost) || 0 });
				}
			});
			setPartsOptions(merged);
		}
	}, []);

	// ----- Costs (your logic kept; serviceCost respects edit initial cost) -----
	const washingCost = washing === "Yes" ? 300 : 0;
	const interiorCost = interior === "Yes" ? 1000 : 0;
	const teflonCost = teflon === "Yes" ? 2000 : 0;
	const serviceCost =
		selectedServiceIndex !== null
			? carServiceSchedules[selectedServiceIndex].cost
			: initialServiceCost;
	const pickupCost = 300;
	const selectedPartsCost = selectedParts.reduce(
		(total, item) => total + (Number(item.cost) || 0),
		0
	);
	const additionalCost =
		pickupCost + washingCost + interiorCost + teflonCost + selectedPartsCost;
	const totalCost = serviceCost + additionalCost;

	// ----- Image handling (your original) -----
	const handleImageChange = (e) => {
		const files = Array.from(e.target.files);
		const readers = files.map(
			(file) =>
				new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.onloadend = () => resolve(reader.result);
					reader.onerror = reject;
					reader.readAsDataURL(file);
				})
		);

		Promise.all(readers).then((images) => {
			setCarImages(images);
		});
	};

	// ----- Save (add or update) -----
	const handleSave = (e) => {
		e.preventDefault();

		const payload = {
			id: editMode ? editCustomerId : Date.now(),
			customerName,
			vehicleNumber,
			selectedService:
				selectedServiceIndex !== null
					? carServiceSchedules[selectedServiceIndex].label
					: null,
			serviceCost,
			additionalCost,
			totalCost: serviceCost + additionalCost,
			washing,
			interior,
			teflon,
			selectedParts,
			carImages,
			customerConcerns,
			createdAt: editMode ? originalCreatedAt : new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		if (editMode) {
			// Update existing record
			let customers = JSON.parse(localStorage.getItem("CUSTOMER_LIST")) || [];
			customers = customers.map((c) => (c.id === editCustomerId ? payload : c));
			localStorage.setItem("CUSTOMER_LIST", JSON.stringify(customers));
			localStorage.removeItem("EDIT_CUSTOMER");
			alert("Customer updated successfully!");
		} else {
			// Add new record (your original)
			addCustomer(payload);
			alert("Customer saved successfully!");
		}

		navigate("/customersList"); // back to dashboard/list
	};

	// ----- Add custom part (your original) -----
	const handleAddCustomPart = () => {
		if (customPartName.trim() === "" || customPartCost === "") {
			alert("Please enter both part name and cost");
			return;
		}
		const newPart = { label: customPartName, cost: Number(customPartCost) };
		setPartsOptions((prev) => [...prev, newPart]);

		// If the user adds a part, auto-select it for convenience
		setSelectedParts((prev) => [...prev, newPart]);

		setCustomPartName("");
		setCustomPartCost("");
		alert("Part added successfully!");
	};

	return (
		<div>
			<Navbar />
			<div className="container p-3 p-md-5">
				{/* Header */}
				<div className="row align-items-center mb-4">
					<div className="col-12 col-md-6 mb-2 mb-md-0">
						<h2 className="fw-bold text-center text-md-start">
							{editMode ? "Edit Customer" : "Create New Customer"}
						</h2>
					</div>
					<div className="col-12 col-md-6 text-center text-md-end">
						<Link to="/">
							<button className="btn btn-primary w-100 w-md-auto">
								Back To Dashboard
							</button>
						</Link>
					</div>
				</div>

				<div className="row">
					{/* Image Section (unchanged) */}
					<div className="col-12 col-lg-4 mb-3">
						<div className="p-3 shadow rounded bg-white">
							<img
								src="https://media.istockphoto.com/id/1144385888/vector/happy-successful-man-is-standing-next-to-a-yellow-car-on-a-background-vector-illustration-in.jpg?s=612x612&w=0&k=20&c=TkDUuDoWVGfxKbazgWJHMGu3h29XWU6BdIVVWkg7GfY="
								alt="car"
								className="img-fluid rounded"
							/>
						</div>
					</div>

					{/* Form Section */}
					<div className="col-12 col-lg-8">
						<div className="card p-3 shadow">
							<h4 className="mb-3">Customer Details</h4>
							<hr />
							<form onSubmit={handleSave}>
								<div className="mb-3">
									<label className="form-label">Customer Name</label>
									<input
										className="form-control"
										value={customerName}
										onChange={(e) => setCustomerName(e.target.value)}
										placeholder="Enter Customer Name"
										required
									/>
								</div>
								<div className="mb-3">
									<label className="form-label">Vehicle Number</label>
									<input
										className="form-control"
										value={vehicleNumber}
										onChange={(e) => setVehicleNumber(e.target.value)}
										placeholder="Enter Vehicle Number"
										required
									/>
								</div>
								<div className="mb-3">
									<label className="form-label">Service Type</label>
									<select
										className="form-select"
										value={
											selectedServiceIndex !== null ? selectedServiceIndex : ""
										}
										onChange={(e) => {
											const idx =
												e.target.value === "" ? null : Number(e.target.value);
											setSelectedServiceIndex(idx);
										}}
									>
										<option disabled value="">
											-- Select Service --
										</option>
										{carServiceSchedules.map((schedule, index) => (
											<option key={index} value={index}>
												{schedule.label}
											</option>
										))}
									</select>
								</div>

								{/* Options */}
								<div className="row">
									<div className="col-12 col-sm-4 mb-3">
										<label className="form-label">Washing</label>
										<select
											className="form-select"
											value={washing}
											onChange={(e) => setWashing(e.target.value)}
										>
											<option value="Yes">Yes</option>
											<option value="No">No</option>
										</select>
									</div>
									<div className="col-12 col-sm-4 mb-3">
										<label className="form-label">Interior Cleaning</label>
										<select
											className="form-select"
											value={interior}
											onChange={(e) => setInterior(e.target.value)}
										>
											<option value="Yes">Yes</option>
											<option value="No">No</option>
										</select>
									</div>
									<div className="col-12 col-sm-4 mb-3">
										<label className="form-label">Teflon Coating</label>
										<select
											className="form-select"
											value={teflon}
											onChange={(e) => setTeflon(e.target.value)}
										>
											<option value="Yes">Yes</option>
											<option value="No">No</option>
										</select>
									</div>
								</div>

								{/* Custom Part */}
								<div className="mb-3">
									<label className="form-label">Add Custom Part</label>
									<div className="row g-2">
										<div className="col-12 col-md-4">
											<input
												type="text"
												className="form-control"
												placeholder="Part Name"
												value={customPartName}
												onChange={(e) => setCustomPartName(e.target.value)}
											/>
										</div>
										<div className="col-12 col-md-4">
											<input
												type="number"
												className="form-control"
												placeholder="Cost"
												value={customPartCost}
												onChange={(e) => setCustomPartCost(e.target.value)}
											/>
										</div>
										<div className="col-12 col-md-4 d-grid">
											<button
												type="button"
												className="btn btn-success"
												onClick={handleAddCustomPart}
											>
												Add
											</button>
										</div>
									</div>
								</div>

								{/* Parts Multi Select */}
								<div className="mb-3">
									<label className="form-label">
										Additional Approvals (Search & Select Multiple)
									</label>
									<Select
										options={partsOptions}
										isMulti
										value={selectedParts}
										onChange={(selected) => setSelectedParts(selected || [])}
										placeholder="Search and select parts..."
										// Ensure stable matching by label so edited items show up correctly
										getOptionLabel={(o) => o.label}
										getOptionValue={(o) => String(o.label)}
									/>
								</div>

								{/* Images */}
								<div className="mb-3">
									<label className="form-label">Upload Car Images</label>
									<input
										type="file"
										className="form-control"
										multiple
										accept="image/*"
										onChange={handleImageChange}
									/>
									<div className="d-flex flex-wrap mt-3 gap-2">
										{carImages.map((img, index) => (
											<img
												key={index}
												src={img}
												alt={`img-${index}`}
												className="rounded"
												style={{
													width: "100px",
													height: "100px",
													objectFit: "cover",
												}}
											/>
										))}
									</div>
								</div>

								{/* Concerns */}
								<div className="mb-3">
									<label className="form-label">Customer Concerns</label>
									<textarea
										className="form-control"
										placeholder="Enter customer concerns..."
										rows="3"
										value={customerConcerns}
										onChange={(e) => setCustomerConcerns(e.target.value)}
									/>
								</div>

								{/* Save */}
								<button
									type="submit"
									className="btn btn-primary w-100 fs-5 mt-2"
								>
									{editMode ? "Update Customer" : "Save"}
								</button>
							</form>

							{/* Estimation (unchanged) */}
							<div className="mt-4">
								<h5>Estimation</h5>
								<ul className="list-unstyled">
									<li>Service Cost: ₹{serviceCost}</li>
									<li>Pick-up: ₹{pickupCost}</li>
									<li>Washing: ₹{washingCost}</li>
									<li>Interior Cleaning: ₹{interiorCost}</li>
									<li>Teflon Coating: ₹{teflonCost}</li>
									<li>Additional Parts: ₹{selectedPartsCost}</li>
								</ul>
								<h6>
									Other Charges: ₹
									{pickupCost +
										washingCost +
										interiorCost +
										teflonCost +
										selectedPartsCost}
								</h6>
								<h5 className="fw-bold">Grand Total: ₹{totalCost}</h5>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewCustomerComponent;
