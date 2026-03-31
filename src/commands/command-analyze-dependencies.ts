import * as vscode from 'vscode';
import { analyzeDependencies } from '../parsers/parse-typescript';

const CommandAnalyzeDependencies = async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage("No active editor open");
        return;
    }

    const currentFile = editor.document.uri.fsPath;
    const projectRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

    if (!projectRoot) {
        vscode.window.showErrorMessage("No workspace folder found");
        return;
    }

    vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: "Analyzing dependencies..." },
        async () => {
            const { forward, reverse } = await analyzeDependencies(currentFile, projectRoot);

            vscode.window.showInformationMessage(
                `Forward: ${forward.length} files, Reverse: ${reverse.length} files`
            );

            console.log("Forward dependencies:", forward);
            console.log("Reverse dependencies:", reverse);
        }
    );
};

export default CommandAnalyzeDependencies;