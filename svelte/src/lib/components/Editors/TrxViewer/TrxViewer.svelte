<script lang="ts">
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import { UiParserFormatter } from "$lib/context/UiParserFormatter";
    import TextField from "$lib/controls/TextField.svelte";
    import { fileSystem } from "$lib/ipc";
    import { getContext, onMount } from "svelte";
    import { writable } from "svelte/store";
    import { combinePath } from "../../FileExplorer/Node";
    import { toTitle } from "../Editor";
    import OutcomeCounter from "./OutcomeCounter.svelte";
    import TestOutcomeIcon from "./TestOutcomeIcon.svelte";
    import TestSuite from "./TestSuite.svelte";
    import {
        formatDuration,
        parseTestRun,
        parseViewModel,
        TestOutcome,
        type ITestResult,
        type ITestRun,
        type ITrxViewerModel,
    } from "./trxViewer";

    const uiContext = getContext(uiContextKey) as IUiContext;
    const uiParserFormatter = new UiParserFormatter(uiContext);

    export let folderPath: string;
    export let fileName: string;
    $: filePath = combinePath([folderPath, fileName], uiContext.pathSeparator);

    let data: ITestRun | undefined;
    const viewModel = writable<ITrxViewerModel | undefined>(undefined);

    let totalTests: number = 0;
    let totalPassedTests: number = 0;
    let totalFailedTests: number = 0;
    let startTime: string = "";
    let totalDuration: number = 0; // in second

    let keyword: string = "";
    let selectedOutcome: TestOutcome = TestOutcome.Unknown;

    onMount(async () => {
        let fileContent = await fileSystem.readFile(filePath);
        if (fileContent) {
            data = parseTestRun(fileContent);
            totalTests = data.testResults.length;
            totalPassedTests = data.testResults.filter((test) => test.outcome === TestOutcome.Passed).length;
            totalFailedTests = data.testResults.filter((test) => test.outcome === TestOutcome.Failed).length;
            startTime = uiParserFormatter.formatDateTime(data.start);
            totalDuration = (data.finish.valueOf() - data.start.valueOf()) / 1000;

            viewModel.set(parseViewModel(data));
        }
    });

    const handleCounterClick = (outcome: TestOutcome) => {
        if (selectedOutcome === outcome) {
            return;
        } else {
            selectedOutcome = outcome;
        }

        doFilter();
    };

    const onKeyUp = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            doFilter();
        }
    };

    const doFilter = () => {
        if (!data) {
            return;
        }

        const lowerKeyword = keyword.toLowerCase();
        let filteredTestResults = [...data.testResults];
        filteredTestResults = filteredTestResults.filter((test: ITestResult) => {
            let matched = selectedOutcome === TestOutcome.Unknown || test.outcome === selectedOutcome;
            if (matched && lowerKeyword) {
                const displayTestName = toTitle(test.name);
                const displaySuiteName = toTitle(test.suite);

                matched =
                    // test.suite.toLowerCase().includes(lowerKeyword) ||
                    // test.name.toLowerCase().includes(lowerKeyword) ||
                    displaySuiteName.toLowerCase().includes(lowerKeyword) ||
                    displayTestName.toLowerCase().includes(lowerKeyword);
            }

            return matched;
        });

        viewModel.set(parseViewModel({ ...data, testResults: filteredTestResults }));
    };
</script>

{#if $viewModel}
    <div class="flex-1 trx-viewer p-8 flex flex-col">
        <div class="filter-container flex items-center">
            <div class="grow mr-16">
                <TextField
                    name="keyword"
                    value={keyword}
                    placeholder="Keyword"
                    on:input={(e) => (keyword = e.detail.value)}
                    on:keyup={onKeyUp}
                />
            </div>
            <nav class="ml-auto flex whitespace-nowrap">
                <OutcomeCounter
                    outcome="All"
                    count={totalTests}
                    on:click={() => handleCounterClick(TestOutcome.Unknown)}
                    highlight={selectedOutcome === TestOutcome.Unknown}
                />
                <OutcomeCounter
                    outcome={TestOutcome.Passed}
                    count={totalPassedTests}
                    on:click={() => {
                        handleCounterClick(TestOutcome.Passed);
                    }}
                    highlight={selectedOutcome === TestOutcome.Passed}
                >
                    <TestOutcomeIcon outcome={TestOutcome.Passed} slot="icon" />
                </OutcomeCounter>
                <OutcomeCounter
                    outcome={TestOutcome.Failed}
                    count={totalFailedTests}
                    on:click={() => {
                        handleCounterClick(TestOutcome.Failed);
                    }}
                    highlight={selectedOutcome === TestOutcome.Failed}
                >
                    <TestOutcomeIcon outcome={TestOutcome.Failed} slot="icon" />
                </OutcomeCounter>
            </nav>
        </div>
        <div class="my-6 flex">
            <div class="">Start: {startTime}</div>
            <div class="ml-auto mr-4">Total time: {formatDuration(uiParserFormatter, totalDuration)}</div>
        </div>
        <div class="tests-container">
            {#each $viewModel.suites as suite (suite.name)}
                <TestSuite {suite} />
            {/each}
        </div>
    </div>
{/if}
