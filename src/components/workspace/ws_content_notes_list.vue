<style lang="sass">
.content-item
  &:hover
    background: #777 !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- dialog editor
  q-dialog(v-model="contentEditorOpened" persistent :maximized="true" position="bottom")
    .row.fit.justify-center
      div(
        :style=`{position: 'relative', height: $q.screen.height+'px', background: 'rgba(0,0,0,0)'}`).row.full-width.justify-center
        ws-item-saver(v-if="content" :value="content")
          template(v-slot=`{item}`)
            composition-editor(
              v-if="item"
              ctx="workspace"
              :composition="item.rawData"
              @cancel="contentEditorOpened = false"
              :style=`{
                maxWidth: $store.state.ui.maxWidthPage+'px'
              }`)
  //- header content finder
  .row.full-width.justify-center
    div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width
      ws-content-finder(
        :sources="['url', 'device']"
        @content="contentFound")
  //- body
  .col.full-width.scroll
    .row.full-width.justify-center
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.maxWidthPage+'px', paddingBottom: '0px'}`
        ).row.full-width.items-start.content-start.q-pt-sm
        kalpa-loader(type="CONTENT_NOTES_LIST")
          template(v-slot="{items}")
            .row.full-width.items-start
              div(
                v-for="(c,ci) in items" :key="c.oid" @click="contentClick(c.oid)"
                :style=`{minHeight: '40px', borderRadius: '10px', overflow: 'hidden'}`
                ).row.full-width.items-center.bg-grey-8.q-px-md.q-py-sm.q-mb-xs.cursor-pointer.content-item
                span(:style=`{userSelect: 'none'}`).text-white {{ c.name }}
        div(:style=`{height: '1000px'}`).row.full-width
</template>

<script>
export default {
  name: 'wsContentNotesList',
  data () {
    return {
      content: null,
      contentFinderOpened: false,
      contentEditorOpened: false
    }
  },
  methods: {
    async contentClick (oid) {
      this.$log('contentClick', oid)
      this.content = await this.$store.dispatch('objects/get', {oid: oid})
      this.$log('contentClick', this.content)
      this.contentEditorOpened = true
      this.$emit('item', {type: 'contentNotes', item: this.content})
    },
    async contentDelete (oid) {
      this.$log('contentDelete start', oid)
      if (!confirm('Delete content & notes ?')) return
      let res = await this.$store.dispatch('workspace/wsItemDelete', oid)
      this.$log('contentDelete done', res)
    },
    async contentFound (content) {
      this.$log('contentFound', content)
      let contentInput = {
        name: content.name,
        unique: content.oid,
        thumbOid: content.oid,
        wsItemType: 'CONTENT_NOTES',
        rawData: {
          oid: Date.now().toString(),
          layers: [],
          spheres: [],
          contentOid: content.oid,
          operation: {
            items: null,
            operations: null,
            type: 'CONCAT'
          }
        }
      }
      this.$log('contentFound contentInput', contentInput)
      let item = await this.$store.dispatch('workspace/wsItemCreate', contentInput)
      this.$log('contentFound item', item)
      await this.$wait(300)
      this.contentClick(item.oid)
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
