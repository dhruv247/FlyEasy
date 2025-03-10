/**
 * Function to add a flight to the db
 * @param {*} event - form submission event
 * @description
 * 1. gets the data add flight form
 * 2. use addFlightToDB function from flightDB.js to add a flight to db
 * 3. reset (clear form after adding flight)
 */
function addFlight(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const flightNo = formData.get('flightNo');
    const planeType = formData.get('planeType');
    const airline = formData.get('airline');
    const departurePlace = formData.get('departurePlace');
    const departureDate = formData.get('departureDate');
    const departureTime = formData.get('departureTime');
    const arrivalPlace = formData.get('arrivalPlace');
    const arrivalDate = formData.get('arrivalDate');
    const arrivalTime = formData.get('arrivalTime');
    const duration = formData.get("duration");
    const economyCapacity = formData.get('economyCapacity');
    let economyBookedCount = 1;
    const businessCapacity = formData.get('businessCapacity');
    let businessBookedCount = 1;
    const economyBasePrice = formData.get('economyBasePrice');
    const businessBasePrice = formData.get('businessBasePrice');
    let economyCurrentPrice = (((economyBookedCount/100)*economyBasePrice)+economyBasePrice);
    let businessCurrentPrice = (((businessBookedCount/100) * businessBasePrice) + businessBasePrice);
    addFlightToDB(
        flightNo,
        planeType,
        airline,
        departurePlace,
        departureDate,
        departureTime,
        arrivalPlace,
        arrivalDate,
        arrivalTime,
        duration,
        economyCapacity,
        economyBookedCount,
        businessCapacity,
        businessBookedCount,
        economyBasePrice,
        businessBasePrice,
        economyCurrentPrice,
        businessCurrentPrice
    )
    .then((flight) => {
        console.log("Flight added successfully: ", flight);
        alert("Flight added successfully")
        document.getElementById("addFlightForm").reset();
    })
    .catch((error) => {
        alert(error.message);
    });
}