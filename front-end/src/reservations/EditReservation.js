import React, { useEffect, useState } from "react";
import { editReservation, readReservation } from "../utils/api";
import { formatAsDate } from "../utils/date-time";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import FormComp from "./FormComp";

export default function EditReservation() {
	const history = useHistory();
	const { reservation_id } = useParams();
	const [errors, setErrors] = useState([]);
	const [apiError, setApiError] = useState(null);
	const [formData, setFormData] = useState({
		first_name: "",
		last_name: "",
		mobile_number: "",
		reservation_date: "",
		reservation_time: "",
		people: "",
	});

	function validateFields() {
		const reserveDate = new Date(`${formData.reservation_date}T${formData.reservation_time}:00.000`);
		const todaysDate = new Date();
	
		const foundErrors = []
	
		for (const field in formData) {
			if (formData[field] === "") {
				foundErrors.push({ message: `${field.split("_").join(" ")} cannot be left blank.`})
			}
		}
		
		if (reserveDate.getDay() === 2) {
			foundErrors.push({ message: "Unfortunately, we are closed on Tuesdays." });
		}
		if (reserveDate < todaysDate) {
			foundErrors.push({ message: "Reservations cannot be made on a past date." });
		}
		if (reserveDate.getHours() < 10 || (reserveDate.getHours() === 10 && reserveDate.getMinutes() < 30)) {
			foundErrors.push({ message: "Unfortunately, we are not open until 10:30AM." });
		} else if (reserveDate.getHours() > 22 || (reserveDate.getHours() === 22 && reserveDate.getMinutes() >= 30)) {
			foundErrors.push({ message: "Unfortunately, we close at 10:30PM." });
		} else if (reserveDate.getHours() > 21 || (reserveDate.getHours() === 21 && reserveDate.getMinutes() > 30)) {
			foundErrors.push({ message: "Unfortunately, reservations must be made at least an hour before we close at 10:30PM." })
		}
	
		setErrors(foundErrors);
	
		return foundErrors.length === 0;
	}

	useEffect(() => {
		const abortController = new AbortController();
		if (!reservation_id) return null;

		readReservation(reservation_id)
			.then(fill);

		function fill(foundReservation) {
			if (!foundReservation || foundReservation.status !== "booked") {
				return <p>Only existing reservations can be edited.</p>;
			}

			const date = new Date(foundReservation.reservation_date);
			const dateString = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + (date.getDate())).slice(-2)}`;
	
			setFormData({
				first_name: foundReservation.first_name,
				last_name: foundReservation.last_name,
				mobile_number: foundReservation.mobile_number,
				reservation_date: dateString,
				reservation_time: foundReservation.reservation_time,
				people: foundReservation.people,
			});
		}

		return () => abortController.abort();
		
	}, [reservation_id]);

	function handleSubmit(event) {
		event.preventDefault();
		const abortController = new AbortController();

		if (validateFields()) {
			editReservation(reservation_id, formData)
				.then(({ reservation_date }) => history.push(`/dashboard?date=${formatAsDate(reservation_date)}`))
				.catch(setApiError);
		}

		return () => abortController.abort();
	}

	function handleChange({ target }) {
		setFormData({ ...formData, [target.name]: target.name === "people" ? Number(target.value) : target.value });
	}

	const errorsJSX = () => {
		return errors.map((error) => <ErrorAlert key={error} error={error} />);
	};

	return (
		<FormComp errorsJSX={errorsJSX} apiError={apiError} handleChange={handleChange} handleSubmit={handleSubmit} formData={formData} />
	);
}