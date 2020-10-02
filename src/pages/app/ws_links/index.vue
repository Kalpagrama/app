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
              :placeholder="$t('Find a link', 'Найти связь')"
              :input-style=`{
                paddingLeft: '10px',
              }`
              ).full-width
        q-btn(
          @click="$router.push('/workspace/link/new')"
          round flat dense color="green" icon="add"
          :style=`{width: '40px'}`)
    //- types
    div(:style=`{paddingRight: '50px',}`).row.full-width.q-pl-md
      q-tabs(
        :value="typeId" @input="typeId = $event" inline-label
        dense no-caps active-color="green" align="left" switch-indicator
        ).full-width.text-grey-8
        q-tab(name="bookmarked" icon="bookmark" label="Закладки").q-px-xs
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
  name: 'pageApp_wsLinks',
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
