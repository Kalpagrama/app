<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-center.content-center
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
        .col
          q-input(
            v-if="sphere"
            v-model="sphere.name"
            borderless
            :input-style=`{
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              //- paddingLeft: '10px',
            }`
            ).full-width
            template(v-slot:prepend)
              q-icon(name="blur_on" color="white" size="30px")
              //- span.text-white #
        q-btn(round flat color="white" icon="launch" @click="sphereLaunch()")
        div(:style=`{paddingRight: '50px',}`).row.full-width.q-pl-md
          q-tabs(
            :value="typeId" @input="typeId = $event" inline-label
            dense no-caps active-color="green" align="left"
            ).full-width.text-grey-8
            q-tab(name="details" label="Детали").q-px-md
            q-tab(name="items" label="Элементы").q-px-md
    component(v-if="sphere" :is="`sphere-${typeId}`" :sphere="sphere")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsSphere',
  components: {
    sphereDetails: () => import('./sphere_details.vue'),
    sphereExplore: () => import('./sphere_explore.vue'),
    sphereItems: () => import('./sphere_items.vue')
  },
  data () {
    return {
      typeId: 'items',
      sphere: null,
      sphereNameEditing: false,
      viewId: 'items',
      views: [
        {id: 'workspace.sphere.details', name: 'Details'},
        {id: 'workspace.sphere.items', name: 'Items'},
        {id: 'workspace.sphere.explore', name: 'Explore'}
      ]
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          let item = await this.$rxdb.get(RxCollectionEnum.WS_SPHERE, to)
          // let [item] = await this.$rxdb.find({
          //   selector: {
          //     rxCollectionEnum: RxCollectionEnum.WS_SPHERE,
          //     id: to
          //   }
          // })
          this.sphere = item
        }
      }
    }
  },
  methods: {
    sphereLaunch () {
      this.$log('sphereLaunch')
      // get sphere oid if there is one?
      // and go to this
    },
    outHandle ([type, val]) {
      this.$log('outHandle', type, val)
      if (type === 'back') {
        this.$router.back()
      }
    },
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
    this.$store.commit('ui/stateSet', ['showDesktopNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
    this.$store.commit('ui/stateSet', ['showDesktopNavigation', true])
  }
}
</script>
