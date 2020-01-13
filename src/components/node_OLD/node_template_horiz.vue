<template lang="pug">
div().row.full-width.items-start.content-start
  node-header(:node="node" :nodeFull="nodeFull")
    template(v-slot:actions)
      k-menu-popup(name="Choose template" :actions="nodeTemplates" @action="$event => $emit('nodeTemplate', $event.id)")
        q-btn(icon="brush" color="grey-5" round flat)
  div(:style=`{position: 'relative', zIndex: zIndex+100}`).row.full-width.items-start.content-start.bg-grey-3
    //- actions
    node-name(:node="node" :style=`{order: 1}`)
    //- previews
    div(
       v-for="(p, pi) in 2" :key="pi"
       :style=`{position: 'relative', order: pi*2, overflow: 'hidden', ...getRadius}`
      ).row.full-width.items-start
      k-menu-popup(v-if="active && nodeFull"
        :style=`{position: 'absolute', zIndex: zIndex+1000, top: '8px', right: '8px'}`
        :name="nodeFull.fragments[pi].content.name" :actions="fragmentActions"
        @action="$event => fragmentAction($event, pi)")
        q-btn(icon="more_horiz" color="white" round flat
          :style=`{}`).shadow-1
      img(
        :src="node.thumbUrl[pi]"
        :style=`{width: '100%', objectFit: 'contain', zIndex: zIndex+50}`
        draggable="false"
        @load="$event => imgLoaded($event, `preview:${pi}`)"
        @error="$event => imgError($event, `preview:${pi}`)")
      //- active
      div(v-if="needFull && nodeFull" :style=`{position: 'absolute', zIndex: zIndex+90}`).row.fit
        node-fragment-video(v-if="nodeFull.fragments[pi].content.type === 'VIDEO'" :zIndex="zIndex" :url="nodeFull.fragments[pi].url" :visible="active && pi === 0")
        node-fragment-image(v-if="nodeFull.fragments[pi].content.type === 'IMAGE'" :zIndex="zIndex" :url="nodeFull.fragments[pi].url" :visible="active")
  //- name
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
  props: ['index', 'zIndex', 'node', 'nodeFull', 'active', 'needFull', 'nodeTemplates', 'inCreator'],
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
      this.$logD('fragmentAction', a)
      await this.$wait(200)
      switch (a.id) {
        case 'explore_content': {
          this.$logD('fragmentAction', a.id)
          this.$router.push(`/app/content/${this.nodeFull.fragments[fi].content.oid}`)
          break
        }
        case 'fork_fragment': {
          this.$logD('fragmentAction', a.id)
          // prepare node
          let f = JSON.parse(JSON.stringify(this.nodeFull.fragments[fi]))
          let n = { name: '', thumbUrl: [], fragments: [], spheres: [], author: this.$store.getters.currUser }
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
          this.$logD('forkFragment', n)
          // save node to store
          this.$store.commit('workspace/stateSet', ['node', n])
          this.$router.push('/app/create/node')
          break
        }
        case 'add_content_to_workspace': {
          this.$logD('fragmentAction', a.id)
          break
        }
        case 'add_node_to_workspace': {
          this.$logD('fragmentAction', a.id)
          break
        }
      }
    },
    imgError (e, msg) {
      // this.$logD('imgError', msg)
    },
    imgLoaded (e, msg) {
      // this.$logD('imgLoaded', msg)
    }
  },
  mounted () {
    // this.$logD('mounted')
  },
  beforeDestroy () {
    // this.$logD('beforeDestroy')
  }
}
</script>
