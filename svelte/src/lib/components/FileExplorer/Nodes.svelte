<script lang="ts">
    import type { Node as NodeInfo } from './Node';
    import Node from './Node.svelte';

    export let nodes: NodeInfo[] = [];
</script>

{#each nodes as node}
    <Node {node} />
{/each}
