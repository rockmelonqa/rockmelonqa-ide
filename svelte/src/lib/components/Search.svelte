<script lang="ts">
    import TextField from '$lib/controls/TextField.svelte';

    let searchTerm: string = '';
    let searchResults: string[] | undefined = undefined;

    const onKeyUp = async (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (searchTerm) {
                await doSearch(searchTerm);
            } else {
                searchResults = undefined;
            }
        }
    };

    const doSearch = async (searchTerm: string) => {
        // TODO: perform Search
    };
</script>

<div class="search-container flex flex-col">
    <div class="font-medium uppercase">Search</div>
    <div class="mt-2 mb-4">
        <TextField
            name="search"
            value={searchTerm}
            placeholder="Input your search term"
            on:input={(e) => (searchTerm = e.detail.value)}
            on:keyup={onKeyUp}
        />
    </div>
    {#if searchResults !== undefined}
        {#if searchResults.length}
            <div>Found in {searchResults.length} file{searchResults.length > 1 ? 's' : ''}.</div>
        {:else}
            <div>No results found.</div>
        {/if}
    {/if}
</div>

<style>
    :global(.search-container #search_input) {
        background-color: rgb(245 245 245);
    }
</style>
