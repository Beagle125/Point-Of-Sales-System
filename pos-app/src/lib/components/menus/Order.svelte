<!-- Button Info -->
<script module lang="ts">
	export const icon = '/order.jpg';
	export const text = 'Orders';
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	interface Product {
		product_id: number;
		name: string;
		unit_price: string;
	}

	interface Location {
		location_id: number;
		name: string;
		street: string;
		city: string;
		location_status: string;
	}
	type ProductSelection = { selected: boolean; quantity: number };

	let product_list: Product[] = $state([]);
	let location_list: Location[] = $state([]);
	let selections_post: Record<number, ProductSelection> = $state({});
	let selections_put: Record<number, ProductSelection> = $state({});

	onMount(async () => {
		let response_product = await fetch('/api/products', {
			method: 'QUERY',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				ingredients: [].map(Number)
			})
		});
		product_list = (await response_product.json()).data;

		for (let product of product_list) {
			selections_post[product.product_id] = { selected: false, quantity: 0 };
			selections_put[product.product_id] = { selected: false, quantity: 0 };
		}

		let response_location = await fetch('/api/locations', {
			method: 'QUERY',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				cities: [].map(String)
			})
		});

		location_list = (await response_location.json()).data;
	});

	async function createOrder(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const product_arr = Object.entries(selections_post)
			.filter(([id, data]) => data.selected && data.quantity > 0)
			.map(([id, data]) => ({ product_id: Number(id), quantity: Number(data.quantity) }));

		if (product_arr.length < 1) {
			console.log('Enter atleast one product');
			return;
		}

		let response;

		if (data.get('has_payment')) {
			response = await fetch('/api/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					location_id: Number(data.get('location')),
					product_arr: product_arr,
					payment_amount: data.get('payment_amount'),
					transaction_type: data.get('transaction_type')
				})
			});
		} else {
			response = await fetch('/api/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					location_id: Number(data.get('location')),
					product_arr: product_arr,
					payment_amount: null,
					transaction_type: null
				})
			});
		}

		const result = await response.json();
		console.log(result);

		if (!response.ok) {
			// Show bad stuff here...
			return;
		}

		// reset the selections
		Object.entries(selections_post).map(([id, data]) => {
			data.selected = false;
			data.quantity = 0;
		});

		form.reset();
	}

	async function deleteOrder(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		const orderId = data.get('order_id');

		const response = await fetch(`/api/orders/${orderId}`, {
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

	async function updateOrder(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		const orderId = data.get('order_id');

		const product_arr = Object.entries(selections_put)
			.filter(([id, data]) => data.selected && data.quantity > 0)
			.map(([id, data]) => ({ product_id: Number(id), quantity: Number(data.quantity) }));

		const response = await fetch(`/api/orders/${orderId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				location_id: Number(data.get('location')),
				product_arr: product_arr
			})
		});

		const result = await response.json();
		console.log(result);

		if (!response.ok) {
			// Show bad stuff here...
			return;
		}

		// reset the selections
		Object.entries(selections_put).map(([id, data]) => {
			data.selected = false;
			data.quantity = 0;
		});

		form.reset();
	}

	async function getOrder(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const response = await fetch('/api/orders', {
			method: 'QUERY',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				locations: data.getAll('locations[]').map(Number),
				products: data.getAll('products[]').map(Number)
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

<form method="POST" onsubmit={createOrder}>
	<fieldset>
		<legend>Select Location</legend>
		{#each location_list as location}
			<label>
				<input type="radio" name="location" value={location.location_id} required />
				{location.name}
			</label>
		{/each}
	</fieldset>
	<fieldset>
		<legend>Select Products</legend>
		{#each product_list as product}
			{@const selection = selections_post[product.product_id]}
			<label>
				<input type="checkbox" bind:checked={selection.selected} />
				{product.name}
				<input
					type="number"
					disabled={!selection.selected}
					bind:value={selection.quantity}
					min="1"
					step="1"
				/>
			</label>
			<br />
		{/each}
	</fieldset>
	<label>
		Enter Optional Payment
		<input type="checkbox" name="has_payment" />Add payment<br />
		<input type="number" name="payment_amount" min="0" step="0.0001" />
		<select name="transaction_type" id="transaction_type">
			<option value="e-wallet">e-wallet</option>
			<option value="cash">cash</option>
			<option value="card">card</option>
		</select>
	</label>
	<button type="submit">Place Order</button>
</form>

<form method="POST" onsubmit={deleteOrder}>
	<label>
		Order ID to delete
		<input type="number" name="order_id" required />
	</label>
	<button type="submit">Delete order</button>
</form>

<form method="POST" onsubmit={updateOrder}>
	<label>
		Order ID to update
		<input type="number" name="order_id" required />
	</label>
	<fieldset>
		<legend>Select Location</legend>
		{#each location_list as location}
			<label>
				<input type="radio" name="location" value={location.location_id} required />
				{location.name}
			</label>
		{/each}
	</fieldset>
	<fieldset>
		<legend>Select Products</legend>
		{#each product_list as product}
			{@const selection = selections_put[product.product_id]}
			<label>
				<input type="checkbox" bind:checked={selection.selected} />
				{product.name}
				<input
					type="number"
					disabled={!selection.selected}
					bind:value={selection.quantity}
					min="1"
					step="1"
				/>
			</label>
			<br />
		{/each}
	</fieldset>
	<button type="submit">Update Order</button>
</form>

<form action="QUERY" onsubmit={getOrder}>
	<fieldset>
		<legend>Filter Products</legend>
		{#each product_list as product}
			<label>
				<input type="checkbox" name="products[]" value={product.product_id} />
				{product.name}
			</label>
		{/each}
	</fieldset>
	<fieldset>
		<legend>Filter Locations</legend>
		{#each location_list as location}
			<label>
				<input type="checkbox" name="locations[]" value={location.location_id} />
				{location.name}
			</label>
		{/each}
	</fieldset>
	<button type="submit">Get Orders</button>
</form>
