"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const cors_1 = __importDefault(require("cors"));
const schema_1 = require("./schema");
const db_1 = require("./db");
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
// Seed database with sample data
const seedDatabase = () => {
    const existingPeople = db_1.getAllPeople.all();
    if (existingPeople.length === 0) {
        const samplePeople = [
            {
                name: 'Sarah Johnson',
                location: 'San Francisco',
                relationship: 'Friend',
                availability: 'Dec 15-20',
                description: 'Spacious guest room with private bath',
                availabilities: [
                    { startDate: '2025-12-15', endDate: '2025-12-20', notes: 'Holiday break' },
                    { startDate: '2025-12-22', endDate: '2025-12-28', notes: 'Christmas week' }
                ]
            },
            {
                name: 'Mike Chen',
                location: 'New York',
                relationship: 'Colleague',
                availability: 'Jan 5-12',
                description: 'Cozy apartment downtown',
                availabilities: [
                    { startDate: '2026-01-05', endDate: '2026-01-12', notes: 'New Year vacation' },
                    { startDate: '2026-01-18', endDate: '2026-01-22', notes: 'Weekend stay' }
                ]
            },
            {
                name: 'Emma Davis',
                location: 'Austin, TX',
                relationship: 'Friend',
                availability: 'Nov 20-25',
                description: 'Beautiful house with garden',
                availabilities: [
                    { startDate: '2025-11-20', endDate: '2025-11-25', notes: 'Thanksgiving week' }
                ]
            },
            {
                name: 'Alex Rodriguez',
                location: 'Seattle, WA',
                relationship: 'Family',
                availability: 'Dec 1-7',
                description: 'Modern condo with city views',
                availabilities: [
                    { startDate: '2025-12-01', endDate: '2025-12-07', notes: 'Family visit' }
                ]
            },
            {
                name: 'Lisa Wang',
                location: 'Los Angeles',
                relationship: 'Friend',
                availability: 'Jan 15-20',
                description: 'Beachfront apartment',
                availabilities: [
                    { startDate: '2026-01-15', endDate: '2026-01-20', notes: 'Winter getaway' },
                    { startDate: '2025-12-10', endDate: '2025-12-15', notes: 'Pre-holiday visit' }
                ]
            }
        ];
        for (const person of samplePeople) {
            const result = db_1.insertPerson.run(person.name, null, // email - sample data doesn't have emails
            person.location, person.relationship, person.availability, person.description, null, // address
            null, // city
            null, // state
            null, // zip_code
            null, // country
            null, // latitude
            null, // longitude
            JSON.stringify(['WiFi', 'Kitchen']), // amenities
            'No smoking, quiet hours after 10pm', // house_rules
            '3:00 PM', // check_in_time
            '11:00 AM', // check_out_time
            2, // max_guests
            1, // bedrooms
            1, // bathrooms
            JSON.stringify(['https://example.com/photo1.jpg']) // photos
            );
            const personId = result.lastInsertRowid;
            // Add availability records
            for (const availability of person.availabilities) {
                db_1.insertAvailability.run(personId, availability.startDate, availability.endDate, 'available', availability.notes);
            }
        }
        console.log('Database seeded with sample data');
    }
};
// REST API
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from REST API' });
});
app.post('/api/seed', (req, res) => {
    try {
        seedDatabase();
        res.json({ message: 'Database seeded successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to seed database' });
    }
});
const server = new server_1.ApolloServer({
    typeDefs: schema_1.typeDefs,
    resolvers: schema_1.resolvers,
});
async function startServer() {
    await server.start();
    app.use('/graphql', (0, cors_1.default)(), express_1.default.json(), (0, express4_1.expressMiddleware)(server));
    // Seed database on startup
    seedDatabase();
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/graphql`);
        console.log(`REST API available at http://localhost:${port}/api`);
    });
}
startServer();
