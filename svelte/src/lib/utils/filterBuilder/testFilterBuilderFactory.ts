import type { IUiContext } from "$lib/context/UiContext";
import { Language } from "rockmelonqa.common";
import type { ITestFilterBuilder } from "./testFilterBuilder";
import { DotnetTestFilterBuilder } from "./dotnetTestFilterBuilder";
import { PlaywrightTypeScriptTestFilterBuilder } from "./playwrightTypeScriptTestFilterBuilder";

/** Factory for creating instance of FilterBuilder */
export class TestFilterBuilderFactory {
    /** Creates new instance of FilterBuilder based on Language */
    static newInstance(language: Language, uiContext: IUiContext): ITestFilterBuilder {
        if (language === Language.CSharp) {
            return new DotnetTestFilterBuilder(uiContext);
        }
        if (language === Language.Typescript) {
            return new PlaywrightTypeScriptTestFilterBuilder(uiContext);
        }

        throw new Error(`DEV ERROR: Cannot find filter builder for language ${language}`);
    }
}
