<template lang="pug">
div(
  :class=`{
    'full-height': !inDialog,
    'q-pt-sm': $q.screen.gt.xs
  }`
  :style=`{
    position: 'relative',
  }`
  ).column.full-width
  //- ws content editor
  q-dialog(v-model="contentEditorOpened" position="bottom")
    ws-content-explorer(
      v-if="content" :value="content"
      @close="contentEditorOpened = false"
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
        //- maxWidth: $store.state.ui.maxWidthPage+'px',
      }`).b-50
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px',
    }`
    ).row.full-width.items-center.content-center.b-50
    slot(name="header")
    //- navigation
    div(
      v-if="ctx === 'workspace'"
      :style=`{height: '100px',}`).row.full-width.items-center.content-center.q-px-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold {{$t('content', 'Контент')}}
    //- search
    div.row.full-width.q-px-sm
      .col.q-pr-xs
        q-input(
          v-model="searchStringRaw"
          ref="searchStringInput"
          filled dense dark color="white"
          :placeholder="$t('find_content_or_paste_url', 'Найди контент или вставь ссылку')"
          :loading="searchStringLoading"
          @focus="searchStringFocused"
          @blur="searchStringBlurred"
          ).full-width
          template(v-slot:append)
            q-btn(
              v-if="searchStringRaw.length > 0"
              @click="searchStringRaw = ''"
              flat dense color="white" icon="clear")
            q-btn(
              flat dense color="white" icon="filter_list")
      content-from-file(@content="contentAdd")
    //- actions
    div(:style=`{}`).row.full-width.items-end.content-end.q-px-sm.q-pb-sm
      .col
        kalpa-buttons(:value="types" :id="type" @id="type = $event" screenSet="gt.xs" wrapperBg="b-70").justify-start
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.justify-center.q-py-md
      kalpa-loader(:mangoQuery="mangoQuery" :key="i")
        template(v-slot=`{items}`)
          div(v-if="items.length > 0" :style=`{maxWidth: '800px', paddingBottom: '400px',}`).row.full-width
            div(v-if="type === 'VIDEO'").row.full-width
              content-item(v-for="(c,ci) in items" :key="c.id" :ctx="ctx" :content="c" @pick="contentPicked(c,ci)")
            div(v-if="type === 'IMAGE'").row.full-width
              masonry(:cols="$q.screen.width < 600 ?  2 : 3" :gutter="0").full-width
                content-item(v-for="(c,ci) in items" :key="c.id" :ctx="ctx" :content="c" @pick="contentPicked(c,ci)")
          //- nothing found
          div(
            v-else
            :style=`{height: '200px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
            ).row.full-width.items-center.content-center.justify-center.b-50
            span.text-white {{ $t('nothing_found', 'Ничего не найдено :(') }}
</template>

<script>
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'

import contentItem from './content_item'
import contentFromFile from './content_from_file'
import itemImage from './item_image'

export default {
  name: 'wsContentList',
  components: {contentItem, contentFromFile, itemImage},
  props: {
    inDialog: {
      type: Boolean,
      default () {
        return false
      }
    },
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
      searchString: '',
      searchStringRaw: '',
      searchStringLoading: false,
      content: null,
      contentShow: false,
      contentEditorOpened: false,
      contentFile: null,
      listView: 'mini',
      listViews: [
        {id: 'mini', icon: 'view_list'},
        {id: 'maxi', icon: 'view_agenda'}
      ],
      listShow: false
    }
  },
  computed: {
    types () {
      return [
        {id: 'VIDEO', name: this.$t('Видео')},
        {id: 'IMAGE', name: this.$t('Картинки')},
        {id: 'BOOK', name: this.$t('Книги')},
        {id: 'WEB', name: this.$t('Веб')}
      ]
    },
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
          this.$q.loading.show({spinnerColor: 'green', message: 'Loading content...'})
          this.searchStringRaw = ''
          this.$refs.searchStringInput.blur()
          await this.$wait(2000)
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
      this.$log('contentPicked', this.ctx)
      if (this.ctx === 'workspace') {
        // this.$router.push(`/workspace/content/${content.id}`)
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
