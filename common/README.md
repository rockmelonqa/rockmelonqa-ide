# Overview

This package contain common code for the Electron and Svelte projects.

# Types

The types for all objects in the RM Project are in `src/file-defs` folder.

# Codegen

The main codegen classes are in `/src/codegen/` folder. The `CodeGenFactory` class instantiates the CodeGen based on the info in the RM Project, i.e, if the test framework is Playwright, language is CSharp, and the automation framework is NUnit, then the CodeGen will be `playwright-csharp-nunit`

# Set up

For output dotnet projects, run dotnet restore/build before running test.

For output Node project, run `npm i` before running test.

# Notes

- Code files within `common` package must import each other using relative path, don't import from root name package namespace `rockmelonqa.common`.

- All public files (modules) of `common` package must be exported in `common/index.ts`

- Code files in Svelte app must import only from root namespace `rockmelonqa.common`, `rockmelonqa.common/file-defs`, `rockmelonqa.common/ipc-defs`. Do not import files/modules in other sub namespaces: `file-defs`, `ipc-defs`, those are specific for Electron app;

# Run Tests

Open `common` in a separate vscode window to run the jest tests.
