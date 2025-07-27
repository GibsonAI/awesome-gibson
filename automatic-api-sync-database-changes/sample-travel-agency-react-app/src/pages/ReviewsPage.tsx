import React, { useState, useEffect } from 'react';
import { reviewApi, userApi, destinationApi } from '../services/api';
import { TravelReview, CreateReviewForm, UpdateReviewForm, TravelUser, TravelDestination } from '../types';
import toast from 'react-hot-toast';

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<TravelReview[]>([]);
  const [users, setUsers] = useState<TravelUser[]>([]);
  const [destinations, setDestinations] = useState<TravelDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<TravelReview | null>(null);
  const [formData, setFormData] = useState<CreateReviewForm>({
    user_id: 0,
    destination_id: 0,
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [reviewsData, usersData, destinationsData] = await Promise.all([
        reviewApi.getAll(),
        userApi.getAll(),
        destinationApi.getAll(),
      ]);
      setReviews(reviewsData);
      setUsers(usersData);
      setDestinations(destinationsData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch data';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReview) {
        const updateData: UpdateReviewForm = {
          rating: formData.rating,
          comment: formData.comment,
        };
        await reviewApi.update(editingReview.id, updateData);
        toast.success('Review updated successfully');
      } else {
        await reviewApi.create(formData);
        toast.success('Review created successfully');
      }
      setShowModal(false);
      setEditingReview(null);
      resetForm();
      fetchAllData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save review';
      toast.error(message);
    }
  };

  const handleEdit = (review: TravelReview) => {
    setEditingReview(review);
    setFormData({
      user_id: review.user_id,
      destination_id: review.destination_id,
      rating: review.rating,
      comment: review.comment || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number, reviewInfo: string) => {
    if (window.confirm(`Are you sure you want to delete this review "${reviewInfo}"?`)) {
      try {
        await reviewApi.delete(id);
        toast.success('Review deleted successfully');
        fetchAllData();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete review';
        toast.error(message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: 0,
      destination_id: 0,
      rating: 5,
      comment: '',
    });
  };

  const handleNewReview = () => {
    setEditingReview(null);
    resetForm();
    setShowModal(true);
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  };

  const getDestinationName = (destinationId: number) => {
    const destination = destinations.find(d => d.id === destinationId);
    return destination ? destination.name : 'Unknown Destination';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  const renderRatingInput = (rating: number, onChange: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {Array.from({ length: 5 }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(index + 1)}
            className={`text-2xl focus:outline-none ${
              index < rating ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Reviews</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage customer reviews. Total reviews: {reviews.length}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={handleNewReview}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:w-auto"
            disabled={users.length === 0 || destinations.length === 0}
          >
            Add Review
          </button>
        </div>
      </div>

      {(users.length === 0 || destinations.length === 0) && (
        <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong className="font-bold">Note: </strong>
          <span className="block sm:inline">
            You need at least one user and one destination to create reviews.
          </span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      ({review.rating}/5)
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {getDestinationName(review.destination_id)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    by {getUserName(review.user_id)}
                  </p>
                  {review.comment && (
                    <blockquote className="text-sm text-gray-700 italic border-l-4 border-gray-200 pl-3 mb-3">
                      "{review.comment}"
                    </blockquote>
                  )}
                  <div className="text-xs text-gray-500">
                    Reviewed on: {new Date(review.review_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(review)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(review.id, `${getUserName(review.user_id)} - ${getDestinationName(review.destination_id)}`)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new review.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">
                {editingReview ? 'Edit Review' : 'Add New Review'}
              </h3>
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Customer *
                  </label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: parseInt(e.target.value) })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    disabled={editingReview !== null}
                  >
                    <option value={0}>Select a customer</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Destination *
                  </label>
                  <select
                    value={formData.destination_id}
                    onChange={(e) => setFormData({ ...formData, destination_id: parseInt(e.target.value) })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    disabled={editingReview !== null}
                  >
                    <option value={0}>Select a destination</option>
                    {destinations.map((destination) => (
                      <option key={destination.id} value={destination.id}>
                        {destination.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center space-x-2">
                    {renderRatingInput(formData.rating, (rating) => setFormData({ ...formData, rating }))}
                    <span className="text-sm text-gray-600">({formData.rating}/5)</span>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Comment
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24 resize-none"
                    placeholder="Share your experience..."
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    {editingReview ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
