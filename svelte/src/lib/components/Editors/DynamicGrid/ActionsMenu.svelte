<script lang="ts">
    import IconLinkButton from "$lib/components/IconLinkButton.svelte";
    import EllipsisIcon from "$lib/icons/EllipsisIcon.svelte";
    import type { ButtonOptions } from "./DynamicGrid";

    /** index: list data row index */
    export let index: number;
    export let buttons: ButtonOptions[] = [];
    const visibleButtons = 2;

    let isDropdownOpen = false;
    const handleDropdownClick = () => {
        isDropdownOpen = !isDropdownOpen;
    };

    const handleDropdownFocusLoss = (e: any) => {
        if (e.relatedTarget instanceof HTMLElement && e.currentTarget.contains(e.relatedTarget)) {
            return;
        }
        
        isDropdownOpen = false;
    };

</script>

<div class="h-full flex gap-2 flex-nowrap items-center justify-start px-2" data-row-index={index}>
    {#each buttons.filter((b) => b.visible).slice(0, visibleButtons) as button}
        <IconLinkButton on:click={(e) => button.action(index)} title={button.label}>
            <svelte:fragment slot="icon">
                <svelte:component this={button.icon} />
            </svelte:fragment>
        </IconLinkButton>
    {/each}

    <div class="dropdown relative" on:focusout={handleDropdownFocusLoss}>
        <IconLinkButton
            on:click={handleDropdownClick}
        >
            <svelte:fragment slot="icon">
                <EllipsisIcon />
            </svelte:fragment>
        </IconLinkButton>
        <ul
            class="dropdown-content menu flex flex-col items-center p-2 gap-y-4 shadow-lg bg-gray-50 border border-gray-200 rounded-box absolute right-1/2 translate-x-1/2 z-10 {isDropdownOpen
                ? ''
                : 'hidden'}"
        >
            {#each buttons.filter((b) => b.visible) as button}
                <li>
                    <IconLinkButton
                        on:click={(e) => {
                            button.action(index);
                            isDropdownOpen = false;
                        }}
                        title={button.label}
                        class="hover:brightness-75"
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
</style>
