import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router-dom";
import VistedvehiclesModule from "/src/components/VistedvehiclesModule.jsx";
import NewCustomerComponent from "./components/NewCustomerComponent.jsx";
import CustomerList from "./components/VistedvehiclesModule.jsx";
import SingleCustomerComponent from "./components/SingleCustomerComponent.jsx";

let router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
	},
	{
		path: "/visited",
		element: <VistedvehiclesModule />,
	},
	{
		path: "/customersList",
		element: <CustomerList />,
	},
	{
		path: "/newcustomer",
		element: <NewCustomerComponent />,
	},
	{
		path: "/singlecustomer",
		element: <SingleCustomerComponent />,
	},
]);

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>
);
