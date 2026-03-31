// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CommandAnalyzeDependencies from './commands/command-analyze-dependencies';
import { CommandOpenUMLExplorer, UMLExplorerViewProvider } from './commands/command-open-umlexplorer';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log("UML Explorer activated on current file");
	const provider = new UMLExplorerViewProvider(context);

	const disposables = [
		vscode.commands.registerCommand("uml-explorer.analyzeDependencies", CommandAnalyzeDependencies),
		vscode.commands.registerCommand("uml-explorer.openUMLExplorerOnNode", CommandOpenUMLExplorer),
		vscode.window.registerWebviewViewProvider("UMLExplorerView", provider),
	];

    context.subscriptions.push(...disposables);

	// Track active editor changes
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (!editor) {return;}

        provider.postMessage({
            type: "activeFileChanged",
            filePath: editor.document.uri.fsPath
        });
    });

    // Track file saves (optional)
    vscode.workspace.onDidSaveTextDocument(document => {
        provider.postMessage({
            type: "fileSaved",
            filePath: document.uri.fsPath
        });
    });

	// const editor = vscode.window.activeTextEditor;
	// if (!editor) {
	// 	vscode.window.showInformationMessage("No active editor");
	// 	return;
	// }

	// const currentFile = editor.document.uri.fsPath;

	// // Get the workspace folder containing the current file
	// const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);

	// if (!workspaceFolder) {
	// 	vscode.window.showErrorMessage("File is not in a workspace folder");
	// 	return;
	// }

	// const projectRoot = workspaceFolder.uri.fsPath;
	// console.log("Using workspace folder as project root:", projectRoot);
}

// This method is called when your extension is deactivated
export function deactivate() {}
