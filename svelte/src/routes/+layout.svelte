<script lang="ts">
    import "media-chrome";
    import Application from "$lib/components/Application.svelte";
    import { Notify } from "$lib/components/Notify";
    import { createAppContext } from "$lib/context/AppContext";
    import AppContext from "$lib/context/AppContext.svelte";
    import { stringResEn } from "$lib/context/StringResEn";
    import { createUiContext } from "$lib/context/UiContext";
    import UiContext from "$lib/context/UiContext.svelte";
    import { uiThemeRes } from "$lib/context/UiThemeRes";
    import { SvelteToast } from "@zerodevx/svelte-toast";
    import "../app.css";

    const stringRes = {
        en: stringResEn,
        "en-AU": stringResEn,
    };
    let uiContext = createUiContext(uiThemeRes, stringRes, "en-AU");
    let appContext = createAppContext();
</script>

<AppContext {appContext}>
    <UiContext {uiContext}>
        <Application>
            <slot />
        </Application>
    </UiContext>
</AppContext>

<SvelteToast options={Notify.svelteToastOptions} />
