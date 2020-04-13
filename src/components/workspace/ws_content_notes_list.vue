<style lang="stylus">
.ws-content {
  color: white;
  &:hover {
    color: #4caf50 !important;
  }
}
</style>

<template lang="pug">
.column.fit
  //- add content
  div(
    :style=`{height: '70px'}`
    ).row.full-width.justify-center.q-pa-sm
    div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width
      content-finder(
        :sources="['url', 'device']"
        @content="contentFound")
  //- actions, list, gallery, feed, list-expanded
  div(v-if="false" :style=`{height: '60px'}`).row.full-width
    //- .col.full-height
    div(:style=`{width: '60px', height: '60px'}`).row.items-center.justify-center
      q-btn(round flat color="green" icon="search" @click="contentsFindStart()")
    .col.full-height
      //- TODO: reuse
      div(v-if="false").row.fit.items-center.justify-center
        q-btn(dense :flat="mode !== 'list'" color="green" no-caps @click="mode = 'list'").q-px-sm.q-mx-sm List
        q-btn(dense :flat="mode !== 'gallery'" color="green" no-caps @click="mode = 'gallery'").q-px-sm Gallery
        q-btn(dense :flat="mode !== 'feed'" color="green" no-caps @click="mode = 'feed'").q-px-sm.q-mx-sm Feed
  .col.full-width.scroll
    .row.full-width.justify-center.q-px-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.maxWidthPage+'px', paddingBottom: '80px'}`).row.full-width.items-start.content-start
        //- kalpa-loader(type="wsContents" :variables=`{}`)
        //-   template(v-slot:items=`{items}`)
        //-     ws-content(
        //-       v-for="(n, ni) in items" :key="n.oid"
        //-       :node="n" :contentOid="contentOid"
        //-       @contentClick="contentClick"
        //-       @contentDelete="contentDelete"
        //-       @contentEdit="contentEdit")
</template>

<script>
import wsContentNotes from './ws_content_notes'

export default {
  name: 'wsContents',
  components: {wsContentNotes},
  props: ['ctx'],
  data () {
    return {
      mode: 'list',
      modes: ['list', 'gallery', 'feed'],
      content: null,
      contentOid: null
    }
  },
  methods: {
    contentClick (oid) {
      this.$log('contentClick', oid)
      this.contentOid = oid
    },
    contentEdit (content) {
      this.$log('contentEdit', content)
      this.$emit('item', {type: 'content', item: content})
    },
    async contentDelete (oid) {
      this.$log('contentDelete start', oid)
      if (!confirm('Delete content?')) return
      let res = await this.$store.dispatch('workspace/wsItemDelete', oid)
      this.$log('contentDelete done', res)
      this.contentOid = null
    },
    async contentFound (content) {
      this.$log('contentFound', content)
      // try to find item in ws by name
      let name = 'CONTENT-' + content.oid
      let itemInput = {
        name: content.name,
        unique: content.oid,
        rawData: {
          figuresAbsolute: []
        }
      }
      this.$log('itemInput', itemInput)
      let item = await this.$store.dispatch('workspace/wsItemCreate', itemInput)
      // let item = await this.$store.dispatch('workspace/get', {name})
      // this.$log('item before', item)
      // if (!item) {
      //   this.$log('*** CREATE content-node')
      //   let nodeContentInput = {
      //     name,
      //     layout: 'PIP',
      //     category: 'FUN',
      //     spheres: [],
      //     items: [
      //       {
      //         composition: {
      //           operation: { type: 'CONCAT', items: [], operations: null },
      //           layers: [{ content: content, figuresAbsolute: [], figuresRelative: [], spheres: [] }]
      //         }
      //       }
      //     ]
      //   }
      //   this.$log('nodeContentInput', nodeContentInput)
      //   item = await this.$store.dispatch('workspace/wsNodeSave', nodeContentInput)
      // }
      this.$log('item after', item)
      // this.$emit('item', {type: 'content', item: item})
      // this.contentClick(item.oid)
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
