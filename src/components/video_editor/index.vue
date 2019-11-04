<template lang="pug">
q-layout.bg-black
  q-resize-observer(@resize="onResize")
  div(:style=`{position: 'absolute', top: '0px', left: '0px', zIndex: 10000, height: '70px', width: '70px'}`).row.items-center.justify-center
    q-btn(
      round flat color="white" icon="menu" @click="$refs.menuLocalDialog.toggle()"
      :style=`{background: 'rgba(0,0,0,0.4)'}`)
  div(:style=`{position: 'absolute', top: '0px', right: '0px', zIndex: 10000, height: '70px', width: '70px'}`).row.items-center.justify-center
    q-btn(
      round flat color="white" icon="clear" @click="$emit('hide')"
      :style=`{background: 'rgba(0,0,0,0.4)'}`)
  q-dialog(ref="menuLocalDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    menu-local(
      v-if="fragment" @fragment="$emit('fragment')"
      :fragment="fragment" :now="now" :duration="duration" @hide="$refs.menuLocalDialog.hide()")
  q-dialog(ref="menuKalpaDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    menu-kalpa(
      v-if="fragment"
      :fragment="fragment" :now="now" :duration="duration" @hide="$refs.menuKalpaDialog.hide()")
  q-page-container
    k-video(
      ref="kvideo" :src="fragmentInput.content.url" autoplay playsinline type="video/mp4" crossorigin="Anonymous"
      :fragment="fragment" :timeline="true"
      @duration="duration = $event" @now="now = $event"
      :style=`{position: 'relative', maxHeight: $q.screen.height/2-10+'px', height: $q.screen.height/2-10+'px', width: '100%'}`)
  //- points-editor(
  //-   v-if="fragment" :now="now" :duration="duration" :fragment="fragment" :width="width" :video="$refs.kvideo"
  //-   @create="pointCreate()"
  //-   :style=`{position: 'absolute', height: $q.screen.height/2+'px', bottom: '0px'}`)
  vegas(
    v-if="fragment" :fragment="fragment" :now="now" :duration="duration" :width="width" :video="$refs.kvideo"
    :style=`{position: 'absolute', bottom: '0px', height: $q.screen.height/2+'px'}`)
</template>

<script>
import menuLocal from './menu_local'
import menuKalpa from './menu_kalpa'
import pointsEditor from './points_editor'
import videoTools from './video_tools'
import vegas from './vegas'

export default {
  name: 'videoEditor',
  components: {menuLocal, menuKalpa, pointsEditor, videoTools, vegas},
  props: {
    fragmentInput: {type: Object},
    inCreator: {type: Boolean, default () { return false }
    }
  },
  data () {
    return {
      width: 0,
      height: 0,
      duration: 0,
      now: 0,
      fragment: null,
      pointsMax: 20
    }
  },
  watch: {
    fragment: {
      handler (to, from) {
        this.$log('fragment CHANGED', to)
      }
    }
  },
  methods: {
    onResize (e) {
      this.$log('onResize', e)
      this.$set(this, 'width', e.width)
      this.$set(this, 'height', e.height)
    },
    pointCreate () {
      this.$log('pointCreate')
      if (this.fragment.relativePoints.length === this.pointsMax) return
      let start = this.now
      let end = this.now + 3 > this.duration ? this.duration : this.now + 3
      this.fragment.relativePoints.push({x: start})
      this.fragment.relativePoints.push({x: end})
    },
    async ready () {
      this.$log('ready start')
      // validate fragment length
      this.$refs.kvideo.pause()
      // create previews for every point
      // // create canvas
      // let canvas = document.createElement('canvas')
      // canvas.width = this.fragment.content.width
      // canvas.height = this.fragment.content.height
      // let ctx = canvas.getContext('2d')
      // // loop fragments
      // for (let i = 0; i < this.fragment.relativePoints.length; i++) {
      //   let index = i + 1
      //   if (index % 2 !== 0) {
      //     let point = this.fragment.relativePoints[i]
      //     await this.$refs.kVideo.go(point.x)
      //     ctx.drawImage(this.$refs.kvideo, 0, 0, canvas.width, canvas.height)
      //     await this.$wait(1000)
      //     this.fragment.thumbUrl[i] = canvas.toDataURL('image/jpeg', 0.5)
      //   }
      // }
      this.$log('ready done')
      this.$emit('fragment', this.fragment)
    },
    async cancel () {
      this.$log('cancel start')
      this.$emit('fragment', this.fragmentInput)
      this.fragment = null
      this.$log('cancel done')
    }
  },
  async mounted () {
    this.$log('mounted')
    this.$set(this, 'fragment', JSON.parse(JSON.stringify(this.fragmentInput)))
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>

<style lang="stylus">
</style>
