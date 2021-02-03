<template lang="pug">
q-page(
  :style=`{
    //- paddingTop: '8px',
    //- paddingBottom: '0px',
  }`
  ).row.full-width.items-start.content-start.justify-center
  slot(name="prepend")
  //- q-page-sticky(
    expand position="top"
    :style=`{zIndex: 2000}`).row.full-width.justify-center.b-30
  //- div(
    :style=`{
      position: 'sticky', top: '0px',
      zIndex: 2000,
      transform: 'translate3d(0,0,100px)',
    }`
    ).row.full-width.justify-center.b-30
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width.q-px-md
      q-tabs(
        no-caps active-color="green" align="justify"
        stretch :breakpoint="100" inline-label
        :switch-indicator="true").full-width.text-grey-8
        //- t.name +' '+ t.count
        q-route-tab(
          v-for="t in tabs" :key="t.id"
          inline-label
          :to="t.id" :name="t.id" :label="t.name").q-px-sm
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
    tabFollowing: () => import('./tab_following.vue')
  },
  props: ['user'],
  computed: {
    tabs () {
      return [
        // {id: 'nodes', name: this.$t('Nodes and Links', 'Ядра и связи'), icon: 'panorama_fish_eye', count: 356},
        // {id: 'collections', name: 'Каналы', icon: 'view_week', count: 11},
        {id: 'nodes', name: 'Ядра', icon: 'panorama_fish_eye', count: 356},
        {id: 'joints', name: 'Связи', icon: 'panorama_fish_eye', count: 356},
        {id: 'votes', name: this.$t('Votes', 'Голоса'), icon: 'adjust', count: 12},
        // {id: 'followers', name: this.$t('Subscribers', 'Подписчики'), icon: 'supervisor_account', count: 1233},
        // {id: 'following', name: this.$t('Following', 'Подписки'), icon: null, count: 123}
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
