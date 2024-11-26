import * as vscode from 'vscode';
import { exec } from 'child_process';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Profile Shuffler');
    context.subscriptions.push(outputChannel);

    let moveDisposable = vscode.commands.registerCommand('extension.moveExtensions', async () => {
        const sourceProfile = await promptForProfile('Enter the source profile name to move extensions from', 'Default');
        if (!sourceProfile) return;

        const targetProfile = await promptForProfile('Enter the target profile name to move extensions to');
        if (!targetProfile) return;

        const selectedExtensions = await selectExtensions(sourceProfile);
        if (!selectedExtensions) return;

        moveExtensions(selectedExtensions, sourceProfile, targetProfile);
    });

    let copyDisposable = vscode.commands.registerCommand('extension.copyExtensions', async () => {
        const sourceProfile = await promptForProfile('Enter the source profile name to copy extensions from', 'Default');
        if (!sourceProfile) return;

        const targetProfile = await promptForProfile('Enter the target profile name to copy extensions to');
        if (!targetProfile) return;

        const selectedExtensions = await selectExtensions(sourceProfile);
        if (!selectedExtensions) return;

        copyExtensions(selectedExtensions, targetProfile);
    });

    context.subscriptions.push(moveDisposable);
    context.subscriptions.push(copyDisposable);
}

async function promptForProfile(placeHolder: string, value?: string): Promise<string | undefined> {
    return await vscode.window.showInputBox({ placeHolder, value });
}

async function selectExtensions(profile: string): Promise<string[] | undefined> {
    const extensions = await getExtensionsForProfile(profile);
    if (!extensions) {
        vscode.window.showErrorMessage(`Failed to get extensions for profile ${profile}`);
        return;
    }

    const extensionMap = getExtensionMap();
    const displayNames = extensions.map(id => extensionMap[id] || id);

    const selectedDisplayNames = await vscode.window.showQuickPick(displayNames, {
        canPickMany: true,
        placeHolder: 'Select extensions'
    });

    if (!selectedDisplayNames) {
        return;
    }

    return selectedDisplayNames.map(name => {
        const entry = Object.entries(extensionMap).find(([, displayName]) => displayName === name);
        return entry ? entry[0] : name;
    });
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

function getExtensionMap(): { [id: string]: string } {
    const map: { [id: string]: string } = {};
    vscode.extensions.all.forEach(ext => {
        const displayName = ext.packageJSON.displayName;
        map[ext.id] = displayName ? `${displayName} (${ext.id})` : ext.id;
    });
    return map;
}

function moveExtensions(extensions: string[], sourceProfile: string, targetProfile: string) {
    extensions.forEach(extension => {
        runCommand(`code --profile '${targetProfile}' --install-extension '${extension}'`, `Error installing extension ${extension} to profile ${targetProfile}`)
            .then(() => runCommand(`code --profile '${sourceProfile}' --uninstall-extension '${extension}'`, `Error uninstalling extension ${extension} from profile ${sourceProfile}`))
            .then(() => vscode.window.showInformationMessage(`Moved extension ${extension} from profile ${sourceProfile} to profile ${targetProfile}`))
            .catch(error => vscode.window.showErrorMessage(error));
    });
}

function copyExtensions(extensions: string[], targetProfile: string) {
    extensions.forEach(extension => {
        runCommand(`code --profile '${targetProfile}' --install-extension '${extension}'`, `Error installing extension ${extension} to profile ${targetProfile}`)
            .then(() => vscode.window.showInformationMessage(`Copied extension ${extension} to profile ${targetProfile}`))
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
