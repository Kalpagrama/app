<template lang="pug">
q-page(
  :style=`{
  }`
  ).row.full-width.items-start.content-start.justify-center.q-px-sm
  q-page-sticky(
    expand
    :position="$q.screen.gt.sm ? 'top' : 'bottom'"
    :style=`{
      zIndex: 4000
    }`).b-30
    //- types
    .row.full-width.justify-center.b-30
      div(:style=`{maxWidth: 770+'px'}`).row.full-width.q-px-sm.q-pb-xs
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
    }`
    @nodeEdit="$emit('nodeEdit', $event)"
    @nodeCreate="$emit('nodeCreate')"
    @figures="$emit('figures', $event)")
</template>

<script>
export default {
  name: 'viewNodes',
  inject: ['pick'],
  props: ['player', 'contentKalpa', 'contentBookmark', 'nodeEditingId'],
  components: {
    typeCommunity: () => import('./type_community.vue'),
    typeMine: () => import('./type_community.vue'),
    typeDrafts: () => import('./type_drafts.vue'),
  },
  data () {
    return {
      typeId: 'community',
    }
  },
  computed: {
    types () {
      return [
        {id: 'drafts', name: 'Черновики'},
        {id: 'mine', name: 'Мои'},
        {id: 'community', name: 'Все'}
      ]
    },
    maxWidth () {
      if (this.$q.screen.width < 770) return this.$q.screen.width - 70
      else return 770
    }
  },
  created () {
    if (this.pick) this.typeId = 'drafts'
  }
}
</script>
