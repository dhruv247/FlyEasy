// Helper function to generate dates
function generateDates(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    while (currentDate <= lastDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

// Helper function to generate flight numbers
function generateFlightNo(airline) {
    const prefixes = {
        'Indigo': '6E',
        'Air India': 'AI',
        'Vistara': 'UK',
        'Jet Airways': '9W'
    };
    return `${prefixes[airline]} ${Math.floor(1000 + Math.random() * 9000)}`;
}

// Helper function to generate random number within range
function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function loadSampleFlights() {
    try {
        const routes = [
            { from: "New Delhi", to: "Mumbai", duration: "2:20" },
            { from: "Mumbai", to: "New Delhi", duration: "2:20" },
            { from: "Bengaluru", to: "Mumbai", duration: "1:40" },
            { from: "Mumbai", to: "Bengaluru", duration: "1:40" },
            { from: "New Delhi", to: "Kolkata", duration: "2:30" },
            { from: "Kolkata", to: "New Delhi", duration: "2:30" },
            { from: "Bengaluru", to: "Kolkata", duration: "2:30" },
            { from: "Kolkata", to: "Bengaluru", duration: "2:30" },
            { from: "New Delhi", to: "Bengaluru", duration: "2:50" },
            { from: "Bengaluru", to: "New Delhi", duration: "2:50" }
        ];

        const airlines = ["Indigo", "Air India", "Vistara", "Jet Airways"];
        const planes = ["Airbus A380", "Boeing 737", "Airbus A350", "Boeing 777"];
        const departureTimes = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
        
        // Generate dates for March, April, May 2025
        const dates = generateDates("2025-03-01", "2025-05-31");
        
        const sampleFlights = [];

        // Generate flights
        for (const date of dates) {
            // Generate 2-3 flights per route per day
            for (const route of routes) {
                const flightsPerDay = randomInRange(2, 3);
                
                for (let i = 0; i < flightsPerDay; i++) {
                    const airline = airlines[randomInRange(0, airlines.length - 1)];
                    const plane = planes[randomInRange(0, planes.length - 1)];
                    const departureTime = departureTimes[randomInRange(0, departureTimes.length - 1)];
                    
                    // Calculate arrival time based on departure time and duration
                    const [durationHours, durationMinutes] = route.duration.split(':').map(Number);
                    const [depHours, depMinutes] = departureTime.split(':').map(Number);
                    let arrivalHours = depHours + durationHours;
                    let arrivalMinutes = depMinutes + durationMinutes;
                    
                    if (arrivalMinutes >= 60) {
                        arrivalHours += Math.floor(arrivalMinutes / 60);
                        arrivalMinutes %= 60;
                    }
                    
                    const arrivalTime = `${String(arrivalHours).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;
                    
                    // Generate capacities and bookings
                    const economyCapacity = randomInRange(150, 200);
                    const businessCapacity = randomInRange(15, 25);
                    const economyBookedCount = randomInRange(0, economyCapacity * 0.8); // max 80% booked
                    const businessBookedCount = randomInRange(0, businessCapacity * 0.8);
                    
                    // Generate prices
                    const economyBasePrice = randomInRange(3000, 6000);
                    const businessBasePrice = economyBasePrice * 3;
                    const economyCurrentPrice = ((economyBookedCount/economyCapacity) * economyBasePrice) + economyBasePrice;
                    const businessCurrentPrice = ((businessBookedCount/businessCapacity) * businessBasePrice) + businessBasePrice;

                    const flight = {
                        flightNo: generateFlightNo(airline),
                        planeName: plane,
                        airline: airline,
                        departurePlace: route.from,
                        departureDate: date,
                        departureTime: departureTime,
                        arrivalPlace: route.to,
                        arrivalDate: date, // Assuming all flights land same day
                        arrivalTime: arrivalTime,
                        duration: route.duration,
                        economyCapacity,
                        economyBookedCount,
                        businessCapacity,
                        businessBookedCount,
                        economyBasePrice,
                        businessBasePrice,
                        economyCurrentPrice: Math.round(economyCurrentPrice),
                        businessCurrentPrice: Math.round(businessCurrentPrice),
                        changed: "No Changes"
                    };

                    sampleFlights.push(flight);
                }
            }
        }

        // Add each flight to the database
        for (const flight of sampleFlights) {
            await addFlightToDB(
                flight.flightNo,
                flight.planeName,
                flight.airline,
                flight.departurePlace,
                flight.departureDate,
                flight.departureTime,
                flight.arrivalPlace,
                flight.arrivalDate,
                flight.arrivalTime,
                flight.duration,
                flight.economyCapacity,
                flight.economyBookedCount,
                flight.businessCapacity,
                flight.businessBookedCount,
                flight.economyBasePrice,
                flight.businessBasePrice,
                flight.economyCurrentPrice,
                flight.businessCurrentPrice,
                flight.changed
            );
            console.log(`Added flight ${flight.flightNo} from ${flight.departurePlace} to ${flight.arrivalPlace} on ${flight.departureDate}`);
        }

        console.log(`Successfully loaded ${sampleFlights.length} sample flights!`);
    } catch (error) {
        console.error('Error loading sample flights:', error);
    }
}

// Run the loader
document.addEventListener('DOMContentLoaded', loadSampleFlights); 