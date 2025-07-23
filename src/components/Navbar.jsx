import React from "react";
import { Link, NavLink } from "react-router";

function Navbar() {
	return (
		<div className="h-50 p-3 fs-3 shadow ">
			<div className="container">
				<NavLink
					to="/"
					className="text-black link-underline link-underline-opacity-0"
				>
					<h3>MY APP</h3>
				</NavLink>
			</div>
		</div>
	);
}

export default Navbar;
