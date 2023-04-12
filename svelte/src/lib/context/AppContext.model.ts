import type { LocatorType } from 'rockmelonqa.common';

export interface IPageElementData {
    id: string;
    name: string;
    findBy: LocatorType;
    locator: string;
}

export interface IPageData {
    id: string;
    name: string;
    elements: Map<string, IPageElementData>;
    filePath: string;
}

export interface ITestCaseData {
    id: string;
    name: string;
    filePath: string;
}
