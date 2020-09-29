<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
    //- header
    .row.full-width.q-px-sm
      .col
        div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
          q-input(
            v-model="searchString"
            filled dark dense color="white"
            :placeholder="$t('wsNodeList_searchPlaceholder', 'Найти ядро')"
            ).full-width
      q-btn(round flat dense color="green" icon="add" @click="$router.push('/workspace/nodenew/new')")
    //- types
    div(:style=`{paddingRight: '50px',}`).row.full-width.q-pl-md
      q-tabs(
        :value="typeId" @input="typeIdChanged"
        dense no-caps active-color="white" align="left" switch-indicator
        ).full-width.text-grey-8
        q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
  .row.full-width
    component(:is="`type-${typeId}`" :searchString="searchString")
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
      return [
        {id: 'drafts', name: this.$t('pageApp_wsNodes_drafts', 'Черновики')},
        {id: 'published', name: this.$t('pageApp_wsNodes_published', 'Опубликованные')},
        {id: 'saved', name: this.$t('pageApp_wsNodes_saved', 'Сохраненные')},
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
