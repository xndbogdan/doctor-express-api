# Implementation Plan: Doctor Appointment System

This document outlines the strategic approach for implementing the Doctor Appointment System based on the requirements specified in the technical assessment.

## System Requirements Analysis

Based on the task description, we need to create a backend system that:

1. Allows doctors to create configurable appointment slots
2. Supports different types of recurrence patterns for slots
3. Enables patients to book available slots
4. Provides endpoints to view bookings and available slots
5. Handles the booking process and manages slot availability

## Technical Stack Selection

### Backend

- **Language & Framework**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Data Validation**: VineJS for request validation
- **Date Handling**: Luxon for date/time operations
- **Performance Optimization**: Redis for caching frequent queries

### Infrastructure

- **Containerization**: Docker and Docker Compose
- **Documentation**: OpenAPI/Swagger for API documentation

## Database Schema Design

### Key Entities

1. **Doctor**

   - Core fields: id, username, first_name, last_name, email
   - Relations: has many RecurringPatterns, has many Slots, has many Bookings

2. **Patient**

   - Core fields: id, name, email, phone
   - Relations: has many Bookings

3. **RecurringPattern**

   - Core fields: id, doctorId, type (daily, weekly, one-time), startDate, end_date, startTime, endTime, duration, week_days, isActive
   - Relations: belongs to Doctor, has many Slots

4. **Slot**

   - Core fields: id, doctorId, patternId, startTime, endTime, status (available, booked)
   - Relations: belongs to Doctor, belongs to RecurringPattern, has one Booking

5. **Booking**
   - Core fields: id, slotId, patientId, doctorId, reason, created_at
   - Relations: belongs to Slot, belongs to Patient, belongs to Doctor

## Approach to Key Requirements

### 1. Slot Creation with Recurrence

- On-the-fly slot generation for better scalability
- Store recurrence rules in the RecurringPattern model
- Support three recurrence types: daily, weekly, and one-time

### 2. Available Slots Calculation

- For pre-generation approach: query available slots directly from the database
- For on-the-fly approach: generate slots based on patterns and filter out booked times
- Implement caching to improve performance for frequently queried dates

### 3. Booking Process

- Check if slot is available before allowing booking
- Support both real and virtual slots (real slot is what's booked)
- Add validation for patient information

## Optimization Strategy

### Performance Considerations

- Use Redis caching for frequently accessed data (available slots, daily appointments)
- Consider pagination for endpoints that might return large datasets

## Implementation Phases

1. **Infrastructure Setup**: Project structure, ORM configuration
2. **Core Models**: Database schema implementation
3. **Basic APIs**: CRUD operations for doctors and patients
4. **Core Business Logic**: Slot creation and booking
5. **Query Features**: Listing endpoints with filtering
6. **Optimization**: Caching and performance improvements
7. **Testing & Documentation**: Ensuring quality and usability

## Bonus Implementation

If time permits:

- Create a simple React frontend to demonstrate the API's capabilities
- Implement user authentication and authorization
- Add admin dashboard for managing doctors and slots
- Implement email notifications for bookings

# Backend Developer Test Objectives

## Requirements from task.md

### 1. Create a Doctor

- Implement an API to create new doctor records
- API Example: `POST /doctors`
- Required fields: username, first_name, last_name, email
- Expected Result: Creates a new doctor record and returns the details with an ID

### 2. Set/Create Slots

- Implement an API to create appointment slots for a doctor
- API Example: `POST /doctors/{doctorId}/slots`
- Required fields: start_time, end_time, duration, recurrence options
- Recurrence options:
  - Daily: repeat every day
  - Weekly: repeat on specific days of the week
  - One-time: single occurrence
- Expected Result: Creates slot entries in the database with start and end times

### 3. Create an Appointment (Book a Slot)

- Implement an API to book a slot
- API Example: `POST /slots/{slotId}/book`
- Required fields: patient ID, reason (optional)
- Expected Result: Marks the slot as booked and returns booking confirmation

### 4. Show All Booked Appointments

- Implement an API to list all booked appointments for a doctor
- API Example: `GET /doctors/{doctorId}/bookings?start_date=2014-12-01&end_date=2014-12-31`
- Required parameters: start_date, end_date
- Expected Result: Returns a list of booked appointments within the specified date range

### 5. Show All Available Slots

- Implement an API to list all available slots for a doctor on a specific date
- API Example: `GET /doctors/{doctorId}/available_slots?date=2014-12-25`
- Required parameters: date
- Expected Result: Returns a list of available slots for the specified date