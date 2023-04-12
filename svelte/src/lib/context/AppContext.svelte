<script lang="ts">
    /**
     * App Context including application state
     *
     * USAGE
     *    In a top level __layout.svelte, create the context.
     *
     *       const appContext = createAppContext();
     *
     *    Use the <AppContext> component to store the application state in the svelte context
     *
     *       <AppContext {appContext}>
     *          <slot>
     *       </AppContext>
     */

    import { setContext } from 'svelte';
    import { appContextKey, type IAppContext } from './AppContext';

    //*************************************
    // Props
    //*************************************
    export let appContext: IAppContext;

    //*****************************************
    // Init
    //*****************************************
    setContext(appContextKey, appContext);
</script>

<slot />
