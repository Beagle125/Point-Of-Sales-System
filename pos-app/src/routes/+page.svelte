<script lang="ts">
	import { goto } from "$app/navigation";
	import { type Component, onMount } from "svelte";

    interface MenuModule {
        icon: string;
        text: string;
        default: Component;
    }

    interface Menu {
        icon: string;
        text: string;
        component: Component;
    }

    const menus: Array<Menu> = $state(
        Object.values(import.meta.glob('../lib/components/menus/*.svelte', { eager: true }) as Record<string, MenuModule>).map((module) => ({
            icon: module.icon,
            text: module.text,
            component: module.default
        }))
    );
    
    let CurrentMenu: Component = $state(menus[0].component);
</script>

<div class="min-h-svh min-w-svw flex flex-col">
    <!-- Top Bar Navigation-->
    <div class="flex flex-1 max-h-30 bg-secondary-300 justify-center items-center">
        <div class="min-h-full flex flex-row gap-2 p-4">
            {#each menus as menu}
                <button class="btn aspect-square preset-filled-secondary-100-900 flex flex-col items-center justify-center" onclick={() => {CurrentMenu = menu.component; console.log($state.snapshot(CurrentMenu))}}>
                    <div class="flex flex-col">
                        <img src={menu.icon} alt={menu.text}/>
                        {menu.text}
                    </div>
                </button>
            {/each}
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-2 bg-primary-500 p-4">
        <CurrentMenu />
    </div>
</div>