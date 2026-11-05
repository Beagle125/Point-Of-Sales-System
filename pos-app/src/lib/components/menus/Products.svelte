<!-- Button Info -->
<script module lang="ts">
	export const icon = '/products.jpg';
	export const text = 'Products';
</script>

<script lang="ts">
	async function createProduct(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const response = await fetch('/api/products', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: data.get('name'),
				unit_price: data.get('unit_price')
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

	async function deleteProduct(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		const productId = data.get('product_id');

		const response = await fetch(`/api/products/${productId}`, {
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

	async function updateProduct(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		const productId = data.get('product_id');

		const response = await fetch(`/api/products/${productId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: data.get('name'),
				unit_price: data.get('unit_price')
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

<form method="POST" onsubmit={createProduct}>
	<label>
		Product name
		<input type="text" name="name" required />
	</label>
	<label>
		Unit price
		<input type="number" name="unit_price" min="0" step="0.0001" required />
	</label>
	<button type="submit">Create product</button>
</form>

<form method="POST" onsubmit={deleteProduct}>
	<label>
		Product ID to delete
		<input type="number" name="product_id" required />
	</label>
	<button type="submit">Delete product</button>
</form>

<form method="POST" onsubmit={updateProduct}>
	<label>
		Product ID to update
		<input type="number" name="product_id" required />
	</label>
	<label>
		New Product name
		<input type="text" name="name" required />
	</label>
	<label>
		New Unit price
		<input type="number" name="unit_price" min="0" step="0.0001" required />
	</label>
	<button type="submit">update product</button>
</form>
