<template lang="pug">
div().row.full-width.items-start.content-start
  node-header(:node="node" :nodeFull="nodeFull")
    template(v-slot:actions)
      k-menu-popup(name="Choose template" :actions="nodeTemplates" @action="$event => $emit('nodeTemplate', $event.id)")
        q-btn(icon="brush" color="grey-5" round flat)
  //- ...getRadius, overflow: 'hidden'
  div(:style=`{position: 'relative', zIndex: zIndex+100, maxHeight: getHeight+'px'}`
    ).row.full-width.items-start.content-start.bg-grey-3
    //- actions
    //- .row.full-width.justify-end
    k-menu-popup(v-if="active && nodeFull"
      :style=`{position: 'absolute', zIndex: zIndex+1000, top: '8px', right: '8px'}`
      :name="nodeFull.fragments[fragmentActive].content.name" :actions="fragmentActions"
      @action="$event => fragmentAction($event, fragmentActive)")
      q-btn(icon="more_horiz" color="white" round flat
        :style=`{}`).shadow-1
    //- forward
    div(@click="forwardClick()"
      :style=`{position: 'absolute', zIndex: zIndex+200, width: '100px', bottom: '20px', right: '20px', borderRadius: '4px', overflow: 'hidden', opacity: 0.7}`
      ).row.items-center.justify-center.cursor-pointer
      img(
        v-for="(p, pi) in 2" :key="pi"
        v-show="fragmentActive !== pi"
        :src="node.thumbUrl[pi]"
        :style=`{width: '100%', height: '100%', objectFit: 'contain'}` draggable="false"
        @load="$event => imgLoaded($event, `mini:${pi}`)"
        @error="$event => imgError($event, `mini:${pi}`)")
    //- previews
    img(
      v-for="(p, pi) in 2" :key="pi"
      v-show="fragmentActive === pi"
      :src="node.thumbUrl[pi]"
      :style=`{width: '100%', minHeight: '150px', objectFit: 'contain', zIndex: zIndex+50}`
      draggable="false"
      @load="$event => imgLoaded($event, `preview:${pi}`)"
      @error="$event => imgError($event, `preview:${pi}`)")
    //- active
    div(v-if="needFull && nodeFull" :style=`{position: 'absolute', zIndex: zIndex+90}`).row.fit
      div(v-for="(f, fi) in 2" :key="fi" v-show="fragmentActive === fi").row.fit
        node-fragment-video(v-if="nodeFull.fragments[fi].content.type === 'VIDEO'" :zIndex="zIndex" :url="nodeFull.fragments[fi].url" :visible="fi === fragmentActive && active")
        node-fragment-image(v-if="nodeFull.fragments[fi].content.type === 'IMAGE'" :zIndex="zIndex" :url="nodeFull.fragments[fi].url" :visible="fi === fragmentActive && active")
  //- name
  node-name(:node="node")
  node-actions(:node="node" :nodeFull="nodeFull")
  node-spheres(:node="node" :nodeFull="nodeFull")
  node-timestamp(:node="node" :nodeFull="nodeFull")
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
  props: ['index', 'zIndex', 'node', 'nodeFull', 'active', 'needFull', 'nodeTemplates'],
  data () {
    return {
      fragmentActive: 0,
      fragmentActions: [
        {id: 'explore_content', name: 'Исследовать контент'},
        {id: 'fork_fragment', name: 'Создать ядро с этим фрагментом'},
        {id: 'add_content_to_workspace', name: 'Добавить конент в мастерскую'}
      ]
    }
  },
  computed: {
    fragment () {
      if (this.nodeFull) {
        return this.nodeFull.fragments[this.fragmentActive]
      } else {
        return null
      }
    },
    getHeight () {
      let w = this.$q.screen.width
      if (w > 500) return 500
      else return w
    },
    getRadius () {
      return {
        borderBottomLeftRadius: '100%6px',
        borderBottomRightRadius: '100%6px',
        borderTopLeftRadius: '100%6px',
        borderTopRightRadius: '100%6px'
      }
    }
  },
  methods: {
    async fragmentAction (a, fi) {
      this.$log('fragmentAction', a)
      await this.$wait(200)
      switch (a.id) {
        case 'explore_content': {
          this.$log('fragmentAction', a.id)
          this.$router.push(`/app/content/${this.nodeFull.fragments[fi].content.oid}`)
          break
        }
        case 'fork_fragment': {
          this.$log('fragmentAction', a.id)
          // prepare node
          let f = JSON.parse(JSON.stringify(this.nodeFull.fragments[fi]))
          let n = { name: '', thumbUrl: [], fragments: [], spheres: [], author: this.$store.state.auth.user }
          n.fragments[fi] = {
            oid: f.content.oid,
            relativePoints: f.relativePoints.map(p => {
              delete p.__typename
              return p
            }),
            relativeScale: f.relativeScale,
            url: f.url,
            content: f.content
          }
          n.thumbUrl[fi] = this.node.thumbUrl[fi]
          this.$log('forkFragment', n)
          // save node to store
          this.$store.commit('workspace/state', ['node', n])
          this.$router.push('/app/create/node')
          break
        }
        case 'add_content_to_workspace': {
          this.$log('fragmentAction', a.id)
          break
        }
        case 'add_node_to_workspace': {
          this.$log('fragmentAction', a.id)
          break
        }
      }
    },
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
