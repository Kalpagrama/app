<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
  //- tint for nodeClick event
  div(v-if="!active" :style=`{position: 'absolute', zIndex: 1001}` @click="$emit('nodeClick')").row.fit
  div(
    :style=`{position: 'relative', zIndex: zIndex+100, overflow: 'hidden', borderRadius: '10px', ...getStyles}`
    ).row.full-width.items-start.content-start.bg-black
    //- framgment action
    q-btn(v-if="active" round dense flat color="white" icon="more_vert" @click="fragmentAction()"
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
        @load="$event => imgForwardLoaded($event, pi)"
        @error="$event => imgForwardError($event, pi)")
    //- previews v-if="node.thumbUrl[pi]"
    img(
      v-for="(p, pi) in 2" :key="pi"
      v-show="node.meta.fragments[pi].thumbUrl && fragmentActive === pi"
      :src="node.meta.fragments[pi].thumbUrl"
      :style=`{width: '100%', objectFit: 'contain', zIndex: zIndex+50, ...getStylesPreview}`
      draggable="false"
      @load="$event => imgPreviewLoaded($event, pi)"
      @error="$event => imgPreviewError($event, pi)")
    //- active
    div(v-if="needFull && nodeFull && nodeFull.fragments" :style=`{position: 'absolute', zIndex: zIndex+90}`).row.fit
      div(v-for="(f, fi) in 2" :key="fi" v-show="fragmentActive === fi").row.fit
        node-fragment-video(v-if="nodeFull.fragments[fi].content.type === 'VIDEO'" :zIndex="zIndex" :url="nodeFull.fragments[fi].url" :visible="fi === fragmentActive && active" :active="active" :muted="muted")
        node-fragment-image(v-if="nodeFull.fragments[fi].content.type === 'IMAGE'" :zIndex="zIndex" :url="nodeFull.fragments[fi].url" :visible="fi === fragmentActive && active")
  node-name(v-if="!noName" :node="node")
  node-actions(v-if="!noActions" :node="node" :nodeFull="nodeFull")
  node-spheres(v-if="!noSpheres" :node="node" :nodeFull="nodeFull")
  node-timestamp(v-if="!noTimestamp" :node="node" :nodeFull="nodeFull")
  div(v-if="false").row.full-width
    small.full-width getStyles {{ getStyles }}
    small.full-width k: {{ k }}
    small.full-width width/height: {{ width }}/{{ height }}
    small.full-width widthWrapper: {{ widthWrapper }}
</template>

<script>
import nodeName from './node_name'
import nodeHeader from './node_header'
import nodeActions from './node_actions'
import nodeSpheres from './node_spheres'
import nodeTimestamp from './node_timestamp'
import nodeFragmentVideo from './node_fragment_video'
import nodeFragmentImage from './node_fragment_image'

export default {
  name: 'nodeTemplate__pip',
  components: {nodeName, nodeHeader, nodeActions, nodeSpheres, nodeTimestamp, nodeFragmentVideo, nodeFragmentImage},
  props: ['index', 'zIndex', 'node', 'nodeFull', 'active', 'needFull', 'inCreator', 'noActions', 'noTimestamp', 'noName', 'noSpheres', 'widthWrapper', 'muted'],
  data () {
    return {
      fragmentActive: 0,
      previewsLoaded: 0,
      width: 0,
      height: 0
    }
  },
  watch: {
    active: {
      immediate: true,
      handler (to, from) {
        this.$log('active CHANGED', to)
      }
    }
  },
  computed: {
    k () {
      return this.height / this.width
    },
    getHeight () {
      return this.widthWrapper * this.k
    },
    getStyles () {
      if (this.height === 0) {
        return {
          minHeight: '200px',
          maxHeight: '530px'
        }
      } else {
        return {
          minHeight: this.getHeight + 'px',
          maxHeight: this.getHeight + 'px',
          height: this.getHeight + 'px'
        }
      }
    },
    getStylesPreview () {
      if (this.height === 0) {
        return {}
      } else {
        return {
          height: '100%'
        }
      }
    }
  },
  methods: {
    fragmentAction () {
      this.$log('fragmentAction')
      this.$store.commit('ui/stateSet', ['fragmentActionDialogOpened', true])
      let fragment = this.nodeFull.fragments[this.fragmentActive]
      this.$log('fragment', fragment)
      this.$store.commit('ui/stateSet', ['fragment', fragment])
      this.$store.commit('ui/stateSet', ['node', this.nodeFull])
    },
    forwardClick () {
      this.$log('forwardClick')
      let a = this.fragmentActive === 0 ? 1 : 0
      this.fragmentActive = a
      this.$nextTick(() => {
        if (this.$refs.kvideo) this.$refs.kvideo[this.fragmentActive].play()
      })
    },
    imgPreviewLoaded (e, i) {
      if (i === 0) {
        this.$log('LOADED FIRST PREVIEW')
        this.width = e.path[0].width
        this.height = e.path[0].height
      }
    },
    imgPreviewError (e, i) {
    },
    imgForwardLoaded (e, i) {
    },
    imgForwardError (e, i) {
    }
  }
}
</script>
