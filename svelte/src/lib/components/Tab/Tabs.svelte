<script lang="ts">
    import { AppActionType, appContextKey, type IAppContext } from '$lib/context/AppContext';
    import CircleIcon from '$lib/icons/CircleIcon.svelte';
    import CloseIcon from '$lib/icons/CloseIcon.svelte';
    import { application } from '$lib/ipc';
    import getWindow from '$lib/utils/getWindow';
    import type { Action } from 'rockmelonqa.common';
    import { afterUpdate, getContext, onDestroy, onMount } from 'svelte';
    import { AlertDialogButtons, AlertDialogType } from '../Alert';
    import AlertDialog from '../AlertDialog.svelte';
    import { appActionContextKey, type IAppActionContext } from '../Application';
    import FileIcon from '../FileIcon.svelte';
    import { getFileType } from '../FileType';
    import type { ITab } from './Tab';

    const window = getWindow();

    export let tabs: ITab[] = [];

    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;

    let titleBar: HTMLElement;
    let mounted: boolean;
    let recentActiveTabIndex: number;

    let closeTabDialogType: AlertDialogType = AlertDialogType.None;
    let tabToClose: number;

    $: tabTitleContainerCss = 'tab-item-title-container pl-4 pr-2 py-3 flex items-center gap-x-3';
    $: tabContentCss = 'tab-item-content flex-1 overflow-y-auto';

    onMount(() => {
        // Enable horizontal scroll
        titleBar.addEventListener('wheel', function (e) {
            titleBar.scrollLeft = titleBar.scrollLeft + (e.deltaY > 0 ? 100 : -100);
            e.preventDefault();
        });

        mounted = true;
    });

    onDestroy(() => {});

    afterUpdate(() => {
        if (mounted) {
            // When new tab is selected, scroll to it
            if (recentActiveTabIndex !== $appState.activeTabIndex) {
                const activeTabElement = titleBar.childNodes.item($appState.activeTabIndex) as HTMLElement;
                activeTabElement?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end',
                    inline: 'nearest',
                });

                recentActiveTabIndex = $appState.activeTabIndex;
            }
        }
    });

    const handleSelectTab = async (tab: ITab, tabIndex: number) => {
        appStateDispatch({ type: AppActionType.SelectTab, tabIndex });
    };

    const { getOnSaveHandler } = getContext(appActionContextKey) as IAppActionContext;

    const handleCloseTab = async (e: Event, tab: ITab, tabIndex: number) => {
        e.stopPropagation();

        if (!tab.isDirty) {
            // if tab is not dirty, just close it
            appStateDispatch({ type: AppActionType.CloseTab, tabIndex });
            return;
        }

        // tab is dirty, determine whether tab-content registers onSave handler or not
        const handler = getOnSaveHandler(tabIndex);
        if (handler != null) {
            closeTabDialogType = AlertDialogType.Question;
            tabToClose = tabIndex;
        } else {
            appStateDispatch({ type: AppActionType.CloseTab, tabIndex });
        }
    };

    const handleCloseConfirmation = async (event: any) => {
        const button = event.detail.button;
        if (button === 'cancel') {
            return;
        }

        // yes || no
        if (button === 'yes') {
            const handler = getOnSaveHandler(tabToClose);
            if (handler != null) {
                const success = await handler();
                if (!success) {
                    // do not close tab
                    return;
                }
            }
        }

        appStateDispatch({ type: AppActionType.CloseTab, tabIndex: tabToClose });
    };

    const setTabDirty = (tabIndex: number, isDirty: boolean) => {
        const needUpdate = tabs[tabIndex].isDirty !== isDirty;
        if (needUpdate) {
            appStateDispatch({
                type: AppActionType.SetTabDirty,
                tabIndex: tabIndex,
                isDirty: isDirty,
            });
        }
    };
</script>

<div class="tabs h-screen flex flex-col">
    <div class="tab-item-title-bar flex bg-neutral-200" bind:this={titleBar}>
        {#each tabs as tab, idx (tab.id)}
            <button on:click={() => handleSelectTab(tab, idx)}>
                <div
                    class={`${tabTitleContainerCss}
                    ${idx === $appState.activeTabIndex ? 'active bg-white font-bold' : 'bg-neutral-100'}
                    ${tab.isDirty ? 'dirty' : ''}`}
                >
                    <div class="tab-item-icon">
                        <FileIcon type={getFileType(tab.id)} class="h-5 w-5" />
                    </div>
                    <div class="tab-item-title truncate" title={tab.tooltip ?? tab.title}>
                        {tab.title}
                    </div>
                    <div class="tab-button visible h-5 w-5">
                        <button class="close-button" on:click={(e) => handleCloseTab(e, tab, idx)}>
                            <CloseIcon class="h-5 w-5 hover:bg-neutral-200 rounded" />
                        </button>
                        <span class="dirty-icon align-middle"><CircleIcon class="h-3 w-3" fill="currentColor" /></span>
                    </div>
                </div>
            </button>
        {/each}
    </div>
    {#each tabs as tab, idx (tab.id)}
        <div class={`${tabContentCss} ${idx === $appState.activeTabIndex ? '' : 'hidden'}`}>
            <svelte:component
                this={tab.content.component}
                {...tab.content.data}
                contentIndex={idx}
                on:change={() => setTabDirty(idx, true)}
                on:saved={() => setTabDirty(idx, false)}
            />
        </div>
    {/each}
</div>

<AlertDialog
    id="dialogCloseTab"
    bind:type={closeTabDialogType}
    buttons={AlertDialogButtons.YesNoCancel}
    on:click={handleCloseConfirmation}
>
    <div slot="content">Do you want to save pending changes?</div>
</AlertDialog>

