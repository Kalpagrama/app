<style lang="sass">
.content-item
  cursor: pointer
  &:hover
    background: rgb(80,80,80)
.q-menu
  background: none !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative'
  }`
  ).column.full-width
  //- ws content editor
  q-dialog(
    v-model="contentEditorOpened" position="bottom"
    @show="$store.commit('ui/stateSet', ['wsShowMenu', false])"
    @hide="$store.commit('ui/stateSet', ['wsShowMenu', true])")
    ws-content-editor(
      v-if="content" :value="content"
      @close="contentEditorOpened = false"
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
      }`).b-50
  //- header
  kalpa-debug(:options=`{ctx}`)
  div(
    :style=`{
      borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px'
    }`).row.full-width.items-start.content-start.b-50.q-pb-sm.q-px-sm
    slot(name="header")
    //- navigation
    div(
      v-if="ctx === 'workspace'"
      :style=`{}`).row.full-width.items-center.content-center.q-py-md
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold Content
    //- search
    div.row.full-width
      q-input(
        v-model="searchStringRaw"
        ref="searchStringInput"
        filled dense dark color="white"
        :autofocus="ctx === 'workpsace'"
        placeholder="Search or paste URL"
        :loading="searchStringLoading"
        @focus="searchStringFocused"
        @blur="searchStringBlurred"
        ).full-width
        template(v-slot:append)
          q-btn(
            v-if="searchStringRaw.length > 0"
            flat dense color="grey-2" icon="clear" @click="searchStringRaw = ''")
          q-btn(
            v-else
            flat dense color="grey-2" icon="attach_file" @click="contentFromFILEStart()")
    //- actions
    div(:style=`{}`).row.full-width.items-end.content-end
      .col
        kalpa-buttons(:value="types" :id="type" @id="type = $event" wrapperBg="b-70").justify-start
      //- q-btn-group(flat :style=`{borderRadius: '10px'}`).b-70
      //-   q-btn(
      //-     v-for="(v,vi) in listViews" :key="v.id" @click="listView = v.id"
      //-     round dense flat
      //-     :icon="v.icon"
      //-     :color="listView === v.id ? 'green' : 'grey-6'")
      //- q-btn(round dense flat no-caps color="white" icon="filter_list").b-70 {{$q.screen.xs ? '' : 'Filters'}}
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-md.q-px-sm
      kalpa-loader(:mangoQuery="mangoQuery")
        template(v-slot=`{items}`)
          div(v-if="items.length > 0").row.full-width.items-start.content-start
            div(
              :style=`{paddingBottom: '100px'}`).row.full-width.items-start.content-start
              content-item(
                v-for="(c,ci) in items" :key="c.id"
                @pick="contentPicked(c,ci)"
                @explore="contentExplore(c,ci)"
                @delete="contentDelete(c,ci)"
                :ctx="ctx" :content="c" :contentIndex="ci")
          //- nothing found
          div(
            v-else
            :style=`{height: '200px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.content-center.justify-center.b-50
            span.text-white Nothing found :(
</template>

<script>
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'

import contentItem from './content_item'

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
      searchStringLoading: false,
      content: null,
      contentShow: false,
      contentEditorOpened: false,
      listView: 'mini',
      listViews: [
        {id: 'mini', icon: 'view_list'},
        {id: 'maxi', icon: 'view_agenda'}
      ]
    }
  },
  computed: {
    mangoQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT}}
      // selector
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      if (this.type !== 'all') {
        res.selector.contentType = this.type
      }
      // sort
      res.sort = [{updatedAt: 'desc'}]
      return res
    }
  },
  watch: {
    searchStringRaw: {
      async handler (to, from) {
        this.$log('searchString CHANGED', to)
        if (this.isURL(to)) {
          this.searchStringLoading = true
          this.$q.loading.show()
          this.searchStringRaw = ''
          this.$refs.searchStringInput.blur()
          await this.$wait(1000)
          this.$q.loading.hide()
          this.searchStringLoading = false
          this.contentPicked(await this.contentAdd(await this.contentFromURL(to)))
        }
        else {
          this.searchString = to
        }
      }
    }
  },
  methods: {
    isURL (str) {
      let a = document.createElement('a')
      a.href = str
      return (a.host && a.host !== window.location.host)
    },
    contentPicked (content) {
      this.$log('contentPicked')
      if (this.ctx === 'workspace') {
        this.content = content
        this.contentEditorOpened = true
      }
      else {
        this.$emit('content', JSON.parse(JSON.stringify(content)))
      }
    },
    contentExplore (c, ci) {
      this.$log('contentExplore', c, ci)
      this.$router.push(`/content/${c.contentOid}`).catch(e => e)
    },
    async contentDelete (content, ci) {
      this.$log('contentDelete', content, ci)
      if (!confirm('Delete content ?!')) return
      await this.$rxdb.remove(content.id)
    },
    async contentAdd (content) {
      this.$log('contentAdd content', content)
      // todo неверное решение! мастерская автономна! oid появится только после синхронизации!!!!
      let {items: contentFind} = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
          contentOid: content.oid
        }
      })
      this.$log('contentAdd contentFind', contentFind)
      // create rxDoc
      if (contentFind.length === 0) {
        let contentInput = {
          wsItemType: 'WS_CONTENT',
          thumbOid: content.thumbUrl,
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
        let res = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, contentInput)
        this.$log('contentAdd res', res)
        return res
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
      // TODO: impl
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
    },
    searchStringFocused () {
      this.$log('searchStringFocused')
      this.$store.commit('ui/stateSet', ['wsShowMenu', false])
    },
    searchStringBlurred () {
      this.$log('searchStringBlurred')
      this.$store.commit('ui/stateSet', ['wsShowMenu', true])
    }
  }
}
</script>
