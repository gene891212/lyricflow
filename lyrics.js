import { createVideo } from "./player.js";


class Lyrics {
  constructor(lyricsData) {
    this.lyricsData = lyricsData;
    this.availableLanguages = Object.keys(this.lyricsData.lyrics);
    this.linesCount = this.lyricsData.lyrics[this.availableLanguages[0]].length;
  }

  findIndex = (currentTime) => {
    // linear search
    for (let [index, time] of this.lyricsData.startTime.entries()) {
      if (time > currentTime) {
        return index - 1;
      }
    }
    return this.linesCount - 1;
  };

  getPrevIndex = (currentTime) => {
    let index = this.findIndex(currentTime);
    if (index <= 0) {
      return null;
    }
    return index - 1;
  };

  getCurrIndex = (currentTime) => {
    let index = this.findIndex(currentTime);
    if (index < 0) {
      return null;
    }
    return index;
  };

  getNextIndex = (currentTime) => {
    let index = this.findIndex(currentTime);
    if (index >= this.linesCount - 1) {
      return null;
    }
    return index + 1;
  };
};


const createLine = (lang, lyric) => {
  const line = document.createElement("div");
  line.setAttribute(`data-lang`, lang);
  line.innerHTML = lyric;
  return line;
};

const lyricsElement = document.getElementById("lyric");

(async () => {
  const player = await createVideo();
  const response = await fetch("https://gene891212.github.io/mock-api/7%E6%9C%88%E3%81%AE%E7%BF%BC_9756.json");
  const lyricsData = await response.json();

  const lyrics = new Lyrics(lyricsData);

  // control buttons event listener
  document.getElementById("previous").addEventListener("click", (event) => {
    event.preventDefault();
    let index = lyrics.getPrevIndex(player.getCurrentTime());
    player.seekTo(lyrics.lyricsData.startTime[index]);
  });
  document.getElementById("toggle").addEventListener("click", (event) => {
    event.preventDefault();
    player.togglePlay();
  });
  document.getElementById("next").addEventListener("click", (event) => {
    event.preventDefault();
    let index = lyrics.getNextIndex(player.getCurrentTime());
    player.seekTo(lyrics.lyricsData.startTime[index]);
  });

  // handle repeat button
  let repeatIndex = null;
  let repeatFlag = false;
  const repeatElement = document.getElementById("repeat");
  repeatElement.addEventListener("click", (event) => {
    event.preventDefault();

    // get the current repeat index
    repeatIndex = lyrics.getCurrIndex(player.getCurrentTime());
    if (repeatIndex === null) {
      return;
    }

    // toggle the repeatFlag on each click
    repeatFlag = !repeatFlag;
    if (repeatFlag) {
      repeatElement.classList.add("active");
    } else {
      repeatElement.classList.remove("active");
    }
  });


  player.addEventListener('onReady', () => {
    const stateIconElement = document.getElementById("state-icon");
    let previousIndex = null;
    setInterval(() => {
      let currentIndex = lyrics.getCurrIndex(player.getCurrentTime());
      if (currentIndex !== null) {
        // handle repeating behavior
        if (repeatFlag) {
          // seek player to the repeat line if index has changed
          if (repeatIndex !== currentIndex) {
            player.seekTo(lyrics.lyricsData.startTime[repeatIndex]);
          }
        }

        // check if active line has changed
        if (currentIndex !== previousIndex) {
          const lines = lyricsElement.children;
          Array.from(lines).forEach(line => {
            line.classList.remove("active");
          });
          // highlight current line
          let currentLine = lines.item(currentIndex);
          currentLine.classList.add("active");
        }
        previousIndex = currentIndex;
      }

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
  const jpYomiExist = "jp_yomi" in lyricsData.lyrics;
  Array.from(lyricsElement.children).forEach((lyricsLine, index) => {
    lyricsLine.addEventListener("click", (event) => {
      // seek player to the line
      player.seekTo(lyricsData.startTime[index]);
      player.playVideo();

      // set the repeatIndex if line on click
      repeatIndex = index;
    });

    lyricsLine.setAttribute("data-time", lyricsData.startTime[index]);

    // append languages lyrics
    for (const [lang, lyrics] of Object.entries(lyricsData.lyrics)) {
      if (jpYomiExist && lang === "jp") {
        continue;
      }
      lyricsLine.appendChild(createLine(lang, lyrics[index]));
    }
  });
})();

// createVideo()
//   .then(ytPlayer => {
//     player = ytPlayer;
//     // get lyircs data
//     return fetch("https://gene891212.github.io/mock-api/7%E6%9C%88%E3%81%AE%E7%BF%BC_9756.json");
//   })
//   .then(response => {
//     return response.json();
//   })
//   .then(lyricsData => {
//     const lyrics = new Lyrics(lyricsData);
//     console.log(lyrics);

//     // control buttons event listener
//     document.getElementById("previous").addEventListener("click", (event) => {
//       event.preventDefault();
//       let index = lyrics.getPrevIndex(player.getCurrentTime());
//       player.seekTo(lyrics.lyricsData.startTime[index]);
//     });
//     const toggleElement = document.getElementById("toggle");
//     toggleElement.addEventListener("click", (event) => {
//       event.preventDefault();
//       player.togglePlay();
//     });
//     document.getElementById("next").addEventListener("click", (event) => {
//       event.preventDefault();
//       let index = lyrics.getNextIndex(player.getCurrentTime());
//       player.seekTo(lyrics.lyricsData.startTime[index]);
//     });

//     // handle repeat button
//     let repeatIndex = null;
//     let repeatFlag = false;
//     const repeatElement = document.getElementById("repeat");
//     repeatElement.addEventListener("click", (event) => {
//       event.preventDefault();

//       // get the current repeat index
//       repeatIndex = lyrics.getCurrIndex(player.getCurrentTime());
//       if (repeatIndex === null) {
//         return;
//       }

//       // toggle the repeatFlag on each click
//       repeatFlag = !repeatFlag;
//       if (repeatFlag) {
//         repeatElement.classList.add("active");
//       } else {
//         repeatElement.classList.remove("active");
//       }
//     });


//     player.addEventListener('onReady', () => {
//       let previousIndex = null;
//       setInterval(() => {
//         let currentIndex = lyrics.getCurrIndex(player.getCurrentTime());
//         if (currentIndex !== null) {
//           // handle repeating behavior
//           if (repeatFlag) {
//             // seek player to the repeat line if index has changed
//             if (repeatIndex !== currentIndex) {
//               player.seekTo(lyrics.lyricsData.startTime[repeatIndex]);
//             }
//           }

//           // check if active line has changed
//           if (currentIndex !== previousIndex) {
//             const lines = lyricsElement.children;
//             Array.from(lines).forEach(line => {
//               line.classList.remove("active");
//             });
//             // highlight current line
//             let currentLine = lines.item(currentIndex);
//             currentLine.classList.add("active");
//           }
//           previousIndex = currentIndex;
//         }

//         // handle play / pause icon
//         const stateIconElement = document.getElementById("state-icon");
//         if (player.isPlayerPlaying) {
//           stateIconElement.classList.add("fa-pause");
//           stateIconElement.classList.remove("fa-play");
//         } else {
//           stateIconElement.classList.add("fa-play");
//           stateIconElement.classList.remove("fa-pause");
//         }
//       }, 100);
//     });

//     // hide lyrics in jp
//     document.querySelectorAll('[data-lang="jp"]').forEach(jpLyric => {
//       jpLyric.style.display = 'none';
//     });

//     // iter all the languages
//     const jpYomiExist = "jp_yomi" in lyricsData.lyrics;
//     Array.from(lyricsElement.children).forEach((lyricsLine, index) => {
//       lyricsLine.addEventListener("click", (event) => {
//         // seek player to the line
//         player.seekTo(lyricsData.startTime[index]);
//         player.playVideo();

//         // set the repeatIndex if line on click
//         repeatIndex = index;
//       });

//       lyricsLine.setAttribute("data-time", lyricsData.startTime[index]);

//       // append languages lyrics
//       for (const [lang, lyrics] of Object.entries(lyricsData.lyrics)) {
//         if (jpYomiExist && lang === "jp") {
//           continue;
//         }
//         lyricsLine.appendChild(createLine(lang, lyrics[index]));
//       }
//     });
//   })
//   .catch(error => {
//     console.error(error);
//   });