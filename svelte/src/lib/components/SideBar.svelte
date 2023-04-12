<script lang="ts">
    import { appContextKey, type IAppContext } from '$lib/context/AppContext';
    import { getContext } from 'svelte';
    import { ActivityType } from './ActivityBar';
    import FileExplorer from './FileExplorer/FileExplorer.svelte';
    import Search from './Search.svelte';

    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState } = appContext;
</script>

<div class="side-bar h-full bg-neutral-100">
    <div class="{$appState.activity == ActivityType.Files ? '' : 'hidden'} h-full overflow-auto">
        <FileExplorer />
    </div>
    <div class="p-4 {$appState.activity == ActivityType.Search ? '' : 'hidden'}">
        <Search />
    </div>
</div>
