<template lang="pug">
q-layout(
  view='hHh Lpr fFf'
  :style=`{width: $q.screen.width+'px', height: '100vh'}`
  :class="{'bg-primary': $route.path !== '/app/menu'}").bg-primary
  //- node action dialog
  k-dialog-bottom(ref="fragmentActionDialog" :value="$store.state.ui.fragmentActionDialogOpened" mode="actions" :options="fragmentActionDialogOptions"
    @action="fragmentActionDialogAction" @hide="$store.commit('ui/stateSet', ['fragmentActionDialogOpened', false])")
  //- node rate dialog
  q-dialog(ref="nodeRateDialog" :value="$store.state.ui.nodeRateDialogOpened" :maximized="true" transition-show="slide-up" transition-hide="slide-down"
    @hide="$store.commit('ui/stateSet', ['nodeRateDialogOpened', false])")
    node-rate(@hide="$refs.nodeRateDialog.hide()")
  //- node creator dialog
  q-dialog(ref="nodeCreatorDialog" :value="$store.state.ui.nodeCreatorDialogOpened" :maximized="true" transition-show="slide-up" transition-hide="slide-down"
    @hide="$store.commit('ui/stateSet', ['nodeCreatorDialogOpened', false])")
    node-creator(@hide="$refs.nodeCreatorDialog.hide()")
  //- bookmark dialog
  q-dialog(
    ref="bookmarkDialog" :value="$store.state.ui.bookmarkDialogOpened"
    @hide="$store.commit('ui/stateSet', ['bookmarkDialogOpened', false])"
    :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    ws-bookmark(@hide="$refs.bookmarkDialog.hide()")
  //- fragment dialog
  q-dialog(
    ref="fragmentDialog" :value="$store.state.ui.fragmentDialogOpened"
    @hide="$store.commit('ui/stateSet', ['fragmentDialogOpened', false])"
    :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    ws-fragment(@hide="$refs.fragmentDialog.hide()")
  //- tutorial
  q-dialog(ref="tutorialDialog" :maximized="true")
    .column.fit.bg-primary
      q-carousel(
        v-model="slide"
        transition-prev="scale"
        transition-next="scale"
        animated
        control-color="white"
        padding
        height="100%"
        class="bg-primary text-white")
        q-carousel-slide(name="1").row.fit.justify-center.items-center
          .row.full-width.justify-center.q-mt-sm
            k-logo(:width="100" :height="100")
          .row.full-width.justify-center
            span.text-h6 KALPAGRAMMA
            .row.full-width.justify-center
              span essence is near...
          div(style=`width: 200px; height: 200px; border-radius: 10px`).row.full-width.justify-items-center.bg-grey-1.q-mt-md.shadow-5
          //- .row.full-width.justify-center.q-mt-md
          //-   <iframe width="280" height="157,5" src="https://www.youtube-nocookie.com/embed/MwYbCLJCV8s" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          .row.full-width.justify-end.self-end.q-mt-xl
            q-btn(v-model="slide" style=`height: 40px` @click="nextSlide()" color="accent" label="Next")
        q-carousel-slide(name="2").row.fit.justify-center.items-center
          .row.justify-center.content-center
            div(style=`border-radius: 50%; border: 3px solid #fff; height: 100px; width: 100px`).row.justify-center.items-center
              q-icon(name="person_add" size="56px")
            .row.full-width.justify-center.q-mt-sm
              span.text-center.text-h5 Find and Follow Facebook Friends
            .row.full-width.justify-center.q-mt-sm
              span.text-center.text-grey-4 You decide who to subscribe to. We will never post to Facebook without your permission.
            .row.full-width.justify-center.q-mt-lg
              q-btn(unelevated color="accent") Connect Facebook
          .row.full-width.justify-end.self-end
            q-btn(flat color="accent" @click="nextSlide()") Skip
        q-carousel-slide(name="3").row.justify-center.items-center
          .row.justify-center.content-center
            div(style=`border-radius: 50%; border: 3px solid #fff; height: 100px; width: 100px`).row.justify-center.items-center
              q-icon(name="add_a_photo" size="56px")
            .row.full-width.justify-center.q-mt-sm
              span.text-center.text-h5 Add a profile photo
            .row.full-width.justify-center.q-mt-sm
              span.text-center.text-grey-4 Add a profile photo that friends could recognize you.
            .row.full-width.justify-center.q-mt-lg
              q-btn(unelevated color="accent") Add a photo
          .row.full-width.justify-end.self-end
            q-btn(flat color="accent" @click="nextSlide()") Skip
        q-carousel-slide(name="4").row.justify-center.content-start
          div(style=`height: 30%`).row
            .row.full-width.justify-start
              span(style='width: 160px').text-h6 Welcome to the Kalpagramma
              .col
              q-btn(v-model="slide" style=`height: 40px` @click="nextSlide()" color="accent" label="Next")
            .row.full-width.justify-start
              span Choose at least 5 to get started.
          div(style=`height: 70%`).row.full-width.justify-center.scroll
            div(v-for="(c, ci) in contentList" :key="ci" @click="chosenContent()").row.justify-center.q-ma-xs
              div(:style=`{width: '6em', height: '6em', overflow: 'hidden', borderRadius: '10px', backgroundSize: 'cover', backgroundImage: 'url(' + c.thumbUrl + ')'}`).row.justify-start
                div(style=`backgroundColor: rgba(0, 0, 0, 0.4)`).row.fit.q-pa-xs
                  small.self-end {{$t(c.name)}}
                  .col
                  div(v-if="chosen === true" :style=`{width: '20px', height: '20px', borderRadius: '50%'}`).row.justify-center.items-center.bg-white
                    q-icon(name="done" size="20px" color="black")
  //- content dialog
  //- q-drawer(v-model="leftDrawerShow" side="left" :width="leftDrawerWidth").gt-xs
  //-   k-menu-desktop(v-if="!loading" @width="leftDrawerWidth = $event")
  //- page
  //- q-page-container
  //-   q-page
  //-     q-resize-observer(ref="pageResizeObserver" @resize="onResize")
  //-     router-view(v-if="!loading" :height="$q.screen.gt.xs ? height : height" :width="width")
  //-     div(v-else).row.full-width.window-height.items-center.justify-center
  //-       k-spinner(:width="200" :height="200")
  //- //- q-footer(reveal).lt-sm
  //- k-menu-mobile(:style=`{position: 'fixed', bottom: '0px', zIndex: 1000}`)
  //- q-layout(
  //-   view='hHh Lpr fFf'
  //-   :style=`{width: $q.screen.width+'px', height: '100vh'}`
  //-   :class="{'bg-grey-3': $route.path !== '/app/menu'}")
  //-   //- node action dialog
  //-   k-dialog-bottom(ref="fragmentActionDialog" :value="$store.state.ui.fragmentActionDialogOpened" mode="actions" :options="fragmentActionDialogOptions"
  //-     @action="fragmentActionDialogAction" @hide="$store.commit('ui/stateSet', ['fragmentActionDialogOpened', false])")
  //-   //- node rate dialog
  //-   q-dialog(ref="nodeRateDialog" :value="$store.state.ui.nodeRateDialogOpened" :maximized="true" transition-show="slide-up" transition-hide="slide-down"
  //-     @hide="$store.commit('ui/stateSet', ['nodeRateDialogOpened', false])")
  //-     node-rate(@hide="$refs.nodeRateDialog.hide()")
  //-   //- node creator dialog
  //-   q-dialog(ref="nodeCreatorDialog" :value="$store.state.ui.nodeCreatorDialogOpened" :maximized="true" transition-show="slide-up" transition-hide="slide-down"
  //-     @hide="$store.commit('ui/stateSet', ['nodeCreatorDialogOpened', false])")
  //-     node-creator(@hide="$refs.nodeCreatorDialog.hide()")
  //-   //- bookmark dialog
  //-   q-dialog(
  //-     ref="bookmarkDialog" :value="$store.state.ui.bookmarkDialogOpened"
  //-     @hide="$store.commit('ui/stateSet', ['bookmarkDialogOpened', false])"
  //-     :maximized="true" transition-show="slide-up" transition-hide="slide-down")
  //-     ws-bookmark(@hide="$refs.bookmarkDialog.hide()")
  //-   //- fragment dialog
  //-   q-dialog(
  //-     ref="fragmentDialog" :value="$store.state.ui.fragmentDialogOpened"
  //-     @hide="$store.commit('ui/stateSet', ['fragmentDialogOpened', false])"
  //-     :maximized="true" transition-show="slide-up" transition-hide="slide-down")
  //-     ws-fragment(@hide="$refs.fragmentDialog.hide()")
  //-   //- content dialog
  //-   //- q-drawer(v-model="leftDrawerShow" side="left" :width="leftDrawerWidth").gt-xs
  //-   //-   k-menu-desktop(v-if="!loading" @width="leftDrawerWidth = $event")
  //-   //- page
  //-   q-page-container
  //-     q-page
  //-       q-resize-observer(ref="pageResizeObserver" @resize="onResize")
  //-       router-view(v-if="!loading" :height="$q.screen.gt.xs ? height : height" :width="width")
  //-       div(v-else).row.full-width.window-height.items-center.justify-center
  //-         k-spinner(:width="200" :height="200")
  //-   //- q-footer(reveal).lt-sm
  //-   k-menu-mobile(
  //-     v-if="$route.name !== 'create'"
  //-     :style=`{position: 'fixed', bottom: '0px', zIndex: 100000}`)
  //- div(:style=`{position: 'relative'}`).row.fit.items-center.justify-center
  //-   q-dialog(
  //-     v-if="$store.state.ui.rect"
  //-     ref="nodeRectDialog" :value="$store.state.ui.rect ? true : false"
  //-     :maximized="true" transition-hide="fadeIn" transition-show="fadeOut"
  //-     @hide="$store.commit('ui/stateSet', ['rect', null])")
  //-     node-rect(:rect="$store.state.ui.rect" @hide="$refs.nodeRectDialog.hide()")
  //-   div(:style=`{position: 'absolute', zIndex: 1000, bottom: '0px', height: '60px'}`).row.full-width
  //-     k-menu-mobile
  //-   transition(appear
  //-     :enter-active-class="$store.state.ui.going ? 'animated slideInRight' : ''")
  //-     router-view(v-if="!loading" :height="$q.screen.height" :width="$q.screen.width")
  //-   //- k-spinner(v-if="loading" :width="100" :height="100")
  //- router-view
  .row.fit.items-center.justify-center
    k-spinner(v-if="loading")
    transition(appear :enter-active-class="$store.state.ui.going ? 'animated slideInRight' : ''")
      router-view(v-if="!loading" :opened="true" :height="$q.screen.height" :width="$q.screen.width")
</template>

<script>
export default {
  name: 'mainLayout',
  components: {},
  data () {
    return {
      contentList: [
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''},
        {name: 'Flowers', thumbUrl: 'https://kvitochka.kiev.ua/image/catalog/00005/flowers-in-basket-2019074.jpg', oid: ''}
      ],
      chosen: null,
      slide: '1',
      next: '',
      lorem: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Itaque voluptatem totam, architecto cupiditate officia rerum, error dignissimos praesentium libero ab nemo.',
      loading: true,
      leftDrawerShow: true,
      leftDrawerWidth: 230,
      radius: 30,
      width: 0,
      height: 0,
      noPointerEvents: true,
      miniState: false,
      drawer: true,
      toggleIcon: ''
    }
  },
  watch: {
    '$q.screen.gt.xs': {
      immediate: true,
      handler (to, from) {
        this.$log('gt.sm CHANGED', to)
        if (to) {
          this.$store.commit('ui/stateSet', ['gtxs', true])
        } else {
          this.$store.commit('ui/stateSet', ['gtxs', false])
        }
        let vh = window.innerHeight
        // if (to) vh = vh * 0.01
        // else vh = (vh - 60) * 0.01
        vh = vh * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      }
    }
  },
  computed: {
    fragmentActionDialogHeaderName () {
      let fragmentPayload = this.$store.state.ui.fragment
      if (fragmentPayload) {
        return fragmentPayload.content.name
      } else {
        return ''
      }
    },
    fragmentActionDialogOptions () {
      return {
        header: false,
        headerName: this.fragmentDialogHeaderName,
        confirm: true,
        confirmName: 'Create node',
        actions: {
          // contentSubscribe: {name: 'Подпсаться на контент'},
          nodeBookmark: {name: 'Node bookmark'},
          contentExplore: {name: 'Explore content'},
          fragmentWorkspace: {name: 'Fragment to workspace'}
        }
      }
    }
  },
  methods: {
    chosenContent () {
      this.chosen = !this.chosen
    },
    prevSlide () {
      if (this.slide === '4') this.prev = '3'
      if (this.slide === '3') this.prev = '2'
      if (this.slide === '2') this.prev = '1'
      if (this.slide === '1') this.prev = '1'
      this.slide = this.prev
    },
    nextSlide () {
      if (this.slide === '1') this.next = '2'
      if (this.slide === '2') this.next = '3'
      if (this.slide === '3') this.next = '4'
      if (this.slide === '4') this.next = '5'
      this.slide = this.next
      if (this.next === '5') this.$refs.tutorialDialog.toggle()
    },
    fragmentActionDialogAction (action) {
      this.$log('fragmentDialogAction', action)
      this.$log('fragmentDialogPayload', this.$store.state.ui.fragment)
      switch (action) {
        case 'header': {
          this.$router.push(`/app/content/${this.$store.state.ui.fragment.content.oid}`)
          break
        }
        case 'nodeBookmark': {
          this.$store.commit('ui/stateSet', ['bookmarkDialogOpened', true])
          this.$store.commit('ui/stateSet', ['bookmark', {
            type: 'node',
            name: '',
            url: 'qwe'
          }])
          break
        }
        case 'contentSubscribe': {
          this.$store.dispatch('subscriptions/subscribe', this.$store.state.ui.fragment.content.oid)
          break
        }
        case 'contentExplore': {
          this.$router.push(`/app/content/${this.$store.state.ui.fragment.content.oid}`)
          break
        }
        case 'fragmentWorkspace': {
          this.$store.commit('ui/stateSet', ['fragmentDialogOpened', true])
          break
        }
        case 'confrim': {
          // this.$store.commit('ui/s')
          this.$store.commit('ui/nodeCreatorDialogOpened', true)
          break
        }
      }
    },
    toggleMini (miniState) {
      this.miniState = !this.miniState
    },
    onResize (e) {
      // this.$log('onResize', e)
      this.width = e.width
      this.height = this.$q.screen.height
    }
  },
  mounted () {
    this.$log('mounted')
    this.$refs.pageResizeObserver.trigger()
    this.$refs.tutorialDialog.show()
    if (this.$refs.pageResizeObserver) this.$refs.pageResizeObserver.trigger()
  },
  async created () {
    try {
      // this.$log('created')
      // console.time('created')
      // this.$q.notify('Created start')
      this.loading = true
      // await this.$wait(10000)
      // Oauth case. take token from redirect url
      let token = this.$route.query.token
      let expires = this.$route.query.expires
      if (token) {
        localStorage.setItem('ktoken', token)
        localStorage.setItem('ktokenExpires', expires)
        this.$router.push('/app/home')
      }
      // this.$q.notify('token', token)
      // user check
      // this.$log('Checking user...')
      let { data: { userIsAuthorized, userIsConfirmed } } = await this.$apollo.query({
        client: 'authApollo',
        query: gql`
          query userCheck {
            userIsAuthorized
            userIsConfirmed
          }
        `,
        fetchPolicy: 'network-only'
      })
      // this.$log('userIsAuthorized', userIsAuthorized)
      // this.$log('userIsConfirmed', userIsConfirmed)
      // this.$q.notify('userIsAuthorized', userIsAuthorized)
      // this.$q.notify('userIsConfirmed', userIsConfirmed)
      // TODO: create with try/catch this...
      if (!userIsAuthorized || !userIsConfirmed) {
        this.$log('GO LOGIN')
        this.$router.push('/login')
        this.$q.notify('Go login')
        return
        // throw new Error(`No auth!`)
        // // TODO: error code? switch...
      }
      await this.$store.dispatch('init')

      this.loading = false
    } catch (error) {
      this.$log('error', error)
      // this.loading = false
    }
  }
 }
</script>

<style lang="stylus">
// .q-footer {
//   background: none !important
// }
// .q-dialog {
//   background: none !important
// }
// .q-dialog__backdrop {
//   background: none !important
// }
</style>
