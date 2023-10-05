import './styles/main.scss';
import './init-firebase.js'


class LyricsManager {
  constructor(lyricsData) {
    this.data = lyricsData;
    this.availableLanguages = Object.keys(this.data.lyrics);
    this.linesCount = this.data.lyrics[this.availableLanguages[0]].length;
  }

  findIndex = (currentTime) => {
    const index = this.data.startTime.findIndex((time) => time > currentTime);
    return index >= 0 ? index - 1 : this.linesCount - 1;
  };

  getPrevIndex = (currentTime) => {
    const index = this.findIndex(currentTime);
    return index >= 0 ? index - 1 : null;
  };

  getCurrIndex = (currentTime) => {
    const index = this.findIndex(currentTime);
    return index >= 0 ? index : null;
  };

  getNextIndex = (currentTime) => {
    const index = this.findIndex(currentTime);
    return index < this.linesCount - 1 ? index + 1 : null;
  };
};

class RepeatManager {
  constructor(repeatElement) {
    this.repeatIndex = null;
    this.repeatFlag = false;

    this.repeatElement = repeatElement;
  }

  toggleRepeat = () => {
    if (this.repeatIndex === null) {
      return;
    }

    this.repeatFlag = !this.repeatFlag;
    if (this.repeatFlag) {
      this.repeatElement.classList.add("active");
    } else {
      this.repeatElement.classList.remove("active");
    }
  };
}

const createVideo = async (videoId) => {
  var tag = document.createElement('script');
  var firstScript = document.getElementsByTagName('script')[0];

  tag.src = 'https://www.youtube.com/iframe_api';
  firstScript.parentNode.insertBefore(tag, firstScript);

  return new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = function () {
      class YTPlayer extends window.YT.Player {
        constructor(id, options) {
          super(id, options);
          this.isPlayerPlaying = false;
        }

        togglePlay = () => {
          if (this.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
            return;
          }
          this.playVideo();
        };

        handleStateChange = (event) => {
          this.isPlayerPlaying = event.data !== YT.PlayerState.PAUSED;
        };
      };

      let player = new YTPlayer('player', {
        videoId: videoId,
        playerVars: {
          'rel': 0,
        },
        events: {
          'onStateChange': (event) => player.handleStateChange(event)
        }
      });
      resolve(player); // Resolve the promise with the player instance
    };
  });
};


const initialize = async () => {
  // TODO: error handle
  //        1. response maybe 404
  //        2. lyricsData will parse error
  const videoId = document.getElementById("player").dataset.video;
  const player = await createVideo(videoId);
  const response = await fetch("https://gene891212.github.io/mock-api/9756.json");
  const lyricsData = await response.json();

  const lyricsElement = document.getElementById("lyric");
  const lyricsManager = new LyricsManager(lyricsData);

  const repeatElement = document.getElementById("repeat");
  const repeatManager = new RepeatManager(repeatElement);

  const previousButton = document.getElementById("previous");
  const playPauseButton = document.getElementById("toggle");
  const nextButton = document.getElementById("next");

  repeatElement.addEventListener("click", (event) => {
    event.preventDefault();
    repeatManager.repeatIndex = lyricsManager.getCurrIndex(player.getCurrentTime());
    repeatManager.toggleRepeat();
  });

  previousButton.addEventListener("click", (event) => {
    event.preventDefault();
    const prevIndex = lyricsManager.getPrevIndex(player.getCurrentTime());
    player.seekTo(lyricsManager.data.startTime[prevIndex]);

    repeatManager.repeatIndex = prevIndex;
  });

  playPauseButton.addEventListener("click", (event) => {
    event.preventDefault();
    player.togglePlay();
  });

  nextButton.addEventListener("click", (event) => {
    event.preventDefault();
    const nextIndex = lyricsManager.getNextIndex(player.getCurrentTime());
    player.seekTo(lyricsManager.data.startTime[nextIndex]);

    repeatManager.repeatIndex = nextIndex;
  });

  player.addEventListener('onReady', () => {
    const stateIconElement = document.getElementById("state-icon");
    const lines = lyricsElement.children;
    let previousIndex = null;
    setInterval(() => {
      let currentIndex = lyricsManager.getCurrIndex(player.getCurrentTime());
      // check if repeat mode is active and the current index has changed
      if (repeatManager.repeatFlag && (repeatManager.repeatIndex !== currentIndex)) {
        player.seekTo(lyricsManager.data.startTime[repeatManager.repeatIndex]);
      }

      // check if active line has changed
      if (currentIndex !== previousIndex) {
        Array.from(lines).forEach((line, index) => {
          line.classList.toggle("active", index === currentIndex);
        });
      }
      previousIndex = currentIndex;

      // handle play / pause icon
      const isPlaying = player.isPlayerPlaying;
      stateIconElement.classList.toggle("fa-play", !isPlaying);
      stateIconElement.classList.toggle("fa-pause", isPlaying);
    }, 100);
  });

  // hide lyrics in jp
  document.querySelectorAll('[data-lang="jp"]').forEach(jpLyric => {
    jpLyric.style.display = 'none';
  });

  // iter all the languages
  const isJapaneseYomiAvailable = "jp_yomi" in lyricsData.lyrics;
  Array.from(lyricsElement.children).forEach((lyricsLine, index) => {
    lyricsLine.addEventListener("click", () => {
      player.seekTo(lyricsData.startTime[index]);
      player.playVideo();
      // set the repeatIndex if line on click
      repeatManager.repeatIndex = index;
    });

    lyricsLine.setAttribute("data-time", lyricsData.startTime[index]);

    // append mulit-languages lyrics
    for (const [language, lyrics] of Object.entries(lyricsData.lyrics)) {
      if (isJapaneseYomiAvailable && (language === "jp")) {
        continue;
      }
      const lineElement = document.createElement("div");
      lineElement.setAttribute(`data-lang`, language);
      lineElement.innerHTML = lyrics[index];
      lyricsLine.appendChild(lineElement);
    }
  });
};

initialize();
