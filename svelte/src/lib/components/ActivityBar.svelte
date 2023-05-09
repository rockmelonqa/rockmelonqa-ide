<script lang="ts">
    import { AppActionType, appContextKey, type IAppContext } from '$lib/context/AppContext';
    import SettingsIcon from '$lib/icons/SettingsIcon.svelte';
    import { getContext } from 'svelte';
    import { ActivityType, type IActivityBarItem } from './ActivityBar';
    import ActivityBarItemIcon from './ActivityBarItemIcon.svelte';
    import { appActionContextKey, type IAppActionContext } from './Application';

    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;

    const { showCodeGenerationDialog, showRunTestDialog } = getContext(appActionContextKey) as IAppActionContext;

    const handleActivityChange = (activity: ActivityType) => {
        let newActivity = $appState.activity != activity ? activity : undefined;
        appStateDispatch({ type: AppActionType.SetActivity, activity: newActivity });
    };

    let activityItems: IActivityBarItem[] = [
        {
            type: ActivityType.Files,
            onSelect: () => handleActivityChange(ActivityType.Files),
        },
        // {
        //     type: ActivityType.Search,
        //     onSelect: () => handleActivityChange(ActivityType.Search),
        // },
        {
            type: ActivityType.GenerateCode,
            onSelect: showCodeGenerationDialog,
        },
        {
            type: ActivityType.RunTest,
            onSelect: showRunTestDialog,
        },
    ];
</script>

<div class="h-full flex">
    <div class="activity-bar w-14 flex flex-col bg-neutral-700">
        {#each activityItems as item}
            <button
                title={item.type.toString()}
                on:click={item.onSelect}
                class="activity-item text-zinc-400 px-1 py-2 {item.type == $appState.activity ? 'active' : ''}"
            >
                <ActivityBarItemIcon type={item.type} />
            </button>
        {/each}
        <button title="Settings" class="activity-item px-1 py-2 text-zinc-400 mt-auto">
            <SettingsIcon class="h-10 w-10" />
        </button>
    </div>
</div>

<style>
    .activity-item:hover {
        color: var(--color-white);
    }

    .activity-item.active {
        color: var(--color-white);
        border-left: 0.25rem solid var(--color-white);
        padding-left: 0;
    }
</style>
