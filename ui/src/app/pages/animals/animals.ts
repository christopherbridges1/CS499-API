// Angular component for managing animals in Admin page.
import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AdminAnimals, Animal as ApiAnimal } from '../../services/admin-animals';

// Extended animal type
type UiAnimal = ApiAnimal & { lat?: number; lon?: number };

// Form state type
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

// Animals component definition
@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './animals.html',
  styleUrls: ['./animals.css']
})
// Animals component class
export class Animals {
  animals = signal<UiAnimal[]>([]);
  selectedId = signal<string | null>(null);

  // edit mode
  editId = signal<string | null>(null); // Editing this animal

  loading = signal<boolean>(false);
  error = signal<string>('');
  success = signal<string>('');

  // form state
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

  // computed stats
  total = computed(() => this.animals().length);
  available = computed(() => this.animals().filter(a => (a.status || 'Available') === 'Available').length);
  adopted = computed(() => this.animals().filter(a => a.status === 'Adoption').length);
  transfer = computed(() => this.animals().filter(a => a.status === 'Transfer').length);

  // map URL
  mapUrl: SafeResourceUrl;

  // component constructor
  constructor(private api: AdminAnimals, private sanitizer: DomSanitizer) {
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.makeOsmUrl(39.8283, -98.5795));
    this.refresh();
  }

  // Edit mode?
  get isEditing() {
    return !!this.editId();
  }

  // Create embed URL
  private makeOsmUrl(lat: number, lon: number) {
    return (
      `https://www.openstreetmap.org/export/embed.html?bbox=` +
      `${lon - 0.2}%2C${lat - 0.2}%2C${lon + 0.2}%2C${lat + 0.2}` +
      `&layer=mapnik&marker=${lat}%2C${lon}`
    );
  }

  // Convert API animal to UI animal
  private animalToUi(a: ApiAnimal): UiAnimal {
    const coords = a.location?.coordinates;
    const lon = Array.isArray(coords) && coords.length === 2 ? coords[0] : undefined;
    const lat = Array.isArray(coords) && coords.length === 2 ? coords[1] : undefined;
    return { ...a, lat, lon };
  }

  // Reset form to default state
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

  // Refresh animal list
  async refresh() {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);

    // load animals from API
    try {
      const list = await this.api.list();
      const ui = list.map(a => this.animalToUi(a));
      this.animals.set(ui);

      // auto-select first if none is selected
      if (!this.selectedId() && ui.length) {
        this.select(ui[0]._id);
      } else if (this.selectedId() && !ui.find(x => x._id === this.selectedId())) {
        this.selectedId.set(ui.length ? ui[0]._id : null);
        if (ui.length) this.select(ui[0]._id);
      }
      // exit if the edited animal no longer exists
    } catch (e: any) {
      this.error.set(e?.message || 'Failed to load animals.');
    } finally {
      this.loading.set(false);
    }
  }

  // Select an animal
  select(id: string) {
    this.selectedId.set(id);
    const a = this.animals().find(x => x._id === id);
    const lat = a?.lat ?? 39.8283;
    const lon = a?.lon ?? -98.5795;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.makeOsmUrl(lat, lon));
  }

  // Start editing an animal
  startEdit(id: string) {
    const a = this.animals().find(x => x._id === id);
    if (!a) return;

    // clear messages
    this.error.set('');
    this.success.set('');

    // enter edit mode
    this.editId.set(id);
    this.select(id);

    // populate form
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

  // Cancel editing
  cancelEdit() {
    this.editId.set(null);
    this.resetForm();
  }

  // Build payload from form data
  private buildPayloadFromForm() {
    const f = this.form();
    const name = f.name.trim();
    const breed = f.breed.trim();

    // required fields
    if (!name || !breed) {
      throw new Error('Name and breed are required.');
    }

    // build payload
    const payload: any = {
      name,
      breed,
      sex: f.sex?.trim() || undefined,
      rescueType: f.rescueType?.trim() || undefined,
      status: f.status?.trim() || 'Available',
      description: f.description?.trim() || undefined
    };

    // ageWeeks
    if (String(f.ageWeeks).trim() !== '') {
      const n = Number(f.ageWeeks);
      // validate
      if (!Number.isFinite(n) || n < 0) throw new Error('Age (weeks) must be a non-negative number.');
      payload.ageWeeks = n;
    }

    // Coordinates => GeoJSON [longitutde, Latitude]
    const latStr = String(f.lat).trim();
    const lonStr = String(f.lon).trim();
    if (latStr !== '' && lonStr !== '') {
      const lat = Number(latStr);
      const lon = Number(lonStr);
      // validate
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Latitude/Longitude must be valid numbers.');
      payload.location = { coordinates: [lon, lat] };
    }
    // return payload
    return payload;
  }

  // Save (create or update) animal
  async save() {
    this.error.set('');
    this.success.set('');

    let payload: any;
    // build payload from form
    try {
      payload = this.buildPayloadFromForm();
    } catch (e: any) {
      this.error.set(e?.message || 'Invalid form.');
      return;
    }

    // create or update via API
    try {
      if (this.editId()) {
        // UPDATE -> PUT
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
      // refresh list
      await this.refresh();
    } catch (e: any) {
      this.error.set(e?.message || 'Save failed.');
    }
  }

  // Delete an animal
  async remove(id: string) {
    this.error.set('');
    this.success.set('');

    // confirm deletion
    const a = this.animals().find(x => x._id === id);
    const label = a ? `${a.name} (${a.breed})` : 'this animal';
    if (!confirm(`Delete ${label}?`)) return;

    // delete via API
    try {
      await this.api.remove(id);
      this.success.set('Animal deleted.');

      // if you deleted the one you were editing, exit edit mode
      if (this.editId() === id) {
        this.editId.set(null);
        this.resetForm();
      }

      // refresh list
      await this.refresh();
    } catch (e: any) {
      // show error
      this.error.set(e?.message || 'Delete failed.');
    }
  }
}
