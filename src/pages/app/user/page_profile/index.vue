<template lang="pug">
q-page(
  :style=`{
    //- paddingTop: '8px',
    paddingBottom: '0px',
  }`
  ).row.full-width.items-start.content-start.justify-center
  slot(name="prepend")
  //- q-page-sticky(
    expand position="top"
    :style=`{zIndex: 2000}`).row.full-width.justify-center.b-30
  div(
    :style=`{
      position: 'sticky', top: '0px',
      zIndex: 2000,
    }`
    ).row.full-width.justify-center.b-30
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width.q-px-md
      q-tabs(
        no-caps active-color="green" align="left" dense
        stretch :breakpoint="100" inline-label
        :switch-indicator="true").full-width.text-grey-8
        q-route-tab(
          v-for="t in tabs" :key="t.id"
          inline-label
          :to="t.id" :name="t.id" :label="t.name" :icon="t.icon").q-px-sm
  component(
    :is="`tab-${$route.params.tab}`"
    :user="user"
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`)
</template>

<script>
export default {
  name: 'user_pageProfile',
  components: {
    tabCollections: () => import('./tab_collections.vue'),
    tabNodes: () => import('./tab_nodes.vue'),
    tabJoints: () => import('./tab_joints.vue'),
    tabVotes: () => import('./tab_votes.vue'),
    tabFollowers: () => import('./tab_followers.vue'),
  },
  props: ['user'],
  computed: {
    tabs () {
      return [
        // {id: 'collections', name: this.$t('Collections', 'Коллекции'), icon: 'view_week'},
        {id: 'nodes', name: this.$t('Nodes', 'Ядра'), icon: 'panorama_fish_eye'},
        // {id: 'joints', name: this.$t('Joints', 'Связи'), icon: 'link'},
        {id: 'votes', name: this.$t('Votes', 'Голоса'), icon: 'adjust'},
        {id: 'followers', name: this.$t('Subscribers', 'Подписчики'), icon: 'supervisor_account'},
      ]
    },
  },
  watch: {
    '$route.params.tab': {
      immediate: true,
      handler (to, from) {
        if (to) {
        }
        else {
          this.$router.replace({params: {tab: 'nodes'}})
        }
      }
    }
  }
}
</script>
