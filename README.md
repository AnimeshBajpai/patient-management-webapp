# DocGenie - Patient Management System

A modern, responsive patient management web application built with React and TypeScript, designed for healthcare professionals to efficiently manage patient records and appointments.

## 🌟 Features

### 📱 Responsive Design
- **Mobile-First Approach**: Optimized for smartphones, tablets, and desktop devices
- **Adaptive UI**: Dynamic layout switching between mobile cards and desktop tables
- **Touch-Friendly**: Large touch targets and intuitive gestures for mobile users

### 👥 User Management
- **Role-Based Access**: Separate interfaces for doctors and patients
- **Secure Authentication**: Mobile OTP-based authentication system
- **User Profiles**: Personalized experience based on user role

### 🏥 Patient Management
- **Complete Patient Records**: Store comprehensive patient information
- **Medical History**: Track patient medical history and allergies
- **Contact Information**: Manage patient contact details and addresses
- **Age Calculation**: Automatic age calculation from date of birth

### 📅 Appointment Scheduling
- **Smart Scheduling**: Easy appointment booking with date/time pickers
- **Status Tracking**: Monitor appointment status (scheduled, completed, cancelled, no-show)
- **Duration Management**: Flexible appointment duration settings
- **Appointment Notes**: Add detailed notes for each appointment

### 📊 Dashboard Analytics
- **Key Metrics**: Overview of total patients, appointments, and statistics
- **Recent Activity**: Quick view of upcoming appointments
- **Quick Actions**: Fast access to common tasks
- **Visual Indicators**: Color-coded status indicators and chips

## 🏗 Technology Stack

### Frontend
- **React 19** with TypeScript for type safety
- **Material-UI (MUI)** for modern, accessible components
- **React Router** for client-side navigation
- **Axios** for API communication
- **Day.js** for date manipulation
- **Emotion** for styled components

### Backend Integration
- **Spring Boot** REST API
- **MySQL** database with Azure MySQL Flexible Server
- **Azure Container Apps** for scalable hosting
- **Docker** containerization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd patient-management-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:8080/api
   GENERATE_SOURCEMAP=false
   BROWSER=none
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏥 Backend API

The frontend connects to a Spring Boot backend API that provides:

- User authentication and authorization
- Patient CRUD operations
- Appointment management
- Dashboard statistics
- Data validation and error handling

### API Endpoints

```
GET    /api/auth/login          - User authentication
GET    /api/patients            - List all patients
POST   /api/patients            - Create new patient
PUT    /api/patients/{id}       - Update patient
DELETE /api/patients/{id}       - Delete patient
GET    /api/appointments        - List all appointments
POST   /api/appointments        - Create new appointment
PUT    /api/appointments/{id}   - Update appointment
DELETE /api/appointments/{id}   - Delete appointment
GET    /api/dashboard/stats     - Dashboard statistics
```

## 🐳 Deployment

### Azure Container Apps Deployment

1. **Build and push Docker image**
   ```bash
   docker build -t patient-management-webapp .
   docker tag patient-management-webapp:latest <registry>.azurecr.io/patient-management-webapp:latest
   docker push <registry>.azurecr.io/patient-management-webapp:latest
   ```

2. **Deploy using PowerShell script**
   ```powershell
   .\deploy-frontend.ps1
   ```

3. **Manual Azure CLI deployment**
   ```bash
   az containerapp create \
     --name patientapp-web-sea \
     --resource-group userservice-rg-sea \
     --environment userservice-env-sea \
     --image <registry>.azurecr.io/patient-management-webapp:latest \
     --target-port 80 \
     --ingress external \
     --cpu 0.5 \
     --memory 1.0Gi
   ```

## 📁 Project Structure

```
patient-management-webapp/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable React components
│   │   ├── Layout.tsx     # Main application layout
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── contexts/          # React context providers
│   │   └── AuthContext.tsx # Authentication context
│   ├── pages/             # Application pages
│   │   ├── LoginPage.tsx  # Login and authentication
│   │   ├── DashboardPage.tsx # Dashboard with statistics
│   │   ├── PatientsPage.tsx # Patient management
│   │   └── AppointmentsPage.tsx # Appointment scheduling
│   ├── services/          # API service layer
│   │   └── api.ts         # HTTP client and API calls
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # Application types
│   └── App.tsx            # Main application component
├── Dockerfile             # Docker configuration
├── nginx.conf             # Nginx configuration
├── deploy-frontend.ps1    # Deployment script
└── package.json           # Dependencies and scripts
```

## 🎨 Design Features

### Material Design
- Modern Material-UI components
- Consistent color scheme and typography
- Elevation and shadow effects
- Responsive breakpoints

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast color ratios

### Performance
- Code splitting and lazy loading
- Optimized bundle sizes
- Efficient rendering with React hooks
- Nginx compression and caching

## 🔧 Configuration

### Environment Variables
- `REACT_APP_API_URL`: Backend API base URL
- `GENERATE_SOURCEMAP`: Enable/disable source maps
- `BROWSER`: Browser opening behavior

### Proxy Configuration
The application includes a proxy configuration for local development:
```json
{
  "proxy": "http://localhost:8080"
}
```

## 🛡 Security Features

### Frontend Security
- XSS protection with Content Security Policy
- HTTPS enforcement in production
- Secure headers via Nginx
- Token-based authentication

### API Security
- CORS configuration
- Request validation
- Error handling without data exposure
- Secure session management

## 📱 Mobile Responsiveness

### Breakpoints
- **xs**: 0px - 600px (Mobile phones)
- **sm**: 600px - 960px (Tablets)
- **md**: 960px - 1280px (Small laptops)
- **lg**: 1280px - 1920px (Desktop)
- **xl**: 1920px+ (Large screens)

### Mobile-Specific Features
- Card-based layout for better touch interaction
- Optimized form inputs for mobile keyboards
- Swipe gestures and touch-friendly buttons
- Responsive navigation with collapsible menu

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Appointment reminders
- [ ] Integration with calendar systems
- [ ] Telemedicine video calls
- [ ] Prescription management
- [ ] Insurance integration
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Offline functionality with PWA

---

**Built with ❤️ for healthcare professionals**
