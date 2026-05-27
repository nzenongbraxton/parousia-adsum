# Standard Boilerplate for React Inertia Pages

Use this standard layout file as a template when creating new pages inside `resources/js/Pages/` in the **ParousiaAdsum** Laravel Inertia application.

---

## Standard Page Boilerplate

Save new components with `.tsx` extension inside `resources/js/Pages/`.

```tsx
import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// 1. Declare Strict Interfaces for Incoming Backend Props
interface User {
  id: number;
  name: string;
  email: string;
}

interface Geofence {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface IndexProps {
  auth: {
    user: User;
  };
  geofences: Geofence[];
}

// 2. Main Page Component
export default function Index({ auth, geofences }: IndexProps) {
  
  // 3. Strongly-Typed Inertia Form Helper
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    latitude: '',
    longitude: '',
    radius: '100', // Default 100 meters
  });

  // 4. Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('geofences.store'), {
      onSuccess: () => reset(),
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Geofence Configurations</h2>}
    >
      {/* Dynamic Title Tag for SEO and Window Title */}
      <Head title="Geofences" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Create Geofence Card Form */}
            <div className="p-6 bg-white dark:bg-gray-800 shadow sm:rounded-lg md:col-span-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Add New Geofence</h3>
              
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                  />
                  {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      id="latitude"
                      value={data.latitude}
                      onChange={(e) => setData('latitude', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                    />
                    {errors.latitude && <div className="text-red-500 text-xs mt-1">{errors.latitude}</div>}
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      id="longitude"
                      value={data.longitude}
                      onChange={(e) => setData('longitude', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                    />
                    {errors.longitude && <div className="text-red-500 text-xs mt-1">{errors.longitude}</div>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium shadow-sm transition disabled:opacity-50"
                >
                  {processing ? 'Saving...' : 'Add Geofence'}
                </button>
              </form>
            </div>

            {/* Configured Geofences List */}
            <div className="p-6 bg-white dark:bg-gray-800 shadow sm:rounded-lg md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Active Geofences</h3>
              
              <div className="mt-6 overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Radius</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {geofences.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No geofences configured.</td>
                      </tr>
                    ) : (
                      geofences.map((gf) => (
                        <tr key={gf.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{gf.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{gf.latitude}, {gf.longitude}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{gf.radius}m</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}
```
