<!-- Button Info -->
<script module lang="ts">
    import LocationRevenue from "../reports/LocationRevenue.svelte";
	import ProductRevenue from "../reports/ProductRevenue.svelte";
	import QtyPerProduct from "../reports/QtyPerProduct.svelte";
	import Transactions from "../reports/Transactions.svelte";
    
    export const icon = "/reports.jpg";
    export const text = "Reports";
</script>

<script lang="ts">
    // ...
</script>

<LocationRevenue />
<ProductRevenue />
<QtyPerProduct />
<Transactions />