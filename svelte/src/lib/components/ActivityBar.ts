export interface IActivityBarItem {
    type: ActivityType;
    onSelect: () => void;
}

export enum ActivityType {
    Files = 'Files',
    Search = 'Search',
    GenerateCode = 'Generate Code',
    RunTest = 'Run Test',
}
