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

    let videoEl: HTMLImageElement;
    onMount(async () => {
        const fileContentBase64 = (await fileSystem.readFileBase64(filePath)) ?? "";
        videoEl.src = "data:image/png;base64," + fileContentBase64;

        const viewer = new Viewer(videoEl, {
            inline: true,
            toolbar: false,
            navbar: false,
            backdrop: "static",
            className: "rm-photo-viewer",
        });
    });
</script>

<div class="h-full flex items-center bg-gray-300">
    <media-controller class="w-full">
        <video slot="media" src={filePath}>
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
