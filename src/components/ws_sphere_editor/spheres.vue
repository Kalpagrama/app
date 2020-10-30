<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-center.content-center
  //- get width for sphere autocomplete menu maxWidth...
  q-resize-observer(@resize="e => width = e.width")
  //- sphere autocomplete dialog...
  q-menu(
    v-model="sphereAutocompleteShow"
    fit dark no-focus no-parent-event separate-close-popup
    :offset="[0,8]")
    sphere-autocomplete(
      :searchString="sphereSearching" :selected="spheres"
      :style=`{
        maxWidth: width+'px', minWidth: width+'px',
        height: '500px',
        minHeight: '500px', maxHeight: '500px',
      }`
      @sphere="sphereAdd")
  //- preview spheres...
  div(
    v-for="(sphere,si) in spheres"  :key="sphere"
    :style=`{height: '42px'}`).row.items-center.content-center.q-mr-xs
    ws-sphere-item(:id="sphere").b-60
      template(v-slot:append)
        q-icon(
          @click="sphereDelete(sphere)"
          name="clear" color="white" size="14px").q-mr-sm.q-mt-xs.cursor-pointer
  //- sphere input for search and autocomplete...
  q-input(
    ref="sphereInput"
    v-model="sphereSearching"
    borderless dark dense
    placeholder="Введите сферу"
    :input-style=`{
      paddingLeft: '8px',
      paddingTop: '4px',
    }`
    :style=`{
      //- maxHeight: '24px',
      minWidth: '80px',
    }`
    @keyup.enter="sphereInputEntered"
    @keyup.backspace="sphereInputBackspaced"
    @input.native="sphereInputEvented"
    @focus="sphereInputFocused"
    @blur="sphereInputBlurred"
    ).col
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import sphereAutocomplete from './sphere_autocomplete.vue'

export default {
  name: 'wsSphereEditor_spheres',
  props: ['spheres', 'sphereAdd', 'sphereDelete', 'sphereCreate'],
  components: {sphereAutocomplete},
  data () {
    return {
      width: 0,
      sphereSearching: '',
      sphereAutocompleteShow: false,
      // sphereInputBackspaced: 0,
    }
  },
  watch: {
    sphereSearching: {
      handler (to, from) {
        this.$log('sphereSearching TO', to)
        this.$emit('searchString', to)
      }
    }
  },
  methods: {
    async sphereInputEntered () {
      this.$log('sphereInputEntered')
      if (this.sphereSearching.length === 0) return
      let sphere = await this.sphereCreate(this.sphereSearching)
      this.sphereAdd(sphere)
      this.sphereSearching = ''
    },
    sphereInputBackspaced (e) {
      this.$log('sphereInputBackspaced', e)
      // if (e.target.value.length === 0) {
      //   if (this.spheres.length > 0) {
      //     this.sphereInputBackspaced += 1
      //     if (this.sphereInputBackspaced >= 1) {
      //       this.sphereDelete(this.spheres[this.spheres.length - 1])
      //     }
      //   }
      // }
    },
    async sphereInputEvented (e) {
      this.$log('sphereInputEvented', e)
      // if ()
      // let start = e.target.selectionStart
      // let lastChar = String.fromCharCode(e.target.value.charCodeAt(start - 1))
      let commaIndex = e.target.value.indexOf(',', 0)
      this.$log('commaIndex', commaIndex)
      if (commaIndex >= 0) {
        let val = this.sphereSearching
        // slice string
        this.sphereSearching = val.slice(commaIndex, this.sphereSearching.length - 1)
        // create sphere
        let sphere = await this.sphereCreate(val.slice(0, val.length - 1))
        this.sphereAdd(sphere)
      }
    },
    sphereInputFocused (e) {
      this.$log('sphereInputFocused')
      // TODO: weak place...
      if (this.$q.screen.width < 800) return
      this.sphereAutocompleteShow = true
    },
    sphereInputBlurred (e) {
      this.$log('sphereInputBlurred')
    },
  }
}
</script>
