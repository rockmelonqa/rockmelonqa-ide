<script lang="ts">
    import { formContextKey, type IFormContext } from '$lib/form/FormContext';
    /**
     * Context for forms including:
     *  - mode = Form mode
     *  - data = Form data
     *  - formDef = Form definition
     *  - uiContext = Locale context
     *
     * USAGE
     *    On your form, create the fomrm context.
     *
     *       const uiContext = getContext(uiContextKey) as IUiContext;
     *       const formContext = createFormContext('changePassword', formDef, uiContext);
     *
     *    Use the <Form> component to store the form context in the fields
     *
     *       <Form {formContext}>
     *       </Form>
     */

    import { createEventDispatcher, setContext } from 'svelte';

    //*************************************
    // Props
    //*************************************
    export let formContext: IFormContext;

    //*************************************
    // Init
    //*************************************
    const dispatch = createEventDispatcher();

    setContext(formContextKey, formContext);
    const formId = `${formContext.formName}_form`;

    const handleSubmit = (event: SubmitEvent) => {
        dispatch('submit', { event });
    };
</script>

<form id={formId} {...$$restProps} on:submit|preventDefault={handleSubmit}>
    <slot />
</form>
