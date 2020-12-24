<template lang="pug">
q-layout(view="hHh Lpr lff").bg-black
  q-footer(reveal).bg-black
    div(
      :style=`{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`).row.full-width
        div(
          v-if="jointCreating"
          :style=`{
            position: 'relative',
            height: creatorHeight+'px',
            paddingTop: '35px',
            paddingBottom: '35px',
          }`
          ).row.full-width.bg-black.br
          div(
            :style=`{
              position: 'absolute', zIndex: 3000, top: '-30px', left: '0px',
              height: '60px',
            }`
            ).row.full-width.q-px-md
            div(
              :style=`{
                height: '60px',
                borderRadius: '10px',
              }`
              ).row.full-width.b-40
          q-btn(
            round flat color="green" icon="add" size="xl"
            ).fit.b-30
        .row.full-width.items-center.content-center.q-pa-sm
          q-btn(round flat color="white" icon="west" @click="$router.back()")
          .col
          q-btn(
            @click="jointCreating = !jointCreating"
            round flat color="green"
            :icon="jointCreating ? 'check' : 'add'")
  q-page-container
    component(
      :is="`view-${viewId}`"
      :joint="joint"
      :joints="joints")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import viewThreads from './view_threads/index.vue'
import viewBinary from './view_binary/index.vue'

export default {
  name: 'pageApp_links',
  components: {
    viewThreads,
    viewBinary,
  },
  data () {
    return {
      joint: null,
      jointNew: {
        oid: null,
        items: [],
        name: '',
        vertices: [],
        spheres: [],
        category: 'FUN',
        layout: 'HORIZONTAL',
      },
      jointCreating: false,
      joints: [],
      jointsLoaded: false,
      viewId: 'binary', // threads, binary
    }
  },
  computed: {
    jointsQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.$route.params.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    },
    creatorHeight () {
      return (this.$q.screen.height - 60) / 2
    },
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.$log('$route.params.oid TO', to)
          let item = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          let joint = JSON.parse(JSON.stringify(this.jointNew))
          joint.items[0] = item
          this.$set(this, 'joint', joint)
        }
      }
    },
  },
  methods: {
    async jointsUpdated (joints) {
      this.$log('jointsUpdated', joints)
      if (joints) this.joints = joints
      if (this.jointsLoaded) {
      }
      else {
        this.jointsLoaded = true
      }
    }
  },
  mounted () {
    // this.$log('mounted')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
  }
}
</script>
