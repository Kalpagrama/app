<style lang="stylus">
iframe {
  width: 100%;
  height: 500px;
}
</style>

<template lang="pug">
//- .row.fit.items-center.justify-center
  //- q-dialog(ref="kTutorialDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    //- k-dialog-tutorial(@hide="$refs.kTutorialDialog.hide()")
  //- k-spinner(v-if="loading")
  //- q-resize-observer(@resize="onResize")
  //- transition(appear :enter-active-class="$store.state.ui.going ? 'animated slideInRight' : ''")
.row.full-width.items-start.content-start
  //- transition(appear enter-active-class="animated fadeIn")
  //- q-dialog(ref="kTutorialDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
  //-   k-dialog-tutorial(@hide="closeTutorial()")
  q-dialog(ref="kTutorialDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    k-dialog-tutorial(@hide="closeTutorial()")
  k-dialog-bottom(
    :value="$store.state.node.nodeOptionsDialogOpened"
    :options="$store.state.node.nodeOptions"
    @action="$event => $store.dispatch('node/nodeAction', $event)"
    @hide="$store.commit('node/stateSet', ['nodeOptionsDialogOpened', false])")
  // - iframe(v-if="showIframe" frameborder="0" src="https://www.youtube.com/embed/QywBr6-K2zM" height="500").bg
  router-view(v-if="!loading")
  //- .row.full-width.items-start.content-start
  //-   div(:style=`{height: '500px'}`).row.full-width
  //-   iframe(v-if="true" frameborder="0" src="https://www.youtube.com/embed/QywBr6-K2zM" height="500").bg
  //-   div(:style="{height: '2000px', background: 'red'}").row.full-width
</template>

<script>
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'

export default {
  name: 'mainLayout',
  components: {},
  data () {
    return {
      loading: true,
      width: 0,
      height: 0,
      me: null,
      player: null,
      showIframe: false
    }
  },
  computed: {
  },
  watch: {
    '$q.screen.gt.xs': {
      immediate: true,
      handler (to, from) {
        this.$logD('gt.sm CHANGED', to)
        this.$store.commit('ui/stateSet', ['gtxs', to])
      }
    }
  },
  methods: {
    onResize (e) {
      this.$logD('onResize', e)
      this.width = e.width
      let vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
      this.height = vh
    },
    async closeTutorial(){
      await this.$refs.kTutorialDialog.hide()
      this.loading = false
    }
  },
  async mounted () {
    this.$log('mounted')
    await this.$wait(3000)
    this.showIframe = true
  },
  async created () {
    this.$logD('created')
    this.loading = true
    // take token from redirect url
    let token = this.$route.query.token
    let expires = this.$route.query.expires
    if (token) {
      localStorage.setItem('ktoken', token)
      localStorage.setItem('ktokenExpires', expires)
      await this.$router.push('/')
    }
    if (!await this.$store.dispatch('init')) {
      this.$logD('GO LOGIN')
      await this.$router.push('/login')
      return
    }
    if (this.$store.state.objects.currentUser.profile.tutorial) this.$refs.kTutorialDialog.show()
    else this.loading = false
  }
 }
</script>
