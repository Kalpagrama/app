<template lang="pug">
.row.full-width.justify-center
  div(:style=`{
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 3px)',
    maxWidth: this.$store.state.ui.pageWidth + 'px',
    maxHeight: '50px',
    minHeight: '50px',
    ...styles}`).row.full-width.justify-center
    slot(name="all")
      .row.full-width.justify-between.q-px-sm
        //- feed
        slot(name="left-button")
          q-btn(
            @click="$eventBus.$emit('btn-home-clicked'), $go('/home')"
            flat no-caps icon="home"
            :ripple="false"
            :color="$route.name.split('.')[0] === 'home' ? 'green' : 'grey-7'"
            :style=`{
            width: size+'px',
            height: size+'px',
          }`)
            small(:style=`{marginTop: '-2px', whiteSpace: 'nowrap'}`) {{$t('Feed')}}
        slot(name="center")
          //- trends
          q-btn(
            @click="$eventBus.$emit('btn-trends-clicked'), $go('/trends')"
            flat no-caps icon="search"
            :ripple="false"
            :color="$route.name.split('.')[0] === 'trends' ? 'green' : 'grey-7'"
            :style=`{
            width: size+'px',
            height: size+'px',
          }`)
            small(:style=`{marginTop: '-2px', whiteSpace: 'nowrap'}`) {{$t('Search')}}
          //- workspace
          div(v-if="$q.screen.width > 320"
            :style=`{
            width: size+'px',
            height: size+'px',
          }`
          ).row.items-center.content-center.justify-center
            q-btn(
              @click="$go('/workspace')"
              flat no-caps icon="construction"
              :ripple="false"
              :color="$route.name.split('.')[0] === 'workspace' ? 'green' : 'grey-7'"
              :style=`{
            width: size+'px',
            height: size+'px',
            }`)
              small(:style=`{marginTop: '-2px', whiteSpace: 'nowrap'}`) {{$t('Workspace')}}
          div(v-else
          :style=`{
            width: size+'px',
            height: size+'px',
            position: 'relative',
            bottom: '10%'
            }`
          ).row.items-center.content-center.justify-center
            q-btn(
              @click="$go('/workspace')"
              round no-caps icon="construction"
              :ripple="false"
              :color="$route.name.split('.')[0] === 'workspace' ? 'green' : 'grey-7'"
              :style=`{width: size+'px', height: size+'px', borderRadius: '50%',}`)
          //- notifications
          q-btn(
            @click="$eventBus.$emit('btn-notifications-clicked'), $go('/notifications')"
            flat no-caps icon="notifications_none"
            :ripple="false"
            :color="$route.name.split('.')[0] === 'notifications' ? 'green' : 'grey-7'"
            :style=`{
            width: size+'px',
            height: size+'px',
          }`)
            //q-badge(color="red" floating transparent) •
            small(:style=`{marginTop: '-2px', whiteSpace: 'nowrap'}`) {{$t('Activity')}}
        slot(name="rightButton")
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
  props: {
    homeButton: {type: Boolean, default: true},
    styles: {
      type: Object,
      default() {
        return {
          background: 'rgba(50,50,50,1)',
          borderRadius: '20px 20px 0 0',
        }
      }
    },
  },
  components: {},
  data() {
    return {}
  },
  computed: {
    size() {
      if (this.$q.screen.width > 350) {
        return 46
      } else {
        return 46
      }
    }
  },
  methods: {},
  mounted() {
    this.$store.commit('ui/stateSet', ['mobileMenuShown', true])
  },
  beforeUnmount () {
    this.$store.commit('ui/stateSet', ['mobileMenuShown', false])
  }
}
</script>
