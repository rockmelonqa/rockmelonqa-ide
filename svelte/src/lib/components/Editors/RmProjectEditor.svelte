<script lang="ts">
    import Alert from "$lib/components/Alert.svelte";
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
    import { FieldDataType, type IDictionary } from "$lib/form/FieldDef";
    import { createFormContext } from "$lib/form/FormContext";
    import { FormDataActionType } from "$lib/form/FormData";
    import type { IFormDef } from "$lib/form/FormDef";
    import { FormModeState } from "$lib/form/FormMode";
    import { FormSerializer } from "$lib/form/FormSerializer";
    import { fileSystem } from "$lib/ipc";
    import {
        automationFrameworkOptions,
        indentOptions,
        lanugageOptions,
        testFrameworkOptions,
    } from "$lib/utils/dropdowns";
    import { ProjectNameRegex } from "$lib/utils/Regex";
    import _ from "lodash";
    import { AutomationFramework, Language, TestFramework, type IRmProj, type IRmProjFile } from "rockmelonqa.common";
    import { createEventDispatcher, getContext, onMount } from "svelte";
    import { derived } from "svelte/store";
    import { AlertLevel } from "../Alert";
    import { appActionContextKey, type IAppActionContext } from "../Application";
    import { combinePath } from "../FileExplorer/Node";
    import PrimaryButton from "../PrimaryButton.svelte";

    const uiContext = getContext(uiContextKey) as IUiContext;

    export let folderPath: string;
    export let fileName: string;
    $: filePath = combinePath([folderPath, fileName], uiContext.pathSeparator);

    export let contentIndex: number;

    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;

    const formDef: IFormDef = {
        fields: {
            fileVersion: {
                dataType: FieldDataType.Integer,
                dataPath: "fileVersion",
            },
            name: {
                dataType: FieldDataType.Text,
                dataPath: "name",
                isRequired: true,
                maxLength: 50,
                pattern: ProjectNameRegex,
                patternErrorMessage: uiContext.str(stringResKeys.project.nameRegexErrorMessage),
            },
            description: {
                dataType: FieldDataType.Text,
                dataPath: "description",
                maxLength: 10000,
            },
            automationFramework: {
                dataType: FieldDataType.Dropdown,
                dataPath: "automationFramework",
                isRequired: true,
            },
            language: {
                dataType: FieldDataType.Dropdown,
                dataPath: "language",
                isRequired: true,
            },
            testFramework: {
                dataType: FieldDataType.Dropdown,
                dataPath: "testFramework",
                isRequired: (values) => values.language !== Language.Typescript,
            },
            rootNamespace: {
                dataType: FieldDataType.Text,
                dataPath: "rootNamespace",
                maxLength: 100,
            },
            indent: {
                dataType: FieldDataType.Dropdown,
                dataPath: "indent",
                isRequired: true,
            },
            indentSize: {
                dataType: FieldDataType.Integer,
                dataPath: "indentSize",
                isRequired: true,
                min: 1,
                max: 8,
            },
            testIdAttributeName: {
                dataType: FieldDataType.Text,
                dataPath: "testIdAttributeName",
                isRequired: false,
                initialValue: "",
            },
        },
    };

    let formContext = createFormContext("project", formDef, uiContext, FormModeState.Edit);
    let {
        mode: formMode,
        modeDispatch: formModeDispatch,
        data: formData,
        dataDispatch: formDataDispatch,
    } = formContext;

    let alertLevel: AlertLevel = AlertLevel.None;
    let alertMessage = "";

    // all options by default
    let languageDropdownOptions: IDropdownOption[] = lanugageOptions;
    let testFrameworkDropdownOptions: IDropdownOption[] = testFrameworkOptions;

    const { registerOnSaveHandler, unregisterOnSaveHandler } = getContext(appActionContextKey) as IAppActionContext;
    const dispatch = createEventDispatcher();

    // store form's saved-values, to determine whether form value changed
    let formCommittedValues: IDictionary | undefined;

    onMount(async () => {
        const fileContent = await fileSystem.readFile(filePath);
        let model: IRmProj = JSON.parse(fileContent ?? "{}") as IRmProj;

        const serializer = new FormSerializer(uiContext);
        const fieldValues = serializer.deserialize(model, formDef.fields);
        formDataDispatch({ type: FormDataActionType.Load, newValues: fieldValues });
        formCommittedValues = fieldValues;

        registerOnSaveHandler(contentIndex, doSave);

        return () => {
            unregisterOnSaveHandler(contentIndex);
        };
    });

    const handleSaveClick = async () => {
        await doSave();
    };

    const doSave = async (): Promise<boolean> => {
        if ($formData.isValid) {
            const serializer = new FormSerializer(uiContext);
            const model = serializer.serialize($formData.values, formDef.fields) as IRmProj;

            const filePath = combinePath([folderPath, fileName], uiContext.pathSeparator);
            await fileSystem.writeFile(filePath, JSON.stringify(model, null, 4));

            const projectFile: IRmProjFile = {
                content: model,
                fileName: fileName,
                folderPath: folderPath,
            };
            appStateDispatch({ type: AppActionType.SetProject, projectFile: projectFile });

            formCommittedValues = $formData.values;
            dispatch("saved");

            return true;
        }

        formDataDispatch({ type: FormDataActionType.ShowAllErrors });
        return false;
    };

    const formValueSubscription = derived(formData, ($formData) => $formData.values);
    formValueSubscription.subscribe((values) => {
        let isDirty = formCommittedValues !== undefined && !_.isEqual(formCommittedValues, values);
        dispatch(isDirty ? "change" : "saved");
    });

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
</script>

<div class="rm-project-editor p-8">
    <Form {formContext}>
        <Alert bind:alertLevel class="mb-8">
            <svelte:fragment slot="title">{alertMessage}</svelte:fragment>
        </Alert>

        <FormGroup columns={2}>
            <FormGroupColumn>
                <TextField name="name" />
                <DropdownField
                    name="automationFramework"
                    options={automationFrameworkOptions}
                    on:change={(e) => handleAutomationFrameworkChange(e.detail.value)}
                />
                <DropdownField
                    name="language"
                    options={languageDropdownOptions}
                    on:change={(e) => handleLanguageChange(e.detail.value)}
                />
                <DropdownField
                    name="testFramework"
                    options={testFrameworkDropdownOptions}
                    disabled={$formData.values.language === Language.Typescript}
                />
                <DropdownField name="indent" options={indentOptions} />
                <TextField name="testIdAttributeName" />
            </FormGroupColumn>
            <FormGroupColumn>
                <TextField name="description" />

                <TextField name="rootNamespace" />
                <NumberField name="indentSize" />
            </FormGroupColumn>
        </FormGroup>

        <div class="flex justify-end">
            <PrimaryButton
                label={stringResKeys.general.save}
                on:click={handleSaveClick}
                disabled={$formMode.isProcessing()}
            />
        </div>
    </Form>
</div>
