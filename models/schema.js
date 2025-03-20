users = [{
    userId: "UUID", // Unique ID - Primary Key (Automatic)
    username: "dhruv123", // Unique - Custom Index (case sensitive)
    email: "dhruv@gmail.com", // Unique - Custom Index (convert to lowercase when storing and checking against)
    password: "xyz", // hashed
    createdAt: '22-01-2025', // Automatic
    updatedAt: '22-02-2025', // Automatic
    userType: "admin" // admin, customer
}]

flights = [{
    flightId: "UUID", // Unique ID - Primary Key (Automatic)
    flightNo: "IN121", // Unique - Custom Index (Custom Index and Case Sensitive)
    planeName: "Airbus A350", // (Not Used for Search)
    airline: "Indigo", // (Not Used for Search)
    departurePlace: "John F Kennedy Airport - New York, USA", // convert to lowercase when storing and checking against
    departureDate: "22-01-2025", // (Format decided by form-select)
    departureTime: "1860", // (Format decided by form-select)
    arrivalPlace: "Los Angeles International Airport - Los Angeles, USA", // convert to lowercase when storing and checking against
    arrivalDate: "22-01-2025", // (Format decided by form-select)
    arrivalTime: "2040", // (Format decided by form-select)
    duration: "flights.arrivalDateTime-flights.departureDateTime", // By combining date and time
    economyCapacity: 100, // Entered Manually (Type - Number)
    economyBookedCount: 0, // Changed Dynamically (Type - Number)
    businessCapacity: 20, // Entered Manually (Type - Number)
    businessBookedCount: 0, // Changed Dynamically (Type - Number)
    economyBasePrice: 5000, // Entered Manually (Type - Number)
    businessBasePrice: 15000, // Entered Manually (Type - Number)
    economyCurrentPrice: 5050, // Change Dynamically using (((economySeatsBooked/economyCapacity)*basePrice)+basePrice)
    businessCurrentPrice: 17000, // Change Dynamically using (((businessSeatsBooked/businessCapacity)*basePrice)+basePrice)
    createdAt: "xyz", // Automatic
    updatedAt: "xyz", // Automatic
    changed: "No Changes" // No changes, Flight Times Changed
}]

tickets = [
    {
        ticketId: "UUID", // Unique ID - Primary Key (Automatic)
        user: {
            userId: users.userId,
            username: users.username,
            email: users.email
        },
        departureflight: {
            flightId: flights.flightId,
            flightNo: flights.flightNo,
            planeName: flights.planeName,
            airline: flights.airline,
            departurePlace: flights.departurePlace,
            departureDate: flights.departureDate,
            departureTime: flights.departureTime,
            arrivalPlace: flights.arrivalPlace,
            arrivalDate: flights.arrivalDate,
            arrivalTime: flights.arrivalTime,
            duration: flights.duration,
            economyCapacity: flights.economyCapacity,
            economyBookedCount: flights.economyBookedCount,
            businessCapacity: flights.businessCapacity,
            businessBookedCount: flights.businessBookedCount,
            economyBasePrice: flights.economyBasePrice,
            businessBasePrice: flights.businessBasePrice,
            economyCurrentPrice: flights.economyCurrentPrice,
            businessCurrentPrice: flights.businessCurrentPrice,
            createdAt: "xyz", // Automatic
            updatedAt: "xyz", // Automatic
            changed: flights.changed
        },
        returnflight: {
            flightId: flights.flightId,
            flightNo: flights.flightNo,
            planeName: flights.planeName,
            airline: flights.airline,
            departurePlace: flights.departurePlace,
            departureDate: flights.departureDate,
            departureTime: flights.departureTime,
            arrivalPlace: flights.arrivalPlace,
            arrivalDate: flights.arrivalDate,
            arrivalTime: flights.arrivalTime,
            duration: flights.duration,
            economyCapacity: flights.economyCapacity,
            economyBookedCount: flights.economyBookedCount,
            businessCapacity: flights.businessCapacity,
            businessBookedCount: flights.businessBookedCount,
            economyBasePrice: flights.economyBasePrice,
            businessBasePrice: flights.businessBasePrice,
            economyCurrentPrice: flights.economyCurrentPrice,
            businessCurrentPrice: flights.businessCurrentPrice,
            createdAt: "xyz", // Automatic
            updatedAt: "xyz", // Automatic
            changed: flights.changed
        },
        nameOfFlyer: "Raj", // (Not Used for Search)
        emailOfFlyer: "dhruvmahendru247@gmail.com", // (Not Used for Search)
        ageOfFlyer: 20, // (Not Used for Search, Type - Number)
        tripType: "oneWay", // oneWay or return
        seatType: "economy", // economy or business
        ticketPrice: 7500 // (departure flight price + return flight price) * 0.9
    }
]

bookings = [{
    bookingId: "UUID", // Unique ID - Primary Key (Automatic)
    user: {
        userId: users.userId,
        username: users.username,
        email: users.email
    },
    departureFlight: {
        flightId: flights.flightId,
        flightNo: flights.flightNo,
        planeName: flights.planeName,
        airline: flights.airline,
        departurePlace: flights.departurePlace,
        departureDate: flights.departureDate,
        departureTime: flights.departureTime,
        arrivalPlace: flights.arrivalPlace,
        arrivalDate: flights.arrivalDate,
        arrivalTime: flights.arrivalTime,
        duration: flights.duration,
        economyCapacity: flights.economyCapacity,
        economyBookedCount: flights.economyBookedCount,
        businessCapacity: flights.businessCapacity,
        businessBookedCount: flights.businessBookedCount,
        economyBasePrice: flights.economyBasePrice,
        businessBasePrice: flights.businessBasePrice,
        economyCurrentPrice: flights.economyCurrentPrice,
        businessCurrentPrice: flights.businessCurrentPrice,
        createdAt: "xyz", // Automatic
        updatedAt: "xyz", // Automatic
        changed: flights.changed
    },
    returnFlight: {
        flightId: flights.flightId,
        flightNo: flights.flightNo,
        planeName: flights.planeName,
        airline: flights.airline,
        departurePlace: flights.departurePlace,
        departureDate: flights.departureDate,
        departureTime: flights.departureTime,
        arrivalPlace: flights.arrivalPlace,
        arrivalDate: flights.arrivalDate,
        arrivalTime: flights.arrivalTime,
        duration: flights.duration,
        economyCapacity: flights.economyCapacity,
        economyBookedCount: flights.economyBookedCount,
        businessCapacity: flights.businessCapacity,
        businessBookedCount: flights.businessBookedCount,
        economyBasePrice: flights.economyBasePrice,
        businessBasePrice: flights.businessBasePrice,
        economyCurrentPrice: flights.economyCurrentPrice,
        businessCurrentPrice: flights.businessCurrentPrice,
        createdAt: "xyz", // Automatic
        updatedAt: "xyz", // Automatic
        changed: flights.changed
    },
    tickets: [
        {
            ticketId: tickets.ticketId,
            nameOfFlyer: "Raj", // (Not Used for Search)
            ageOfFlyer: 20, // (Not Used for Search, Type - Number)
            emailOfFlyer: "dhruvmahendru247@gmail.com", // (Not Used for Search)
            tripType: "oneWay", // oneWay or return
            seatType: "economy", // economy (1) or business (2)
            ticketPrice: 7500 // (departure flight price + return flight price)
        }
    ],
    ticketCount: 5, // calculate from tickets and store
    tripType: "oneWay", // oneWay or return
    createdAt: "21-01-2025",
    updatedAt: '22-02-2025',
    bookingPrice: 5050, // Sum of all tickets
    status: "confirmed" // confirmed, cancelled
}]