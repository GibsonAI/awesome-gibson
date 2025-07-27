import React, { useState, useEffect } from 'react';
import { destinationApi } from '../services/api';
import { TravelDestination, CreateDestinationForm, UpdateDestinationForm } from '../types';
import toast from 'react-hot-toast';

const DestinationsPage: React.FC = () => {
  const [destinations, setDestinations] = useState<TravelDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState<TravelDestination | null>(null);
  const [formData, setFormData] = useState<CreateDestinationForm>({
    name: '',
    description: '',
    price: 0,
  });

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const data = await destinationApi.getAll();
      setDestinations(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch destinations';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDestination) {
        const updateData: UpdateDestinationForm = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
        };
        await destinationApi.update(editingDestination.id, updateData);
        toast.success('Destination updated successfully');
      } else {
        await destinationApi.create(formData);
        toast.success('Destination created successfully');
      }
      setShowModal(false);
      setEditingDestination(null);
      resetForm();
      fetchDestinations();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save destination';
      toast.error(message);
    }
  };

  const handleEdit = (destination: TravelDestination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name,
      description: destination.description,
      price: destination.price,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete destination "${name}"?`)) {
      try {
        await destinationApi.delete(id);
        toast.success('Destination deleted successfully');
        fetchDestinations();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete destination';
        toast.error(message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
    });
  };

  const handleNewDestination = () => {
    setEditingDestination(null);
    resetForm();
    setShowModal(true);
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
          <h1 className="text-xl font-semibold text-gray-900">Destinations</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage travel destinations. Total destinations: {destinations.length}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={handleNewDestination}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
          >
            Add Destination
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((destination) => (
          <div key={destination.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
                  {destination.name}
                </h3>
                <div className="flex items-center space-x-2">
                  {destination.rating && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⭐ {destination.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                {destination.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  ${destination.price.toLocaleString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(destination)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(destination.id, destination.name)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Created: {new Date(destination.date_created).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
        {destinations.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No destinations</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new destination.</p>
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
                {editingDestination ? 'Edit Destination' : 'Add New Destination'}
              </h3>
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24 resize-none"
                    required
                    placeholder="Describe this travel destination..."
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    min="0"
                    step="0.01"
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
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    {editingDestination ? 'Update' : 'Create'}
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

export default DestinationsPage;
