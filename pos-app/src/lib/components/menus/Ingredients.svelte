<!-- Button Info -->
<script module lang="ts">
	export const icon = '/ingredients.jpg';
	export const text = 'Ingredients';
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	interface Product {
		product_id: number;
		name: string;
	}

	let product_list: Product[] = $state([]);

	onMount(async () => {
		let response = await fetch('/api/products', {
			method: 'QUERY',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				ingredients: [].map(Number)
			})
		});
		product_list = (await response.json()).data;
	});

	async function createIngredient(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const response = await fetch('/api/ingredients', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: data.get('name')
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

	async function deleteIngredient(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		const ingredientId = data.get('ingredient_id');

		const response = await fetch(`/api/ingredients/${ingredientId}`, {
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

	async function updateIngredient(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const date = new FormData(form);
		const ingredientId = date.get('ingredient_id');

		const response = await fetch(`/api/ingredients/${ingredientId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: date.get('name')
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

	async function getIngredient(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const response = await fetch('/api/ingredients', {
			method: 'QUERY',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
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

<form method="POST" onsubmit={createIngredient}>
	<label>
		Ingredient name
		<input type="text" name="name" required />
	</label>
	<button type="submit">Create Ingredient</button>
</form>

<form method="POST" onsubmit={deleteIngredient}>
	<label>
		Ingredient ID
		<input type="number" name="ingredient_id" />
	</label>
	<button type="submit">Delete Ingredient</button>
</form>

<form method="POST" onsubmit={updateIngredient}>
	<label>
		Ingredient ID to update
		<input type="number" name="ingredient_id" required />
	</label>
	<label>
		New Ingreident name
		<input type="text" name="name" required />
	</label>
	<button type="submit">update ingredient</button>
</form>

<form action="QUERY" onsubmit={getIngredient}>
	{#each product_list as product}
		<label>
			<input type="checkbox" name="products[]" value={product.product_id} />
			{product.name}
		</label>
	{/each}
	<button type="submit">Get Ingredients</button>
</form>
