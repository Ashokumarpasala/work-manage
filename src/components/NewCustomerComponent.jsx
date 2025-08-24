import React, { useState, useEffect, useMemo, useCallback } from "react";
import Select from "react-select";
import Navbar from "./Navbar";
import additionalPartsList from "./parts";
import { addCustomer } from "./CustomerList";
import { Link, useNavigate } from "react-router-dom"; // ✅ fixed import

// Constant service schedules (doesn't change per render)
const CAR_SERVICE_SCHEDULES = [
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

function NewCustomerComponent() {
	const [formData, setFormData] = useState({
		customerName: "",
		vehicleNumber: "",
		selectedServiceIndex: null,
		washing: "No",
		interior: "No",
		teflon: "No",
		selectedParts: [],
		carImages: [],
		customerConcerns: "",
	});

	const [partsOptions, setPartsOptions] = useState(additionalPartsList);
	const [customPartName, setCustomPartName] = useState("");
	const [customPartCost, setCustomPartCost] = useState("");
	const [editMode, setEditMode] = useState(false);
	const [editCustomerId, setEditCustomerId] = useState(null);
	const [initialServiceCost, setInitialServiceCost] = useState(0);
	const [originalCreatedAt, setOriginalCreatedAt] = useState(null);

	const navigate = useNavigate();

	// ----- Load edit data if present -----
	useEffect(() => {
		const editCustomer = JSON.parse(localStorage.getItem("EDIT_CUSTOMER"));
		if (editCustomer) {
			setEditMode(true);
			setEditCustomerId(editCustomer.id);

			setFormData((prev) => ({
				...prev,
				customerName: editCustomer.customerName || "",
				vehicleNumber: editCustomer.vehicleNumber || "",
				customerConcerns: editCustomer.customerConcerns || "",
				washing: editCustomer.washing || "No",
				interior: editCustomer.interior || "No",
				teflon: editCustomer.teflon || "No",
				carImages: Array.isArray(editCustomer.carImages)
					? editCustomer.carImages
					: [],
				selectedParts: Array.isArray(editCustomer.selectedParts)
					? editCustomer.selectedParts
					: [],
				selectedServiceIndex: CAR_SERVICE_SCHEDULES.findIndex(
					(s) => s.label === editCustomer.selectedService
				),
			}));

			setOriginalCreatedAt(editCustomer.createdAt || new Date().toISOString());
			setInitialServiceCost(editCustomer.serviceCost || 0);

			// Merge custom parts back into select options
			const merged = [...additionalPartsList];
			(editCustomer.selectedParts || []).forEach((p) => {
				if (!merged.some((opt) => opt.label === p.label)) {
					merged.push({ label: p.label, cost: Number(p.cost) || 0 });
				}
			});
			setPartsOptions(merged);
		}
	}, []);

	// ----- Costs (memoized) -----
	const {
		serviceCost,
		washingCost,
		interiorCost,
		teflonCost,
		pickupCost,
		selectedPartsCost,
		totalCost,
	} = useMemo(() => {
		const washingCost = formData.washing === "Yes" ? 300 : 0;
		const interiorCost = formData.interior === "Yes" ? 1000 : 0;
		const teflonCost = formData.teflon === "Yes" ? 2000 : 0;
		const serviceCost =
			formData.selectedServiceIndex !== null
				? CAR_SERVICE_SCHEDULES[formData.selectedServiceIndex].cost
				: initialServiceCost;

		const pickupCost = 300;
		const selectedPartsCost = formData.selectedParts.reduce(
			(total, item) => total + (Number(item.cost) || 0),
			0
		);

		return {
			serviceCost,
			washingCost,
			interiorCost,
			teflonCost,
			pickupCost,
			selectedPartsCost,
			totalCost:
				serviceCost +
				pickupCost +
				washingCost +
				interiorCost +
				teflonCost +
				selectedPartsCost,
		};
	}, [formData, initialServiceCost]);

	// ----- Image handling -----
	// ----- Image handling -----
	const handleImageChange = useCallback((e) => {
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
			setFormData((prev) => ({
				...prev,
				carImages: [...prev.carImages, ...images], // ✅ append instead of replace
			}));
		});
	}, []);

	// ----- Save -----
	const handleSave = useCallback(
		(e) => {
			e.preventDefault();

			const payload = {
				id: editMode ? editCustomerId : Date.now(),
				customerName: formData.customerName,
				vehicleNumber: formData.vehicleNumber,
				selectedService:
					formData.selectedServiceIndex !== null
						? CAR_SERVICE_SCHEDULES[formData.selectedServiceIndex].label
						: null,
				serviceCost,
				additionalCost: totalCost - serviceCost,
				totalCost,
				washing: formData.washing,
				interior: formData.interior,
				teflon: formData.teflon,
				selectedParts: formData.selectedParts,
				carImages: formData.carImages,
				customerConcerns: formData.customerConcerns,
				createdAt: editMode ? originalCreatedAt : new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			if (editMode) {
				let customers = JSON.parse(localStorage.getItem("CUSTOMER_LIST")) || [];
				customers = customers.map((c) =>
					c.id === editCustomerId ? payload : c
				);
				localStorage.setItem("CUSTOMER_LIST", JSON.stringify(customers));
				localStorage.removeItem("EDIT_CUSTOMER");
				alert("Customer updated successfully!");
			} else {
				addCustomer(payload);
				alert("Customer saved successfully!");
			}

			navigate("/customersList");
		},
		[
			editMode,
			editCustomerId,
			formData,
			serviceCost,
			totalCost,
			originalCreatedAt,
			navigate,
		]
	);

	// ----- Add custom part -----
	const handleAddCustomPart = useCallback(() => {
		if (!customPartName.trim() || !customPartCost) {
			alert("Please enter both part name and cost");
			return;
		}
		const newPart = { label: customPartName, cost: Number(customPartCost) };
		setPartsOptions((prev) => [...prev, newPart]);
		setFormData((prev) => ({
			...prev,
			selectedParts: [...prev.selectedParts, newPart],
		}));
		setCustomPartName("");
		setCustomPartCost("");
		alert("Part added successfully!");
	}, [customPartName, customPartCost]);

	return (
		<div>
			<Navbar />
			<div className="container p-3 p-md-5">
				{/* Header */}
				<div className="row align-items-center mb-4">
					<div className="col-12 col-md-6">
						<h2 className="fw-bold">
							{editMode ? "Edit Customer" : "Create New Customer"}
						</h2>
					</div>
					<div className="col-12 col-md-6 text-md-end">
						<Link to="/">
							<button className="btn btn-primary">Back To Dashboard</button>
						</Link>
					</div>
				</div>

				{/* Form */}
				<div className="card p-3 shadow">
					<form onSubmit={handleSave}>
						{/* Customer Details */}
						<div className="mb-3">
							<label className="form-label">Customer Name</label>
							<input
								className="form-control"
								value={formData.customerName}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										customerName: e.target.value,
									}))
								}
								required
							/>
						</div>

						<div className="mb-3">
							<label className="form-label">Vehicle Number</label>
							<input
								className="form-control"
								value={formData.vehicleNumber}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										vehicleNumber: e.target.value,
									}))
								}
								required
							/>
						</div>

						{/* Service */}
						<div className="mb-3">
							<label className="form-label">Service Type</label>
							<select
								className="form-select"
								value={formData.selectedServiceIndex ?? ""}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										selectedServiceIndex:
											e.target.value === "" ? null : Number(e.target.value),
									}))
								}
							>
								<option value="">-- Select Service --</option>
								{CAR_SERVICE_SCHEDULES.map((s, i) => (
									<option key={i} value={i}>
										{s.label}
									</option>
								))}
							</select>
						</div>

						{/* Options */}
						<div className="row">
							{["washing", "interior", "teflon"].map((field, i) => (
								<div className="col-12 col-sm-4 mb-3" key={i}>
									<label className="form-label">{field}</label>
									<select
										className="form-select"
										value={formData[field]}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												[field]: e.target.value,
											}))
										}
									>
										<option value="Yes">Yes</option>
										<option value="No">No</option>
									</select>
								</div>
							))}
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
							<label className="form-label">Additional Approvals</label>
							<Select
								options={partsOptions}
								isMulti
								value={formData.selectedParts}
								onChange={(selected) =>
									setFormData((prev) => ({
										...prev,
										selectedParts: selected || [],
									}))
								}
								placeholder="Search and select parts..."
								getOptionLabel={(o) => o.label}
								getOptionValue={(o) => String(o.label)}
							/>
						</div>

						{/* Images */}
						<div className="mb-3">
							<label className="form-label">Upload Car Images</label>
							<input
								type="file"
								multiple
								accept="image/*"
								className="form-control"
								onChange={handleImageChange}
							/>
							<div className="d-flex flex-wrap mt-3 gap-2">
								{formData.carImages.map((img, i) => (
									<img
										key={i}
										src={img}
										alt={`car-${i}`}
										style={{ width: 100, height: 100, objectFit: "cover" }}
										className="rounded"
									/>
								))}
							</div>
						</div>

						{/* Concerns */}
						<div className="mb-3">
							<label className="form-label">Customer Concerns</label>
							<textarea
								className="form-control"
								rows="3"
								value={formData.customerConcerns}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										customerConcerns: e.target.value,
									}))
								}
							/>
						</div>

						{/* Save */}
						<button type="submit" className="btn btn-primary w-100 fs-5 mt-2">
							{editMode ? "Update Customer" : "Save"}
						</button>
					</form>

					{/* Estimation */}
					<div className="mt-4">
						<h5>Estimation</h5>
						<ul>
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
	);
}

export default NewCustomerComponent;
