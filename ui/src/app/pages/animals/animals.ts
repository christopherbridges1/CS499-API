import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AdminAnimals, Animal as ApiAnimal } from '../../services/admin-animals';

type UiAnimal = ApiAnimal & { lat?: number; lon?: number };

type FormState = {
  name: string;
  breed: string;
  sex: string;
  ageWeeks: any;
  rescueType: string;
  status: string;
  description: string;
  lat: any;
  lon: any;
};

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './animals.html',
  styleUrls: ['./animals.css']
})
export class Animals {
  animals = signal<UiAnimal[]>([]);
  selectedId = signal<string | null>(null);

  // edit mode
  editId = signal<string | null>(null); // when set, form is editing this animal

  loading = signal<boolean>(false);
  error = signal<string>('');
  success = signal<string>('');

  form = signal<FormState>({
    name: '',
    breed: '',
    sex: '',
    ageWeeks: '' as any,
    rescueType: '',
    status: 'Available',
    description: '',
    lat: '' as any,
    lon: '' as any
  });

  total = computed(() => this.animals().length);
  available = computed(() => this.animals().filter(a => (a.status || 'Available') === 'Available').length);
  adopted = computed(() => this.animals().filter(a => a.status === 'Adoption').length);
  transfer = computed(() => this.animals().filter(a => a.status === 'Transfer').length);

  mapUrl: SafeResourceUrl;

  constructor(private api: AdminAnimals, private sanitizer: DomSanitizer) {
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.makeOsmUrl(39.8283, -98.5795));
    this.refresh();
  }

  get isEditing() {
    return !!this.editId();
  }

  private makeOsmUrl(lat: number, lon: number) {
    return (
      `https://www.openstreetmap.org/export/embed.html?bbox=` +
      `${lon - 0.2}%2C${lat - 0.2}%2C${lon + 0.2}%2C${lat + 0.2}` +
      `&layer=mapnik&marker=${lat}%2C${lon}`
    );
  }

  private animalToUi(a: ApiAnimal): UiAnimal {
    const coords = a.location?.coordinates;
    const lon = Array.isArray(coords) && coords.length === 2 ? coords[0] : undefined;
    const lat = Array.isArray(coords) && coords.length === 2 ? coords[1] : undefined;
    return { ...a, lat, lon };
  }

  private resetForm() {
    this.form.set({
      name: '',
      breed: '',
      sex: '',
      ageWeeks: '' as any,
      rescueType: '',
      status: 'Available',
      description: '',
      lat: '' as any,
      lon: '' as any
    });
  }

  async refresh() {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);

    try {
      const list = await this.api.list();
      const ui = list.map(a => this.animalToUi(a));
      this.animals.set(ui);

      if (!this.selectedId() && ui.length) {
        this.select(ui[0]._id);
      } else if (this.selectedId() && !ui.find(x => x._id === this.selectedId())) {
        this.selectedId.set(ui.length ? ui[0]._id : null);
        if (ui.length) this.select(ui[0]._id);
      }
    } catch (e: any) {
      this.error.set(e?.message || 'Failed to load animals.');
    } finally {
      this.loading.set(false);
    }
  }

  select(id: string) {
    this.selectedId.set(id);
    const a = this.animals().find(x => x._id === id);
    const lat = a?.lat ?? 39.8283;
    const lon = a?.lon ?? -98.5795;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.makeOsmUrl(lat, lon));
  }

  startEdit(id: string) {
    const a = this.animals().find(x => x._id === id);
    if (!a) return;

    this.error.set('');
    this.success.set('');

    this.editId.set(id);
    this.select(id);

    this.form.set({
      name: a.name || '',
      breed: a.breed || '',
      sex: a.sex || '',
      ageWeeks: a.ageWeeks ?? '',
      rescueType: a.rescueType || '',
      status: a.status || 'Available',
      description: a.description || '',
      lat: a.lat ?? '',
      lon: a.lon ?? ''
    });
  }

  cancelEdit() {
    this.editId.set(null);
    this.resetForm();
  }

  private buildPayloadFromForm() {
    const f = this.form();
    const name = f.name.trim();
    const breed = f.breed.trim();

    if (!name || !breed) {
      throw new Error('Name and breed are required.');
    }

    const payload: any = {
      name,
      breed,
      sex: f.sex?.trim() || undefined,
      rescueType: f.rescueType?.trim() || undefined,
      status: f.status?.trim() || 'Available',
      description: f.description?.trim() || undefined
    };

    // optional ageWeeks
    if (String(f.ageWeeks).trim() !== '') {
      const n = Number(f.ageWeeks);
      if (!Number.isFinite(n) || n < 0) throw new Error('Age (weeks) must be a non-negative number.');
      payload.ageWeeks = n;
    }

    // optional coordinates => GeoJSON [lng, lat]
    const latStr = String(f.lat).trim();
    const lonStr = String(f.lon).trim();
    if (latStr !== '' && lonStr !== '') {
      const lat = Number(latStr);
      const lon = Number(lonStr);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Latitude/Longitude must be valid numbers.');
      payload.location = { coordinates: [lon, lat] };
    }

    return payload;
  }

  async save() {
    this.error.set('');
    this.success.set('');

    let payload: any;
    try {
      payload = this.buildPayloadFromForm();
    } catch (e: any) {
      this.error.set(e?.message || 'Invalid form.');
      return;
    }

    try {
      if (this.editId()) {
        // EDIT -> PUT
        const id = this.editId()!;
        await this.api.update(id, payload);
        this.success.set('Animal updated.');
        this.editId.set(null);
        this.resetForm();
      } else {
        // CREATE -> POST
        const created = await this.api.create(payload);
        this.success.set('Animal added.');
        this.resetForm();
        this.select((created as any)._id);
      }

      await this.refresh();
    } catch (e: any) {
      this.error.set(e?.message || 'Save failed.');
    }
  }

  async remove(id: string) {
    this.error.set('');
    this.success.set('');

    const a = this.animals().find(x => x._id === id);
    const label = a ? `${a.name} (${a.breed})` : 'this animal';
    if (!confirm(`Delete ${label}?`)) return;

    try {
      await this.api.remove(id);
      this.success.set('Animal deleted.');

      // if you deleted the one you were editing, exit edit mode
      if (this.editId() === id) {
        this.editId.set(null);
        this.resetForm();
      }

      await this.refresh();
    } catch (e: any) {
      this.error.set(e?.message || 'Delete failed.');
    }
  }
}