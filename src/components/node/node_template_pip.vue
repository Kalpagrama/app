<template lang="pug">
.row.full-width.items-start.content-start
  div(
    :style=`{position: 'relative', zIndex: zIndex+100, maxHeight: '100vh', overflow: 'hidden', borderRadius: '10px'}`
    ).row.full-width.items-start.content-start.bg-grey-3
    //- action
    q-btn(v-if="active" round dense flat color="white" icon="more_horiz" @click="$emit('action', ['menu', nodeFull.fragments[fragmentActive]])"
      :style=`{position: 'absolute', zIndex: 1000, right: '8px', top: '8px', background: 'rgba(0,0,0,0.5)'}`)
    //- forward
    div(@click="forwardClick()"
      :style=`{position: 'absolute', zIndex: zIndex+200, width: '100px', bottom: '10px', right: '10px', borderRadius: '10px', overflow: 'hidden', opacity: 0.7}`
      ).row.items-center.justify-center.cursor-pointer
      img(
        v-for="(p, pi) in 2" :key="pi"
        v-show="fragmentActive !== pi"
        :src="node.meta.fragments[pi].thumbUrl"
        :style=`{width: '100%', height: '100%', objectFit: 'contain'}` draggable="false"
        @load="$event => imgLoaded($event, `mini:${pi}`)"
        @error="$event => imgError($event, `mini:${pi}`)")
    //- previews v-if="node.thumbUrl[pi]"
    img(
      v-for="(p, pi) in 2" :key="pi"
      v-show="node.meta.fragments[pi].thumbUrl && fragmentActive === pi"
      :src="node.meta.fragments[pi].thumbUrl"
      :style=`{width: '100%', minHeight: '150px', objectFit: 'contain', zIndex: zIndex+50}`
      draggable="false"
      @load="$event => imgLoaded($event, `preview:${pi}`)"
      @error="$event => imgError($event, `preview:${pi}`)")
    //- active
    div(v-if="needFull && nodeFull && nodeFull.fragments" :style=`{position: 'absolute', zIndex: zIndex+90}`).row.fit
      div(v-for="(f, fi) in 2" :key="fi" v-show="fragmentActive === fi").row.fit
        node-fragment-video(v-if="nodeFull.fragments[fi].content.type === 'VIDEO'" :zIndex="zIndex" :url="nodeFull.fragments[fi].url" :visible="fi === fragmentActive && active")
        node-fragment-image(v-if="nodeFull.fragments[fi].content.type === 'IMAGE'" :zIndex="zIndex" :url="nodeFull.fragments[fi].url" :visible="fi === fragmentActive && active")
  node-name(v-if="!noName" :node="node")
  node-actions(v-if="!noActions" :node="node" :nodeFull="nodeFull")
  node-spheres(v-if="!noSpheres" :node="node" :nodeFull="nodeFull")
  node-timestamp(v-if="!noTimestamp" :node="node" :nodeFull="nodeFull")
</template>

<script>
import nodeName from './node_name'
import nodeHeader from './node_header'
import nodeActions from './node_actions'
import nodeSpheres from './node_spheres'
import nodeTimestamp from './node_timestamp'
import nodeFragmentVideo from './node_fragment_video'
import nodeFragmentImage from './node_fragment_image'
import kMenuPopup from 'components/k_menu_popup'

export default {
  name: 'nodeTemplate__pip',
  components: {nodeName, nodeHeader, nodeActions, nodeSpheres, nodeTimestamp, nodeFragmentVideo, nodeFragmentImage, kMenuPopup},
  props: ['index', 'zIndex', 'node', 'nodeFull', 'active', 'needFull', 'inCreator', 'noActions', 'noTimestamp', 'noName', 'noSpheres'],
  data () {
    return {
      fragmentActive: 0
    }
  },
  computed: {
    getHeight () {
      let w = this.$q.screen.width
      if (w > 500) return 500
      else return w
    }
  },
  methods: {
    forwardClick () {
      this.$log('forwardClick')
      let a = this.fragmentActive === 0 ? 1 : 0
      this.fragmentActive = a
      this.$nextTick(() => {
        if (this.$refs.kvideo) this.$refs.kvideo[this.fragmentActive].play()
      })
    },
    imgError (e, msg) {
      // this.$log('imgError', msg)
    },
    imgLoaded (e, msg) {
      // this.$log('imgLoaded', msg)
    },
    contentExplore () {
      this.$log('contentExplore')
      this.$router.push(`/app/content/${this.nodeFull.fragments[this.fragmentActive].content.oid}`)
    },
    fragmentWorkspace () {
      this.$log('fragmentWorkspace')
      let fragment = JSON.parse(JSON.stringify(this.nodeFull.fragments[this.fragmentActive]))
      // TODO: take thumbUrl from node.meta.fragments
      // fragment.thumbUrl = this.node.thumbUrl[fi]
      this.$store.commit('workspace/state', ['fragment', fragment])
      this.$store.commit('ui/state', ['fragmentDialogOpened', true])
    },
    async fragmentAction (a, fi) {
      this.$log('fragmentAction', a)
      await this.$wait(200)
      switch (a.id) {
        case 'content_explore': {
          this.$log('fragmentAction', a.id)
          this.$router.push(`/app/content/${this.nodeFull.fragments[fi].content.oid}`)
          break
        }
        case 'fragment_workspace': {
          this.$log('fragmentAction', a.id)
          let fragment = JSON.parse(JSON.stringify(this.nodeFull.fragments[fi]))
          this.$store.commit('workspace/state', ['fragment', fragment])
          this.$store.commit('ui/state', ['dialogOpened', true])
          // this.$nextTick(() => {
          //   this.$store.commit('ui/state', ['dialogOpened', true])
          // })
          break
        }
      }
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
