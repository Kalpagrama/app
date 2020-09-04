<template lang="pug">
q-page(
  :style=`{paddingTop: '20px', paddingBottom: '400px'}`)
  .row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: '800px', overflow: 'hidden'}`).row.full-width
      small.text-white {{sphere}}
      .row.full-width
        ws-sphere-item(
          v-for="(s,si) in sphere.spheres" :key="s" :id="s"
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
          }`
          @clicked="sphereEditing = s").q-mb-sm.q-mr-sm.b-40
          template(v-slot:append)
            q-btn(
              v-if="sphereEditing === s"
              @click="sphereDelete(s)"
              round flat dense color="red" icon="delete_outline")
        div(
          :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '40px'}`
          ).row.items-start.content-start
          q-input(
            v-if="sphereAdding"
            v-model="sphereSearchString" autofocus
            placeholder="Найти сферу"
            filled dark dense color="grey-6"
            @keyup.enter="$refs.wsSphereFinder.sphereCreate().then(sphereAdd)")
          q-menu(
            v-model="sphereAdding"
            ref="sphereSelectorMenu"
            dark fit no-focus
            anchor="top left" self="bottom left")
            ws-sphere-finder(
              ref="wsSphereFinder" :useSearch="false"
              :searchString="sphereSearchString"
              :selectedIds="sphere.spheres"
              :hiddenIds="[sphere.id]"
              @sphere="sphereAdd")
        q-btn(
          v-if="sphereAdding"
          @click="sphereAdding = false"
          round flat color="grey-8" icon="clear"
          :style=`{height: '40px',}`)
        q-btn(
          v-if="!sphereAdding"
          @click="sphereAdding = true"
          flat color="green" icon="add" no-caps dense
          :style=`{height: '40px'}`) {{$t('wsNodeEditor_sphereAddFirst', 'Добавь сферу')}}
</template>

<script>
import wsSphereFinder from 'components/ws_sphere_finder/index.vue'

export default {
  name: 'pageApp_wsSphere_details',
  components: {wsSphereFinder},
  props: ['sphere'],
  data () {
    return {
      sphereSearchString: '',
      sphereAdding: false,
      sphereEditing: null
    }
  },
  methods: {
    sphereAdd (sphere) {
      this.$log('sphereAdd', sphere)
      let sphereFind = this.sphere.spheres.find(id => id === sphere.id)
      if (sphereFind) this.sphere.spheres = this.sphere.spheres.filter(id => id !== sphere.id)
      else this.sphere.spheres.push(sphere.id)
      this.$refs.sphereSelectorMenu.hide()
    },
    sphereDelete (sphereId) {
      this.$log('sphereDelete', sphereId)
      this.sphere.spheres = this.sphere.spheres.filter(id => id !== sphereId)
    }
  }
}
</script>
