<!-- Button Info -->
<script module lang="ts">
	export const icon = '/locations.jpg';
	export const text = 'Locations';
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	interface CityObj {
		city: string;
	}

	let city_list: string[] = $state([]);

	onMount(async () => {
		let response = await fetch('/api/locations', {
			method: 'GET'
		});
		let obj_arr = (await response.json()).data;
		city_list = obj_arr.map((object: CityObj) => object.city);
	});

	async function createLocation(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const response = await fetch('/api/locations', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: data.get('name'),
				city: data.get('city'),
				street: data.get('street')
			})
		});

		const result = await response.json();
		console.log(result);

		if (!response.ok) {
			// Show bad stuff here...
			return;
		}

		form.reset();
	}

	async function deleteLocation(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		const locationId = data.get('location_id');

		const response = await fetch(`/api/locations/${locationId}`, {
			method: 'DELETE'
		});

		const result = await response.json();
		console.log(result);

		if (!response.ok) {
			// Show bad stuff here...
			return;
		}

		form.reset();
	}

	async function updateLocation(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		const locationId = data.get('location_id');

		const response = await fetch(`/api/locations/${locationId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: data.get('name'),
				city: data.get('city'),
				street: data.get('street')
			})
		});

		const result = await response.json();
		console.log(result);

		if (!response.ok) {
			// Show bad stuff here...
			return;
		}

		form.reset();
	}

	async function getLocation(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const response = await fetch('/api/locations', {
			method: 'QUERY',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				cities: data.getAll('locations[]').map(String)
			})
		});

		const result = await response.json();
		console.log(result);

		if (!response.ok) {
			// Show bad stuff here...
			return;
		}

		form.reset();
	}
</script>

<form method="POST" onsubmit={createLocation}>
	<label>
		Location name
		<input type="text" name="name" required />
	</label>
	<label>
		City name
		<input type="text" name="city" required />
	</label>
	<label>
		Street name
		<input type="text" name="street" required />
	</label>
	<button type="submit">Create Location</button>
</form>

<form method="POST" onsubmit={deleteLocation}>
	<label>
		Location ID
		<input type="number" name="location_id" />
	</label>
	<button type="submit">Delete Location</button>
</form>

<form method="POST" onsubmit={updateLocation}>
	<label>
		Location ID to update
		<input type="text" name="location_id" required />
	</label>
	<label>
		New Location name
		<input type="text" name="name" required />
	</label>
	<label>
		New City
		<input type="text" name="city" required />
	</label>
	<label>
		New Street
		<input type="text" name="street" required />
	</label>
	<button type="submit">update location</button>
</form>

<form action="QUERY" onsubmit={getLocation}>
	{#each city_list as city}
		<label>
			<input type="checkbox" name="locations[]" value={city} />
			{city}
		</label>
	{/each}
	<button type="submit">Get locations</button>
</form>
