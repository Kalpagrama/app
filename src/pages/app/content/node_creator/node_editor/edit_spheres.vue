<template lang="pug">
.row.full-width.items-start.content-start.q-pl-sm
  edit-category(:node="node")
  div(
    @click="sphereDelete(si)"
    v-for="(s,si) in node.spheres" :key="si"
    :style=`{
      background: 'rgba(40,40,40,0.5)',
      borderRadius: '10px',
      height: '34px',
      marginTop: '6px',
    }`
    ).row.items-center.content-center.q-px-sm.q-mr-sm.cursor-pointer
    //q-icon(name="blur_on" color="grey-6" size="20px").q-mr-xs
    span.text-grey-4 {{ '✦'+ s.name }}
  q-input(
    ref="sphereInput"
    v-model="sphere"
    dark borderless color="white" dense
    placeholder="Введите сферу"
    :input-style=`{
      paddingTop: '12px',
      //- paddingLeft: node.spheres.length === 0 ? '12px' : '4px',
      paddingLeft: '4px',
      minWidth: '60px',
    }`
    @keyup.enter="sphereAdd")
</template>

<script>
import editCategory from './edit_category.vue'

export default {
  name: 'spheresEditorOnline',
  components: {
    editCategory,
  },
  props: ['node'],
  data () {
    return {
      sphereAdding: false,
      sphere: ''
    }
  },
  methods: {
    sphereAdd () {
      this.$log('sphereAdd')
      let sphereName = this.sphere.trim()
      if (sphereName.length === 0) return
      if (this.node.spheres.find(s => s.name === sphereName)) {
        this.sphere = ''
        return
      }
      this.node.spheres.push({ name: sphereName })
      this.sphere = ''
    },
    sphereDelete (si) {
      this.$log('sphereDelete', si)
      this.$delete(this.node.spheres, si)
    },
    sphereInputOnKeydown (e) {
      this.$log('sphereInputOnKeydown', e)
      const key = e.key
      if (key === 'Backspace' || key === 'Delete') {
        if (this.sphere.length === 0) {
          if (this.node.spheres.length > 0) {
            this.$delete(this.node.spheres, this.node.spheres.length - 1)
          }
        }
        return false
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$refs.sphereInput.$el.addEventListener('keydown', this.sphereInputOnKeydown)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$refs.sphereInput.$el.removeEventListener('keydown', this.sphereInputOnKeydown, false)
  }
}
</script>
