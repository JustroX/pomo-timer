import { ItemView, Notice, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_POMODORO = "pomodoro";

export default class PomodoroView extends ItemView {
	private button_focus: HTMLButtonElement;
	private button_break: HTMLButtonElement;
	private button_stop: HTMLButtonElement;
	private display_time: HTMLDivElement;
	private display_status: HTMLDivElement;
	private interval: ReturnType<typeof setInterval>;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	private formatDuration(duration: moment.Duration) {
		const s = duration.seconds();
		const m = duration.minutes();

		const ss = s < 10 ? "0" + s : s;
		const mm = m < 10 ? "0" + m : m;

		return `${mm}:${ss}`;
	}

	start(status: string, seconds: number) {
		this.button_focus.addClass("hidden");
		this.button_break.addClass("hidden");
		this.button_stop.removeClass("hidden");

		let duration = window.moment.duration(seconds, "seconds");
		this.display_status.textContent = status;
		this.display_time.textContent = this.formatDuration(duration);

		this.interval = setInterval(() => {
			duration = duration.subtract(1, "s");
			if (duration.asSeconds() < 0) {
				clearInterval(this.interval);
				this.button_focus.removeClass("hidden");
				this.button_break.removeClass("hidden");
				this.button_stop.addClass("hidden");
				this.display_status.textContent = "Done";

				new Notice(`${status} done!`);
				return;
			}
			this.display_time.textContent = this.formatDuration(duration);
		}, 1000);
	}

	stop() {
		if (this.interval) clearInterval(this.interval);
		this.button_focus.removeClass("hidden");
		this.button_break.removeClass("hidden");
		this.button_stop.addClass("hidden");
		this.display_status.textContent = "Stopped";
	}

	getViewType(): string {
		return VIEW_TYPE_POMODORO;
	}

	getDisplayText(): string {
		return "Pomodoro Timer";
	}

	getIcon(): string {
		return "check-small";
	}

	onClose(): Promise<void> {
		return Promise.resolve();
	}

	async onOpen(): Promise<void> {
		this.contentEl.appendChild(this.buildHTML());
	}

	private buildHTML() {
		const root = document.createElement("div");
		root.addClass("pomodoro-view");

		const timer = document.createElement("div");
		timer.addClass("pomodoro-timer");

		const time = document.createElement("div");
		time.addClass("pomodoro-time");
		time.textContent = "25:00";

		const status = document.createElement("div");
		status.addClass("pomodoro-status");
		status.textContent = "Focus";

		timer.appendChild(time);
		timer.appendChild(status);

		const buttons = document.createElement("div");
		buttons.addClass("pomodoro-buttons");

		const button1 = document.createElement("button");
		button1.textContent = "Focus";

		const button2 = document.createElement("button");
		button2.textContent = "Chill";

		const button3 = document.createElement("button");
		button3.textContent = "Stop";
		button3.addClass("hidden");

		root.appendChild(timer);
		root.appendChild(buttons);
		buttons.appendChild(button1);
		buttons.appendChild(button2);
		buttons.appendChild(button3);

		this.display_time = time;
		this.display_status = status;
		this.button_focus = button1;
		this.button_break = button2;
		this.button_stop = button3;

		button1.addEventListener("click", () => {
			this.start("Focus", 25 * 60);
		});
		button2.addEventListener("click", () => {
			this.start("Chill", 5 * 60);
		});
		button3.addEventListener("click", () => {
			this.stop();
		});
		return root;
	}
}
