<template lang="pug">
q-layout(
  view="hHh Lpr lff" container
  :style=`{
    zIndex: 4000, width: 600+'px', height: 600+'px',
    borderRadius: '10px', overflow: 'hidden'}`).b-30
  q-header(reveal)
    .row.full-width.justify-center
      div(:style=`{maxWidth: '800px',}`
        ).row.full-width.items-center.content-center.q-px-sm.b-30
        //- header
        .row.full-width.items-center.content-center.q-py-sm
          q-btn(round flat color="white" icon="insert_link" @click="$emit('close')")
          span(:style=`{fontSize: '18px',}`).text-bold.text-white Link this node
        //- with picker
        div(
          v-if="withType"
          :style=`{paddingLeft: '40px',}`).row.full-width.items-center.content-center
          span(:style=`{fontSize: '18px',}`).text-bold.text-white with
          q-btn(
            flat dense no-caps color="white"
            icon-right="keyboard_arrow_down"
            ).b-40.q-mx-sm
            span(:style=`{fontSize: '18px',}`).text-white.text-bold.q-mx-sm {{ withTypes.find(t => t.id === withType).name }}
            q-menu(fit)
              div(:style=`{maxWidth: '150px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-40
                q-btn(
                  v-for="t in withTypes" :key="t.id" @click="withType = t.id, item = null"
                  flat dense no-caps color="white" align="left"
                  v-close-popup).full-width
                  span(:style=`{fontSize: '18px',}`).text-white.text-bold.q-mx-sm {{ t.name }}
        //- filters
        div(v-if="!item && withType").row.full-width.items-start.content-start.q-pa-sm
          div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
            q-input(
              v-model="searchString"
              filled dark dense color="grey-6"
              placeholder="Search").full-width
  q-page-container
    .row.full-width.q-px-sm
      //- item pick find...
      div(v-if="!item && withType").row.full-width
        component(
          :is="`with-${withType}`" :searchString="searchString"
          @item="item = $event")
      div(v-if="item").row.full-width
        //- item wrapper preview
        div(:style=`{paddingLeft: '40px', position: 'relative',}`).row.full-width.q-py-sm.q-mb-md
          q-btn(
            @click="item = null"
            round flat dense color="grey-6" icon="clear"
            :style=`{position: 'absolute', zIndex: 1000, left: '2px', top: 'calc(50% - 20px)',}`)
          ws-node-item(
            v-if="item.wsItemType === 'WS_NODE'" :node="item"
            :style=`{maxWidth: '50%'}`)
          div(
            v-if="item.wsItemType === 'WS_SPHERE'"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`
            ).row.b-50.q-pa-md
            q-icon(name="blur_on" size="40px" color="white").q-mr-sm
            span(:style=`{fontSize: '24px',}`).text-white.text-bold.q-mr-lg {{ item.name }}
          ws-content-item(
            v-if="item.wsItemType === 'WS_CONTENT'" :content="item"
            :style=`{}`
            ).full-width
        //- by pick
        div(:style=`{paddingLeft: '40px',}`).row.full-width.items-center.content-center
          span(:style=`{fontSize: '18px',}`).text-bold.text-white how
          q-btn(
            flat dense no-caps color="white"
            icon-right="keyboard_arrow_down"
            ).b-40.q-mx-sm
            span(:style=`{fontSize: '18px',}`).text-white.text-bold.q-mx-sm {{ byTypes.find(t => t.id === byType).name }}
            q-menu(fit)
              div(:style=`{maxWidth: '150px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-40
                q-btn(
                  v-for="t in byTypes" :key="t.id" @click="byType = t.id"
                  flat dense no-caps color="white" align="left"
                  v-close-popup).full-width
                  span(:style=`{fontSize: '18px',}`).text-white.text-bold.q-mx-sm {{ t.name }}
        //- by body
        div(
          v-if="byType === 'essence'"
          :style=`{paddingLeft: '40px',}`).row.full-width.q-py-sm.q-mb-md
          div(:style=`{position: 'relative', zIndex: 1000, borderRadius: '10px', overflow: 'hidden'}`).full-width
            q-input(
              v-model="name"
              filled dark color="grey-6" type="textarea" autogrow autofocus
              placeholder="How are dots connected?"
              ).full-width
        //- confirm
        div(:style=`{paddingLeft: '40px',}`).row.full-width.q-py-sm
          q-btn(
            @click="link()"
            color="green" no-caps size="lg" align="left"
            icon="insert_link"
            :loading="linking"
            :style=`{minWidth: '200px',}`)
            span(:style=`{}`).text-white.text-bold.q-ml-md Link
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import withContent from './with_content.vue'
import withSphere from './with_sphere.vue'
import withNode from './with_node.vue'

export default {
  name: 'pageApp_node_nodeLinker',
  components: {withContent, withSphere, withNode},
  props: ['node'],
  data () {
    return {
      searchString: '',
      withType: null,
      byType: 'essence',
      item: null,
      linking: false,
      name: '',
    }
  },
  computed: {
    withTypes () {
      return [
        {id: 'sphere', name: 'sphere'},
        {id: 'node', name: 'node'},
        {id: 'content', name: 'content'}
      ]
    },
    byTypes () {
      return [
        {id: 'essence', name: 'по сути'},
        {id: 'prich', name: 'причина'},
        {id: 'sled', name: 'следсвие'},
        {id: 'asso', name: 'ассоциация'}
      ]
    },
    width () {
      if (this.$q.screen.width < 800) return this.$q.screen.width
      else return 800
    },
  },
  methods: {
    async link () {
      this.$log('link')
      this.linking = true
      await this.$wait(1000)
      this.linking = false
    },
  },
  async mounted () {
    this.$log('mounted')
    await this.$wait(500)
    this.withType = 'node'
  }
}
</script>
