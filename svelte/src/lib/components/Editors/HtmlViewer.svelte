<script lang="ts">
    import { appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import { fileSystem } from "$lib/ipc";
    import type monaco from "monaco-editor";
    import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
    import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
    import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
    import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
    import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
    import { StandardOutputFile } from "rockmelonqa.common/file-defs";
    import { createEventDispatcher, getContext, onMount } from "svelte";
    import { appActionContextKey, type IAppActionContext } from "../Application";
    import { combinePath } from "../FileExplorer/Node";

    const uiContext = getContext(uiContextKey) as IUiContext;

    export let folderPath: string;
    export let fileName: string;
    $: filePath = combinePath([folderPath, fileName], uiContext.pathSeparator);

    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;

    const dispatch = createEventDispatcher();
    let frameEl: HTMLDivElement;
    onMount(async () => {
        const fileContent = (await fileSystem.readFile(filePath)) ?? "";
        frameEl.src = "data:text/html;charset=utf-8," + escape(fileContent);
    });
</script>

<iframe class="w-full h-full border-0" bind:this={frameEl} src="javascript:void(0);" />
