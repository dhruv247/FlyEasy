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
    economyCurrentPrice: 5050, // Change Dynamically using (((seatsBooked/100)*basePrice)+basePrice)
    businessCurrentPrice: 17000, // Change Dynamically using (((seatsBooked/100)*basePrice)+basePrice)
    createdAt: "xyz", // Automatic
    updatedAt: "xyz", // Automatic
    changed: "No Changes" // No changes, Flight Times Changed
}]

tickets = [
    {
        ticketId: "UUID", // Unique ID - Primary Key (Automatic)
        user: user.userId,
        departureFlight: flight.flightId, // Flight for outbound journey
        returnFlight: flight.flightId, // Flight for return journey (null for one-way)
        nameOfFlyer: "Raj", // (Not Used for Search)
        ageOfFlyer: 20, // (Not Used for Search, Type - Number)
        emailOfFlyer: "dhruvmahendru247@gmail.com", // (Not Used for Search)
        tripType: "oneWay", // oneWay or return
        seatType: "economy", // economy or business
        ticketPrice: 7500 // (departure flight price + return flight price) * 0.9
    }
]

bookings = [{
    bookingId: "UUID", // Unique ID - Primary Key (Automatic)
    user: users.userId,
    tickets: [ticket1.ticketId, ticket2.ticketId], // Array of ticket IDs
    tripType: "oneWay", // oneWay or return
    createdAt: "21-01-2025",
    updatedAt: '22-02-2025',
    bookingPrice: 5050, // Sum of all tickets
    status: "confirmed" // confirmed, cancelled
}]

// ------------------------------------------------------------------ OLD SCHEMA FOR TICKETS AND BOOKINGS

// tickets = [
//     {
//         ticketId: "UUID", // Unique ID - Primary Key (Automatic)
//         user: {
//             userId: users.userId,
//             name: users.username,
//             email: users.email
//         },
//         flight: {
//             flightId: flights.flightId,
//             flightNo: flights.flightNo,
//             planeName: flights.planeName,
//             airline: flights.airline,
//             departurePlace: flights.departurePlace,
//             departureDate: flights.departureDate,
//             departureTime: flights.departureTime,
//             arrivalPlace: flights.arrivalPlace,
//             arrivalDate: flights.arrivalDate,
//             arrivalTime: flights.arrivalTime,
//             duration: flights.duration,
//             economyCapacity: flights.economyCapacity,
//             economyBookedCount: flights.economyBookedCount,
//             businessCapacity: flights.businessCapacity,
//             businessBookedCount: flights.businessBookedCount,
//             economyBasePrice: flights.economyBasePrice,
//             businessBasePrice: flights.businessBasePrice,
//             economyCurrentPrice: flights.economyCurrentPrice,
//             businessCurrentPrice: flights.businessCurrentPrice,
//             changed: flights.changed
//         },
//         nameOfFlyer: "Raj", // (Not Used for Search)
//         ageOfFlyer: 20, // (Not Used for Search, Type - Number)
//         EmailOfFlyer: "dhruvmahendru247@gmail.com", // (Not Used for Search, Type - Number)
//         tripType: "oneWay", // Automatic for all tickets within one booking (taken from form select in searchFlight.html)
//         seatType: "economy", // Automatic for all tickets within one booking (taken from form select in searchFlight.html)
//         ticketPrice: 7500 // (Combined Dynamically using - tripType, seatType, currentPrice for seatType (10 % Discount for round-trip) (Type - Number))
//     }
// ]

// bookings = [{
//     bookingId: "UUID", // Unique ID - Primary Key (Automatic)
//     user: {
//         userId: users.userId,
//         username: user.username,
//         email: users.email
//     },
//     flight: {
//         flightId: flights.flightId,
//         flightNo: flights.flightNo,
//         planeName: flights.planeName,
//         airline: flights.airline,
//         departurePlace: flights.departurePlace,
//         departureDate: flights.departureDate,
//         departureTime: flights.departureTime,
//         arrivalPlace: flights.arrivalPlace,
//         arrivalDate: flights.arrivalDate,
//         arrivalTime: flights.arrivalTime,
//         duration: flights.duration,
//         changed: flights.changed
//     },
//     tickets: [
//         {
//             ticketId: tickets.ticketId,
//             nameOfFlyer: tickets.nameOfFlyer,
//             ageOfFlyer: tickets.ageOfFlyer,
//             emailOfFlyer: tickets.emailOfFlyer,
//             tripType: tickets.tripType,
//             seatType: tickets.seatType,
//             ticketPrice: tickets.ticketPrice,
//         }
//     ],
//     bookingDate: "21-01-2025", // (Automatic - createdAt)
//     updatedAt: '22-02-2025', // (Automatic - Cancel Booking)
//     bookingPrice: 5050, // Calculated by combining ticket prices (Type - Number)
//     status: "confirmed", // confirmed, cancelled 
// }]