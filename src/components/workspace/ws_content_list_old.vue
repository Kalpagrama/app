<style lang="sass">
.content-item
  &:hover
    background: rgb(100,100,100) !important
.q-dialog__backdrop
  background: rgba(0,0,0,0.8) !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
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
    ref="wsContentListScrollArea"
    :class=`{
      'q-pt-sm': $q.screen.width > 600
    }`
    :style=`{position: 'relative'}`
    ).col.full-width.scroll
    slot(name="header")
    //- header: contentCreator, filters, edit
    div(:style=`{marginTop: '-20px', paddingTop: '30px', borderRadius: '10px'}`
      ).row.full-width.items-start.content-start.justify-center.b-50
      ws-content-creator(
        ref="wsContentCreator"
        :sources="['url', 'device']"
        @searchString="searchString = $event"
        @content="contentCreated"
        :style=`{}`).b-50
      //- tabs
      div(
        :style=`{
          zIndex: 100,
          borderRadius: '0 0 10px 10px', overflow: 'hidden'
        }`
        ).row.full-width.items-center.content-center.q-px-sm.b-50
        .col
          kalpa-buttons(:value="tabs" :id="tabId" @id="tabId = $event").justify-start
        q-btn(
          v-if="true"
          flat color="white" no-caps
          :style=`{height: '36px'}`).b-110 Filters
          q-menu()
            //- ws-finder-spheres
    //- header: edit
    div(
      v-if="options.editing"
      :style=`{
        position: 'sticky', top: '-20px',
        borderRadius: '0 0 10px 10px', marginTop: '-20px', paddingTop: '28px'}`
      ).row.full-width.q-px-sm.q-pb-sm.b-80
      //- q-btn(flat round color="white").b-90
        q-checkbox(v-model="layersSelected" :val="li" dark dense color="grey-6")
      div(@click.self="scrollTo(0)").col
      q-btn(flat round color="white" icon="edit").b-90
    kalpa-loader(
      type="WS_CONTENT"
      :variables=`{selector: {contentType: tabId}}`)
      template(v-slot="{items}")
        .row.full-width.items-start.q-pa-sm
          div(
            v-for="(c,ci) in items" :key="c.oid" @click="contentClick(c)"
            :style=`{minHeight: '40px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.q-px-md.q-py-sm.q-mb-xs.cursor-pointer.content-item.b-70
            span(:style=`{userSelect: 'none'}`).text-white {{ c.name }}
    div(:style=`{height: '1000px'}`).row.full-width
</template>

<script>
export default {
  name: 'wsContentList',
  props: {
    options: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      content: null,
      contentFinderOpened: false,
      contentEditorOpened: false,
      tabId: 'VIDEO',
      tabs: [
        {id: 'all', name: 'All'},
        {id: 'VIDEO', name: 'Video'},
        {id: 'BOOK', name: 'Books'}
      ],
      searchString: ''
    }
  },
  watch: {
    tabId: {
      handler (to, from) {
        this.$log('tabId CHANGED', to)
      }
    },
    contentEditorOpened: {
      handler (to, from) {
        this.$log('contentEditorOpened CHANGED', to)
        if (to) {
          this.$store.commit('workspace/stateSet', ['showFooter', false])
          this.$store.commit('workspace/stateSet', ['showHeader', false])
        } else {
          this.$store.commit('workspace/stateSet', ['showFooter', true])
          this.$store.commit('workspace/stateSet', ['showHeader', true])
        }
      }
    }
  },
  methods: {
    async contentClick (rxDoc) {
      this.$log('contentClick', rxDoc)
      this.content = rxDoc
      switch (this.options.onItemClick) {
        case 'edit': {
          this.contentEditorOpened = true
          break
        }
        case 'emit': {
          this.$emit('item', {type: 'content', item: this.content})
          break
        }
        default: {
          alert('this.options.onItemClick NONE')
        }
      }
    },
    async contentDelete (rxDoc) {
      this.$log('contentDelete start', rxDoc)
      if (!confirm('Delete content & notes ?')) return
      await this.$rxdb.deleteItem(rxDoc)
    },
    async contentCreated (content) {
      this.$log('contentCreated content', content)
      let rxDoc = await this.$rxdb.WS_CONTENT.findOne({selector: {contentOid: content.oid}}).exec()
      this.$log('contentCreated rxDoc before', rxDoc)
      // create rxDoc
      if (!rxDoc) {
        let contentInput = {
          wsItemType: 'WS_CONTENT',
          thumbOid: content.oid,
          name: content.name,
          layers: [],
          spheres: [],
          contentOid: content.oid,
          contentType: content.type,
          operation: {
            items: null,
            operations: null,
            type: 'CONCAT'
          }
        }
        this.$log('contentCreated contentInput', contentInput)
        rxDoc = await this.$rxdb.upsertItem(contentInput)
      }
      this.$log('contentCreated rxDoc after', rxDoc)
      this.contentClick(rxDoc)
    },
    scrollTo (val) {
      this.$log('scrollTo', val)
      let ref = this.$refs.wsContentListScrollArea
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
