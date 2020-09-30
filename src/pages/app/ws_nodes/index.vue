<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
    //- header
    .row.full-width.q-px-sm
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
    //- types
    div(:style=`{paddingRight: '50px',}`).row.full-width.q-pl-md
      q-tabs(
        :value="typeId" @input="typeIdChanged" inline-label
        dense no-caps active-color="green" align="left" switch-indicator
        ).full-width.text-grey-8
        //- q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name" :icon="t.icon ? t.icon : null").q-px-xs.br
        q-tab(name="saved" icon="bookmark")
        q-tab(name="drafts" label="Drafts")
        q-tab(name="published" label="Published")
  .row.full-width
    component(:is="`type-${typeId}`" :searchString="searchString")
      template(v-slot:tint=`{item}`)
        slot(name="tint" :item="item")
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
  meta () {
    return {
      title: 'Nodes'
    }
  },
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
      // name: this.$t('pageApp_wsNodes_saved', 'Сохраненные'),
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
