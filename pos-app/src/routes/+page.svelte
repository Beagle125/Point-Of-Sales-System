<script lang="ts">
	import { goto } from "$app/navigation";
	import { type Component, onMount } from "svelte";

    interface Menu {
        icon: string;
        text: string;
        component: Component;
    }

    const menus: Array<Menu> = $state(
        Object.values(import.meta.glob('../lib/components/menus/*.svelte', { eager: true }) as Record<string, Menu>).map((module) => ({
            icon: module.icon,
            text: module.text,
            component: module.component
        }))
    );
    
    
</script>

<div class="min-h-svh min-w-svw flex flex-col">
    <!-- Top Bar Navigation-->
    <div class="flex flex-row p-1 gap-2 flex-1 h-30 max-h-30 bg-secondary-300 justify-center items-center">
        {#each menus as menu}
            <button class="aspect-square justify-center items-center  preset-filled-secondary-100-900 min-h-25">
                <img src={menu.icon} alt={menu.text}/>
                {menu.text}
            </button>
        {/each}
    </div>

    <!-- Main Content -->
    <div class="flex-2 bg-primary-500 p-4">
        
    </div>
</div>