<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start
  //- mobile dialog
  q-dialog(
    v-model="sphereDialogShow"
    maximized
    transition-show="none"
    transition-hide="none"
    )
    sphere-autocomplete(
      :searchString="searchString" :selected="item.spheres"
      :style=`{
        minWidth: $q.screen.width+'px', maxWidth: $q.screen.width+'px',
        minHeight: $q.screen.height+'px', maxHeight: $q.screen.height+'px',
      }`
      @sphere="sphereAdd").b-30
      template(v-slot:header)
        .row.full-width.items-start.content-start
          //- header
          div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
            span(:style=`{fontSize: '18px',}`).text-white.text-bold.q-ml-md Добавить сферу
            .col
            q-btn(round flat color="white" icon="clear" @click="sphereDialogShow = false").q-mr-sm
          .row.full-width.items-start.content-start.q-px-sm
            spheres(
              :spheres="item.spheres"
              :sphereAdd="sphereAdd"
              :sphereDelete="sphereDelete"
              :sphereCreate="sphereCreate"
              @searchString="searchString = $event")
  //- tint-interceptor for mobile
  div(
    v-if="$q.screen.width < 800"
    @click="sphereDialogShow = true"
    :style=`{
      position: 'absolute', zIndex: 500,
    }`
    ).row.fit
  spheres(
    :spheres="item.spheres"
    :sphereAdd="sphereAdd"
    :sphereDelete="sphereDelete"
    :sphereCreate="sphereCreate"
    @searchString="searchString = $event")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import spheres from './spheres.vue'
import sphereAutocomplete from './sphere_autocomplete.vue'

export default {
  name: 'wsSphereEditor',
  components: {spheres, sphereAutocomplete},
  props: {
    item: {
      type: Object,
      required: true,
    },
    hiddenIds: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      searchString: '',
      sphereDialogShow: false,
    }
  },
  methods: {
    sphereAdd (sphere) {
      this.$log('sphereAdd', sphere)
      let sphereFind = this.item.spheres.findIndex(i => i === sphere.id)
      if (sphereFind >= 0) {
        this.$log('*** sphere DUPLICATE ***', sphere.name)
      }
      else {
        this.item.spheres.push(sphere.id)
      }
    },
    sphereDelete (id) {
      this.$log('sphereDelete', id)
      this.item.spheres = this.item.spheres.filter(i => i !== id)
    },
    async sphereCreate (name) {
      this.$log('sphereCreate', name)
      let [sphere] = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_SPHERE, name: name,
        }
      })
      if (sphere) {
        this.$log('*** sphere DUPLICATE ***', name)
      }
      else {
        this.$log('sphere CREATE !', name)
        let sphereInput = {
          wsItemType: 'WS_SPHERE',
          spheres: [],
          name: name,
        }
        sphere = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
      }
      return sphere
    }
  }
}
</script>
