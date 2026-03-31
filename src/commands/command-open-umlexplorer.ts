import * as vscode from 'vscode';

const CommandOpenUMLExplorer = async () => {
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


};

class UMLExplorerViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private context: vscode.ExtensionContext) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = getWebviewContent();

        // Optional: handle messages from the webview
        webviewView.webview.onDidReceiveMessage(msg => {
            console.log("Message from webview:", msg);
        });
    }

    // Helper to send messages to webview
    public postMessage(message: any) {
        this._view?.webview.postMessage(message);
    }
}

function getWebviewContent() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UML Explorer</title>
    </head>
    <body>
        <canvas>
        </canvas>

        <script>
            const vscode = acquireVsCodeApi();

            function sendMessage() {
                vscode.postMessage({ type: 'alert', text: 'Hello Extension!' });
            }

            window.addEventListener('message', event => {
                const message = event.data;

                switch(message.type) {
                    case 'activeFileChanged':
                        console.log("Current file changed:", message.filePath);
                        break;
                    case 'fileSaved':
                        console.log("File saved:", message.filePath);
                        break;
                }
            });
        </script>
    </body>
    </html>
    `;
}

export {
    CommandOpenUMLExplorer,
    UMLExplorerViewProvider,
};