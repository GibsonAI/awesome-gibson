// Shared types for the Travel Agency frontend application
export interface TravelUser {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  address?: string;
  date_created: string;
  date_updated?: string;
}

export interface TravelDestination {
  id: number;
  uuid: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  date_created: string;
  date_updated?: string;
}

export interface TravelBooking {
  id: number;
  uuid: string;
  user_id: number;
  destination_id: number;
  booking_date: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  number_of_people: number;
  date_created: string;
  date_updated?: string;
  // Joined data
  first_name?: string;
  last_name?: string;
  email?: string;
  destination_name?: string;
  destination_price?: number;
}

export interface TravelReview {
  id: number;
  uuid: string;
  user_id: number;
  destination_id: number;
  rating: number;
  comment?: string;
  review_date: string;
  date_created: string;
  date_updated?: string;
  // Joined data
  first_name?: string;
  last_name?: string;
  destination_name?: string;
}

// Form types
export interface CreateUserForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  address?: string;
}

export interface UpdateUserForm {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  address?: string;
}

export interface CreateDestinationForm {
  name: string;
  description: string;
  price: number;
}

export interface UpdateDestinationForm {
  name?: string;
  description?: string;
  price?: number;
}

export interface CreateBookingForm {
  user_id: number;
  destination_id: number;
  date: string;
  number_of_people: number;
}

export interface UpdateBookingForm {
  date?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  number_of_people?: number;
}

export interface CreateReviewForm {
  user_id: number;
  destination_id: number;
  rating: number;
  comment?: string;
}

export interface UpdateReviewForm {
  rating?: number;
  comment?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// UI state types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface FormState<T> extends LoadingState {
  data: T;
}
