<script lang="ts">
    import { goto } from "$app/navigation";
    import { AlertLevel } from "$lib/components/Alert";
    import Alert from "$lib/components/Alert.svelte";
    import FolderPicker from "$lib/components/FolderPicker.svelte";
    import PrimaryButton from "$lib/components/PrimaryButton.svelte";
    import Spinner from "$lib/components/Spinner.svelte";
    import StandardButton from "$lib/components/StandardButton.svelte";
    import { AppActionType, appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import type { IDropdownOption } from "$lib/controls/DropdownField";
    import FormGroup from "$lib/controls/layout/FormGroup.svelte";
    import FormGroupColumn from "$lib/controls/layout/FormGroupColumn.svelte";
    import DropdownField from "$lib/form-controls/DropdownField.svelte";
    import Form from "$lib/form-controls/Form.svelte";
    import NumberField from "$lib/form-controls/NumberField.svelte";
    import TextField from "$lib/form-controls/TextField.svelte";
    import { FieldDataType } from "$lib/form/FieldDef";
    import { createFormContext } from "$lib/form/FormContext";
    import { FormDataActionType } from "$lib/form/FormData";
    import type { IFormDef } from "$lib/form/FormDef";
    import { FormModeActionType, FormModeState } from "$lib/form/FormMode";
    import { FormSerializer } from "$lib/form/FormSerializer";
    import { application } from "$lib/ipc";
    import {
        automationFrameworkOptions,
        indentOptions,
        lanugageOptions,
        testFrameworkOptions,
    } from "$lib/utils/dropdowns";
    import { NavRoute } from "$lib/utils/NavRoute";
    import { ProjectNameRegex } from "$lib/utils/Regex";
    import { registerRecentProject } from "$lib/utils/userSettings";
    import type { IIpcResponse, IRmProjFile, IShowHideMenuRequest } from "rockmelonqa.common";
    import { AutomationFramework, Indent, Language, TestFramework } from "rockmelonqa.common";
    import { getContext } from "svelte";

    export let showDialog: boolean = false;

    const uiContext = getContext(uiContextKey) as IUiContext;
    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;

    const formDef: IFormDef = {
        fields: {
            fileVersion: {
                dataType: FieldDataType.Integer,
                dataPath: "content.fileVersion",
                initialValue: 1,
            },
            name: {
                dataType: FieldDataType.Text,
                dataPath: "content.name",
                isRequired: true,
                maxLength: 50,
                pattern: ProjectNameRegex,
                patternErrorMessage: uiContext.str(stringResKeys.project.nameRegexErrorMessage),
            },
            description: {
                dataType: FieldDataType.Text,
                dataPath: "content.description",
                maxLength: 10000,
            },
            automationFramework: {
                dataType: FieldDataType.Dropdown,
                dataPath: "content.automationFramework",
                isRequired: true,
                initialValue: AutomationFramework.Playwright,
            },
            language: {
                dataType: FieldDataType.Dropdown,
                dataPath: "content.language",
                isRequired: true,
                initialValue: Language.CSharp,
            },
            testFramework: {
                dataType: FieldDataType.Dropdown,
                dataPath: "content.testFramework",
                initialValue: TestFramework.MSTest,
                isRequired: (values) => values.language !== Language.Typescript,
            },
            rootNamespace: {
                dataType: FieldDataType.Text,
                dataPath: "content.rootNamespace",
                maxLength: 100,
            },
            indent: {
                dataType: FieldDataType.Dropdown,
                dataPath: "content.indent",
                isRequired: true,
                initialValue: Indent.Spaces,
            },
            indentSize: {
                dataType: FieldDataType.Integer,
                dataPath: "content.indentSize",
                isRequired: true,
                min: 1,
                max: 8,
                initialValue: 4,
            },
            folder: {
                dataType: FieldDataType.Text,
                dataPath: "folderPath",
                isRequired: true,
            },
        },
    };

    let formContext = createFormContext("project", formDef, uiContext, FormModeState.Add);
    let {
        mode: formMode,
        modeDispatch: formModeDispatch,
        data: formData,
        dataDispatch: formDataDispatch,
    } = formContext;

    let alertLevel: AlertLevel = AlertLevel.None;
    let alertMessage = "";

    let showAdvancedOptions: boolean = false;

    // all options by default
    let languageDropdownOptions: IDropdownOption[] = lanugageOptions;
    let testFrameworkDropdownOptions: IDropdownOption[] = testFrameworkOptions;

    const toggleAdvancedOptions = () => {
        showAdvancedOptions = !showAdvancedOptions;
    };

    const handleAutomationFrameworkChange = (value: any) => {
        switch (value) {
            case AutomationFramework.Selenium.toString():
                languageDropdownOptions = [{ key: Language.Java, text: Language.Java.toString() }];
                break;
            default:
                languageDropdownOptions = lanugageOptions;
                break;
        }

        if (!languageDropdownOptions.some((item) => item.key == $formData.values.language)) {
            formDataDispatch({
                type: FormDataActionType.SetValues,
                newValues: { ...$formData.values, language: "" },
            });
            handleLanguageChange("");
        }
    };

    const handleLanguageChange = (value: any) => {
        switch (value) {
            case Language.CSharp:
                testFrameworkDropdownOptions = [
                    { key: TestFramework.MSTest, text: TestFramework.MSTest.toString() },
                    { key: TestFramework.NUnit, text: TestFramework.NUnit.toString() },
                    { key: TestFramework.xUnit, text: TestFramework.xUnit.toString() },
                ];
                break;
            case Language.Java:
                testFrameworkDropdownOptions = [{ key: TestFramework.JUnit, text: TestFramework.JUnit.toString() }];
                break;
            case Language.Typescript:
                testFrameworkDropdownOptions = [];
                break;
            default:
                testFrameworkDropdownOptions = testFrameworkOptions;
                break;
        }

        if (!testFrameworkDropdownOptions.some((item) => item.key == $formData.values.testFramework)) {
            formDataDispatch({
                type: FormDataActionType.SetValues,
                newValues: { ...$formData.values, testFramework: "" },
            });
        }
    };

    const handleSaveClick = async () => {
        if ($formData.isValid) {
            formModeDispatch({
                type: FormModeActionType.Process,
                description: uiContext.str(stringResKeys.project.creatingNewProject),
            });

            const serializer = new FormSerializer(uiContext);
            const model = serializer.serialize($formData.values, formDef.fields) as IRmProjFile;
            if (!model.fileName) {
                model.fileName = `${model.content.name}.rmproj`;
            }

            const response: IIpcResponse = await application.createNewProject(model);
            if (!response.isSuccess) {
                switch (response.errorCode!) {
                    case "FolderNotEmpty":
                        alertError(AlertLevel.Error, "Selected folder is not empty.");
                        break;
                    case "InvalidFramework":
                        alertError(AlertLevel.Error, "Framework and language selection are invalid.");
                        break;
                }
                formModeDispatch({ type: FormModeActionType.Add });
                return;
            }

            // RmProject is created successfully.
            appStateDispatch({ type: AppActionType.LoadProject, projectFile: model });

            application.showHideMenuItem({
                menuItemPath: "fileMenu/Close Project",
                visible: true,
            } as IShowHideMenuRequest);
            await registerRecentProject(
                model.content.name,
                `${model.folderPath}${uiContext.pathSeparator}${model.fileName}`
            );

            showDialog = false;
            goto(NavRoute.HOME);
        } else {
            formDataDispatch({ type: FormDataActionType.ShowAllErrors });
        }
    };

    const handleCancelClick = () => {
        showDialog = false;
    };

    const alertError = (level: AlertLevel, error: string) => {
        alertLevel = level;
        alertMessage = error;
    };
</script>

{#if showDialog}
    <div class="relative" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-400 bg-opacity-75 transition-opacity" />
        <div class="fixed inset-0 overflow-y-auto">
            <div class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                <div
                    class="modal-panel relative bg-white rounded-lg p-4 sm:p-6
                    text-left shadow-xl transform transition-all max-w-4xl w-full"
                >
                    <Form {formContext} on:submit={handleSaveClick}>
                        <div class="modal-title text-xl leading-6 font-bold mb-8">
                            {uiContext.str(stringResKeys.project.newProject)}
                        </div>
                        {#if $formMode.isProcessing()}
                            <div class="modal-content">
                                <Spinner class="py-4" textRight={$formMode.description} />
                            </div>
                        {/if}
                        <div class="modal-content">
                            <Alert bind:alertLevel class="mb-8">
                                <svelte:fragment slot="title">{alertMessage}</svelte:fragment>
                            </Alert>

                            <FormGroup columns={2} class="mb-2">
                                <FormGroupColumn>
                                    <TextField name="name" />
                                </FormGroupColumn>
                                <FormGroupColumn>
                                    <FolderPicker name="folder" />
                                </FormGroupColumn>
                            </FormGroup>
                            <FormGroup columns={1} class="mb-2">
                                <FormGroupColumn>
                                    <TextField name="description" />
                                </FormGroupColumn>
                            </FormGroup>
                            {#if showAdvancedOptions}
                                <FormGroup columns={2}>
                                    <FormGroupColumn>
                                        <DropdownField
                                            name="automationFramework"
                                            options={automationFrameworkOptions}
                                            on:change={(e) => handleAutomationFrameworkChange(e.detail.value)}
                                        />
                                        <DropdownField
                                            name="testFramework"
                                            options={testFrameworkDropdownOptions}
                                            disabled={$formData.values.language === Language.Typescript}
                                        />
                                        <DropdownField name="indent" options={indentOptions} />
                                    </FormGroupColumn>
                                    <FormGroupColumn>
                                        <DropdownField
                                            name="language"
                                            options={languageDropdownOptions}
                                            on:change={(e) => handleLanguageChange(e.detail.value)}
                                        />
                                        <TextField name="rootNamespace" />
                                        <NumberField name="indentSize" />
                                    </FormGroupColumn>
                                </FormGroup>
                            {/if}
                        </div>
                        <div class="modal-buttons flex justify-start items-end gap-x-4">
                            <div class="my-4">
                                <a href={"#"} on:click={toggleAdvancedOptions} class="underline cursor-pointer">
                                    <span>{showAdvancedOptions ? "Hide " : "Show "} Advanced Options</span>
                                </a>
                            </div>
                            <div class="ml-auto">
                                <PrimaryButton
                                    label={stringResKeys.general.create}
                                    class="mr-4"
                                    type="submit"
                                    disabled={$formMode.isProcessing()}
                                />
                                <StandardButton
                                    label={uiContext.str(stringResKeys.general.cancel)}
                                    on:click={handleCancelClick}
                                    disabled={$formMode.isProcessing()}
                                />
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-title,
    a {
        color: var(--color-brand);
    }
</style>
