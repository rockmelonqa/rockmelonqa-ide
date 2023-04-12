<script lang="ts">
    import { setContext } from 'svelte';
    import { uiContextKey, type IUiContext } from './UiContext';

    //*************************************
    // Props
    //*************************************
    export let uiContext: IUiContext;

    //*****************************************
    // Init
    //*****************************************
    setContext(uiContextKey, uiContext);
</script>

<slot />
