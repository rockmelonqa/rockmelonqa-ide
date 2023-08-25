<script lang="ts">
    import "viewerjs/dist/viewer.css";
    import Viewer from "viewerjs";
    import { appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import { fileSystem } from "$lib/ipc";
    import { getContext, onMount } from "svelte";
    import { combinePath } from "../FileExplorer/Node";

    const uiContext = getContext(uiContextKey) as IUiContext;

    export let folderPath: string;
    export let fileName: string;
    $: filePath = combinePath([folderPath, fileName], uiContext.pathSeparator);

    let videoEl: HTMLVideoElement;
    onMount(async () => {
        let handledPath = "rm-file://" + filePath;
        videoEl.src = handledPath;

        const viewer = new Viewer(videoEl, {
            inline: true,
            toolbar: false,
            navbar: false,
            backdrop: "static",
            className: "rm-photo-viewer",
        });
    });
</script>

<div class="flex-1 h-full flex items-center bg-gray-300">
    <media-controller class="w-full">
        <video bind:this={videoEl} slot="media" src="javascript:void(0)">
            <track kind="captions" />
        </video>
        <media-control-bar>
            <media-play-button />
            <media-time-display showduration />
            <media-mute-button />
            <media-time-range />
            <media-fullscreen-button />
        </media-control-bar>
    </media-controller>
</div>

<style>
</style>
