import { Plugin, WorkspaceLeaf } from "obsidian";
import PomodoroView, { VIEW_TYPE_POMODORO } from "view";

interface PomodoroPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: PomodoroPluginSettings = {
	mySetting: "default",
};

export default class PomodoroPlugin extends Plugin {
	private view: PomodoroView;
	settings: PomodoroPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_POMODORO,
			(leaf: WorkspaceLeaf) => (this.view = new PomodoroView(leaf))
		);

		if (this.app.workspace.layoutReady) {
			this.initLeaf();
		} else {
			this.registerEvent(
				this.app.workspace.on(
					"layout-ready" as any,
					this.initLeaf.bind(this)
				)
			);
		}
	}

	initLeaf(): void {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE_POMODORO).length) {
			return;
		}
		this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_POMODORO,
		});
	}

	onunload() {
		this.app.workspace
			.getLeavesOfType(VIEW_TYPE_POMODORO)
			.forEach((leaf) => leaf.detach());
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
