import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.moveExtensions', async () => {
        const profiles = await getProfiles();
        if (!profiles) {
            vscode.window.showErrorMessage('No profiles found.');
            return;
        }

        const selectedProfile = await vscode.window.showQuickPick(profiles, {
            placeHolder: 'Select the profile to move extensions to'
        });

        if (!selectedProfile) {
            return;
        }

        const extensions = vscode.extensions.all.map(ext => ext.id);
        const selectedExtensions = await vscode.window.showQuickPick(extensions, {
            canPickMany: true,
            placeHolder: 'Select extensions to move'
        });

        if (!selectedExtensions) {
            return;
        }

        moveExtensions(selectedExtensions, selectedProfile);
    });

    context.subscriptions.push(disposable);
}

async function getProfiles(): Promise<string[]> {
    // Replace this with actual logic to get profiles if available
    return ['Profile 1', 'Profile 2', 'Profile 3'];
}

function moveExtensions(extensions: string[], profile: string) {
    extensions.forEach(extension => {
        exec(`code --profile ${profile} --install-extension ${extension}`, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error moving extension ${extension}: ${stderr}`);
                return;
            }
            vscode.window.showInformationMessage(`Moved extension ${extension} to profile ${profile}`);
        });
    });
}

export function deactivate() {}
