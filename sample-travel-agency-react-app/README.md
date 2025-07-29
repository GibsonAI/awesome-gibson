# Travel Agency Management React App

A React-based travel agency management app that connects directly to GibsonAI's Data REST API for all CRUD operations. This project uses an existing Travel Agency database schema that can be cloned and deployed on GibsonAI.

![Travel Agency React App Main Page](./assets/Travel%20Agency%20React%20App.gif)

## Prerequisites

Before running this application, you need to:

1. **Create a GibsonAI Account**: Sign up at [https://app.gibsonai.com](https://app.gibsonai.com)

2. **Clone the Travel Agency Database Schema**: 
   - Visit: [https://app.gibsonai.com/clone/rRZ4wD9HDCdHO](https://app.gibsonai.com/clone/rRZ4wD9HDCdHO)
   - This will clone the pre-built Travel Agency database schema to your GibsonAI account

3. **Deploy the Database**: 
   - After cloning, deploy the database schema in your GibsonAI project
   - This creates the necessary tables: `travel_user`, `travel_destination`, `travel_booking`, and `travel_review`

4. **Get Your Data API Key**: 
   - Navigate to your project settings in GibsonAI
   - Generate and copy your Data API Key
   - You'll need this key for the environment configuration below

## Features

- **Users Management**: Create, read, update, and delete travel agency users
- **Destinations Management**: Manage travel destinations with descriptions and pricing
- **Bookings Management**: Handle user bookings with status tracking (pending, confirmed, cancelled)
- **Reviews Management**: Customer review system with star ratings and comments
- **Live Statistics**: Real-time dashboard showing counts of users, destinations, bookings, and reviews
- **Direct API Integration**: Uses GibsonAI Data REST API endpoints directly (no backend server required)
- **Real-time Updates**: Instant feedback with toast notifications
- **Responsive Design**: Built with Tailwind CSS for mobile-first design

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **API**: GibsonAI Data REST API
- **State Management**: React hooks (useState, useEffect)
- **Notifications**: react-hot-toast
- **Routing**: React Router DOM

## GibsonAI Integration

This application connects directly to GibsonAI's Travel Agency Database using the REST API endpoints. The database schema is based on a pre-built Travel Agency template that includes all necessary tables and relationships.

**Database Schema Source**: [Clone Travel Agency Schema](https://app.gibsonai.com/clone/rRZ4wD9HDCdHO)

- **Base URL**: `https://api.gibsonai.com/v1/-`
- **Authentication**: X-Gibson-API-Key header (using your project's Data API Key)
- **Database**: Your deployed GibsonAI project database
- **Documentation**: OpenAPI spec available at the API endpoint

### API Endpoints Used

| Resource | Endpoint | Methods | Description |
|----------|----------|---------|-------------|
| Users | `/travel-user` | GET, POST, PATCH, DELETE | Manage travel agency users |
| Destinations | `/travel-destination` | GET, POST, PATCH, DELETE | Manage travel destinations |
| Bookings | `/travel-booking` | GET, POST, PATCH, DELETE | Manage user bookings |
| Reviews | `/travel-review` | GET, POST, PATCH, DELETE | Manage destination reviews |

## Setup Instructions

1. **Complete Prerequisites**: Make sure you've completed all the prerequisite steps above to clone and deploy the Travel Agency schema in GibsonAI.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the project root and add your GibsonAI Data API Key:
   ```
   GIBSON_PROJECT_API_KEY=your-gibsonai-project-api-key
   ```
   Replace `your-gibsonai-project-api-key` with the actual API key you obtained from your GibsonAI project settings.

4. **Start Development Server**:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navbar.tsx      # Navigation component
├── pages/              # Page components
│   ├── Home.tsx        # Dashboard with live statistics
│   ├── UsersPage.tsx   # Users management page
│   ├── DestinationsPage.tsx # Destinations management page
│   ├── BookingsPage.tsx # Bookings management with status tracking
│   └── ReviewsPage.tsx # Reviews management with star ratings
├── services/           # API service layer
│   └── api.ts          # GibsonAI API client
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types for API responses
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

## API Service Layer

The application uses a service layer (`src/services/api.ts`) that:

- Configures axios with GibsonAI base URL and authentication
- Provides typed API methods for each resource
- Handles error responses and logging
- Maps between frontend types and API formats

Example usage:
```typescript
import { userApi } from '../services/api';

// Get all users
const users = await userApi.getAll();

// Create a new user
const newUser = await userApi.create({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  password: 'password123'
});
```

## Database Schema

The application works with the GibsonAI Travel Agency database schema (cloned from [this template](https://app.gibsonai.com/clone/rRZ4wD9HDCdHO)) which includes the following tables:

- **travel_user**: User information (first_name, last_name, email, etc.)
- **travel_destination**: Destination details (name, description, price, rating)
- **travel_booking**: User bookings (user_id, destination_id, dates, status)
- **travel_review**: User reviews (user_id, destination_id, rating, comment)

The schema includes proper relationships between tables with foreign keys and appropriate data types for all fields.

## Development

- **Linting**: ESLint configuration included
- **Type Safety**: Full TypeScript support with strict typing
- **Code Style**: Prettier configuration for consistent formatting
- **Hot Reload**: Development server with hot module replacement

## Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run test suite
- `npm run eject`: Eject from Create React App (not recommended)

## Deployment

1. **Ensure Database is Deployed**: Make sure your GibsonAI Travel Agency database is properly deployed and accessible.

2. **Build the application**:
   ```bash
   npm run build
   ```

3. **Configure Environment**: Ensure your production environment has the correct `GIBSON_PROJECT_API_KEY` environment variable set with your GibsonAI Data API Key.

4. **Deploy the `build/` directory** to your hosting platform (Vercel, Netlify, AWS S3, etc.)

**Note**: The application requires a valid GibsonAI Data API Key to function properly. Make sure your production environment is configured with the correct API key.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
