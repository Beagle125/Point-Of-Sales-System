<!-- Button Info -->
<script module lang="ts">
	export const icon = '/ingredients.jpg';
	export const text = 'Ingredients';
</script>

<script lang="ts">
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
		const response = await fetch('/api/ingredients', {
			method: 'GET'
		});

		const result = await response.json();
		console.log(result);

		if (!response.ok) {
			// Show bad stuff here...
			return;
		}
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

<form action="GET" onsubmit={getIngredient}>
	<button type="submit">Get Ingredient</button>
</form>
