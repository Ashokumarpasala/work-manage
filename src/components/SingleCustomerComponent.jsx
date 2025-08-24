import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { Link } from "react-router";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JSZip from "jszip";
import { saveAs } from "file-saver";

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

	// ---- Helpers ----
	const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
	const ensureSpace = (doc, currentY, needed = 60) => {
		const pageHeight = doc.internal.pageSize.height;
		if (currentY + needed > pageHeight - 40) {
			doc.addPage();
			return 40; // reset to top margin
		}
		return currentY;
	};

	// ---- Cost Calculations ----
	const serviceCost =
		typeof customer.serviceCost === "number" ? customer.serviceCost : 0;

	const washingCost = customer.washing === "Yes" ? 300 : 0;
	const interiorCost = customer.interior === "Yes" ? 1000 : 0;
	const teflonCost = customer.teflon === "Yes" ? 2000 : 0;
	const pickupCost = 300;

	const selectedPartsCost = Array.isArray(customer.selectedParts)
		? customer.selectedParts.reduce((t, p) => t + Number(p?.cost || 0), 0)
		: 0;

	const computedAdditional =
		washingCost + interiorCost + teflonCost + pickupCost + selectedPartsCost;

	const additionalCost =
		typeof customer.additionalCost === "number"
			? customer.additionalCost
			: computedAdditional;

	const discountValue = (serviceCost * (Number(discountPercent) || 0)) / 100;
	const finalTotal = serviceCost - discountValue + additionalCost;

	// ---- Download all images as ZIP ----
	const downloadAllImagesAsZip = async () => {
		if (!customer.carImages || customer.carImages.length === 0) {
			alert("No images to download");
			return;
		}
		const zip = new JSZip();
		customer.carImages.forEach((img, idx) => {
			const base64Data = img.split(",")[1];
			zip.file(`car_image_${idx + 1}.jpg`, base64Data, { base64: true });
		});
		const content = await zip.generateAsync({ type: "blob" });
		saveAs(content, `${customer.customerName || "customer"}_car_images.zip`);
	};

	// ---- PDF Generator ----
	const buildInvoiceDoc = async () => {
		const doc = new jsPDF("p", "pt", "a4");
		doc.setProperties({ title: `Invoice_${customer?.id}` });

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
		doc.addImage(logoImg, "PNG", 430, 24, 100, 100);

		// Header
		doc.setFont("helvetica", "bold");
		doc.setFontSize(16);
		doc.text("SCAVENGERS Auto Care", 40, 50);

		doc.setFont("helvetica", "normal");
		doc.setFontSize(10);
		doc.text("Raam Group Service Center", 40, 66);
		doc.text("Plot No. 12, Banjara Hills, Hyderabad, India", 40, 80);
		doc.text("GSTIN: 36ABCDE1234F1Z5", 40, 94);
		doc.text("Phone: +91-9876543210 | Email: info@scavengers.com", 40, 108);

		doc.line(40, 120, 555, 120);

		doc.setFont("helvetica", "bold");
		doc.setFontSize(12);
		doc.text("INVOICE", 40, 140);

		doc.setFont("helvetica", "normal");
		doc.setFontSize(10);
		doc.text(`Invoice No: ${customer.id}`, 40, 156);
		doc.text(`Date: ${new Date().toLocaleDateString()}`, 40, 170);

		// Customer Info
		let startY = 196;
		startY = ensureSpace(doc, startY, 80);
		doc.setFont("helvetica", "bold");
		doc.setFontSize(12);
		doc.text("CUSTOMER INFO", 40, startY);

		doc.setFont("helvetica", "normal");
		doc.setFontSize(10);
		doc.text(
			`Name: ${(customer.customerName || "-").toUpperCase()}`,
			40,
			startY + 16
		);
		doc.text(
			`Vehicle No: ${(customer.vehicleNumber || "-").toUpperCase()}`,
			40,
			startY + 30
		);
		doc.text(
			`Service: ${(customer.selectedService || "-").toUpperCase()}`,
			40,
			startY + 44
		);
		doc.text(
			`Concerns: ${(customer.customerConcerns || "NONE").toUpperCase()}`,
			40,
			startY + 58
		);
		startY += 80;

		// Parts Table
		if (
			Array.isArray(customer.selectedParts) &&
			customer.selectedParts.length > 0
		) {
			autoTable(doc, {
				startY,
				head: [["Part Name", "Cost"]],
				body: customer.selectedParts.map((p) => [
					(p?.label || "-").toUpperCase(),
					inr(p?.cost || 0),
				]),
				styles: { fontSize: 9 },
				headStyles: { fillColor: [230, 230, 230] },
				theme: "grid",
				margin: { left: 40, right: 40 },
			});
			startY = doc.lastAutoTable.finalY + 12;
		}

		// Additional Charges
		autoTable(doc, {
			startY,
			head: [["Additional Charges", "Amount"]],
			body: [
				["Pick-up", inr(pickupCost)],
				["Washing", inr(washingCost)],
				["Interior Cleaning", inr(interiorCost)],
				["Teflon Coating", inr(teflonCost)],
				["Additional Parts", inr(selectedPartsCost)],
				[
					{ content: "Additional Subtotal", styles: { fontStyle: "bold" } },
					{ content: inr(computedAdditional), styles: { fontStyle: "bold" } },
				],
			],
			styles: { fontSize: 9 },
			headStyles: { fillColor: [230, 230, 230] },
			theme: "grid",
			margin: { left: 40, right: 40 },
		});
		startY = doc.lastAutoTable.finalY + 12;

		// Cost Summary
		autoTable(doc, {
			startY,
			head: [["Description", "Amount"]],
			body: [
				["Service Cost", inr(serviceCost)],
				[
					`Discount (${Number(discountPercent) || 0}% of Service)`,
					`-${inr(discountValue)}`,
				],
				["Additional Cost", inr(additionalCost)],
				[
					{ content: "Grand Total", styles: { fontStyle: "bold" } },
					{ content: inr(finalTotal), styles: { fontStyle: "bold" } },
				],
			],
			styles: { fontSize: 10 },
			headStyles: { fillColor: [230, 230, 230] },
			theme: "grid",
			margin: { left: 40, right: 40 },
		});
		startY = doc.lastAutoTable.finalY + 16;

		// Car Images
		if (Array.isArray(customer.carImages) && customer.carImages.length > 0) {
			doc.setFont("helvetica", "bold");
			doc.setFontSize(12);
			doc.text("CAR IMAGES", 40, startY);
			startY += 12;

			let x = 40;
			let y = startY;
			const size = 78;
			const gap = 10;

			for (let i = 0; i < customer.carImages.length; i++) {
				y = ensureSpace(doc, y, size + gap);

				try {
					doc.addImage(customer.carImages[i], "JPEG", x, y, size, size);
				} catch {
					try {
						doc.addImage(customer.carImages[i], "PNG", x, y, size, size);
					} catch {}
				}

				x += size + gap;
				if (x + size > 555) {
					x = 40;
					y += size + gap;
				}
				startY = y + size + 10;
			}
		}

		// Footer
		startY = ensureSpace(doc, startY, 60);
		doc.setLineWidth(0.2);
		doc.line(40, startY, 555, startY);
		startY += 14;

		doc.setFont("helvetica", "bold");
		doc.setFontSize(10);
		doc.text("PAYMENT DETAILS", 40, startY);
		doc.setFont("helvetica", "normal");
		doc.setFontSize(9);
		doc.text(
			"Bank: HDFC Bank | A/C: 123456789012 | IFSC: HDFC0000123 | UPI: scavengers@upi",
			40,
			startY + 14
		);
		doc.text("Thank you for trusting Scavengers Auto Care!", 40, startY + 34);

		return doc;
	};

	const previewInvoice = async () => {
		const doc = await buildInvoiceDoc();
		window.open(doc.output("bloburl"), "_blank");
	};

	const downloadInvoice = async () => {
		const doc = await buildInvoiceDoc();
		doc.save(`Invoice_${customer?.vehicleNumber || customer?.id}.pdf`);
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
							<strong>Name:</strong> {customer.customerName.toUpperCase()}
						</p>
						<p>
							<strong>Vehicle Number:</strong>{" "}
							{customer.vehicleNumber.toUpperCase()}
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
							<strong>Service:</strong> {customer.selectedService || "-"}
						</p>
						<p>
							<strong>Concerns:</strong> {customer.customerConcerns || "None"}
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

					{/* Selected Parts */}
					<div className="mb-4 p-3 border rounded bg-light">
						<h4>Selected Parts</h4>
						{Array.isArray(customer.selectedParts) &&
						customer.selectedParts.length > 0 ? (
							<ul className="list-group">
								{customer.selectedParts.map((part, idx) => (
									<li
										key={idx}
										className="list-group-item d-flex justify-content-between"
									>
										{part.label} <span>{inr(part.cost)}</span>
									</li>
								))}
							</ul>
						) : (
							<p>No parts selected.</p>
						)}
					</div>

					{/* Car Images */}
					{customer.carImages && customer.carImages.length > 0 && (
						<div className="mb-4 p-3 border rounded bg-light">
							<h4>Car Images</h4>
							<div className="d-flex flex-wrap gap-3">
								{customer.carImages.map((img, idx) => (
									<div key={idx} className="text-center">
										<img
											src={img}
											alt={`car-${idx}`}
											style={{
												width: "100px",
												height: "100px",
												objectFit: "cover",
												borderRadius: "8px",
												margin: "5px",
											}}
										/>
									</div>
								))}
							</div>
							<button
								className="btn btn-sm btn-outline-success mt-3"
								onClick={downloadAllImagesAsZip}
							>
								Download All Images (ZIP)
							</button>
						</div>
					)}

					{/* Cost Summary */}
					<div className="p-3 border rounded bg-light">
						<h4>Cost Summary</h4>
						<p>
							<strong>Service Cost:</strong> {inr(serviceCost)}
						</p>
						<p>
							<strong>Additional Cost:</strong> {inr(additionalCost)}
						</p>
						<p>
							<strong>Discount ({discountPercent}%):</strong> -
							{inr(discountValue)}
						</p>
						<h5>
							<strong>Grand Total:</strong> {inr(finalTotal)}
						</h5>

						<div className="mt-3">
							<label className="form-label">
								<strong>Apply Discount (%)</strong>
							</label>
							<input
								type="number"
								min="0"
								max="100"
								className="form-control"
								value={discountPercent}
								onChange={(e) => setDiscountPercent(e.target.value)}
								placeholder="Enter discount %"
							/>
						</div>
					</div>

					{/* PDF Buttons */}
					<div className="d-flex gap-2 mt-3">
						<button
							className="btn btn-outline-primary"
							onClick={previewInvoice}
						>
							Preview Invoice
						</button>
						<button className="btn btn-success" onClick={downloadInvoice}>
							Download Invoice (PDF)
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SingleCustomerComponent;
