# Doctor Express Api
```
██████╗  ██████╗  ██████╗████████╗ ██████╗ ██████╗      █████╗ ██████╗ ██╗
██╔══██╗██╔═══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██║
██║  ██║██║   ██║██║        ██║   ██║   ██║██████╔╝    ███████║██████╔╝██║
██║  ██║██║   ██║██║        ██║   ██║   ██║██╔══██╗    ██╔══██║██╔═══╝ ██║
██████╔╝╚██████╔╝╚██████╗   ██║   ╚██████╔╝██║  ██║    ██║  ██║██║     ██║
╚═════╝  ╚═════╝  ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝     ╚═╝
                          - A RESTful API for managing doctor appointments
```
This ain't your grandma's appointment system.
This is Doctor Appointment System, powered by Express.js.

If you're ready to build, deploy, and scale a modern appointment system, you're in the right place.

## Features

- Doctor profile management
- Patient record management
- Appointment slot scheduling with recurring patterns
- Appointment booking system
- Redis-based caching for performance
- API documentation with Swagger UI

## Technologies Used

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Documentation**: Swagger UI
- **Containerization**: Docker, Docker Compose
- **Validation**: VineJS

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- pnpm
- Docker and Docker Compose

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/xndbogdan/doctor-express-api.git
   cd doctor-express-api
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Environment setup
   ```bash
   cp .env.example .env
   # Edit .env with your configuration values
   ```

4. Run with Docker
   ```bash
   pnpm docker:up
   ```

5. Or run manually
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   pnpm build
   pnpm start
   ```

6. For development
   ```bash
   pnpm dev
   ```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

### Main Endpoints

#### Doctors
- `GET /doctors` - List all doctors
- `POST /doctors` - Create a new doctor
- `GET /doctors/:doctorId/bookings` - Get all bookings for a doctor

#### Slots
- `GET /doctors/:doctorId/slots` - Get available slots for a doctor
- `POST /doctors/:doctorId/slots` - Create slots for a doctor
- `POST /slots/:slotId/book` - Book an available slot

#### Patterns
- `GET /doctors/:doctorId/patterns` - Get all recurring patterns for a doctor
- `PATCH /doctors/:doctorId/patterns/:patternId` - Update a pattern's status
- `DELETE /doctors/:doctorId/patterns/:patternId` - Delete a recurring pattern

#### Patients
- `GET /patients` - List all patients
- `POST /patients` - Create a new patient
- `GET /patients/:patientId` - Get patient details
- `PUT /patients/:patientId` - Update patient information
- `DELETE /patients/:patientId` - Delete a patient

## Database Schema

The application uses Prisma ORM with the following main models:

- **Doctor**: Profile information for healthcare providers
- **Patient**: Information about patients who book appointments
- **Slot**: Available time slots for appointments
- **RecurringPattern**: Templates for generating recurring appointment slots
- **Booking**: Records of appointments made by patients

## License

This project is licensed under the MIT License.
