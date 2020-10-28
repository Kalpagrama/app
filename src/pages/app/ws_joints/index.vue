<template lang="pug">
.row.full-width.justify-center
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
    typeBookmarked: () => import('./type_bookmarked.vue'),
    typeDrafts: () => import('./type_drafts.vue'),
    typePublished: () => import('./type_published.vue'),
  },
  data () {
    return {
      typeId: 'drafts',
      searchString: '',
    }
  }
}
</script>
