const presence = new Presence({
		clientId: "651455140477272065",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

let currentTitle = "Simulator Radio",
	currentArtist = "Your #1 Simulation Station",
	currentListeners = 0,
	currentDj = "Otto";

function newStats(): void {
	fetch("https://apiv2.simulatorradio.com/metadata/combined?premid").then(
		response => {
			if (response.status === 200) {
				response.json().then(data => {
					currentTitle = data.now_playing.title;
					currentArtist = data.now_playing.artists;
					currentListeners = data.listeners;
					currentDj = data.djs.now.displayname;
				});
			}
		}
	);
}

function pushMusicPresence(presenceData: PresenceData): void {
	presenceData.details = `${currentTitle} - ${currentArtist}`;
	presenceData.state = `Listening to ${currentDj}`;
	presenceData.smallImageText =
		currentListeners !== 0 ? `Listeners: ${currentListeners}` : "";
	presenceData.smallImageKey = "play";

	if (lastTitle !== currentTitle) {
		lastTitle = currentTitle;
		lastTimeStart = Math.floor(Date.now() / 1000);
	}

	presenceData.startTimestamp = lastTimeStart;
}

setInterval(newStats, 10000);
newStats();

let lastTitle = "",
	lastTimeStart = Math.floor(Date.now() / 1000);

presence.on("UpdateData", function () {
	const presenceData: PresenceData = {
		largeImageKey: "https://i.imgur.com/fUvjEoV.png",
	};

	if (
		document.querySelector(".fas.fa-play") !== null ||
		document.querySelector(".fa.fa-play") !== null /*Paused*/
	) {
		presenceData.startTimestamp = browsingTimestamp;

		if (document.location.pathname.includes("/request")) {
			presenceData.details = "Requesting...";
			presenceData.smallImageKey = "writing";
		} else if (document.location.pathname.includes("/timetable")) {
			presenceData.details = "Viewing the Timetable";
			presenceData.state = document.querySelector("#timetable-day").textContent;
		} else if (document.location.pathname.includes("/home"))
			pushMusicPresence(presenceData);
		else if (
			document.location.pathname.includes("/articles") ||
			document.location.pathname.includes("/news")
		)
			presenceData.details = "Browsing the Blog";
		else if (
			document.location.pathname.includes("/post") ||
			document.location.pathname.includes("/blog")
		) {
			presenceData.details = "Reading Blog Post";
			presenceData.state =
				document.querySelector(".blog-title")?.textContent ??
				document.querySelector(".blog-page-title").textContent;
			presenceData.smallImageKey = "reading";
		} else if (document.location.pathname.includes("/team"))
			presenceData.details = "Viewing the Team";
		else if (document.location.pathname.includes("/changelog")) {
			presenceData.details = "Reading the Changelog";
			presenceData.smallImageKey = "reading";
		}
	} else pushMusicPresence(presenceData);

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
