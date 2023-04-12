<script lang="ts">
    import Node from './Node.svelte';
    import type { NodeInfo } from './NodeInfo';

    export let nodes: NodeInfo[] = [];
</script>

{#each nodes as node}
    <Node {node} />
{/each}
