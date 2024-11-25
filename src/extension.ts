import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.moveExtensions', async () => {
        const extensions = vscode.extensions.all.map(ext => ext.id);

        const profile = await vscode.window.showInputBox({
            placeHolder: 'Enter the profile name to move extensions to'
        });

        if (!profile) {
            return;
        }

        const selectedExtensions = await vscode.window.showQuickPick(extensions, {
            canPickMany: true,
            placeHolder: 'Select extensions to move'
        });

        if (!selectedExtensions) {
            return;
        }

        moveExtensions(selectedExtensions, profile);
    });

    context.subscriptions.push(disposable);
}

function moveExtensions(extensions: string[], profile: string) {
    extensions.forEach(extension => {
        exec(`code --profile ${profile} --install-extension ${extension}`, (installError, installStdout, installStderr) => {
            if (installError) {
                vscode.window.showErrorMessage(`Error installing extension ${extension} to profile ${profile}: ${installStderr}`);
                return;
            }
            exec(`code --uninstall-extension ${extension}`, (uninstallError, uninstallStdout, uninstallStderr) => {
                if (uninstallError) {
                    vscode.window.showErrorMessage(`Error uninstalling extension ${extension}: ${uninstallStderr}`);
                    return;
                }
                vscode.window.showInformationMessage(`Moved extension ${extension} to profile ${profile}`);
            });
        });
    });
}

export function deactivate() {}
