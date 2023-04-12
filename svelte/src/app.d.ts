/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
	// interface Locals {}
	// interface Platform {}
	// interface Session {}
	// interface Stuff {}
}


// Additional event handlers

// https://stackoverflow.com/a/64131834
// https://github.com/sveltejs/language-tools/blob/master/docs/preprocessors/typescript.md#im-using-an-attributeevent-on-a-dom-element-and-it-throws-a-type-error
declare namespace svelte.JSX {
	interface HTMLAttributes<T> {
		/** Used in OutClick */
		onoutclick?: (param: any) => void,

		/** Used in List Table */
		onshowmore?: (param: any) => void,
	}
}
