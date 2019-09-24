<template lang="pug">
.row.full-width.items-start.content-start
  node-header(v-if="false" :node="node" :nodeFull="nodeFull" :inCreator="inCreator")
    template(v-slot:actions)
      k-menu-popup(name="Choose template" :actions="nodeTemplates" @action="$event => $emit('nodeTemplate', $event.id)")
        q-btn(icon="brush" color="grey-5" round flat)
  //- wrapper maxHeight: getHeight+'px'
  div(
    :style=`{position: 'relative', zIndex: zIndex+100, maxHeight: '100vh', overflow: 'hidden', borderRadius: '10px'}`
    ).row.full-width.items-start.content-start.bg-grey-3
    //- actions
    //- .row.full-width.justify-end
    k-menu-popup(v-if="active && nodeFull"
      :style=`{position: 'absolute', zIndex: zIndex+1000, top: '8px', right: '8px'}`
      :name="nodeFull.fragments[fragmentActive].content.name" :actions="fragmentActions"
      @action="$event => fragmentAction($event, fragmentActive)")
      q-btn(icon="more_horiz" color="white" round flat dense
        :style=`{opacity: 0.5}`).shadow-1.bg-grey-9
    //- forward
    div(@click="forwardClick()"
      :style=`{position: 'absolute', zIndex: zIndex+200, width: '100px', bottom: '10px', right: '10px', borderRadius: '10px', overflow: 'hidden', opacity: 0.7}`
      ).row.items-center.justify-center.cursor-pointer
      img(
        v-for="(p, pi) in 2" :key="pi"
        v-show="fragmentActive !== pi"
        :src="node.thumbUrl[pi]"
        :style=`{width: '100%', height: '100%', objectFit: 'contain'}` draggable="false"
        @load="$event => imgLoaded($event, `mini:${pi}`)"
        @error="$event => imgError($event, `mini:${pi}`)")
    //- previews v-if="node.thumbUrl[pi]"
    img(
      v-for="(p, pi) in 2" :key="pi"
      v-show="node.thumbUrl[pi] && fragmentActive === pi"
      :src="node.thumbUrl[pi]"
      :style=`{width: '100%', minHeight: '150px', objectFit: 'contain', zIndex: zIndex+50}`
      draggable="false"
      @load="$event => imgLoaded($event, `preview:${pi}`)"
      @error="$event => imgError($event, `preview:${pi}`)")
    //- div(
    //-   v-for="(p, pi) in 2" :key="pi"
    //-   :style=`{height: '240px'}`).row.full-width.bg-grey-3.br
    //- active
    div(v-if="needFull && nodeFull && nodeFull.fragments" :style=`{position: 'absolute', zIndex: zIndex+90}`).row.fit
      div(v-for="(f, fi) in 2" :key="fi" v-show="fragmentActive === fi").row.fit
        node-fragment-video(v-if="nodeFull.fragments[fi].content.type === 'VIDEO'" :zIndex="zIndex" :url="nodeFull.fragments[fi].url" :visible="fi === fragmentActive && active")
        node-fragment-image(v-if="nodeFull.fragments[fi].content.type === 'IMAGE'" :zIndex="zIndex" :url="nodeFull.fragments[fi].url" :visible="fi === fragmentActive && active")
  node-name(:node="node")
  node-actions(:node="node" :nodeFull="nodeFull")
    template(v-slot:actions)
      k-menu-popup(name="Choose template" :actions="nodeTemplates" @action="$event => $emit('nodeTemplate', $event.id)")
        q-btn(icon="brush" color="grey-5" round flat)
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
        {id: 'content_explore', name: 'Исследовать контент'},
        {id: 'content_workspace', name: 'Добавить контент в мастерскую'},
        {id: 'fragment_workspace', name: 'Добавить фрагмент в мастерскую'},
        {id: 'fragment_create', name: 'Создать ядро с этим фрагментом'}
      ]
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
    fragmentWorkspace (fi) {
      let r = this.$strip(JSON.parse(JSON.stringify(this.nodeFull)))
      r.oid = `${r.oid}-${Date.now()}`
      r.fragments = r.fragments.filter((f, i) => (i === fi))
      r.thumbUrl = this.node.thumbUrl.filter((t, i) => (i === fi))
      r.createdAt = Date.now()
      this.$store.commit('workspace/addNode', r)
      return r
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
        case 'content_workspace': {
          this.$log('fragmentAction', a.id)
          // add contentWorksapce aciton dispatch
          await this.$store.dispatch('workspace/addWSContent', this.nodeFull.fragments[fi].content)
          break
        }
        case 'fragment_workspace': {
          this.$log('fragmentAction', a.id)
          this.fragmentWorkspace(fi)
          break
        }
        case 'fragment_create': {
          this.$log('fragmentAction', a.id)
          // add to workspace
          let n = this.fragmentWorkspace(fi)
          // save node to store
          this.$store.commit('workspace/state', ['draft', n])
          await this.$wait(200)
          // go to create
          this.$router.push('/app/create')
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
