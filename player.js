function createVideo() {
  const videoId = document.getElementById("player").dataset.video;

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
}


export { createVideo };