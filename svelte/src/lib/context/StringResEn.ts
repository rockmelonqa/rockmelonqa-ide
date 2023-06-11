import { StandardFolder } from "rockmelonqa.common";
import type { IStringRes } from "./IStringRes";

export const stringResEn: IStringRes = {
    aboutDialog: {
        checkingForUpdateMsg: "Checking for update ...",
        checkUpdateBtn: "Check update",
        downloadingMsg: "Downloading {{percent}}% of {{totalSize}} MB ...",
        errorOnUpdateMsg: "Error on auto update. {{errorMessage}}",
        startDownloadUpdateMsg: "Start download update ...",
        updateAvailableMsg: "There is new version: {{version}}. Do you want to update?",
        updateBtn: "Update",
        updateDownloadedMsg: "Prepare installation ...",
        updateNotAvailableMsg: "There is not any update.",
        version: "Version",
    },
    actionType: {
        clear: "Clear",
        click: "Click",
        clickPopup: "Click Popup",
        closePopup: "Close Popup",
        delay: "Delay",
        goToUrl: "Go To Url",
        input: "Input",
        inputByCode: "Input By Code",
        run: "Run",
        runCode: "Run Code",
        selectOption: "Select Option",
        verifyAttribute: "Verify Attribute",
        verifyHasText: "Verify Has Text",
        verifyHasValue: "Verify Has Value",
        verifyIsHidden: "Verify Is Hidden",
        verifyIsEditable: "Verify Is Editable",
        verifyIsReadOnly: "Verify Is ReadOnly",
        verifyIsVisible: "Verify Is Visible",
        verifyTitle: "Verify Title",
        verifyTitleContains: "Verify Title Contains",
        verifyUrl: "Verify Url",
    },
    application: {
        name: "Rockmelon QA",
    },
    codeGenerationDialog: {
        buildMsg: "Compile",
        checkPrerequisites: "Check prerequisites",
        cleanFolderMsg: "Cleaning folder",
        copyCustomCodeMsg: "Copy Custom Code",
        dialogMsg: "Do you want to generate automation testing code?",
        dialogTitle: "Code Generation",
        duplicateFileNameMessage:
            "resolve to the same class name. Please change one of the files to make the names unique.",
        errorMsg: "There are errors with following logs.",
        finishedMsg: `Done, please check '${StandardFolder.OutputCode}' folder.`,
        generateCodeMsg: "Generate code",
        installDependenciesMsg: "Install dependencies",
        logFile: "Log File",
        parseDataMsg: "Parse data",
        validateInputMsg: "Validate input",
    },
    culture: {
        currencyCode: "AUD",
        currencyDecimalPlaces: "2",
        currencySymbol: "$",
        dateFormat: "d MMM yyyy",
        dateFormatDatePicker: "d M yyyy",
        dateTimeFormat: "d MMM yyyy hh:mm:ss a",
        decimalPoint: ".",
        floatRegExp: "^[0-9,.-]+",
        integerRegExp: "^[0-9,-]+$",
        locale: "en",
        thousandsDelimeter: ",",
        timeFormat: "hh:mm:ss a",
    },
    deletePageWarningDialog: {
        dialogContent: "This page is being used by following test case(s) and test routine(s).",
        dialogTitle: "Warning",
    },
    deleteTestCaseConfirmationDialog: {
        dialogContent: "This test case is being used by the following test suites. Do you want to remove it?",
        dialogTitle: "Delete test case",
    },
    deleteTestRoutineWarningDialog: {
        dialogContent: "This test routine is being used by following test case(s).",
        dialogTitle: "Warning",
    },
    fileExplorer: {
        newFile: "New File",
        newFolder: "New Folder",
        newPage: "New Page",
        newTestCase: "New Test Case",
        newTestRoutine: "New Test Routine",
        newTestSuite: "New Test Suite",
    },
    form: {
        invalidDateError: "Invalid date",
        invalidDateTimeError: "Invalid date and time",
        invalidFloatError: "Invalid number",
        invalidIntegerError: "Invalid integer",
        isRequiredError: "Required",
        maxDateError: "Maximum date is {maxDate}",
        maxFloatError: "Maximum value is {max}",
        maxIntegerError: "Maximum value is {max}",
        maxLengthError: "Maximum length is {maxLength}",
        minDateError: "Minimum date is {minDate}",
        minFloatError: "Minimum value is {min}",
        minIntegerError: "Minimum value is {min}",
        minLengthError: "Minimum length is {minLength}",
        noDropdownLabel: "No",
        patternError: "Invalid format",
        yesDropdownLabel: "Yes",
    },
    general: {
        add: "Add",
        and: "and",
        cancel: "Cancel",
        close: "Close",
        confirmation: "Confirmation",
        create: "Create",
        delete: "Delete",
        dismiss: "Dismiss",
        done: "Done",
        edit: "Edit",
        error: "Error",
        exit: "Exit",
        info: "Info",
        moveDown: "Move Down",
        moveUp: "Move Up",
        next: "Next",
        no: "No",
        none: "None",
        noRecordsFound: "No records found",
        ok: "Ok",
        previous: "Previous",
        save: "Save",
        searching: "Search",
        showMore: "Show More",
        start: "Start",
        success: "Success",
        warning: "Warning",
        yes: "Yes",
    },
    locatorType: {
        attribute: "Attribute",
        code: "Code",
        css: "Css",
        id: "Id",
        iFrame: "IFrame",
        iFrameId: "IFrame Id",
        iFrameName: "IFrame Name",
        label: "Label",
        name: "Name",
        placeholder: "Placeholder",
        relativeCss: "Relative CSS",
        relativeXpath: "Relative Xpath",
        testId: "Test Id",
        text: "Text",
        title: "Title",
        xpath: "Xpath",
    },
    pageDefinitionEditor: {
        actions: "Actions",
        addComment: "Add Comment",
        addElement: "Add Element",
        comment: "Comment",
        deleteRowConfirmation: "Are you sure to delete this row?",
        description: "Description",
        elementName: "Element Name",
        elementNameInvalidMessage: "Only accepts a-z, A-Z, 0-9 characters",
        findBy: "Find By",
        locator: "Locator",
        name: "Name",
    },
    project: {
        automationFramework: "Automation Framework",
        creatingNewProject: "Creating new project",
        description: "Description",
        folder: "Folder",
        indent: "Indent",
        indentSize: "Indent Size",
        language: "Language",
        name: "Name",
        nameRegexErrorMessage: "Only accepts a-z, A-Z, 0-9, space, underscore, and dash characters.",
        newProject: "New Project",
        openProject: "Open Project",
        output: "Output",
        rootNamespace: "Root Namespace",
        testIdAttributeName: "Test Id Attribute Name",
        testFramework: "Test Framework",
    },
    runTestDialog: {
        dialogTitle: "Run Tests",
        errorMsg: `There are errors with following logs.`,
        finishedMsg: `Done, please get test output at '${StandardFolder.TestRuns}' folder.`,
        headless: "Headless",
        selectAllTests: "Select all",
        selectBrowser: "Select browser",
        runningTestMsg: "Running test cases",
        runTestBtn: "Run",
        testAvailableMsg: "Please select tests to run",
        testNotAvailableMsg: "Not found test cases. Please check your configuration or generate code.",
        testOutput: "Test Output",
    },
    testCaseEditor: {
        action: "Action",
        actions: "Actions",
        addComment: "Add Comment",
        addRoutine: "Add Routine",
        addStep: "Add Step",
        comment: "Comment",
        data: "Data",
        deleteRowConfirmation: "Are you sure to delete this row?",
        description: "Description",
        element: "Element",
        name: "Name",
        page: "Page",
        routine: "Routine",
    },
    testRoutineEditor: {
        actions: "Actions",
        action: "Action",
        addComment: "Add Comment",
        comment: "Comment",
        dataSet: "Data Set",
        deleteRowConfirmation: "Are you sure to delete this row?",
        description: "Description",
        element: "Element",
        name: "Name",
        page: "Page",
        routine: "Routine",
        steps: "Steps",
    },
    testSuiteEditor: {
        action: "Action",
        actions: "Actions",
        addTestCase: "Add Test Case",
        deleteRowConfirmation: "Are you sure to delete this row?",
        description: "Description",
        name: "Name",
        testCase: "Test Case",
    },
};
