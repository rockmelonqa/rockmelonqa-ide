export const toPrerequisiteText = (item: string) => {
    switch (item) {
        case "dotnet":
            return "Dotnet 6.0 or higher";
        case "node":
            return "Node version 16.16 or higher";
        case "pwsh":
            return "Powershell (pwsh)";
        default:
            return "";
    }
};
