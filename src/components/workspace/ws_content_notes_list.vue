<style lang="sass">
.content-item
  &:hover
    background: rgb(100,100,100) !important
.q-dialog__backdrop
  background: rgba(0,0,0,0.8) !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- actions
  //- dialogs
  //- composition editor
  q-dialog(v-model="contentEditorOpened" persistent position="bottom")
    ws-item-saver(v-if="content" :value="content")
      template(v-slot=`{item}`)
        composition-editor(
          v-if="item"
          ctx="workspace"
          :composition="item"
          @cancel="contentEditorOpened = false"
          :style=`{
            maxWidth: $store.state.ui.maxWidthPage+'px',
            minHeight: $q.screen.height+'px'
          }`)
  //- body
  div(
    ref="wsContentNotesScrollArea"
    :class=`{
      'q-pt-sm': $q.screen.width > 600
    }`
    :style=`{position: 'relative'}`
    ).col.full-width.scroll
    slot(name="header")
    //- header: content finder, filters, edit
    div(:style=`{marginTop: '-20px', paddingTop: '30px'}`
      ).row.full-width.items-start.content-start.justify-center.b-100
      ws-content-finder(
        ref="wsContentFinder"
        :sources="['url', 'device']"
        @content="contentFound"
        :style=`{}`).b-100
      //- tabs
      div(
        :style=`{
          zIndex: 100,
          borderRadius: '0 0 10px 10px', overflow: 'hidden'
        }`
        ).row.full-width.items-center.content-center.q-px-sm.b-100
        .col
          kalpa-buttons(:value="tabs" :id="tabId" @id="tabId = $event").justify-start
        q-btn(
          flat color="white" no-caps
          :style=`{height: '36px'}`).b-110 Spheres
    //- header: edit
    div(:style=`{
      position: 'sticky', top: '-20px',
      borderRadius: '0 0 10px 10px', marginTop: '-20px', paddingTop: '28px'}`
      ).row.full-width.q-px-sm.q-pb-sm.b-80
      //- q-btn(flat round color="white").b-90
        q-checkbox(v-model="layersSelected" :val="li" dark dense color="grey-6")
      div(@click.self="scrollTo(0)").col
      q-btn(flat round color="white" icon="edit").b-90
    kalpa-loader(type="CONTENT_NOTES_LIST")
      template(v-slot="{items}")
        .row.full-width.items-start.q-py-sm
          div(
            v-for="(c,ci) in items" :key="c.oid" @click="contentClick(c.oid)"
            :style=`{minHeight: '40px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.q-px-md.q-py-sm.q-mb-xs.cursor-pointer.content-item.b-70
            span(:style=`{userSelect: 'none'}`).text-white {{ c.name }}
    div(:style=`{height: '1000px'}`).row.full-width
</template>

<script>
export default {
  name: 'wsContentNotesList',
  props: ['options'],
  data () {
    return {
      content: null,
      contentFinderOpened: false,
      contentEditorOpened: false,
      tabId: 'video',
      tabs: [
        {id: 'all', name: 'All'},
        {id: 'video', name: 'Video'},
        {id: 'books', name: 'Books'}
      ]
    }
  },
  watch: {
  },
  methods: {
    async contentClick (oid) {
      this.$log('contentClick', oid)
      this.content = await this.$store.dispatch('objects/get', {oid: oid})
      this.$log('contentClick', this.content)
      // TODO add switch to edit or select, depends on mode...
      this.contentEditorOpened = true
      // this.$emit('item', {type: 'contentNotes', item: this.content})
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
        oid: Date.now().toString(),
        wsItemType: 'CONTENT_NOTES',
        unique: content.oid,
        thumbOid: content.oid,
        name: content.name,
        layers: [],
        spheres: [],
        contentOid: content.oid,
        operation: {
          items: null,
          operations: null,
          type: 'CONCAT'
        }
      }
      this.$log('contentFound contentInput', contentInput)
      let item = await this.$store.dispatch('workspace/wsItemCreate', contentInput)
      this.$log('contentFound item', item)
      await this.$wait(300)
      this.contentClick(item.oid)
    },
    scrollTo (val) {
      this.$log('scrollTo', val)
      let ref = this.$refs.wsContentNotesScrollArea
      if (ref) {
        this.$tween.to(ref, 0.5, {scrollTop: val})
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    // TODO wait for mounted wsContentFinder...
    await this.$wait(1000)
    let to = this.$route.query?.share
    if (to) {
      let item = this.$store.state.workspace.shareItem
      this.$log('item', item)
      if (item) {
        switch (item.type) {
          case 'VIDEO': {
            let ref = this.$refs.wsContentFinder
            this.$log('ref', ref)
            ref.urlChanged(item.url)
            this.$store.commit('workspace/stateSet', ['shareItem', null])
            this.$router.replace('/workspace/contentNotes')
            break
          }
        }
      }
    }
  }
}
</script>
