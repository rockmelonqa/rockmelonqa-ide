<script lang="ts">
    /**
     * Test Explorer Context including test suites, test cases
     *
     * USAGE
     *    create the context.
     *
     *       const context = createTestExplorerContext();
     *
     *    Use the <TestExplorerContext> component to store the data in the svelte context
     *
     *       <TestExplorerContext {context}>
     *          <slot>
     *       </TestExplorerContext>
     */

    import { setContext } from 'svelte';
    import { testExplorerContextKey, type ITestExplorerContext } from './TestExplorerContext';

    //*************************************
    // Props
    //*************************************
    export let testExplorerContext: ITestExplorerContext;

    //*****************************************
    // Init
    //*****************************************
    setContext(testExplorerContextKey, testExplorerContext);
</script>

<slot />
