import type { ICultureStringRes, IFormStringRes } from '$lib/context/UiStringResKeys';

export interface IStringRes {
    aboutDialog: IAboutDialogStringRes;
    actionType: IActionTypeStringRes;
    application: IApplicationStringRes;
    codeGenerationDialog: ICodeGenerationDialogStringRes;
    deleteTestCaseDialog: IDeleteTestCaseDialogStringRes;
    culture: ICultureStringRes;
    form: IFormStringRes;
    general: IGeneralStringRes;
    locatorType: ILocatorTypeStringRes;
    pageDefinitionEditor: IPageDefinitionEditorStringRes;
    project: IProjectStringRes;
    runTestDialog: IRunTestDialogStringRes;
    testCaseEditor: ITestCaseEditorStringRes;
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
    selectOption: string;
    verify: string;
    verifyAttribute: string;
    verifyHasText: string;
    verifyHasValue: string;
    verifyIsHidden: string;
    verifyIsVisible: string;
    verifyTitle: string;
    verifyTitleContain: string;
    verifyUrl: string;
}

export interface IApplicationStringRes {
    name: string;
}

export interface IDeleteTestCaseDialogStringRes {
    deleteTestCase: string;
    relatedSuitesMessage: string;
}

export interface ICodeGenerationDialogStringRes {
    buildMsg: string;
    checkPrerequisites: string;
    cleanFolderMsg: string;
    dialogMsg: string;
    dialogTitle: string;
    errorMsg: string;
    finishedMsg: string;
    generateCodeMsg: string;
    installDependenciesMsg: string;
    logFile: string;
    parseDataMsg: string;
    validateInputMsg: string;
}

export interface IGeneralStringRes {
    add: string;
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
    relative: string;
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
