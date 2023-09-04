import type { ICultureStringRes, IFormStringRes } from "$lib/context/UiStringResKeys";

export interface IStringRes {
    aboutDialog: IAboutDialogStringRes;
    actionType: IActionTypeStringRes;
    application: IApplicationStringRes;
    codeGenerationDialog: ICodeGenerationDialogStringRes;
    deletePageWarningDialog: IDeletePageWarningDialogStringRes;
    deleteTestCaseConfirmationDialog: IDeleteTestCaseConfirmationDialogStringRes;
    deleteTestRoutineWarningDialog: IDeleteTestRoutineWarningDialogStringRes;
    culture: ICultureStringRes;
    environmentEditor: IEnvironementEditorStringRes;
    fileExplorer: IFileExplorerStringRes;
    form: IFormStringRes;
    general: IGeneralStringRes;
    locatorType: ILocatorTypeStringRes;
    pageDefinitionEditor: IPageDefinitionEditorStringRes;
    project: IProjectStringRes;
    routinePickerDialog: IRoutinePickerDialogStringRes;
    runTestDialog: IRunTestDialogStringRes;
    testCaseEditor: ITestCaseEditorStringRes;
    testRoutineEditor: ITestRoutineStringRes;
    testSuiteEditor: ITestSuiteEditorStringRes;
}

export interface IAboutDialogStringRes {
    checkingForUpdateMsg: string;
    checkUpdateBtn: string;
    downloadingMsg: string;
    errorOnUpdateMsg: string;
    startDownloadUpdateMsg: string;
    updateAvailableMsg: string;
    updateBtn: string;
    updateDownloadedMsg: string;
    updateNotAvailableMsg: string;
    version: string;
}

export interface IActionTypeStringRes {
    clear: string;
    click: string;
    clickPopup: string;
    closePopup: string;
    delay: string;
    goToUrl: string;
    input: string;
    inputByCode: string;
    run: string;
    runCode: string;
    runTestRoutine: string;
    selectOption: string;
    verifyAttribute: string;
    verifyHasText: string;
    verifyIsEditable: string;
    verifyIsReadOnly: string;
    verifyHasValue: string;
    verifyIsHidden: string;
    verifyIsVisible: string;
    verifyTitle: string;
    verifyTitleContains: string;
    verifyUrl: string;
}

export interface IApplicationStringRes {
    name: string;
}

export interface ICodeGenerationDialogStringRes {
    buildMsg: string;
    checkPrerequisites: string;
    cleanFolderMsg: string;
    copyCustomCodeMsg: string;
    dialogMsg: string;
    dialogTitle: string;
    duplicateFileNameMessage: string;
    errorMsg: string;
    finishedMsg: string;
    generateCodeMsg: string;
    installDependenciesMsg: string;
    logFile: string;
    parseDataMsg: string;
    validateInputMsg: string;
}

export interface IDeletePageWarningDialogStringRes {
    dialogContent: string;
    dialogTitle: string;
}

export interface IDeleteTestCaseConfirmationDialogStringRes {
    dialogContent: string;
    dialogTitle: string;
}

export interface IDeleteTestRoutineWarningDialogStringRes {
    dialogContent: string;
    dialogTitle: string;
}

export interface IEnvironementEditorStringRes {
    actions: string;
    deleteRowConfirmation: string;
    invalidNameMessage: string;
    name: string;
    value: string;
}

export interface IFileExplorerStringRes {
    newEnvFile: string;
    newFile: string;
    newFolder: string;
    newPage: string;
    newTestCase: string;
    newTestRoutine: string;
    newTestSuite: string;
}

export interface IGeneralStringRes {
    add: string;
    addComment: string;
    and: string;
    cancel: string;
    close: string;
    confirmation: string;
    create: string;
    delete: string;
    dismiss: string;
    done: string;
    edit: string;
    error: string;
    exit: string;
    info: string;
    moveDown: string;
    moveUp: string;
    next: string;
    no: string;
    none: string;
    noRecordsFound: string;
    ok: string;
    previous: string;
    save: string;
    searching: string;
    showMore: string;
    start: string;
    success: string;
    warning: string;
    yes: string;
}

export interface ILocatorTypeStringRes {
    attribute: string;
    code: string;
    css: string;
    id: string;
    iFrame: string;
    iFrameId: string;
    iFrameName: string;
    label: string;
    name: string;
    placeholder: string;
    relativeCss: string;
    relativeXpath: string;
    testId: string;
    text: string;
    title: string;
    xpath: string;
}

export interface IPageDefinitionEditorStringRes {
    actions: string;
    addComment: string;
    addElement: string;
    comment: string;
    deleteRowConfirmation: string;
    description: string;
    elementName: string;
    elementNameInvalidMessage: string;
    findBy: string;
    locator: string;
    name: string;
}

export interface IProjectStringRes {
    automationFramework: string;
    creatingNewProject: string;
    description: string;
    folder: string;
    indent: string;
    indentSize: string;
    language: string;
    name: string;
    nameRegexErrorMessage: string;
    newProject: string;
    openProject: string;
    output: string;
    rootNamespace: string;
    testFramework: string;
    testIdAttributeName: string;
}

export interface IRoutinePickerDialogStringRes {
    availableOptions: string;
    dataset: string;
    dialogTitle: string;
    mode: string;
    routine: string;
    selectAll: string;
    selectedOptions: string;
    unselectAll: string;
}

export interface IRunTestDialogStringRes {
    dialogTitle: string;
    errorMsg: string;
    finishedMsg: string;
    headless: string;
    runningTestMsg: string;
    runTestBtn: string;
    selectAllTests: string;
    selectBrowser: string;
    selectEnvironmentFile: string;
    testAvailableMsg: string;
    testNotAvailableMsg: string;
    testOutput: string;
}

export interface ITestCaseEditorStringRes {
    action: string;
    actions: string;
    addComment: string;
    addStep: string;
    comment: string;
    data: string;
    deleteRowConfirmation: string;
    description: string;
    element: string;
    name: string;
    page: string;
    routine: string;
}

export interface ITestRoutineStringRes {
    actions: string;
    action: string;
    addComment: string;
    comment: string;
    dataSet: string;
    deleteRowConfirmation: string;
    description: string;
    element: string;
    name: string;
    page: string;
    routine: string;
    steps: string;
}

export interface ITestSuiteEditorStringRes {
    action: string;
    actions: string;
    addTestCase: string;
    deleteRowConfirmation: string;
    description: string;
    name: string;
    testCase: string;
}
