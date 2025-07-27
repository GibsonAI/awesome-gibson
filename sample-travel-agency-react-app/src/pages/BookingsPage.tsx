import React, { useState, useEffect } from 'react';
import { bookingApi, userApi, destinationApi } from '../services/api';
import { TravelBooking, CreateBookingForm, UpdateBookingForm, TravelUser, TravelDestination } from '../types';
import toast from 'react-hot-toast';

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<TravelBooking[]>([]);
  const [users, setUsers] = useState<TravelUser[]>([]);
  const [destinations, setDestinations] = useState<TravelDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<TravelBooking | null>(null);
  const [formData, setFormData] = useState<CreateBookingForm>({
    user_id: 0,
    destination_id: 0,
    date: '',
    number_of_people: 1,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [bookingsData, usersData, destinationsData] = await Promise.all([
        bookingApi.getAll(),
        userApi.getAll(),
        destinationApi.getAll(),
      ]);
      setBookings(bookingsData);
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
      if (editingBooking) {
        const updateData: UpdateBookingForm = {
          date: formData.date,
          number_of_people: formData.number_of_people,
        };
        await bookingApi.update(editingBooking.id, updateData);
        toast.success('Booking updated successfully');
      } else {
        await bookingApi.create(formData);
        toast.success('Booking created successfully');
      }
      setShowModal(false);
      setEditingBooking(null);
      resetForm();
      fetchAllData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save booking';
      toast.error(message);
    }
  };

  const handleEdit = (booking: TravelBooking) => {
    setEditingBooking(booking);
    setFormData({
      user_id: booking.user_id,
      destination_id: booking.destination_id,
      date: booking.date,
      number_of_people: booking.number_of_people,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number, bookingInfo: string) => {
    if (window.confirm(`Are you sure you want to delete booking "${bookingInfo}"?`)) {
      try {
        await bookingApi.delete(id);
        toast.success('Booking deleted successfully');
        fetchAllData();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete booking';
        toast.error(message);
      }
    }
  };

  const updateBookingStatus = async (id: number, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      await bookingApi.update(id, { status });
      toast.success(`Booking ${status} successfully`);
      fetchAllData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update booking status';
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: 0,
      destination_id: 0,
      date: '',
      number_of_people: 1,
    });
  };

  const handleNewBooking = () => {
    setEditingBooking(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case '2':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case '3':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string | number) => {
    if (typeof status === 'number') {
      switch (status) {
        case 1: return 'Pending';
        case 2: return 'Confirmed';
        case 3: return 'Cancelled';
        default: return 'Unknown';
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const isStatusConfirmed = (status: string | number) => {
    return status === 2 || status === 'confirmed';
  };

  const isStatusCancelled = (status: string | number) => {
    return status === 3 || status === 'cancelled';
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
          <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage travel bookings. Total bookings: {bookings.length}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={handleNewBooking}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:w-auto"
            disabled={users.length === 0 || destinations.length === 0}
          >
            Add Booking
          </button>
        </div>
      </div>

      {(users.length === 0 || destinations.length === 0) && (
        <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong className="font-bold">Note: </strong>
          <span className="block sm:inline">
            You need at least one user and one destination to create bookings.
          </span>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Travel Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      People
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booked On
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getUserName(booking.user_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getDestinationName(booking.destination_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.number_of_people}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status.toString())}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex flex-col space-y-1">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(booking)}
                              className="text-blue-600 hover:text-blue-900 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(booking.id, `${getUserName(booking.user_id)} - ${getDestinationName(booking.destination_id)}`)}
                              className="text-red-600 hover:text-red-900 text-xs"
                            >
                              Delete
                            </button>
                          </div>
                          {!isStatusConfirmed(booking.status) && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              className="text-green-600 hover:text-green-900 text-xs"
                            >
                              Confirm
                            </button>
                          )}
                          {!isStatusCancelled(booking.status) && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900 text-xs"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        No bookings found. Click "Add Booking" to create your first booking.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">
                {editingBooking ? 'Edit Booking' : 'Add New Booking'}
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
                    disabled={editingBooking !== null}
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
                    disabled={editingBooking !== null}
                  >
                    <option value={0}>Select a destination</option>
                    {destinations.map((destination) => (
                      <option key={destination.id} value={destination.id}>
                        {destination.name} (${destination.price.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Travel Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Number of People *
                  </label>
                  <input
                    type="number"
                    value={formData.number_of_people}
                    onChange={(e) => setFormData({ ...formData, number_of_people: parseInt(e.target.value) || 1 })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    min="1"
                    max="20"
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
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                  >
                    {editingBooking ? 'Update' : 'Create'}
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

export default BookingsPage;
