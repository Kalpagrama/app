<template lang="pug">
component(
  v-if="joint"
  v-bind="$props"
  :is="$q.screen.gt.sm ? 'view-mobile' : 'view-mobile'"
  :joint="joint")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsJoint',
  components: {
    viewDesktop: () => import('./view_desktop/index.vue'),
    viewMobile: () => import('./view_mobile/index.vue')
  },
  data () {
    return {
      jointNew: {
        name: '',
        type: 'ASSOCIATIVE',
        items: [],
      },
      joint: null,
    }
  },
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
      this.joint.items.push(item)
    },
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          if (to === 'new') {
            // this.$q.notify({type: 'positive', position: 'top', message: 'Creating new joint'})
            this.joint = JSON.parse(JSON.stringify(this.jointNew))
            // // get first item
            if (this.$route.query.oid) {
              let item = await this.$rxdb.get(RxCollectionEnum.OBJ, this.$route.query.oid)
              this.itemFound(item, 0)
            }
            if (this.$route.query.id) {
              let item = await this.$rxdb.get(RxCollectionEnum.WS_ANY, this.$route.query.id)
              this.itemFound(item, 0)
            }
            // remove it after adding? $router.replace()
            var unwatch = this.$watch(
              'joint',
              async (_from, _to) => {
                this.$log('joint TO', to)
                // create node...
                if (unwatch) unwatch()
                let jointInput = JSON.parse(JSON.stringify(this.joint))
                let joint = await this.$rxdb.set(RxCollectionEnum.WS_JOINT, jointInput)
                this.$router.replace(`/workspace/joint/${joint.id}`)
              },
              {
                deep: true,
              }
            )
          }
          else {
            let item = await this.$rxdb.get(RxCollectionEnum.WS_JOINT, to)
            this.$log('FOUND joint', item)
            if (item) this.joint = item
            else this.$router.replace('/workspace/joints')
          }
        }
      }
    },
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
    // jointItem ?
    // get joint item ?
    let item = this.$store.state.ui.jointEditorItem
    this.$log('mounted item', item)
    if (item) {
      this.itemFound(item)
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
  }
}
</script>
