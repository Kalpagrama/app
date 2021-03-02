<template lang="pug">
q-page(
  :style=`{
    paddingTop: '50px',
  }`
  ).row.full-width.justify-center
  //- body
  list-feed(
    :query="query"
    :itemMiddlePersist="false"
    :itemStyles=`{
      paddingBottom: '8px',
    }`
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`)
    template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
      .row.full-width
        router-link(
          :to="itemLink(item)"
          :style=`{
            background: 'rgb(35,35,35)',
            borderRadius: '10px',
          }`
          ).row.full-width
          img(
            v-if="!['WORD', 'SENTENCE', 'SPHERE'].includes(item.type)"
            draggable="false"
            :src="item.thumbUrl"
            :style=`{
              height: '50px',
              minWidth: '89px',
              borderRadius: '10px',
              objectFit: 'contain',
            }`).b-50.q-mr-sm
          div(
            v-else
            :style=`{width: '50px', height: '50px',}`
            ).row.items-center.content-center.justify-center
            q-icon(name="blur_on" size="30px" color="white")
          .col
            div(:style=`{minHeight: '50px',}`).row.full-width.items-center.content-center
              span.text-white {{ item.name }}
              .row.full-width
                small.text-grey-8 {{ itemMetaMap[item.type].name }}
  //- tabs with types...
  q-page-sticky(
    expand position="top"
    :style=`{
      zIndex: 1000,
    }`).b-30
    .row.full-width.justify-center.b-30
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-px-md
        q-tabs(
          v-model="tabId"
          dense no-caps active-color="green" switch-indicator
          ).full-width.text-grey-8
          q-tab(v-for="t in tabs" :key="t.id" :name="t.id" :label="t.name" dense)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'trends_pageSearch',
  props: ['searchString'],
  components: {
    kalpaFinder: () => import('components/kalpa_finder/index.vue'),
  },
  data () {
    return {
      tabId: 'content'
    }
  },
  computed: {
    tabs () {
      return [
        {id: 'content', name: 'Медиа', types: ['VIDEO', 'IMAGE', 'BOOK']},
        {id: 'nodes', name: 'Ядра', types: ['NODE']},
        {id: 'joints', name: 'Связи', types: ['JOINT']},
        {id: 'spheres', name: 'Сферы', types: ['WORD', 'SENTENCE']},
        {id: 'users', name: 'Люди', types: ['USER']}
      ]
    },
    tab () {
      return this.tabs.find(t => t.id === this.tabId)
    },
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SEARCH,
          // objectTypeEnum: {$in: ['VIDEO', 'IMAGE', 'BOOK']},
          querySearch: this.searchString,
        },
        populateObjects: false,
        limit: 100
      }
      if (this.tab) {
        res.selector.objectTypeEnum = {$in: this.tab.types}
      }
      return res
    },
    itemMetaMap () {
      return {
        VIDEO: {
          name: 'Видео',
          link: '/content/'
        },
        IMAGE: {
          name: 'Изображение',
          link: '/content/'
        },
        BOOK: {
          name: 'Книга',
          link: '/content/'
        },
        NODE: {
          name: 'Ядро',
          link: '/node/'
        },
        JOINT: {
          name: 'Связь',
          link: '/joint/'
        },
        WORD: {
          name: 'Сфера',
          link: '/sphere/'
        },
        SENTENCE: {
          name: 'Сфера',
          link: '/sphere/'
        },
        SPHERE: {
          name: 'Сфера',
          link: '/sphere/'
        },
        USER: {
          name: 'Пользователь',
          link: '/user/'
        }
      }
    }
  },
  methods: {
    itemLink (item) {
      this.$log('itemLink', item)
      if (item.wsItemType) {
        confirm('Open in workspace?')
      }
      else {
        return this.itemMetaMap[item.type].link + item.oid
      }
    },
  }
}
</script>
