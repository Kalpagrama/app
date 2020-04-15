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
  //- add content finder
  .row.full-width.justify-center
    div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.q-pa-sm
      content-finder(
        :sources="['url', 'device']"
        @content="contentFound")
  //- header actions, list, gallery, feed, list-expanded
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
  //- body
  .col.full-width.scroll.q-pa-sm
    .row.full-width.justify-center
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.maxWidthPage+'px', paddingBottom: '80px'}`).row.full-width.items-start.content-start
        kalpa-loader(type="CONTENT_NOTES_LIST" :variables=`{}`)
          template(v-slot:items=`{items}`)
            ws-content-notes(
              v-for="(i, ii) in items" :key="i.oid"
              :item="i" :contentOid="contentOid"
              @content="$emit('item', {type: 'content', item: $event})")
</template>

<script>
import wsContentNotes from './ws_content_notes'

export default {
  name: 'wsContentNotesList',
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
      let itemInput = {
        name: content.name,
        unique: content.oid,
        thumbOid: content.oid,
        wsItemType: 'CONTENT_NOTES',
        rawData: {
          layers: [],
          spheres: [],
          content: content
        }
      }
      this.$log('itemInput', itemInput)
      let item = await this.$store.dispatch('workspace/wsItemCreate', itemInput)
      this.$log('item after', item)
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
