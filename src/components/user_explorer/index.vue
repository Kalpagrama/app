<template lang="pug">
q-layout(view="hHh lpR fFf").bg-grey-10
  kalpa-menu-right
    menu-right(:user="user")
  q-header(v-if="false" reveal)
    .row.full-width.justify-center
      div(
        v-if="user"
        :style=`{
          height: '60px',
          maxWidth: $store.state.ui.maxWidthPage+'px'
        }`
        ).row.full-width.items-center.content-center.justify-start.q-px-sm
        span.text-bold.text-white {{ user.name }}
        .row.full-width
          small.text-white @{{ user.name }}
  kalpa-menu-footer
    template(v-slot:menuRight)
      menu-right(:user="user")
  q-page-container.row.fit.justify-center.bg-grey-10
    user-info(v-if="user" :user="user")
    //- user-created-nodes(
    //-   v-if="pageId === 'created'"
    //-   :filter="{ types: ['NODE'], fastFilters: ['CREATED_BY_USER']}")
    //- user-voted
    //- user-followers
    //- user-following
</template>

<script>
import menuRight from './menu_right'
import userInfo from './user_info'
import userFollowers from './user_followers'
import userFollowing from './user_following'
import userCreatedNodes from './user_created_nodes'
import userVotedNodes from './user_voted_nodes'

export default {
  name: 'userExplorer',
  components: {menuRight, userInfo, userVotedNodes, userCreatedNodes, userFollowing, userFollowers},
  props: ['user'],
  data () {
    return {
    }
  },
  computed: {
    pageId () {
      return this.$route.params.page
    },
    followers () {
      if (this.user && this.user.subscribers === null) return 0
      else return this.user.subscribers.length
    },
    following () {
      return this.$store.getters.currentUser.subscriptions
    }
  },
  watch: {
    '$route.params.page': {
      immediate: true,
      handler (to, from) {
        this.$log('$route.params.page CHANGED', to)
        if (to) {
        }
        else {
          this.$router.replace({params: {page: 'created'}})
        }
      }
    }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
