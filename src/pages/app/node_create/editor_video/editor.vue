<template lang="pug">
div(style=`position: relative`).row.fit
  //- header
  //- div(style=`position: absolute; zIndex: 10; height: 50px; top: 0px; opacity: 0.3`
  //-   ).row.full-width.items-center.bg-black
  //-   q-btn(icon="more_vert" color="white" size="md" dense round flat)
  //- video... of different types...
  video(
    id="kveditor"
    poster="http://www.mediaelementjs.com/images/big_buck_bunny.jpg"
    width="100%"
    height="100%")
    source(type="video/youtube" src="http://www.youtube.com/watch?v=nOEw9iiopwI")
  //- range
  //- div(style=`position: absolute; zIndex: 10; height: 50px; bottom: 0px; opacity: 0.5`
  //-   ).row.full-width.bg-black бегунок
</template>

<script>
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'
export default {
  name: 'editorVideo',
  data () {
    return {
      editor: null
    }
  },
  async mounted () {
    this.$log('mounted', window)
    this.editor = new window.MediaElementPlayer('kveditor', {
      // pluginPath: '/path/to/shims/',
      // When using `MediaElementPlayer`, an `instance` argument
      // is available in the `success` callback
      // autoplay: true,
      showPosterWhenPaused: false,
      clickToPlayPause: true,
      iPadUseNativeControls: false,
      iPhoneUseNativeControls: false,
      AndroidUseNativeControls: false,
      success: (mediaElement, originalNode, instance) => {
        this.$log('MediaElementPlayer success!')
        this.$log('MediaElementPlayer mediaElement', mediaElement)
        this.$log('MediaElementPlayer originalNode!', originalNode)
        this.$log('MediaElementPlayer instance!', instance)
        // do things
      }
    })
    await this.$wait(3000)
    // this.player.play()
    this.$log('editor', this.editor)
    // setMuted
    // await this.$wait(3000)
    this.editor.setCurrentTime(100)
  }
}
</script>
