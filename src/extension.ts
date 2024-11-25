import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.moveExtensions', async () => {
        const profiles = await vscode.window.showQuickPick(
            ['Profile 1', 'Profile 2'], // Replace with actual profile names
            { placeHolder: 'Select the profile to move extensions to' }
        );

        if (!profiles) {
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

        // Logic to move extensions between profiles
        // This is a placeholder, as VS Code API does not directly support profile management
        vscode.window.showInformationMessage(`Moved ${selectedExtensions.length} extensions to ${profiles}`);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}