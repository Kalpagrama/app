<template lang="pug">
.column.fit.bg-white
  q-dialog(ref="sourceUrlDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    source-url(@hide="$refs.sourceUrlDialog.hide()" @oid="contentFound")
  q-dialog(ref="sourceDeviceDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    source-device(@hide="$refs.sourceDeviceDialog.hide()")
  q-dialog(ref="sourceWsDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    source-ws(@hide="$refs.sourceWsDialog.hide()" :type="wsType" @item="fragmentFound")
  div(:style=`{height: '60px'}`).row.full-width.items-center
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold Найти фрагмент
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="clear" @click="$emit('hide')")
  .col.full-width.scroll
    .row.fit.items-start.justify-center
      div(:style=`{maxWidth: $q.screen.width > 500 ? '500px' : '100%'}`).row.full-width.items-start.content-start.q-px-md.q-pt-lg
        .row.full-width.q-pa-sm
          span.text-bold Загрузить
        .row.full-width.q-mb-lg
          div(:style=`{height: '50px', borderRadius: '10px'}` @click="$refs.sourceUrlDialog.show()").col.bg-grey-2.cursor-pointer
            .row.fit.items-center.justify-center
              span по URL
          div(:style=`{height: '50px', borderRadius: '10px'}` @click="$refs.sourceDeviceDialog.show()").col.bg-grey-2.q-ml-sm.cursor-pointer
            .row.fit.items-center.justify-center
              span с устройства
        .row.full-width.q-pa-sm
          span.text-bold Выбрать из мастерской
        .row.full-width
          div(
            v-for="(w, wi) in wsStats" :key="wi" @click="wsType = w.id, $refs.sourceWsDialog.show()"
            :style=`{height: '50px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.q-px-md.bg-grey-2.q-mb-md.cursor-pointer
            span {{ w.name }}
            .col
            span {{ w.count }}
</template>

<script>
import sourceDevice from './source_device'
import sourceUrl from './source_url'
import sourceWs from './source_ws'

export default {
  name: 'fragmentFinder',
  components: {sourceDevice, sourceUrl, sourceWs},
  data () {
    return {
      source: undefined,
      wsType: undefined
    }
  },
  computed: {
    wsStats () {
      return [
        {id: 'bookmarks', name: 'Заметки', count: this.$store.state.workspace.workspace.bookmarks.length},
        {id: 'contents', name: 'Контент', count: this.$store.state.workspace.workspace.contents.length},
        {id: 'fragments', name: 'Фрагменты', count: this.$store.state.workspace.workspace.fragments.length},
        {id: 'nodes', name: 'Ядра', count: this.$store.state.workspace.workspace.nodes.length}
      ]
    }
  },
  methods: {
    async contentFound (oid) {
      this.$log('contentFound', oid)
      let content = await this.contentGet(oid)
      let fragment = await this.fragmentCreate(content)
      this.$log('fragment', fragment)
      this.$emit('fragment', fragment)
      this.$emit('hide')
    },
    fragmentUse () {},
    fragmentFound (i) {
      this.$log('fragmentFound', i)
      this.$emit('fragment', i)
      this.$emit('hide')
    },
    async fragmentCreate (content, f) {
      this.$log('fragmentCreate', content, f)
      let uid = `${content.oid}-${Date.now()}`
      let fragment = null
      switch (content.type) {
        case 'VIDEO': {
          fragment = {
            uid: uid,
            name: content.name,
            relativeCuts: [],
            relativeScale: content.duration,
            content: content,
            thumbUrl: ''
          }
          break
        }
        case 'IMAGE': {
          fragment = {
            uid: uid,
            name: '',
            relativeCuts: [],
            relativeScale: 0.00,
            content: content,
            thumbUrl: []
          }
          // this.$set(this.fragments, uid, fragment)
          break
        }
      }
      return fragment
    },
    async contentGet (oid) {
      this.$log('contentGet start', oid)
      let content = await this.$store.dispatch('objects/get', { oid, fragmentName: 'contentFragment', priority: 0 })
      this.$log('contentGet done', content)
      return content
    }
  },
  mounted () {
    this.$log('mounted')
    // url, create content, and then empty fragment
    // device, create content and then empty fragment
    // from bookmark, create content and then empty fragment
    // from content, create empty fragment
    // from fragment, take ready fragment
    // from draft, take all the fragments?
    // add bookmark, add content, add fragment
    // by url, by device, add to workspace, add what?
    // ws we got it?
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
