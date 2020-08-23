<template lang="pug">
//-  @mouseenter="active = true"
//-  @mouseleave="active = false"
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px', overflow: 'hidden',
    //- minHeight: '200px',
  }`
  ).row.full-width.items-start.content-start.b-50
  //- div(:style=`{position: 'absolute',zIndex: 1000, transform: 'translate3d(0,0,0)', top: '0px', opacity: 0.5}`).row.full-width.q-pa-sm.b-40
    small.text-white.full-width isActive: {{isActive}}
    small.text-white.full-width isVisible: {{isVisible}}
  .row.full-width
    slot(name="header")
  //- composition wrapper
  div(
    :style=`{
      position: 'relative', borderRadius: '10px', overflow: 'hidden',
      cursor: 'pointer',
    }`
    ).row.full-width.items-start.content-start
    //- content
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      q-btn(
        v-if="composition && isActive"
        @click="$router.push('/content/'+composition.layers[0].contentOid)"
        round flat color="grey-2" icon="select_all"
        :style=`{
          position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
          top: '0px', left: '0px',
          background: 'rgba(0,0,0,0.2)',
        }`)
    //- bookmark
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      q-btn(
        v-if="isActive"
        round flat color="grey-2" icon="bookmark_outline"
        :style=`{
          position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
          top: '0px', right: '0px',
          background: 'rgba(0,0,0,0.2)',
        }`)
    img(
      :src="thumbUrl" draggable="false"
      :style=`{borderRadius: '10px', overflow: 'hidden', userSelect: 'none'}`
      ).full-width
    div(
      v-if="composition"
      :style=`{
        position: 'absolute', zIndex: 200, transform: 'translate3d(0,0,0)',
      }`
      ).row.fit
      video(
        v-if="composition.outputType === 'VIDEO'"
        @click="videoClicked"
        @loadedmetadata="videoLoadedmetadata"
        ref="nodeLiteVideoRef" :src="composition.url"
        :muted="muted"
        playsinline loop
        :style=`{
          objectFit: 'contain',
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).fit
  //- essence link...
  router-link(
    :to="'/node/'+node.oid"
    :class=`{
    }`
    :style=`{
      cursor: 'pointer'
    }`
    ).row.full-width.items-center.q-py-sm.q-px-md
    span(:style=`{userSelect: 'none'}`).text-white.text-bold {{ node.name }}
  //- .row.full-width
    slot(name="footer" :node="nodeFull")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeLite',
  props: ['node', 'isActive', 'isVisible'],
  data () {
    return {
      nodeFull: null,
      composition: null,
      muted: true
    }
  },
  computed: {
    thumbUrl () {
      return this.node.meta.items[0].thumbUrl
    }
  },
  watch: {
    isActive: {
      handler (to, from) {
        this.$log('isActive TO', to, this.node.name)
        if (!this.$refs.nodeLiteVideoRef) return
        if (to) {
          this.$refs.nodeLiteVideoRef.play()
        }
        else {
          this.$refs.nodeLiteVideoRef.pause()
        }
      }
    },
    isVisible: {
      immediate: true,
      async handler (to, from) {
        this.$log('isVisible TO', to, this.node.name)
        if (to) {
          if (!this.nodeFull) this.nodeFull = await this.$rxdb.get(RxCollectionEnum.OBJ, this.node.oid)
          if (!this.composition) this.composition = await this.$rxdb.get(RxCollectionEnum.OBJ, this.nodeFull.items[0].oid)
        }
      }
    },
  },
  methods: {
    videoClicked (e) {
      this.$log('videoClicked', e)
      if (this.muted) {
        this.muted = false
        e.target.play()
      }
      else {
        if (e.target.paused) e.target.play()
        else e.target.pause()
      }
    },
    videoLoadedmetadata (e) {
      // this.$log('videoLoadedmetadata', e)
      if (this.isActive) {
        e.target.play()
      }
    },
    nodeEssenceClick () {
      this.$log('nodeEssenceClick')
      this.$router.push(`/node/${this.node.oid}`).catch(e => e)
    }
  }
}
</script>
