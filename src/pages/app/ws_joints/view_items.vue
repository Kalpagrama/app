<template lang="pug">
q-page(
  :style=`{
    paddingTop: 92+paddingTop+'px',
  }`
  ).row.full-width.justify-center
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 1000}`
    ).b-30
    .row.full-width.q-px-sm
      slot(name="top")
      //- search
      .row.full-width.justify-center
        div(
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px',
            borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-start
          div(:style=`{maxWidth: '700px',}`).col
            ws-search(
              @searchString="searchString = $event"
              @contentKalpa="contentKalpaFound")
          q-btn(
            @click="$router.push('/workspace/joint/new')"
            round flat color="grey-4" icon="add").full-height
          q-btn(
            round flat color="grey-4" icon="tune").full-height
      //- types
      .row.full-width.justify-center.q-pt-xs
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          q-btn(
            v-for="(type,ii) in types" :key="type.id"
            @click="typeId = type.id"
            flat no-caps dense
            :color="typeId === type.id ? 'green' : 'grey-7'"
            :class=`{
              'b-40': typeId === type.id
            }`
            :style=`{}`).q-mr-xs.q-mb-xs.q-px-xs {{ type.name }}
  //- items
  .row.full-width.items-start.content-start
    component(:is="`type-${typeId}`" :searchString="searchString")
      template(v-slot:tint=`{item, itemKey}`)
        slot(name="tint" :item="item" :itemKey="itemKey")
</template>

<script>
export default {
  name: 'wsJoints_viewItems',
  props: {
    paddingTop: {
      type: Number,
      default: 0
    }
  },
  components: {
    typeDrafts: () => import('./type_drafts.vue'),
    typePublished: () => import('./type_published.vue'),
  },
  data () {
    return {
      searchString: '',
      typeId: 'drafts',
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
    contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
    }
  }
}
</script>
