# CS499-MEAN Grazioso Salvare Animal Shelter

This repository contains a full stack MEAN style web application developed for **CS-499: Computer Science Capstone** at **Southern New Hampshire University**

This project demonstrates modern full stack software engineering practices including RESTful API design, database modeling, and an Angular frontend.

## Overview

**Grazioso Salvare** is an animal rescue application that allows:
- Public users to browse rescue animals
- Registered customers to "favorite" animals
- Administrators to manage animal records securely

The application is split into backend API and frontend single-page applications (SPA)

## The Stack

### Backend
- Node.js
- Express
- MongoDB / Azure Cosmos DB
- Mongoose
- JWT Authentication
- Password Hashing

### Frontend
- Angular
- TypeScript
- Angular routing
- Global CSS designs

## Authentication and Authorization

**Customers**
- Register and login using username and password
- receive JWT for authenticated requests
- Can favorite animals

** Administrators**
- log in through andmin endpoint
- Role BAsed authorization enforced using middleware
- Can Create, Update, and Delete animals

**Passwords are never stored in plain text and are securely hashed**

---


## API Overview


| Method | Endpoint | Description |
|------|---------|-------------|
| GET | `/api/animals` | Public list of animals |
| GET | `/api/animals/:id` | Animal details |
| POST | `/api/customers/register` | Customer registration |
| POST | `/api/customers/login` | Customer login |
| GET | `/api/favorites` | Get customer favorites |
| POST | `/api/favorites/:animalId` | Add favorite |
| DELETE | `/api/favorites/:animalId` | Remove favorite |
| POST | `/api/admin/login` | Admin login |


---


