<script lang="ts">
    import FileIcon from '$lib/icons/FileIcon.svelte';
    import FolderIcon from '$lib/icons/FolderIcon.svelte';
    import PageIcon from '$lib/icons/PageIcon.svelte';
    import RmProjIcon from '$lib/icons/RmProjIcon.svelte';
    import TCaseIcon from '$lib/icons/TCaseIcon.svelte';
    import TRoutineIcon from '$lib/icons/TRoutineIcon.svelte';
    import TSuiteIcon from '$lib/icons/TSuiteIcon.svelte';
    import { FileType } from './FileType';

    export let type: FileType = FileType.File;

    let cssClass = 'h-6 w-6 ';
    export { cssClass as class };

    let classes = `min-w-fit ${cssClass}`;
</script>

{#if type === FileType.Folder}
    <FolderIcon class={classes} />
{:else if type === FileType.RmProj}
    <RmProjIcon class={classes} />
{:else if type === FileType.TCase}
    <TCaseIcon class={classes} />
{:else if type === FileType.TRoutine}
    <TRoutineIcon class={classes} />
{:else if type === FileType.TSuite}
    <TSuiteIcon class={classes} />
{:else if type === FileType.Page}
    <PageIcon class={classes} />
{:else}
    <FileIcon class={classes} />
{/if}
