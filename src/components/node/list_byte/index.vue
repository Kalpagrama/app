<template lang="pug">
div(
  ref="nodeListByteWrapper"
  :style=`{height: $q.screen.height+'px', overflow: 'hidden'}`
  v-touch-swipe.mouse.up.down="handleSwipe"
  ).row.full-width.justify-center.items-start.content-start.bg-grey-10
  div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
    q-dialog(v-model="nodeDialogOpened" position="bottom")
      .row.full-width.q-px-sm
        div(:style=`{borderRadius: '10px 10px 0 0'}`).row.fit.bg-grey-10
          h1.text-red hello
    q-btn(round push color="green" icon="blur_on"
      :style=`{position: 'fixed', zIndex: 3000, bottom: '16px', right: 'calc(50% - 20px)'}`)
    q-btn(round flat color="white" icon="more_vert" @click="nodeDialogOpened = true"
      :style=`{position: 'fixed', zIndex: 3000, bottom: '16px', right: '16px'}`)
    //- debug
    //- div(:style=`{position: 'fixed', top: 0, zIndex: 100000}`).row.full-width.bg-green
    //-   small.text-white nodeMiddle: {{ nodeMiddle }}
    node(
      v-for="(n,ni) in nodes" :key="n.oid" ctx="list" :accessKey="ni"
      :node="n" :index="ni" layout="byte"
      :active="ni === nodeMiddle"
      :visible="ni >= nodeMiddle-0 && ni <= nodeMiddle+1"
      :needFull="ni >= nodeMiddle-1 && ni <= nodeMiddle+1"
      :class=`{}`
      :style=`{position: 'relative', height: $q.screen.height+'px'}`
      v-observe-visibility=`{
        callback: nodeMiddleHandler,
        throttle: throttle,
        intersection: {
          rootMargin: -($q.screen.height/2-10)+'px 0px'
        }
      }`
      ).row.full-width
</template>

<script>
// TODO: swipe, visibility

export default {
  name: 'nodeListByte',
  components: {},
  props: ['nodes'],
  data () {
    return {
      nodeDialogOpened: false,
      nodeMiddle: -1,
      throttle: 0
    }
  },
  methods: {
    nodeMiddleHandler (isVisible, entry) {
      if (isVisible) {
        this.$log('nodeMiddleHandler', entry.target.accessKey)
        this.nodeMiddle = parseInt(entry.target.accessKey)
      }
    },
    handleSwipe (e) {
      this.$log('handleSwipe', e)
      let scrollTop = this.$refs.nodeListByteWrapper.scrollTop
      this.$log('scrollTop', scrollTop)
      if (e.direction === 'down') scrollTop -= this.$q.screen.height
      else scrollTop += this.$q.screen.height
      this.$tween.to(this.$refs.nodeListByteWrapper, 0.4, {scrollTop: scrollTop})
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
