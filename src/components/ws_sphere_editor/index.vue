<template lang="pug">
.row.full-width.items-start.content-start
  q-dialog(
    :position="$q.screen.width < 800 ? 'bottom' : 'standard'"
    :maximized="$q.screen.width < 800 ? true : false"
    transition-show="none"
    transition-hide="none"
    v-model="sphereAddingDialog")
    ws-sphere-finder(
      :useSearch="true"
      :selectedIds="item.spheres"
      @sphere="sphereAdd"
      @close="sphereAddingDialog = false"
      :style=`{
        height: $q.screen.height < 800 ? $q.screen.height+'px' : '600px',
      }`).full-width.b-30
  //- prepend default slot
  slot
  //- spheres list
  ws-sphere-item(
    v-for="(sphereId, sphereIdIndex) in item.spheres" :key="sphereId"
    :id="sphereId"
    @clicked="sphereEditing = sphereId"
    ).q-mr-sm.q-mb-sm
    template(v-slot:append)
      q-btn(
        v-if="sphereEditing === sphereId"
        @click="sphereDelete(sphereId)"
        round flat dense color="red" icon="delete_outline")
  //- append
  slot(name="append")
  //- input row
  div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden',}`).row
    //- :autofocus="$q.screen.width > 1200"
    q-input(
      v-if="sphereAdding"
      v-model="sphereSearchString"
      ref="sphereEditorInput"
      autofocus
      placeholder="Найти сферу"
      filled dark dense color="grey-6"
      @keyup.enter="$refs.wsSphereFinder.sphereCreate().then(sphereAdd)"
      @focus="$refs.sphereEditorMenu.show()")
      //- template(v-slot:append)
        span.text-white {{sphereAdding}}
    //- :target="$refs.sphereEditorInput"
    q-menu(
      ref="sphereEditorMenu"
      dark fit anchor="bottom left" self="top left" no-focus)
      ws-sphere-finder(
        ref="wsSphereFinder"
        :useSearch="false"
        :searchString="sphereSearchString"
        :selectedIds="item.spheres"
        :hiddenIds="hiddenIds || []"
        @sphere="sphereAdd"
        :style=`{
          width: '300px', height: '300px',
        }`)
  //- stop sphereAdding
  q-btn(
    v-if="sphereAdding"
    @click="sphereAdding = false"
    round flat color="grey-6" icon="clear"
    :style=`{height: '40px',}`)
  //- start sphereAdding
  q-btn(
    v-if="!sphereAdding"
    @click="sphereAddingDialog = true"
    flat color="grey-6" icon="add" no-caps dense
    :style=`{height: '40px'}`) Добавить сферу
</template>

<script>
export default {
  name: 'wsSphereEditor',
  components: {},
  props: {
    item: {
      type: Object,
      required: true
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
      sphereSearchString: '',
      sphereAdding: false,
      sphereAddingDialog: false,
      sphereEditing: null,
    }
  },
  methods: {
    sphereDelete (sphereId) {
      this.$log('sphereDelete')
      this.item.spheres = this.item.spheres.filter(id => id !== sphereId)
      this.sphereAdding = false
      this.sphereEditing = null
      this.sphereSearchString = ''
    },
    sphereAdd (sphere) {
      this.$log('sphereAdd', sphere)
      let sphereFind = this.item.spheres.find(id => id === sphere.id)
      if (!sphereFind) {
        this.item.spheres.push(sphere.id)
      }
      this.sphereAdding = false
      this.sphereEditing = null
      this.sphereSearchString = ''
      this.$refs.sphereEditorMenu.hide()
    }
  }
}
</script>
