import { Injectable } from '@angular/core';
import { AdminAuth } from './admin-auth';

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

@Injectable({ providedIn: 'root' })
export class AdminAnimals {
    constructor(private adminAuth: AdminAuth) { }

    private headers() {
        const token = this.adminAuth.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    }

    async list(): Promise<Animal[]> {
        const res = await fetch('/api/animals');
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || `List failed (${res.status})`);
        return data?.animals || [];
    }

    async create(input: Partial<Animal>): Promise<Animal> {
        const res = await fetch('/api/animals', {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify(input)
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || `Create failed (${res.status})`);
        return data.animal;
    }

    async remove(id: string): Promise<void> {
        const res = await fetch(`/api/animals/${id}`, {
            method: 'DELETE',
            headers: this.headers()
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || `Delete failed (${res.status})`);
    }

    async update(id: string, patch: Partial<Animal>): Promise<Animal> {
        const res = await fetch(`/api/animals/${id}`, {
            method: 'PUT',
            headers: this.headers(),
            body: JSON.stringify(patch)
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || `Update failed (${res.status})`);
        return data.animal;
    }
}
