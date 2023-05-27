<script lang="ts">
    import { appActionContextKey, type IAppActionContext } from '$lib/components/Application';
    import { extractPath } from '$lib/components/FileExplorer/Node';
    import { Notify } from '$lib/components/Notify';
    import { stringResKeys } from '$lib/context/StringResKeys';
    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';
    import AddCircleIcon from '$lib/icons/AddCircleIcon.svelte';
    import ExitIcon from '$lib/icons/ExitIcon.svelte';
    import OpenIcon from '$lib/icons/OpenIcon.svelte';
    import { application, fileSystem } from '$lib/ipc';
    import { removeRecentProjects } from '$lib/utils/userSettings';
    import type { Action, IRecentFile, IRmProj, IRmProjFile } from 'rockmelonqa.common';
    import { getContext, onDestroy, onMount } from 'svelte';

    const uiContext = getContext(uiContextKey) as IUiContext;
    let recentProjects: IRecentFile[] = [];

    onMount(async () => {
        const data = await application.getUserSettings();
        recentProjects = sliceRecentProjects(data.recentFiles);
    });

    onDestroy(() => {});

    const sliceRecentProjects = (projects: IRecentFile[]): IRecentFile[] => {
        // show top-5 latest only
        return projects.slice(0, 5);
    };

    const { showNewProjectDialog, loadProject, quit } = getContext(appActionContextKey) as IAppActionContext;

    const handleOpenProjectClick = () => {
        application.openProject();
    };

    const handleExitClick = () => {
        quit();
    };

    const selectRecentProject = async (recentFile: IRecentFile) => {
        let fileContent = await fileSystem.readFile(recentFile.filePath);
        let errorMessage = '';

        if (fileContent) {
            try {
                const { parentPath, name } = extractPath(recentFile.filePath, uiContext.pathSeparator);
                let projectFile: IRmProjFile = {
                    content: JSON.parse(fileContent) as IRmProj,
                    fileName: name,
                    folderPath: parentPath,
                };
                await loadProject(projectFile);
                return; // exit as success
            } catch (error) {
                errorMessage = 'Invalid file';
            }
        } else {
            errorMessage = 'Cannot read project file';
        }

        // cannot load project file, let's delete this one
        Notify.error(errorMessage);
        recentProjects = sliceRecentProjects(await removeRecentProjects(recentFile.filePath));
    };
</script>

<svelte:head>
    <title>{uiContext.str(stringResKeys.application.name)}</title>
    <meta name="description" content="Rockmelon QA: New revolution for software automation testing" />
</svelte:head>

<div class="flex flex-col items-center justify-center h-full p-8">
    <div class="flex flex-col items-center justify-center gap-y-8">
        <img width="384px" src="../rockmelon-qa-logo.svg" alt="Rockmelon QA" />

        <div class="flex flex-row gap-y-8 gap-x-24 mt-8">
            <div>
                <div class="flex flex-col gap-y-6">
                    <div class="text-xl font-semibold">{uiContext.str(stringResKeys.general.start)}</div>
                    <a href={'#'} on:click={showNewProjectDialog}>
                        <div class="flex items-center gap-x-2 whitespace-nowrap">
                            <AddCircleIcon class="h-5 w-5" />
                            <span>{uiContext.str(stringResKeys.project.newProject)}</span>
                        </div>
                    </a>

                    <a href={'#'} on:click={handleOpenProjectClick}>
                        <div class="flex items-center gap-x-2 whitespace-nowrap">
                            <OpenIcon class="h-5 w-5" />
                            <span>{uiContext.str(stringResKeys.project.openProject)}</span>
                        </div>
                    </a>
                    <a href={'#'} on:click={handleExitClick}>
                        <div class="flex items-center gap-x-2">
                            <ExitIcon class="h-5 w-5" />
                            <span>{uiContext.str(stringResKeys.general.exit)}</span>
                        </div>
                    </a>
                </div>
            </div>
            <div>
                <div class="flex flex-col gap-y-6">
                    <div class="text-xl font-semibold">Recent</div>
                    {#each recentProjects as recentProject}
                        <div class="">
                            <a
                                class="truncate"
                                href={'#'}
                                on:click={() => selectRecentProject(recentProject)}
                                title={recentProject.filePath}
                            >
                                {recentProject.projectName}
                            </a>
                        </div>
                    {/each}
                    {#if !recentProjects.length}
                        <span>{uiContext.str(stringResKeys.general.none)}</span>
                    {/if}
                </div>
            </div>
        </div>
    </div>

    <div class="footer mt-8">
        <p>&copy <a href="https://rockmelon.qa/">Rockmelon QA</a> 2023</p>
    </div>
</div>

<style>
    a {
        cursor: pointer;
        color: var(--color-brand);
    }

    .footer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 40px;
    }

    @media (min-width: 480px) {
        .footer {
            padding: 40px 0;
        }
    }
</style>
