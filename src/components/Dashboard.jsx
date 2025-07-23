import React from "react";
import Navbar from "./Navbar";
import { Link } from "react-router-dom"; // Updated: react-router-dom

function Dashboard() {
	return (
		<div>
			<Navbar />

			<div className="container-lg py-5">
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

				<div className="row g-4">
					<div className="col-md-6">
						<div className="card shadow h-100 border-0">
							<Link to="/customersList">
								<div className="card-body">
									<img
										src="https://previews.123rf.com/images/classicvector/classicvector2006/classicvector200600160/150122570-seller-talking-to-customer-about-car-dealer-and-future-vehicle-owner-rental-center-service.jpg"
										alt=""
									/>
									<h4 className="card-title mb-3">Visited Vehicles</h4>
									<p className="card-text">
										View all vehicles that have visited recently. This helps in
										follow-up and service reminders.
									</p>
								</div>
							</Link>
						</div>
					</div>

					<div className="col-md-6">
						<div className="card shadow h-100 border-0">
							<div className="card-body">
								<h4 className="card-title mb-3">Upcoming Appointments</h4>
								<p className="card-text">
									Keep track of scheduled services and pending customer
									appointments here.
								</p>
							</div>
						</div>
					</div>

					<div className="col-md-4">
						<div className="card shadow h-100 border-0">
							<div className="card-body">
								<h5 className="card-title">Recent Customers</h5>
								<p className="card-text">
									List of customers added recently with contact details.
								</p>
							</div>
						</div>
					</div>

					<div className="col-md-4">
						<div className="card shadow h-100 border-0">
							<div className="card-body">
								<h5 className="card-title">Parts Estimation</h5>
								<p className="card-text">
									Track estimation cost of additional parts selected during
									inspection.
								</p>
							</div>
						</div>
					</div>

					<div className="col-md-4">
						<div className="card shadow h-100 border-0">
							<div className="card-body">
								<h5 className="card-title">Technician Overview</h5>
								<p className="card-text">
									Assign, track and update technician job progress easily.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Dashboard;
