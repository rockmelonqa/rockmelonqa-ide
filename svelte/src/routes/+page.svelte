<script lang="ts">
    import ActivityBar from '$lib/components/ActivityBar.svelte';
    import SideBar from '$lib/components/SideBar.svelte';
    import Tabs from '$lib/components/Tab/Tabs.svelte';
    import { AppActionType, appContextKey, type IAppContext } from '$lib/context/AppContext';
    import { getContext } from 'svelte';
    import { Pane, Splitpanes, type IPaneSizingEvent } from 'svelte-splitpanes';

    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;

    $: showSidebar = $appState.activity != undefined;

    const handleResized = (e: CustomEvent<IPaneSizingEvent[]>) => {
        // get SideBar (first panel) size
        let sideBarSize = e.detail[0].size;

        // Collapse sidebar == unselect activity
        if (sideBarSize === 0) {
            appStateDispatch({ type: AppActionType.SetActivity, activity: undefined });
        }
    };
</script>

<div class="w-full h-full grid grid-col-2 grid-cols-[3.5rem_1fr]">
    <div class="col-start-1"><ActivityBar /></div>
    <Splitpanes class="h-full" theme="modern-theme" on:resized={handleResized}>
        {#if showSidebar}
            <Pane size={25} maxSize={75} snapSize={5}>
                <SideBar />
            </Pane>
        {/if}
        <Pane>
            <Tabs tabs={$appState.tabs} />
        </Pane>
    </Splitpanes>
</div>

<style>
</style>
