<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      borderRadius: '20px 20px 0 0',
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
    }`
    ).row.full-width.justify-between.b-50.q-px-sm.q-pt-sm
    //- feed
    q-btn(
      @click="$go('/feeds/all')"
      flat no-caps icon="view_agenda"
      :color="$route.name.split('.')[0] === 'feeds' ? 'green' : 'grey-7'"
      :style=`{
        width: size+'px',
        height: size+'px',
      }`)
      small(:style=`{marginTop: '-2px', whiteSpace: 'nowrap'}`) {{$t('Feed')}}
    //- trends
    q-btn(
      @click="$go('/trends')"
      flat no-caps icon="search"
      :color="$route.name.split('.')[0] === 'trends' ? 'green' : 'grey-7'"
      :style=`{
        width: size+'px',
        height: size+'px',
      }`)
      small(:style=`{marginTop: '-2px', whiteSpace: 'nowrap'}`) {{$t('Search')}}
    //- workspace
    div(
      :style=`{
        width: size+'px',
        height: size+'px',
      }`
      ).row.items-center.content-center.justify-center
      q-btn(
        @click="$go('/workspace')"
        round no-caps icon="construction"
        :color="'green'"
        :style=`{width: size+'px', height: size+'px', borderRadius: '50%',}`)
    //- notifications
    q-btn(
      @click="$go('/notifications')"
      flat no-caps icon="notifications_none"
      :color="$route.name.split('.')[0] === 'notifications' ? 'green' : 'grey-7'"
      :style=`{
        width: size+'px',
        height: size+'px',
      }`)
      q-badge(color="red" floating transparent) •
      small(:style=`{marginTop: '-4px', whiteSpace: 'nowrap'}`) {{$t('Activity')}}
    //- menu
    kalpa-menu-popup-global(
      color="grey-7"
      :styles=`{
        width: size+'px',
        height: size+'px',
      }`)
</template>

<script>
export default {
  name: 'kalpaMenuMobile',
  components: {
  },
  data () {
    return {
    }
  },
  computed: {
    isGuest () {
      return this.$store.getters.currentUser().profile.role === 'GUEST'
    },
    size () {
      if (this.$q.screen.width > 350) return 46
      else return 46
    }
  },
  methods: {
  }
}
</script>
