import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

/**
 * Recursively list all .ts/.tsx files in a directory
 * Uses asynchronous DFS for performance
 */
async function getAllTSFiles(dir: string): Promise<string[]> {
    console.log("break");
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    await Promise.all(
        entries.map(async (entry) => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...(await getAllTSFiles(fullPath)));
            } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
                files.push(fullPath);
            }
        })
    );

    return files;
}

/**
 * Parse imports from a TypeScript file
 */
function getImports(filePath: string): string[] {
    const source = fs.readFileSync(filePath, "utf-8");
    const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.ESNext, true);

    const imports: string[] = [];
    ts.forEachChild(sourceFile, (node) => {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
            imports.push(node.moduleSpecifier.text);
        }
    });

    return imports;
}

/**
 * Resolve module paths to absolute .ts/.tsx file paths
 */
function resolveImport(importPath: string, fromFile: string, allFilesSet: Set<string>): string | null {
    const baseDir = path.dirname(fromFile);
    const resolvedTs = path.resolve(baseDir, importPath + ".ts");
    const resolvedTsx = path.resolve(baseDir, importPath + ".tsx");
    if (allFilesSet.has(resolvedTs)) {return resolvedTs;}
    if (allFilesSet.has(resolvedTsx)) {return resolvedTsx;}
    // Handle index files
    const resolvedIndexTs = path.resolve(baseDir, importPath, "index.ts");
    const resolvedIndexTsx = path.resolve(baseDir, importPath, "index.tsx");
    if (allFilesSet.has(resolvedIndexTs)) {return resolvedIndexTs;}
    if (allFilesSet.has(resolvedIndexTsx)) {return resolvedIndexTsx;}
    return null;
}

/**
 * Build forward and reverse dependency lists for a file
 */
async function analyzeDependencies(currentFile: string, projectRoot: string) {
    const allFiles = await getAllTSFiles(projectRoot);
    const allFilesSet = new Set(allFiles);

    const forward: string[] = [];
    const reverse: string[] = [];

    // Forward dependencies: files currentFile imports
    const imports = getImports(currentFile);
    for (const imp of imports) {
        const resolved = resolveImport(imp, currentFile, allFilesSet);
        if (resolved) {forward.push(resolved);}
    }

    // Reverse dependencies: files that import currentFile
    await Promise.all(
        allFiles.map(async (file) => {
            if (file === currentFile) {return;}
            const imps = getImports(file);
            for (const imp of imps) {
                const resolved = resolveImport(imp, file, allFilesSet);
                if (resolved === currentFile) {
                    reverse.push(file);
                    break;
                }
            }
        })
    );

    return { forward, reverse };
}

export {
    analyzeDependencies
};