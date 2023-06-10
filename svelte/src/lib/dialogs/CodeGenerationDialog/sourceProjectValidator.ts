import { codeGenerator } from "$lib/ipc";
import _ from "lodash";
import type { IRmProjFile } from "rockmelonqa.common/file-defs";

export class SourceProjectValidator {
    /** Returns the first pair duplicated items (cases, pages, suites) by outputFilePath */
    public static async findDuplicatedObjects(projectFile: IRmProjFile): Promise<string[]> {
        const meta = await codeGenerator.generateOutputProjectMetadata(projectFile);
        if (!meta) {
            return [];
        }

        const duplicateTestCases = SourceProjectValidator.findDuplicatedItems(meta.cases);
        if (duplicateTestCases.length) {
            return duplicateTestCases;
        }

        const duplicatePages = SourceProjectValidator.findDuplicatedItems(meta.pages);
        if (duplicatePages.length) {
            return duplicatePages;
        }

        const duplicateTestSuites = SourceProjectValidator.findDuplicatedItems(meta.suites);
        if (duplicateTestSuites.length) {
            return duplicateTestSuites;
        }

        return [];
    }

    /** Returns the first pair duplicated items by outputFilePath */
    private static findDuplicatedItems(items: { outputFilePath: string; inputFileRelPath: string }[]): string[] {
        // Group the items by "outputFilePath", the find the first group that has more than 1 item.
        const groups = _(
            items.map((item) => ({
                inputFileRelPath: item.inputFileRelPath,
                outputFilePath: item.outputFilePath.toLocaleLowerCase(),
            }))
        )
            .groupBy("outputFilePath")
            .map(function (items, outputFilePath) {
                return {
                    outputFilePath,
                    inputFileRelPaths: _.map(items, "inputFileRelPath"),
                };
            })
            .value();

        const duplicateGroup = groups.find((g) => g.inputFileRelPaths.length > 1);
        if (duplicateGroup) {
            const [file1Name, file2Name] = duplicateGroup.inputFileRelPaths;
            return [file1Name, file2Name];
        }
        return [];
    }
}
