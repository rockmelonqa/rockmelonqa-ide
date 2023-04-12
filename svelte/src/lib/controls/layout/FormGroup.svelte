<script lang="ts">
	//***************************************
	// Props
	//***************************************
	let cssClass = '';
	export { cssClass as class };

	export let columns: number;
	let columnCssClass = `grid-cols-${columns}`;
</script>

<div class="grid gap-x-12 mb-8 {cssClass} {columnCssClass}">
	<slot />
</div>
