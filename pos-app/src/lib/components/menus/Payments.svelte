<!-- Button Info -->
<script module lang="ts">
	export const icon = '/payment.jpg';
	export const text = 'Payments';
</script>

<script lang="ts">
	async function createPayment(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const response = await fetch('/api/payments', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				order_id: Number(data.get('order_id')),
				amount: data.get('amount'),
				transaction_type: data.get('transaction_type')
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

	async function deletePayment(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		const paymentId = data.get('payment_id');

		const response = await fetch(`/api/payments/${paymentId}`, {
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

	async function updatePayment(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		const paymentId = data.get('payment_id');

		const response = await fetch(`/api/payments/${paymentId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				amount: data.get('amount'),
				transaction_type: data.get('transaction_type')
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

	async function getPayment(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const response = await fetch('/api/payments', {
			method: 'QUERY',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				transaction_type: data.get('transaction_type')
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

<form method="POST" onsubmit={createPayment}>
	<label>
		Order id
		<input type="number" name="order_id" required />
	</label>
	<label>
		Amount
		<input type="number" name="amount" min="0" step="0.0001" required />
	</label>
	<label>
		Transaction Type
		<select name="transaction_type" id="transaction_type">
			<option value="e-wallet">e-wallet</option>
			<option value="cash">cash</option>
			<option value="card">card</option>
		</select>
	</label>
	<button type="submit">Enter payment</button>
</form>

<form method="POST" onsubmit={deletePayment}>
	<label>
		Payment ID to delete
		<input type="number" name="payment_id" required />
	</label>
	<button type="submit">Delete payment</button>
</form>

<form method="POST" onsubmit={updatePayment}>
	<label>
		Payment ID to update
		<input type="number" name="payment_id" required />
	</label>
	<label>
		New Amount
		<input type="number" name="amount" min="0" step="0.0001" required />
	</label>
	<label>
		New Transaction Type
		<select name="transaction_type" id="transaction_type">
			<option value="e-wallet">e-wallet</option>
			<option value="cash">cash</option>
			<option value="card">card</option>
		</select>
	</label>
	<button type="submit">Update payment</button>
</form>

<form action="QUERY" onsubmit={getPayment}>
	<label>
		Filter transaction type
		<select name="transaction_type" id="transaction_type">
			<option value="none">None</option>
			<option value="e-wallet">e-wallet</option>
			<option value="cash">cash</option>
			<option value="card">card</option>
		</select>
	</label>
	<button type="submit">Get payment</button>
</form>
