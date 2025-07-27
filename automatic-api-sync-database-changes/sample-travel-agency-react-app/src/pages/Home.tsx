import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plane, MapPin, Users, Calendar, Star, Database } from 'lucide-react';
import { userApi, destinationApi, bookingApi, reviewApi } from '../services/api';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    destinations: 0,
    bookings: 0,
    reviews: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const [users, destinations, bookings, reviews] = await Promise.all([
        userApi.getAll().catch(() => []),
        destinationApi.getAll().catch(() => []),
        bookingApi.getAll().catch(() => []),
        reviewApi.getAll().catch(() => []),
      ]);

      setStats({
        users: users.length,
        destinations: destinations.length,
        bookings: bookings.length,
        reviews: reviews.length,
      });
      setStatsLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load statistics');
      setStatsLoading(false);
    }
  };

  const features = [
    {
      icon: MapPin,
      title: 'Destinations',
      description: 'Browse and manage travel destinations with pricing and ratings',
      link: '/destinations',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      count: stats.destinations,
    },
    {
      icon: Users,
      title: 'Users',
      description: 'Manage customer accounts and user information',
      link: '/users',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      count: stats.users,
    },
    {
      icon: Calendar,
      title: 'Bookings',
      description: 'Track and manage travel bookings and reservations',
      link: '/bookings',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      count: stats.bookings,
    },
    {
      icon: Star,
      title: 'Reviews',
      description: 'View and manage customer reviews and ratings',
      link: '/reviews',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      count: stats.reviews,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-primary-600 rounded-full">
                <Plane className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Travel Agency
              <span className="block text-primary-600">Management System</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A full-stack application built with React and Node.js, powered by GibsonAI's 
              database infrastructure for seamless travel booking management.
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-8">
              <Database className="h-4 w-4" />
              <span>Powered by GibsonAI Data API</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/destinations"
                className="btn-primary text-lg px-8 py-3"
              >
                Explore Destinations
              </Link>
              <Link
                to="/bookings"
                className="btn-secondary text-lg px-8 py-3"
              >
                View Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Manage Your Travel Business
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete solution for managing destinations, users, bookings, and reviews 
            with real-time data synchronization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="card hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Live Stats Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Live Statistics
            </h2>
            <p className="text-lg text-gray-600">
              Real-time data from your travel agency database
            </p>
          </div>
          
          {statsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Loading statistics...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stats.users}</div>
                <div className="text-gray-600 font-medium">Total Users</div>
                <div className="text-sm text-gray-500 mt-1">Registered customers</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl font-bold text-green-600 mb-2">{stats.destinations}</div>
                <div className="text-gray-600 font-medium">Destinations</div>
                <div className="text-sm text-gray-500 mt-1">Available locations</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl font-bold text-purple-600 mb-2">{stats.bookings}</div>
                <div className="text-gray-600 font-medium">Total Bookings</div>
                <div className="text-sm text-gray-500 mt-1">All reservations</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl font-bold text-orange-600 mb-2">{stats.reviews}</div>
                <div className="text-gray-600 font-medium">Customer Reviews</div>
                <div className="text-sm text-gray-500 mt-1">User feedback</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-lg text-gray-600">
              Leveraging GibsonAI and modern frameworks for optimal performance
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-2xl font-bold text-blue-600 mb-2">React 18</div>
              <div className="text-gray-600">Frontend Framework</div>
            </div>
            <div className="p-6">
              <div className="text-2xl font-bold text-purple-600 mb-2">GibsonAI</div>
              <div className="text-gray-600">Database API</div>
            </div>
            <div className="p-6">
              <div className="text-2xl font-bold text-blue-500 mb-2">TypeScript</div>
              <div className="text-gray-600">Type Safety</div>
            </div>
            <div className="p-6">
              <div className="text-2xl font-bold text-cyan-600 mb-2">Tailwind CSS</div>
              <div className="text-gray-600">Styling Framework</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
