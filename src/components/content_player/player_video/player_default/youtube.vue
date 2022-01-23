<template lang="pug">
div(id="player_youtube").row.fit
</template>

<script>
export default {
  name: 'youtubePlayer',
  props: ['url'],
  emits: ['player-youtube', 'pause', 'play', 'timeupdate'],
  data() {
    let resolver = () => {
    }
    const promise = new Promise((resolve) => {
      resolver = resolve
    })
    return {
      promise,
      resolver,
      currentTime: 0,
    }
  },
  computed: {
    videoId () {
      let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      let match = this.url.match(regExp);
      return (match && match[7].length === 11) ? match[7] : null
      }
  },
  watch: {
    videoId(to) {
      if (this.player && to) this.player.loadVideoById(to)
    }
  },
  methods: {
    deinitYoutube () {
      window.removeEventListener('message', this.onIframeMessage)
    },
    initYoutube () {
      const _ = this;
      this.$logT('initYoutube');
      this.player = new window.YT.Player('player_youtube', {
        // width: 600,
        // height: 400,
        videoId: this.videoId,
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, iv_load_policy: 3, modestbranding: 1, rel: 0, showinfo: 0 },
        events: {
          onReady: (evt) => {
            // This is the source "window" that will emit the events.
            this.iframeWindow = this.player.getIframe().contentWindow;
            // Listen to events triggered by postMessage.
            window.addEventListener('message', this.onIframeMessage)
            this.$nextTick(() => this.$emit('player-youtube', this.player))
          },
          onStateChange: (event) => {
            this.$logT('Player state changed', event)
            switch (event.data) {
              case window.YT.PlayerState.ENDED:
              case window.YT.PlayerState.PAUSED:
                this.$emit('pause')
                break
              case window.YT.PlayerState.PLAYING:
                this.$emit('play')
                break
            }
          },
          onError: (evt) => {
            this.$logE('youtube error:', evt.data)
          }
        }
      })
    },
    onIframeMessage (event) {
      // Check that the event was sent from the YouTube IFrame.
      if (event.source === this.iframeWindow) {
        let data = JSON.parse(event.data);
        // The "infoDelivery" event is used by YT to transmit any
        // kind of information change in the player,
        // such as the current time or a playback quality change.
        if (
            data.event === 'infoDelivery' &&
            data.info &&
            data.info.currentTime
        ) {
          // currentTime is emitted very frequently,
          // but we only care about whole second changes.
          this.currentTime = data.info.currentTime;
          this.$emit('timeupdate', this.currentTime)
        }
      }
    }
  },
  created () {
    if (!window.onYouTubeIframeAPIReadyResolvers) {
      window.onYouTubeIframeAPIReadyResolvers = []
    }
    if (!window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady = () => {
        // eslint-disable-next-line no-unused-expressions
        window.onYouTubeIframeAPIReadyResolvers?.forEach((resolver) => {
          resolver()
        })
      }
    }
    this.promise.then(() => this.initYoutube())
    const id = 'youtube-iframe-js-api-script'
    let tag = document.getElementById(id)
    if (!tag) {
      // eslint-disable-next-line no-unused-expressions
      window.onYouTubeIframeAPIReadyResolvers?.push(this.resolver)
      tag = document.createElement('script')
      tag.id = id
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      }
    } else {
      this.resolver()
    }
  },
  unmounted () {
    this.deinitYoutube()
  }
}
</script>

<style scoped>

</style>
