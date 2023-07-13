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

    export let contentIndex: number;

    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;

    let monacoEditor: monaco.editor.IStandaloneCodeEditor;
    const { registerOnSaveHandler, unregisterOnSaveHandler } = getContext(appActionContextKey) as IAppActionContext;
    const dispatch = createEventDispatcher();

    const toLanguage = () => {
        if (fileName === StandardOutputFile.MetaData) {
            return "json";
        } else if (fileName === StandardOutputFile.RunSettings) {
            return "xml";
        }

        const lastIndex = fileName.lastIndexOf(".");
        const ext = lastIndex < 0 ? "" : fileName.substring(lastIndex).toLowerCase();
        switch (ext) {
            case ".cs":
                return "csharp";
            case ".json":
                return "json";
            case ".ts":
                return "typescript";
            case ".xml":
            case ".csproj":
                return "xml";
            default:
                return "";
        }
    };

    let divEl: HTMLDivElement;
    let Monaco;
    // https://github.com/microsoft/monaco-editor/blob/main/docs/integrate-esm.md
    // https://github.com/vitejs/vite/discussions/1791#discussioncomment-321046
    onMount(async () => {
        // @ts-ignore
        self.MonacoEnvironment = {
            getWorker(_, label) {
                if (label === "json") {
                    return new jsonWorker();
                }
                if (label === "css" || label === "scss" || label === "less") {
                    return new cssWorker();
                }
                if (label === "html" || label === "handlebars" || label === "razor" || label === "xml") {
                    return new htmlWorker();
                }
                if (label === "typescript" || label === "javascript") {
                    return new tsWorker();
                }
                return new editorWorker();
            },
        };

        const fileContent = (await fileSystem.readFile(filePath)) ?? "";
        Monaco = await import("monaco-editor");
        monacoEditor = Monaco.editor.create(divEl, {
            value: fileContent,
            language: toLanguage(),
            automaticLayout: true,
        });

        monacoEditor.onDidChangeModelContent((e: monaco.editor.IModelContentChangedEvent) => {
            dispatch("change");
        });

        registerOnSaveHandler(contentIndex, doSave);

        return () => {
            monacoEditor.dispose();
            unregisterOnSaveHandler(contentIndex);
        };
    });

    const doSave = async (): Promise<boolean> => {
        const newContent = monacoEditor.getModel()!.getValue();
        await fileSystem.writeFile(filePath, newContent);

        dispatch("saved");
        return true;
    };
</script>

<div bind:this={divEl} class="h-full font-mono font-consolas" />

<style>
    .font-consolas {
        font-family: "consolas";
    }
</style>
