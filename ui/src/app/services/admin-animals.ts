// Service for managing animal records in the admin interface.
import { Injectable } from '@angular/core';
import { AdminAuth } from './admin-auth';

// Animal type definition
export type Animal = {
  _id: string;
  name: string;
  breed: string;
  sex?: string;
  ageWeeks?: number;
  rescueType?: string;
  status?: string;
  description?: string;
  location?: { type: 'Point'; coordinates?: number[] };
};

// AdminAnimals service definition
@Injectable({ providedIn: 'root' })
// AdminAnimals service class
export class AdminAnimals {
  constructor(private adminAuth: AdminAuth) { }

  // Helper to get headers with auth token
  private headers() {
    const token = this.adminAuth.getToken();
    return {
      // Set content type and authorization headers
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  // List all animals
  async list(): Promise<Animal[]> {
    const res = await fetch('/api/animals');
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || `List failed (${res.status})`);
    return data?.animals || [];
  }

  // Create a new animal
  async create(input: Partial<Animal>): Promise<Animal> {
    const res = await fetch('/api/animals', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(input)
    });
    // Get response data
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || `Create failed (${res.status})`);
    return data.animal;
  }

  // Delete an animal by ID
  async remove(id: string): Promise<void> {
    const res = await fetch(`/api/animals/${id}`, {
      method: 'DELETE',
      headers: this.headers()
    });
    // Get response data
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || `Delete failed (${res.status})`);
  }

  // Update an animal by ID
  async update(id: string, patch: Partial<Animal>): Promise<Animal> {
    const res = await fetch(`/api/animals/${id}`, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(patch)
    });
    // Get response data
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || `Update failed (${res.status})`);
    return data.animal;
  }
}
