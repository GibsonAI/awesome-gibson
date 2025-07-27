import axios from 'axios';
import {
  TravelUser,
  TravelDestination,
  TravelBooking,
  TravelReview,
  CreateUserForm,
  UpdateUserForm,
  CreateDestinationForm,
  UpdateDestinationForm,
  CreateBookingForm,
  UpdateBookingForm,
  CreateReviewForm,
  UpdateReviewForm,
} from '../types';

const GIBSON_API_BASE_URL = 'https://api.gibsonai.com/v1/-';
const GIBSON_API_KEY = process.env.REACT_APP_GIBSON_API_KEY;

// Create axios instance with GibsonAI configuration
const api = axios.create({
  baseURL: GIBSON_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Gibson-API-Key': GIBSON_API_KEY,
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Gibson API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Gibson API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Gibson API Response Error:', error.response?.data || error.message);
    throw error;
  }
);

// User API
export const userApi = {
  getAll: async (): Promise<TravelUser[]> => {
    const response = await api.get<TravelUser[]>('/travel-user');
    return response.data;
  },

  getById: async (id: number): Promise<TravelUser> => {
    const response = await api.get<TravelUser>(`/travel-user/${id}`);
    return response.data;
  },

  create: async (userData: CreateUserForm): Promise<TravelUser> => {
    const response = await api.post<TravelUser>('/travel-user', userData);
    return response.data;
  },

  update: async (id: number, userData: UpdateUserForm): Promise<TravelUser> => {
    const response = await api.patch<TravelUser>(`/travel-user/${id}`, userData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/travel-user/${id}`);
  },
};

// Destination API
export const destinationApi = {
  getAll: async (): Promise<TravelDestination[]> => {
    const response = await api.get<TravelDestination[]>('/travel-destination');
    return response.data;
  },

  getById: async (id: number): Promise<TravelDestination> => {
    const response = await api.get<TravelDestination>(`/travel-destination/${id}`);
    return response.data;
  },

  create: async (destinationData: CreateDestinationForm): Promise<TravelDestination> => {
    const response = await api.post<TravelDestination>('/travel-destination', destinationData);
    return response.data;
  },

  update: async (id: number, destinationData: UpdateDestinationForm): Promise<TravelDestination> => {
    const response = await api.patch<TravelDestination>(`/travel-destination/${id}`, destinationData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/travel-destination/${id}`);
  },
};

// Booking API
export const bookingApi = {
  getAll: async (): Promise<TravelBooking[]> => {
    const response = await api.get<TravelBooking[]>('/travel-booking');
    return response.data;
  },

  getById: async (id: number): Promise<TravelBooking> => {
    const response = await api.get<TravelBooking>(`/travel-booking/${id}`);
    return response.data;
  },

  getByUserId: async (userId: number): Promise<TravelBooking[]> => {
    const response = await api.get<TravelBooking[]>(`/travel-booking?where=user_id=${userId}`);
    return response.data;
  },

  create: async (bookingData: CreateBookingForm): Promise<TravelBooking> => {
    // Transform the form data to match GibsonAI API format
    const gibsonBookingData = {
      user_id: bookingData.user_id,
      destination_id: bookingData.destination_id,
      booking_date: new Date().toISOString(),
      date: bookingData.date,
      number_of_people: bookingData.number_of_people,
      status: 1, // Default to pending (enum value 1)
    };
    const response = await api.post<TravelBooking>('/travel-booking', gibsonBookingData);
    return response.data;
  },

  update: async (id: number, bookingData: UpdateBookingForm): Promise<TravelBooking> => {
    // Transform the form data to match GibsonAI API format
    const gibsonBookingData: any = {};
    if (bookingData.date) gibsonBookingData.date = bookingData.date;
    if (bookingData.number_of_people) gibsonBookingData.number_of_people = bookingData.number_of_people;
    if (bookingData.status) {
      // Map status to enum values
      const statusMap = { pending: 1, confirmed: 2, cancelled: 3 };
      gibsonBookingData.status = statusMap[bookingData.status];
    }
    const response = await api.patch<TravelBooking>(`/travel-booking/${id}`, gibsonBookingData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/travel-booking/${id}`);
  },
};

// Review API
export const reviewApi = {
  getAll: async (): Promise<TravelReview[]> => {
    const response = await api.get<TravelReview[]>('/travel-review');
    return response.data;
  },

  getByDestinationId: async (destinationId: number): Promise<TravelReview[]> => {
    const response = await api.get<TravelReview[]>(`/travel-review?where=destination_id=${destinationId}`);
    return response.data;
  },

  create: async (reviewData: CreateReviewForm): Promise<TravelReview> => {
    // Transform the form data to match GibsonAI API format
    const gibsonReviewData = {
      user_id: reviewData.user_id,
      destination_id: reviewData.destination_id,
      rating: reviewData.rating,
      comment: reviewData.comment || null,
      review_date: new Date().toISOString(),
    };
    const response = await api.post<TravelReview>('/travel-review', gibsonReviewData);
    return response.data;
  },

  update: async (id: number, reviewData: UpdateReviewForm): Promise<TravelReview> => {
    const response = await api.patch<TravelReview>(`/travel-review/${id}`, reviewData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/travel-review/${id}`);
  },
};

// Health check API (using SQL query endpoint for basic connectivity)
export const healthApi = {
  check: async () => {
    try {
      const response = await api.post('/query', { 
        query: 'SELECT 1 as status',
        array_mode: false 
      });
      return { status: 'ok', data: response.data };
    } catch (error) {
      return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};
