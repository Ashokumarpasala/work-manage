import React from "react";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";

// ✅ Reusable Card Component
const DashboardCard = ({ title, text, link, img }) => (
	<div className="card shadow h-100 border-0">
		{link ? (
			<Link to={link} className="text-decoration-none text-dark">
				<div className="card-body">
					{img && (
						<img src={img} alt={title} className="img-fluid mb-3 rounded" />
					)}
					<h4 className="card-title mb-3">{title}</h4>
					<p className="card-text">{text}</p>
				</div>
			</Link>
		) : (
			<div className="card-body">
				{img && (
					<img src={img} alt={title} className="img-fluid mb-3 rounded" />
				)}
				<h4 className="card-title mb-3">{title}</h4>
				<p className="card-text">{text}</p>
			</div>
		)}
	</div>
);

function Dashboard() {
	const mainCards = [
		{
			title: "Visited Vehicles",
			text: "View all vehicles that have visited recently. This helps in follow-up and service reminders.",
			link: "/customersList",
			img: "https://previews.123rf.com/images/classicvector/classicvector2006/classicvector200600160/150122570-seller-talking-to-customer-about-car-dealer-and-future-vehicle-owner-rental-center-service.jpg",
			col: "col-md-6",
		},
		{
			title: "Upcoming Appointments",
			text: "Keep track of scheduled services and pending customer appointments here.",
			col: "col-md-6",
		},
	];

	const subCards = [
		{
			title: "Recent Customers",
			text: "List of customers added recently with contact details.",
		},
		{
			title: "Parts Estimation",
			text: "Track estimation cost of additional parts selected during inspection.",
		},
		{
			title: "Technician Overview",
			text: "Assign, track and update technician job progress easily.",
		},
	];

	return (
		<div>
			<Navbar />

			<div className="container-lg py-5">
				{/* Header */}
				<div className="row align-items-center mb-4">
					<div className="col-md-6">
						<h1 className="fw-bold">Dashboard</h1>
					</div>
					<div className="col-md-6 text-md-end">
						<Link to="/newcustomer">
							<button className="btn btn-primary px-4">+ New Customer</button>
						</Link>
					</div>
				</div>

				{/* Main Cards */}
				<div className="row g-4 mb-4">
					{mainCards.map((card, i) => (
						<div className={card.col} key={i}>
							<DashboardCard {...card} />
						</div>
					))}
				</div>

				{/* Sub Cards */}
				<div className="row g-4">
					{subCards.map((card, i) => (
						<div className="col-md-4" key={i}>
							<DashboardCard {...card} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default Dashboard;
