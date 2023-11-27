import * as vscode from 'vscode';

import { insertContentFromAllTabs } from './insertContentFromAllTabs';
import { OutputChannelManager } from './outputChannelManager';

let isEdited = false;

export function activate(context: vscode.ExtensionContext) {
	OutputChannelManager.initialize("auto-context");
	OutputChannelManager.appendLine("auto-context activated.");

	let resetEditMarkListener = vscode.window.onDidChangeActiveTextEditor(() => {
		isEdited = false;
	});
	context.subscriptions.push(resetEditMarkListener);

	let fileOpenListener = vscode.workspace.onDidChangeTextDocument(event => {
		if (isEdited) {
			return;
		}

		isEdited = true;
		if (event.document === vscode.window.activeTextEditor?.document) {
			insertContentFromAllTabs();
		}
	});

	context.subscriptions.push(fileOpenListener);
}

// This method is called when your extension is deactivated
export function deactivate() { }
