users = [{
    userId: "UUID", // unique id
    username: "dhruv123",
    email: "dhruv@gmail.com",
    password: "xyz", // hashed
    createdAt: '22-01-2025', // Fixed
    updatedAt: '22-02-2025',
    userType: "admin" // [admin, customer] (admin can change everything for a user, flights, and bookings)
}]

flights = [{
    flightId: "UUID",
    flightNo: "IN121", // Reused on repeated flights
    planeName: "Airbus A350",
    airline: "Indigo",
    departureTime: "1860",
    departureDate: "22-01-2025",
    departurePlace: "New York, US - John F Kennedy Airport", // Static
    arrivalPlace: "Los Angeles, US - Los Angeles International Airport", //Static
    arrivalTime: "2040",
    arrivalDate: "22-01-2025",
    duration: flights.arrivalTime-flights.departureTime,
    economyCapacity: 100, // Static
    economyBookedCount: 0, // Increase dynamically
    businessCapacity: 20, // Static
    businessBookedCount: 0, // Increase dynamically
    economyBasePrice: 5000, // Static
    businessBasePrice: 15000, // Static
    economyCurrentPrice: 5050, // Price dynamically using (((seatsBooked/100)*basePrice)+basePrice)
    businessCurrentPrice: 17000,
    createdAt: "xyz", // Price dynamically using (((seatsBooked/100)*basePrice)+basePrice)
    updatedAt: "xyz"
}]

bookings = [{
    bookingId: "UUID", // Unique ID
    user: {
        userId: users.userId,
        name: users.name,
        email: users.email
    },
    flight: {
        flightId: flights.flightId,
        flightNo: flights.flightNo,
        planeType: flights.planeType,
        departureTime: flights.departureTime,
        departureDate: flights.departureDate,
        departurePlace: flights.departurePlace,
        arrivalPlace: flights.arrivalPlace,
        arrivalTime: flights.arrivalTime,
        arrivalDate: flights.arrivalDate,
        airline: "Indigo",
    },
    tickets: [
        tickets.ticketID
    ],
    bookingDate: "21-01-2025", // Date of booking
    bookingTime: "1430", // Time of booking
    bookingPrice: 5050, // Price at the time of booking (Total price of tickets)
    status: "confirmed", // "confirmed", "canceled" (admin and users can cancel a booking) 
}]


tickets = [
    {
        ticketID: "UUID",
        userID: users.userId,
        flightID: flights.flightId,
        nameOfFlyer: "Raj",
        ageOfFlyer: 20,
        EmailOfFlyer: "dhruvmahendru247@gmail.com",
        tripType: "oneWay", // oneWay or roundTrip
        seatType: "economy", // "economy" or "business"
        ticketPrice: "5000" // Price of ticket (currentPrice)
    }
]