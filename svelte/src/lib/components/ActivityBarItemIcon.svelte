<script lang="ts">
    import FilesIcon from '$lib/icons/FilesIcon.svelte';
    import GenerateCodeIcon from '$lib/icons/GenerateCodeIcon.svelte';
    import RunTestIcon from '$lib/icons/RunTestIcon.svelte';
    import SearchIcon from '$lib/icons/SearchIcon.svelte';
    import { ActivityType } from './ActivityBar';

    export let type: ActivityType;
    const iconClass = 'h-10 w-10';
</script>

{#if type === ActivityType.Files}
    <FilesIcon class={iconClass} />
{:else if type === ActivityType.Search}
    <SearchIcon class={iconClass} />
{:else if type === ActivityType.GenerateCode}
    <GenerateCodeIcon class={`${iconClass} p-1`} />
{:else if type === ActivityType.RunTest}
    <RunTestIcon class={iconClass} />
{/if}
