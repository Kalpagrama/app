<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
  q-header(reveal).b-30
    .row.full-width.q-pt-sm.q-px-sm.b-30
      //- .row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`
          ).row.full-width.items-center
          q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left" @click="$router.back()")
          span.text-grey-6 Мастерская / Ядра
      .row.full-width.justify-center
        div(
          :style=`{
            position: 'relative',
            maxWidth: $store.state.ui.pageMaxWidth+'px', height: '60px',
            borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-center.b-40.q-px-sm
          q-icon(name="filter_tilt_shift" size="30px" color="white").q-mr-md.q-ml-sm
          .col
            span(:style=`{fontSize: '1.1rem'}`).text-white.text-bold Ядра
          q-btn(round flat color="white" icon="more_vert")
  q-page-container
    page()
      template(v-slot:tint=`{item, itemKey}`)
        slot(name="tint" :item="item" :itemKey="itemKey")
    //- q-page.row.full-width.justify-center.q-pt-md
      div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
        component(:is="`type-${typeId}`" :searchString="searchString")
          template(v-slot:tint=`{item, itemKey}`)
            slot(name="tint" :item="item" :itemKey="itemKey")
//- .row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
    //- header
    div(v-if="showHeader").row.full-width.justify-start.q-px-sm.q-pt-sm
      slot(name="header")
      .row.full-width
        .col.br
          ws-search(
            :style=`{maxWidth: '700px',}`
            )
        q-btn(
          @click="$router.push('/workspace/node/new')"
          round flat color="grey-4" icon="add")
        q-btn(
          round flat color="grey-4" icon="tune")
      //- div(:style=`{maxWidth: '700px',}`).row.full-width
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
      //- q-tabs(
        :value="typeId" @input="typeIdChanged" inline-label
        dense no-caps active-color="green" align="left" switch-indicator
        ).full-width.text-grey-8
        //- q-tab(name="saved" icon="bookmark" label="Закладки").q-px-xs
        q-tab(name="drafts" label="Черновики" inline-label).q-px-xs
        q-tab(name="published" label="Опубликованные" inline-label).q-px-xs
      q-tabs(
        :value="typeId" @input="typeIdChanged" inline-label
        no-caps active-color="green" align="left"
        stretch :breakpoint="600" dense
        :switch-indicator="true").full-width.text-grey-8
        q-tab(name="drafts" label="Черновики" inline-label).q-px-xs
        q-tab(name="published" label="Опубликованные" inline-label).q-px-xs
        //- q-tab(
          v-for="v in views" :key="v.id"
          inline-label
          :name="v.id" :label="v.name" :icon="v.icon").q-px-xs
  .row.full-width
    component(:is="`type-${typeId}`" :searchString="searchString")
      template(v-slot:tint=`{item, itemKey}`)
        slot(name="tint" :item="item" :itemKey="itemKey")
</template>

<script>
import assert from 'assert'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodes',
  props: {
    mode: {type: String, default () { return 'standalone' }},
    type: {type: String, default () { return 'drafts' }},
    query: {type: Object, default () { return {} }},
    showHeader: {type: Boolean, default: true},
    searchStringInput: {type: String}
  },
  components: {
    page: () => import('./page.vue'),
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
    },
    searchStringInput: {
      handler (to, from) {
        if (to) this.searchString = to
      }
    }
  },
  computed: {
    types () {
      return [
        {id: 'drafts', name: this.$t('pageApp_wsNodes_drafts', 'Черновики')},
        {id: 'published', name: this.$t('pageApp_wsNodes_published', 'Опубликованные')},
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
