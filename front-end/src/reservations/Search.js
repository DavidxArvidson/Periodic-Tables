import React, { useState } from "react";
import { listReservations } from "../utils/api";
import ReservationTableComp from "../dashboard/ReservationTableComp"
import ErrorAlert from "../layout/ErrorAlert";

export default function Search() {
    const [mobileNumber, setMobileNumber] = useState("");

    const [reservations, setReservations] = useState([]);

    const [error, setError] = useState(null);

    function handleChange({ target }) {
	    setMobileNumber(target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();
    
        const abortController = new AbortController();
    
        setError(null);
    
        listReservations({ mobile_number: mobileNumber }, abortController.signal)
            .then(setReservations)
            .catch(setError);
    
        return () => abortController.abort();
    }

    const searchResults = () => {
        return reservations.length > 0 ?
            reservations.map((reservation) => 
                <ReservationTableComp key={reservation.reservation_id} reservation={reservation} />) :
            <p>No reservations found</p>;
    }

	return (
		<div>
			<form>
                <ErrorAlert error={error} />
				<label htmlFor="mobile_number">Enter the phone number:</label>
				<input 
					name="mobile_number"
					id="mobile_number"
					type="tel"
					onChange={handleChange}
					value={mobileNumber}
					required
				/>

				<button type="submit" onClick={handleSubmit}>Find</button>
			</form>
            <table class="table">
			    <thead class="thead-light">
				    <tr>
					    <th scope="col">ID</th>
					    <th scope="col">First Name</th>
					    <th scope="col">Last Name</th>
					    <th scope="col">Mobile Number</th>
					    <th scope="col">Time</th>
					    <th scope="col">People</th>
					    <th scope="col">Status</th>
						<th scope="col">Edit</th>
						<th scope="col">Cancel</th>
						<th scope="col">Seat</th>
				    </tr>
			    </thead>
				
			    <tbody>
				    {searchResults()}
			    </tbody>
		    </table>
		</div>
	);
}