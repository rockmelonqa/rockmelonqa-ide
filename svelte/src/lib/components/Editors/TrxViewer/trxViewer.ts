/* eslint-disable @typescript-eslint/no-explicit-any */
// Reference:
// https://github.com/allure-framework/allure-mstest/blob/master/MSTestAllureAdapter/MSTestResult.cs
// https://github.com/allure-framework/allure-mstest/blob/master/MSTestAllureAdapter/TRXParser/TRXParser.cs
// https://github.com/allure-framework/allure-mstest/blob/master/MSTestAllureAdapter.Tests/trx/sample.trx

import type { UiParserFormatter } from '$lib/context/UiParserFormatter';
import { XMLParser } from 'fast-xml-parser';

export interface ITestRun {
    start: Date;
    finish: Date;
    testResults: ITestResult[];
    summary: ITestSummary;
}

export interface ITestResult {
    /** test name */
    name: string;
    /** test suite */
    suite: string;

    outcome: TestOutcome;
    start: Date;
    end: Date;
    duration: number; // in seconds

    errorInfo?: IErrorInfo;
}

export interface IErrorInfo {
    message?: string;
    stackTrace?: string;
}

export interface ITestSummary {
    outcome: TestOutcome;
    total: number;
    executed: number;
    passed: number;
    failed: number;
    error: number;
    timeout: number;
    absorted: number;
    inconclusive: number;
    passedButRunAborted: number;
    notRunnable: number;
    notExecuted: number;
    disconnected: number;
    warning: number;
    completed: number;
    inProgress: number;
    pending: number;
}

export enum TestOutcome {
    Unknown = 'Unknown',
    Passed = 'Passed',
    Failed = 'Failed',
    Error = 'Error',
    Timeout = 'Timeout',
    Aborted = 'Aborted',
    Inconclusive = 'Inconclusive',
    PassedButRunAborted = 'PassedButRunAborted',
    NotRunnable = 'NotRunnable',
    NotExecuted = 'NotExecuted',
    Disconnected = 'Disconnected',
    Warning = 'Warning',
    Completed = 'Completed',
    InProgress = 'InProgress',
    Pending = 'Pending',
}

export const parseTestRun = (trxContent: string): ITestRun => {
    const options = {
        ignoreAttributes: false,
        allowBooleanAttributes: true,
        parseNodeValue: true,
        parseAttributeValue: true,
        trimValues: true,
    };
    const parser = new XMLParser(options);
    const jsonObj = parser.parse(trxContent);
    const jsonTestRun = jsonObj.TestRun;

    const data: ITestRun = {
        start: new Date(Date.parse(jsonTestRun.Times['@_start'])),
        finish: new Date(Date.parse(jsonTestRun.Times['@_finish'])),
        testResults: parseTestResults(jsonTestRun),
        summary: parseSummary(jsonTestRun),
    };

    return data;
};

const parseSummary = (jsonTestRun: any): ITestSummary => {
    const jsonCounter = jsonTestRun.ResultSummary.Counters;
    const summary: ITestSummary = {
        outcome: jsonTestRun.ResultSummary['@_outcome'],
        total: jsonCounter['@_total'],
        executed: jsonCounter['@_executed'],
        passed: jsonCounter['@_passed'],
        failed: jsonCounter['@_failed'],
        error: jsonCounter['@_error'],
        timeout: jsonCounter['@_timeout'],
        absorted: jsonCounter['@_absorted'],
        inconclusive: jsonCounter['@_inconclusive'],
        passedButRunAborted: jsonCounter['@_passedButRunAborted'],
        notRunnable: jsonCounter['@_notRunnable'],
        notExecuted: jsonCounter['@_notExecuted'],
        disconnected: jsonCounter['@_disconnected'],
        warning: jsonCounter['@_warning'],
        completed: jsonCounter['@_completed'],
        inProgress: jsonCounter['@_inProgress'],
        pending: jsonCounter['@_pending'],
    };

    return summary;
};

const parseTestResults = (jsonTestRun: any): ITestResult[] => {
    const unitTestResults = Array.isArray(jsonTestRun.Results.UnitTestResult)
        ? jsonTestRun.Results.UnitTestResult
        : [jsonTestRun.Results.UnitTestResult];
    const unitTests = Array.isArray(jsonTestRun.TestDefinitions.UnitTest)
        ? jsonTestRun.TestDefinitions.UnitTest
        : [jsonTestRun.TestDefinitions.UnitTest];

    return unitTestResults.map((x: unknown) => parseTestResult(x, unitTests));
};

const parseTestResult = (jsonUnitTestResult: any, jsonUnitTests: any[]): ITestResult => {
    const testResult: ITestResult = {
        name: jsonUnitTestResult['@_testName'],
        suite: parseTestSuiteName(jsonUnitTestResult, jsonUnitTests),
        outcome: jsonUnitTestResult['@_outcome'],
        start: new Date(Date.parse(jsonUnitTestResult['@_startTime'])),
        end: new Date(Date.parse(jsonUnitTestResult['@_endTime'])),
        duration: parseDuration(jsonUnitTestResult['@_duration']),
    };

    const jsonErrorInfo = jsonUnitTestResult.Output?.ErrorInfo;
    if (jsonErrorInfo) {
        testResult.errorInfo = {
            message: jsonErrorInfo.Message,
            stackTrace: jsonErrorInfo.StackTrace,
        };
    }

    return testResult;
};

const parseTestSuiteName = (jsonUnitTestResult: any, jsonUnitTests: any[]): string => {
    const executionId = jsonUnitTestResult['@_executionId'];
    const unitTest: any = jsonUnitTests.find((x: any) => x.Execution['@_id'] === executionId);
    const className = unitTest ? unitTest.TestMethod['@_className'] : '';

    const parts: string[] = className.split('.');
    const lastPart: string = parts[parts.length - 1];
    return lastPart;
};

const parseDuration = (durationStr: string): number => {
    const parts = durationStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const secondsAndMilliseconds = parseFloat(parts[2]);
    const seconds = Math.floor(secondsAndMilliseconds);
    const durationInSeconds = hours * 60 * 60 + minutes * 60 + seconds + (secondsAndMilliseconds - seconds);

    return durationInSeconds;
};

export interface ITrxViewerModel extends Omit<ITestRun, 'testResults'> {
    suites: ITestSuiteModel[];
}

export interface ITestSuiteModel {
    name: string;
    testResults: ITestResult[];
}

export const parseViewModel = (testRun: ITestRun): ITrxViewerModel => {
    const model: ITrxViewerModel = {
        start: testRun.start,
        finish: testRun.finish,
        suites: parseTestSuites(testRun.testResults),
        summary: testRun.summary,
    };

    return model;
};

const parseTestSuites = (testResults: ITestResult[]): ITestSuiteModel[] => {
    // sort test results by suite-name, then test-name
    const sortedTestResults = testResults.sort((a, b) => {
        const suiteCompare = a.suite.localeCompare(b.suite);
        return suiteCompare !== 0 ? suiteCompare : a.name.localeCompare(b.name);
    });

    // group test results by suite
    const suites: ITestSuiteModel[] = [];
    for (const testResult of sortedTestResults) {
        let suite = suites.find((s) => s.name === testResult.suite);
        if (!suite) {
            suite = { name: testResult.suite, testResults: [] };
            suites.push(suite);
        }
        suite.testResults.push(testResult);
    }

    return suites;
};

export const formatDuration = (uiParserFormatter: UiParserFormatter, durationInSecond: number): string => {
    if (durationInSecond >= 1) {
        return uiParserFormatter.formatFloat(durationInSecond) + 's';
    } else {
        const durationInMilliseconds = Math.floor(durationInSecond * 1000);
        return durationInMilliseconds + 'ms';
    }
};
