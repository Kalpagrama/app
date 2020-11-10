<template lang="pug">
q-page(
  :style=`{
  }`
  ).row.full-width.items-start.content-start.justify-center.q-px-sm
  q-page-sticky(
    expand
    :position="$q.screen.gt.sm ? 'top' : 'bottom'"
    :style=`{
      zIndex: 1000
    }`).b-30
    //- types
    .row.full-width.justify-center.b-30
      div(:style=`{maxWidth: 770+'px'}`).row.full-width.q-px-sm
        q-btn(
          v-for="(type,ii) in types" :key="type.id"
          @click="typeId = type.id"
          flat no-caps dense
          :color="typeId === type.id ? 'green' : 'grey-8'"
          :class=`{
            'b-40': typeId === type.id
          }`
          :style=`{}`).q-mr-xs.q-px-xs {{ type.name }}
        .col
        q-btn(round flat dense color='grey-9' icon="search")
        q-btn(round flat dense color='grey-9' icon="tune")
    .row.full-width
      slot(name="bottom")
  //- items wrapper
  component(
    :is="`type-${typeId}`"
    v-bind="$props"
    :onlyMine="typeId === 'mine'"
    :style=`{
      maxWidth: 770+'px',
    }`)
</template>

<script>
export default {
  name: 'viewJoints',
  props: ['node', 'player', 'contentKalpa', 'contentBookmark'],
  components: {
    typeDrafts: () => import('./type_drafts.vue'),
    typeMine: () => import('./type_community.vue'),
    typeCommunity: () => import('./type_community.vue'),
  },
  data () {
    return {
      typeId: 'community',
    }
  },
  computed: {
    types () {
      return [
        // {id: 'drafts', name: 'Drafts'},
        {id: 'mine', name: 'Мои'},
        {id: 'community', name: 'Все'}
      ]
    }
  }
}
</script>
