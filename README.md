# MediXpert - AI-Powered Disease Diagnosis & Healthcare Assistant

![MediXpert Banner](./assets/images/medixpert-banner.png)

MediXpert is a full-stack web application that leverages AI and cognitive science to provide **symptom-based disease prediction**, doctor suggestions, and medical report management. It is designed to enhance patient experience, streamline healthcare workflows, and offer an interactive, personalized platform for both patients and doctors.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Project Structure](#project-structure)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Features

- **User Authentication:** Register, login, and Google Sign-In.  
- **AI-Powered Disease Prediction:** Input symptoms and receive predicted diseases using machine learning.  
- **Doctor Suggestion:** Suggests real doctors based on diagnosis and location.  
- **Appointment Booking:** Book, view, and manage doctor appointments.  
- **Medical Report Management:** Upload, store, and access PDF or image reports.  
- **Patient Dashboard:** View diagnosis history, reports, and upcoming appointments.  
- **Admin Panel:** Manage users, doctors, and appointments through Django Admin.  
- **Email Notifications:** Receive updates for appointments and reports.  
- **Real-Time Chat (Future):** Secure messaging between patients and doctors.  

---

## Tech Stack

**Frontend:** React.js, Tailwind CSS  
**Backend:** Django, Django REST Framework  
**Database:** PostgreSQL / SQLite  
**Machine Learning:** Python, Scikit-learn / TensorFlow  
**Hosting:** Can be deployed on any cloud server (Heroku, AWS, etc.)  

---

## Project Structure

```text
MediXpert/
├─ backend/
│  ├─ api/                  # REST APIs for authentication and prediction
│  ├─ ml/                   # Machine learning models & scripts
│  ├─ medixpert/            # Django project files
├─ frontend/
│  ├─ src/
│  │  ├─ components/        # Reusable UI components
│  │  ├─ pages/             # Login, Register, Predict, Dashboard
│  │  ├─ services/          # API service files
├─ assets/                  # Images, icons, static files
├─ README.md
└─ requirements.txt
