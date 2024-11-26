import * as vscode from 'vscode';
import { exec } from 'child_process';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Profile Shuffler');
    context.subscriptions.push(outputChannel);

    let disposable = vscode.commands.registerCommand('extension.moveExtensions', async () => {
        const sourceProfile = await vscode.window.showInputBox({
            placeHolder: 'Enter the source profile name to move extensions from',
            value: 'Default'
        });

        if (!sourceProfile) {
            return;
        }

        const targetProfile = await vscode.window.showInputBox({
            placeHolder: 'Enter the target profile name to move extensions to'
        });

        if (!targetProfile) {
            return;
        }

        const extensions = await getExtensionsForProfile(sourceProfile);
        if (!extensions) {
            vscode.window.showErrorMessage(`Failed to get extensions for profile ${sourceProfile}`);
            return;
        }

        const selectedExtensions = await vscode.window.showQuickPick(extensions, {
            canPickMany: true,
            placeHolder: 'Select extensions to move'
        });

        if (!selectedExtensions) {
            return;
        }

        moveExtensions(selectedExtensions, sourceProfile, targetProfile);
    });

    context.subscriptions.push(disposable);
}

function getExtensionsForProfile(profile: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const command = `code --list-extensions --profile '${profile}'`;
        outputChannel.appendLine(`Running command: ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                outputChannel.appendLine(`Error listing extensions for profile ${profile}: ${stderr}`);
                reject(`Error listing extensions for profile ${profile}: ${stderr}`);
                return;
            }
            const extensions = stdout.split('\n').filter(ext => ext.trim() !== '');
            resolve(extensions);
        });
    });
}

function moveExtensions(extensions: string[], sourceProfile: string, targetProfile: string) {
    extensions.forEach(extension => {
        runCommand(`code --profile '${targetProfile}' --install-extension '${extension}'`, `Error installing extension ${extension} to profile ${targetProfile}`)
            .then(() => runCommand(`code --profile '${sourceProfile}' --uninstall-extension '${extension}'`, `Error uninstalling extension ${extension} from profile ${sourceProfile}`))
            .then(() => vscode.window.showInformationMessage(`Moved extension ${extension} from profile ${sourceProfile} to profile ${targetProfile}`))
            .catch(error => vscode.window.showErrorMessage(error));
    });
}

function runCommand(command: string, errorMessage: string): Promise<void> {
    return new Promise((resolve, reject) => {
        outputChannel.appendLine(`Running command: ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                outputChannel.appendLine(`${errorMessage}: ${stderr}`);
                reject(`${errorMessage}: ${stderr}`);
                return;
            }
            resolve();
        });
    });
}

export function deactivate() {}
