import React, { useState, useEffect } from "react";
import Select from "react-select";
import Navbar from "./Navbar";
import additionalPartsList from "./parts";
import { addCustomer } from "./CustomerList";
import { Link, useNavigate } from "react-router";

function NewCustomerComponent() {
	useEffect(() => {
		const savedCustomers =
			JSON.parse(localStorage.getItem("CUSTOMER_LIST")) || [];
		console.log("All Customers:", savedCustomers);
	}, []);

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

	const [selectedServiceIndex, setSelectedServiceIndex] = useState(null);
	const [washing, setWashing] = useState("No");
	const [interior, setInterior] = useState("No");
	const [teflon, setTeflon] = useState("No");
	const [selectedParts, setSelectedParts] = useState([]);
	const [customerName, setCustomerName] = useState("");
	const [vehicleNumber, setVehicleNumber] = useState("");
	const [carImages, setCarImages] = useState([]);
	const [customerConcerns, setCustomerConcerns] = useState(""); // ✅ new state

	// new states for custom part
	const [customPartName, setCustomPartName] = useState("");
	const [customPartCost, setCustomPartCost] = useState("");
	const [partsOptions, setPartsOptions] = useState(additionalPartsList);

	const navigate = useNavigate();

	const washingCost = washing === "Yes" ? 300 : 0;
	const interiorCost = interior === "Yes" ? 1000 : 0;
	const teflonCost = teflon === "Yes" ? 2000 : 0;
	const serviceCost =
		selectedServiceIndex !== null
			? carServiceSchedules[selectedServiceIndex].cost
			: 0;
	const pickupCost = 300;
	const selectedPartsCost = selectedParts.reduce(
		(total, item) => total + item.cost,
		0
	);
	const totalCost =
		serviceCost +
		pickupCost +
		washingCost +
		interiorCost +
		teflonCost +
		selectedPartsCost;

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files);
		const readers = files.map((file) => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result);
				reader.onerror = reject;
				reader.readAsDataURL(file);
			});
		});

		Promise.all(readers).then((images) => {
			setCarImages(images);
		});
	};

	const handleSave = (e) => {
		e.preventDefault();
		const newCustomer = {
			id: Date.now(),
			customerName,
			vehicleNumber,
			selectedService:
				selectedServiceIndex !== null
					? carServiceSchedules[selectedServiceIndex].label
					: null,
			washing,
			interior,
			teflon,
			selectedParts,
			carImages,
			customerConcerns, // ✅ added here
			totalCost,
			createdAt: new Date().toISOString(),
		};
		addCustomer(newCustomer);
		alert("Customer saved successfully!");
		navigate("/"); // ✅ redirect to main page
	};

	// add custom part to dropdown
	const handleAddCustomPart = () => {
		if (customPartName.trim() === "" || customPartCost === "") {
			alert("Please enter both part name and cost");
			return;
		}
		const newPart = {
			label: customPartName,
			cost: Number(customPartCost),
		};
		setPartsOptions((prev) => [...prev, newPart]);
		setCustomPartName("");
		setCustomPartCost("");
		alert("Part added successfully!");
	};

	return (
		<div>
			<Navbar />
			<div className="container-lg p-5">
				<div className="row align-items-center mb-4">
					<div className="col-md-6">
						<h1 className="fw-bold">Create New Customer</h1>
					</div>
					<div className="col-md-6 text-md-end">
						<Link to="/">
							<button className="btn btn-primary px-4">
								Back To Dashboard
							</button>
						</Link>
					</div>
				</div>
				<div className="grid">
					<div className=" p-3 shadow m-3">
						<img
							src="https://media.istockphoto.com/id/1144385888/vector/happy-successful-man-is-standing-next-to-a-yellow-car-on-a-background-vector-illustration-in.jpg?s=612x612&w=0&k=20&c=TkDUuDoWVGfxKbazgWJHMGu3h29XWU6BdIVVWkg7GfY="
							alt=""
						/>
					</div>

					<div className="card p-3 shadow m-3">
						<h1 className="text-shadow">New Customer Component</h1>
						<hr />
						<form onSubmit={handleSave}>
							<div className="col pt-3">
								<h3>Customer Name</h3>
								<input
									className="form-control"
									value={customerName}
									onChange={(e) => setCustomerName(e.target.value)}
									placeholder="Enter the Customer Name"
									required
								/>
							</div>
							<div className="col pt-3">
								<h3>Vehicle Number</h3>
								<input
									className="form-control"
									value={vehicleNumber}
									onChange={(e) => setVehicleNumber(e.target.value)}
									placeholder="Enter the Vehicle Number"
									required
								/>
							</div>
							<div className="col pt-3">
								<h3>Service Type</h3>
								<select
									className="form-select"
									onChange={(e) =>
										setSelectedServiceIndex(Number(e.target.value))
									}
									defaultValue=""
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
							<div className="col pt-3">
								<h3>Washing</h3>
								<select
									className="form-select"
									value={washing}
									onChange={(e) => setWashing(e.target.value)}
								>
									<option value="Yes">Yes</option>
									<option value="No">No</option>
								</select>
							</div>
							<div className="col pt-3">
								<h3>Interior Cleaning</h3>
								<select
									className="form-select"
									value={interior}
									onChange={(e) => setInterior(e.target.value)}
								>
									<option value="Yes">Yes</option>
									<option value="No">No</option>
								</select>
							</div>
							<div className="col pt-3">
								<h3>Teflon Coating</h3>
								<select
									className="form-select"
									value={teflon}
									onChange={(e) => setTeflon(e.target.value)}
								>
									<option value="Yes">Yes</option>
									<option value="No">No</option>
								</select>
							</div>

							{/* Custom Part Input Section */}
							<div className="col pt-3">
								<h3>Add Custom Part</h3>
								<div className="d-flex gap-2">
									<input
										type="text"
										className="form-control"
										placeholder="Part Name"
										value={customPartName}
										onChange={(e) => setCustomPartName(e.target.value)}
									/>
									<input
										type="number"
										className="form-control"
										placeholder="Cost"
										value={customPartCost}
										onChange={(e) => setCustomPartCost(e.target.value)}
									/>
									<button
										type="button"
										className="btn btn-success"
										onClick={handleAddCustomPart}
									>
										Add
									</button>
								</div>
							</div>

							<div className="col pt-3">
								<h3>Additional Approvals (Search & Select Multiple)</h3>
								<Select
									options={partsOptions}
									isMulti
									onChange={(selected) => setSelectedParts(selected || [])}
									placeholder="Search and select parts..."
								/>
							</div>

							<div className="col-12">
								<h4>Upload Car Images</h4>
								<input
									type="file"
									className="form-control"
									multiple
									accept="image/*"
									onChange={handleImageChange}
								/>
								<div className="d-flex flex-wrap mt-3">
									{carImages.map((img, index) => (
										<img
											key={index}
											src={img}
											alt={`img-${index}`}
											className="me-2 mb-2"
											style={{
												width: "100px",
												height: "100px",
												objectFit: "cover",
												borderRadius: "8px",
											}}
										/>
									))}
								</div>
							</div>

							{/* Customer Concerns Section */}
							<div className="col pt-3">
								<h3>Customer Concerns</h3>
								<textarea
									className="form-control"
									placeholder="Enter customer concerns or issues with the vehicle..."
									rows="4"
									value={customerConcerns}
									onChange={(e) => setCustomerConcerns(e.target.value)}
								/>
							</div>

							<button
								type="submit"
								className="btn btn-primary mt-3 form-control fs-4"
							>
								Save
							</button>
						</form>
						<div className="col pt-3">
							<h3>Estimation</h3>
							<ul>
								<li>Service: ₹{serviceCost}</li>
								<li>Pick-up: ₹{pickupCost}</li>
								<li>Washing: ₹{washingCost}</li>
								<li>Interior Cleaning: ₹{interiorCost}</li>
								<li>Teflon Coating: ₹{teflonCost}</li>
								<li>Additional Parts: ₹{selectedPartsCost}</li>
							</ul>
							<h3>Total Estimated Cost: ₹{totalCost}</h3>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewCustomerComponent;
