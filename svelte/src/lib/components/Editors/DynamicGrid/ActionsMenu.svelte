<script lang="ts">
    import IconLinkButton from "$lib/components/IconLinkButton.svelte";
    import EllipsisIcon from "$lib/icons/EllipsisIcon.svelte";
    import { onMount } from "svelte";
    import type { ButtonOptions } from "./DynamicGrid";

    export let index: number;
    export let buttons: ButtonOptions[] = [];
    const visibleButtons = 2;

    let isDropdownOpen = false;
    const handleDropdownClick = () => {
        isDropdownOpen = !isDropdownOpen;
    };

    const handleDropdownFocusLoss = (e: any) => {
        if (e.relatedTarget instanceof HTMLElement && e.currentTarget.contains(e.relatedTarget)) return;
        isDropdownOpen = false;
    };
    onMount(() => {});
</script>

<div class="h-full flex gap-2 flex-nowrap items-center justify-start px-4 icon-link-button" data-row-index={index}>
    {#each buttons.filter((b) => b.visible).slice(0, visibleButtons) as button}
        <IconLinkButton on:click={(e) => button.action(index)} title={button.label}>
            <svelte:fragment slot="icon">
                <svelte:component this={button.icon} class="icon-link-button" />
            </svelte:fragment>
        </IconLinkButton>
    {/each}

    <div class="dropdown relative" on:focusout={handleDropdownFocusLoss}>
        <button
            class="icon-link-button border-none font-bold flex items-center justify-center"
            on:click={handleDropdownClick}
        >
            <EllipsisIcon />
        </button>
        <ul
            class="dropdown-content menu flex items-center flex-col shadow-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-box absolute right-1/2 translate-x-1/2 z-10 {isDropdownOpen
                ? ''
                : 'hidden'}"
        >
            {#each buttons.filter((b) => b.visible) as button}
                <li class="bg-gray-50 p-3 text-center">
                    <IconLinkButton
                        on:click={(e) => {
                            button.action(index);
                            isDropdownOpen = false;
                        }}
                        title={button.label}
                        class="flex items-stretch justify-between hover:brightness-75"
                    >
                        <svelte:fragment slot="icon">
                            <svelte:component this={button.icon} />
                        </svelte:fragment>
                    </IconLinkButton>
                </li>
            {/each}
        </ul>
    </div>
</div>

<style>
    .icon-link-button {
        color: var(--color-brand);
    }
</style>
