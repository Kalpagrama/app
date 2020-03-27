<template lang="pug">
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px'}`).bg-grey-10
  q-header(
    reveal
    :style=`{zIndex: 200}`).row.full-width.justify-center.bg-grey-9
    .row.full-width.justify-center
      div(
        v-if="sphere"
        :style=`{
          height: '60px',
          maxWidth: $store.state.ui.maxWidthPage+'px'
        }`
        ).row.full-width.items-center.content-center
        div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
        .col.full-height
          .row.fit.items-center.content-center.justify-center
            span.text-white.text-bold {{ '#'+sphere.name }}
        div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
          q-btn(
            round flat color="white" @click="sphereOpen()"
            :icon="openedHeight > 0 ? 'keyboard_arrow_up' : 'style'")
    //- sphere spheres
    div(
      v-if="openedHeight > 0"
      :style=`{height: openedHeight+'px'}`).row.full-width.justify-center.bg-grey-8
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width
        sphere-spheres(v-if="sphere" :oid="sphere.oid")
        //- q-scroll-area(
        //-   :style=`{height: openedHeight+'px'}`).full-width.q-pa-sm
        //-   .row.items-start.content-start
        //-       span(
        //-         v-for="(s,si) in 100" :key="si"
        //-         :style=`{borderRadius: '10px', whiteSpace: 'nowrap'}`).text-white.q-pa-sm.q-mr-sm.q-mb-sm.bg-grey-7 #sphere-{{si}}
  q-page-conainter
    q-page
      kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables")
        template(v-slot:items=`{items}`)
          node-list(:nodes="items")
</template>

<script>
export default {
  name: 'pageAppSphere',
  components: {},
  data () {
    return {
      sphere: null,
      opened: false,
      openedHeight: 0
    }
  },
  computed: {
    sphereOid () {
      return this.$route.params.oid
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 10 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    }
  },
  watch: {
    $route: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.page = 'sphere'
        if (to.params.oid) {
          this.$log('$route CHANGED', to)
          this.sphere = await this.sphereLoad(to.params.oid)
        }
      }
    }
  },
  methods: {
    sphereOpen () {
      this.$log('sphereOpen')
      this.$tween.to(this, 0.3, {
        openedHeight: this.opened ? 0 : 160,
        onComplete: () => {
          this.opened = !this.opened
        }
      })
    },
    async sphereLoad (oid) {
      this.$log('sphereLoad start', oid)
      let sphere = await this.$store.dispatch('objects/get', { oid, priority: 0 })
      this.$log('sphereLoad done', sphere)
      return sphere
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
