<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.q-pt-sm.q-px-sm.b-30
      .row.full-width.justify-center
        div(
          :style=`{
            maxWidth: $store.state.ui.pageMaxWidth+'px', height: '60px',
            borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-center.b-40.q-px-sm
          q-icon(name="link" size="30px" color="white").q-mr-md.q-ml-sm
          .col
            span(:style=`{fontSize: '1.1rem'}`).text-white.text-bold Связи
          q-btn(round flat color="white" icon="more_vert")
      .row.full-width.justify-center
        div(
          :style=`{
            maxWidth: $store.state.ui.pageMaxWidth+'px', height: '60px',
            borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-start.q-pt-sm
          div(:style=`{maxWidth: '700px',}`).col
            ws-search(
              @searchString="searchString = $event"
              )
          q-btn(
            @click="$router.push('/workspace/joint/new')"
            round flat color="grey-4" icon="add").full-height
          q-btn(
            round flat color="grey-4" icon="tune").full-height
      //- types
      .row.full-width.justify-center.q-pt-xs
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
          q-btn(
            v-for="(type,ii) in types" :key="type.id"
            @click="typeId = type.id"
            flat no-caps dense
            :color="typeId === type.id ? 'green' : 'grey-7'"
            :class=`{
              'b-40': typeId === type.id
            }`
            :style=`{}`).q-mr-xs.q-mb-xs.q-px-xs {{ type.name }}
  q-page-container
    q-page.row.full-width.justify-center.q-pt-md
      div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.br
        component(:is="`type-${typeId}`" :searchString="searchString")
          template(v-slot:tint=`{item, itemKey}`)
            slot(name="tint" :item="item" :itemKey="itemKey")
//- .row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
    .row.full-width.justify-start.q-px-sm.q-pt-sm
      slot(name="header")
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
          @click="$router.push('/workspace/joint/new')"
          round flat color="grey-4" icon="add")
        q-btn(
          round flat color="grey-4" icon="tune")
    //- types
    div(:style=`{paddingRight: '50px',}`).row.full-width.q-pl-md
      q-tabs(
        :value="typeId" @input="typeId = $event" inline-label
        dense no-caps active-color="green" align="left" switch-indicator
        ).full-width.text-grey-8
        //- q-tab(name="bookmarked" icon="bookmark" label="Закладки").q-px-xs
        q-tab(name="drafts" label="Черновики").q-px-xs
        q-tab(name="published" label="Опубликованные").q-px-xs
    //- types wrapper
    .row.full-width.items-start.content-start.q-pt-sm
      component(:is="`type-${typeId}`" :searchString="searchString")
        template(v-slot:tint=`{item, itemKey}`)
          slot(name="tint" :item="item" :itemKey="itemKey")
</template>

<script>

export default {
  name: 'pageApp_wsJoints',
  components: {
    typeDrafts: () => import('./type_drafts.vue'),
    typePublished: () => import('./type_published.vue'),
  },
  data () {
    return {
      typeId: 'drafts',
      searchString: '',
    }
  },
  computed: {
    types () {
      return [
        {id: 'drafts', name: this.$t('pageApp_wsJoints_drafts', 'Черновики')},
        {id: 'published', name: this.$t('pageApp_wsJoints_published', 'Опубликованные')},
      ]
    },
  },
}
</script>
