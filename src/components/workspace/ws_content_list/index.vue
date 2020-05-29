<style lang="sass">
</style>

<template lang="pug">
div(
  :class=`{
    position: 'relative',
    'q-pt-sm': $q.screen.gt.xs
  }`
  ).column.full-width
  //- ws content editor
  q-dialog(v-model="contentEditorOpened" position="bottom")
    ws-content-editor(
      v-if="content" :value="content"
      @close="contentEditorOpened = false"
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
      }`)
  //- header
  div(:style=`{borderRadius: '10px'}`).row.full-width.items-start.content-start.b-50
    slot(name="header")
    //- header: workspace
    div(
      v-if="ctx === 'workspace'"
      :style=`{height: '60px', marginBottom: '20px'}`).row.full-width.items-center.content-center.q-px-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
      span(:style=`{fontSize: '20px'}`).text-white.text-bold Content
    //- search
    div.row.full-width.q-px-sm
      q-input(
        v-model="searchStringRaw"
        filled dense color="grey-6" dark
        :autofocus="ctx === 'workpsace'"
        placeholder="Search or paste URL"
        ).full-width.b-70
        template(v-slot:append)
          q-btn(
            v-if="searchStringRaw.length > 0"
            flat dense color="grey-2" icon="clear" @click="searchStringRaw = ''")
          q-btn(
            v-else
            flat dense color="grey-2" icon="attach_file" @click="contentFromFILEStart()")
    //- actions
    div(:style=`{}`).row.full-width.items-center.content-center.q-px-sm
      .col
        kalpa-buttons(:value="types" :id="type" @id="type = $event" wrapperBg="b-70").justify-start
      q-btn(flat no-caps color="white").b-70 Filters
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-md.q-px-sm
      kalpa-loader(type="WS_CONTENT" :variables="variables")
        template(v-slot=`{items}`)
          div(v-if="items.length > 0").row.full-width.items-start.content-start
            content-item(
              v-for="(c,ci) in items" :key="c.id"
              :ctx="ctx" :content="c" :contentIndex="ci"
              @choose="contentChoose(c,ci)"
              @delete="contentDelete(c,ci)"
              @layerChoose="layerChoose"
              @layerPreview="layerPreview")
          //- nothing found
          div(
            v-else
            :style=`{height: '200px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.content-center.justify-center.b-50
            span.text-white Nothing found :(
</template>

<script>
import contentItem from './content_item'
import { ContentApi } from 'src/api/content'

export default {
  name: 'wsContentList',
  components: {contentItem},
  props: {
    ctx: {
      type: String,
      default () {
        return 'workspace'
      }
    }
  },
  data () {
    return {
      type: 'VIDEO',
      types: [
        {id: 'all', name: 'All'},
        {id: 'VIDEO', name: 'Video'},
        {id: 'IMAGE', name: 'Images'},
        {id: 'BOOK', name: 'Books'}
      ],
      searchString: '',
      searchStringRaw: '',
      content: null,
      contentEditorOpened: false
    }
  },
  computed: {
    composition () {
      if (this.layer) {
        return {
          // contentOid: ,
          preview: this.layer.content.thumbUrl,
          contentType: 'VIDEO',
          layers: [this.layer]
        }
      }
      else {
        return null
      }
    },
    variables () {
      let res = {selector: {}}
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      if (this.type !== 'all') {
        res.selector.contentType = this.type
      }
      return res
    }
  },
  watch: {
    searchStringRaw: {
      async handler (to, from) {
        this.$log('searchString CHANGED', to)
        if (this.isURL(to)) {
          this.contentChoose(await this.contentAdd(await this.contentFromURL(to)))
          this.searchStringRaw = ''
        }
        else {
          this.searchString = to
        }
      }
    },
    contentEditorOpened: {
      handler (to, from) {
        this.$log('contentEditorOpened CHANGED', to)
        this.$store.commit('ui/stateSet', ['ws_showFooter', !to])
      }
    }
  },
  methods: {
    isURL (str) {
      let a = document.createElement('a')
      a.href = str
      return (a.host && a.host !== window.location.host)
    },
    contentChoose (content, ci) {
      this.$log('contentChoose', content, ci)
      // TODO depends on mode
      this.content = content
      this.contentEditorOpened = true
    },
    async contentDelete (content, ci) {
      this.$log('contentDelete', content, ci)
      if (!confirm('Delete content ?!')) return
      await this.$rxdb.deleteItem(content.id)
    },
    layerChoose ([content, li]) {
      this.$log('layerChoose', content, li)
      if (this.ctx === 'nodeEditor') {
        this.$emit('layer', content.layers[li])
      }
    },
    layerPreview ([content, li]) {
      this.$log('layerPreview', content, li)
      this.content = content
      this.contentEditorOpened = true
    },
    async contentAdd (content) {
      this.$log('contentAdd content', content)
      let contentFind = await this.$rxdb.findWs('WS_CONTENT', {selector: {contentOid: content.oid}})
      this.$log('contentAdd contentFind', contentFind)
      // create rxDoc
      if (contentFind.length === 0) {
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
        this.$log('contentAdd contentInput', contentInput)
        return await this.$rxdb.upsertItem(contentInput)
      } else {
        return contentFind[0]
      }
    },
    async contentFromURL (url) {
      try {
        this.$log('contentFromURL start', url)
        let content = await ContentApi.contentCreateFromUrl(url)
        this.$log('contentFromURL done')
        return content
      } catch (e) {
        this.$log('contentFromURL error', e)
      }
    },
    async contentFromFILEStart () {
      this.$log('contentFromFILEStart')
    },
    async contentFromFILE () {
      try {
        this.$log('contentFromFILE start')
        let content = null
        this.$log('contentFromFILE done')
        return content
      } catch (e) {
        this.$log('contentFromFILE error', e)
      }
    }
  }
}
</script>
