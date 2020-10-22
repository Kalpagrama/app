<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
    //- header
    //- .row.full-width.q-px-sm
      div(:style=`{borderRadius: '10px',overflow: 'hidden'}`).row.full-width.b-40
        .col
          div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
            q-input(
              v-model="searchString"
              borderless dark dense color="white"
              :placeholder="$t('wsNodeList_searchPlaceholder', 'Найти ядро')"
              :input-style=`{
                paddingLeft: '10px',
              }`
              ).full-width
        q-btn(
          @click="$router.push('/workspace/node/new')"
          round flat dense color="green" icon="add"
          :style=`{width: '40px'}`)
    .row.full-width.justify-start.q-px-sm
      div(:style=`{maxWidth: '700px',}`).row.full-width
        .col
          div(
            :style=`{
              background: 'rgb(35,35,35)',
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.fit
            q-input(
              v-model="searchString"
              borderless dense dark color="green"
              placeholder="Поиск"
              :input-style=`{
                paddingLeft: '10px',
              }`
              ).full-width
              template(v-slot:append)
                q-icon(v-if="searchString.length > 0" name="clear" color="grey-4" @click="searchString = ''").q-mr-sm
        q-btn(
          @click="$router.push('/workspace/node/new')"
          round flat color="grey-4" icon="add")
        q-btn(
          round flat color="grey-4" icon="tune")
    //- types
    div(:style=`{}`).row.full-width.q-px-md
      q-tabs(
        :value="typeId" @input="typeIdChanged" inline-label
        dense no-caps active-color="green" align="left" switch-indicator
        ).full-width.text-grey-8
        q-tab(name="saved" icon="bookmark" label="Закладки").q-px-xs
        q-tab(name="drafts" label="Черновики").q-px-xs
        q-tab(name="published" label="Опубликованные").q-px-xs
  .row.full-width
    component(:is="`type-${typeId}`" :searchString="searchString")
      template(v-slot:tint=`{item, itemKey}`)
        slot(name="tint" :item="item" :itemKey="itemKey")
</template>

<script>
import assert from 'assert'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp__wsNodes',
  props: {
    mode: {type: String, default () { return 'standalone' }},
    type: {type: String, default () { return 'drafts' }},
    query: {type: Object, default () { return {} }}
  },
  components: {
    typeDrafts: () => import('./type_drafts.vue'),
    typePublished: () => import('./type_published.vue'),
    typeSaved: () => import('./type_saved.vue'),
  },
  // meta () {
  //   return {
  //     title: 'Nodes'
  //   }
  // },
  data () {
    return {
      typeId: 'drafts',
      searchString: ''
    }
  },
  watch: {
    type: {
      immediate: true,
      handler (to, from) {
        this.$log('type TO', to)
        this.typeId = to
      }
    }
  },
  computed: {
    types () {
      return [
        {id: 'saved', icon: 'bookmark'},
        {id: 'drafts', name: this.$t('pageApp_wsNodes_drafts', 'Черновики'), icon: null},
        {id: 'published', name: this.$t('pageApp_wsNodes_published', 'Опубликованные'), icon: null},
      ]
    },
  },
  methods: {
    typeIdChanged (val) {
      this.$log('typeIdChanged', val)
      if (this.mode === 'standalone') {
        this.$router.push({params: {type: val}})
      }
      else {
        this.typeId = val
      }
    }
  }
}
</script>
