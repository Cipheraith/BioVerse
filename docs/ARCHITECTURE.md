# BioVerse Architecture Overview

BioVerse is designed as a full-stack web application, leveraging a modern architecture to ensure scalability, maintainability, and a rich user experience. It follows a client-server model with a clear separation of concerns.

## High-Level Diagram

```mermaid
graph TD
    A[Client Applications] -->|API Calls (REST/WebSockets)| B(Backend Services)
    B -->|Database Queries| C[PostgreSQL Database]
    B -->|AI Model Inference| D[AI/ML Services]
    B -->|External APIs (e.g., SMS, Mapping)| E[Third-Party Integrations]
    B -->|Logging/Monitoring| F[Monitoring & Logging]

    subgraph Client Layer
        A1[Web Browser (React App)]
        A2[Mobile App (Future)]
        A3[USSD Interface (Future)]
    end

    subgraph Backend Layer
        B1(Node.js/Express.js API)
        B2(Authentication Service)
        B3(Patient Management Service)
        B4(Maternal Health Service)
        B5(Symptom Checker Service)
        B6(Messaging Service)
        B7(Location/Dispatch Service)
        B8(Dashboard/Reporting Service)
        B9(Predictive Health Twin Service)
    end

    subgraph Data Layer
        C
    end

    subgraph AI/ML Layer
        D
    end

    subgraph External Services
        E
    end

    subgraph Observability
        F
    end

    A --- A1
    A --- A2
    A --- A3

    B --- B1
    B --- B2
    B --- B3
    B --- B4
    B --- B5
    B --- B6
    B --- B7
    B --- B8
    B --- B9

    B1 --> B2
    B1 --> B3
    B1 --> B4
    B1 --> B5
    B1 --> B6
    B1 --> B7
    B1 --> B8
    B1 --> B9

    B1 --> C
    B1 --> D
    B1 --> E
    B1 --> F
```

## Architectural Components

### 1. Client Applications

*   **Web Application (React.js):** The primary user interface, built with React.js and styled using Tailwind CSS. It consumes data and services from the backend API.
    *   **Key Technologies:** React, React Router, Tailwind CSS, Axios, i18next.
    *   **Structure:** Organized into pages, components, hooks, and services.

### 2. Backend Services (Node.js/Express.js)

The backend is a RESTful API built with Node.js and Express.js. It handles business logic, data persistence, and integration with external services.

*   **Authentication (`authController.js`):** Manages user registration, login (email/phone, Google OAuth), and session management using JWTs.
*   **User Management (`userController.js`):** Handles CRUD operations for user accounts and roles.
*   **Patient Management (`patientController.js`):** Manages patient records, including personal information, medical history, and the `isPregnant` flag.
*   **Maternal Health (`pregnancyController.js`):** Specific logic for managing pregnancy records, estimated due dates, alerts, and transport booking.
*   **Symptom Checker (`symptomController.js`):** Processes symptom input and interacts with AI services for diagnosis.
*   **Messaging (`messageController.js`):** Facilitates communication between different user roles.
*   **Location/Dispatch (`locationController.js`):** Manages location data for clinics, pharmacies, and ambulance bases, and supports dispatch logic.
*   **Dashboard/Reporting (`dashboardController.js`):** Aggregates and provides data for various dashboards (Admin, MoH), including statistics and recent activities.
*   **Predictive Health Twin (`healthTwinService.js`):** A core service that aggregates comprehensive patient data to form a digital health twin and integrates with predictive models.
*   **Services Layer (`services/`):** Contains business logic modules like `aiService.js`, `maternalHealthScheduler.js`, `predictiveService.js`, and `socketService.js`.
*   **Database Configuration (`config/database.js`):** Manages the connection to the PostgreSQL database and provides query utilities.
*   **Middleware (`middleware/auth.js`):** Handles authentication and authorization for API routes.

### 3. Data Layer (PostgreSQL Database)

*   **PostgreSQL:** The primary data store for all application data. Chosen for its robustness, scalability, and rich feature set (e.g., JSONB support).
*   **Schema (`config/schema.sql`):** Defines the database tables and their relationships.

### 4. AI/ML Services

*   **AI Service (`aiService.js`):** Interfaces with AI models for tasks like symptom diagnosis.
*   **Predictive Service (`predictiveService.js`):** Implements logic for calculating patient risk scores and other predictive insights based on health twin data.

### 5. Third-Party Integrations

*   **Google OAuth:** For user authentication.
*   **SMS Gateway (Planned):** For sending alerts and notifications.
*   **Mapping Services (Planned):** For live ambulance routing and clinic location.

### 6. Observability

*   **Logging (`services/logger.js`):** Centralized logging for monitoring application health and debugging.

## Data Flow Example: Patient Health Twin Generation

1.  A request is made to retrieve a patient's health twin (e.g., `/api/patients/:id/health-twin`).
2.  The `patientController.js` calls `healthTwinService.generateHealthTwin`.
3.  `generateHealthTwin` queries the PostgreSQL database to fetch data from `patients`, `pregnancies`, `symptomChecks`, `labResults`, and `appointments` tables for the given patient ID.
4.  The fetched data is aggregated into a comprehensive `healthTwin` object.
5.  `generateHealthTwin` then calls `predictiveService.calculatePatientRisk` using the aggregated patient and pregnancy data.
6.  `calculatePatientRisk` computes a risk score and level based on predefined rules.
7.  The `healthTwin` object, now including the risk assessment, is returned to the `patientController`.
8.  The `patientController` sends the `healthTwin` object as a JSON response to the client.
9.  The client-side `PatientDetail.tsx` component receives and renders this comprehensive health twin data, including the risk assessment.

## Scalability Considerations

*   **Modular Backend:** The backend is organized into controllers and services, promoting modularity and easier scaling of individual components.
*   **PostgreSQL:** Provides inherent scalability features for data storage.
*   **Stateless API:** The API is designed to be largely stateless, allowing for horizontal scaling of backend instances.
*   **Load Balancing (Future):** Can be deployed behind a load balancer to distribute traffic across multiple instances.
*   **Microservices (Future):** As the application grows, specific services can be extracted into independent microservices.

## Future Enhancements

*   Integration with more advanced AI/ML models for deeper predictive analytics.
*   Real-time data streaming for continuous health twin updates.
*   Comprehensive reporting and analytics dashboards with customizable views.
*   Mobile application development.
*   USSD integration for feature phone users.
