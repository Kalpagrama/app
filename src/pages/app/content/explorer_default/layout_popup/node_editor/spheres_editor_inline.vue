<template lang="pug">
.row.full-width.q-px-md
  div(
    :style=`{
      position: 'relative',
    }`
    ).row.full-width.items-center.content-center
    div(
      v-if="sphereAdding"
      :style=`{
        position: 'absolute', zIndex: 100,
      }`
      ).row.fit.b-40
      q-input(
        v-model="sphere"
        borderless dark dense color="white"
        placeholder="Введите сферу"
        autofocus
        ).full-width
        template(v-slot:append)
          q-btn(round flat dense color="grey-6" icon="clear" @click="sphere = '', sphereAdding = false").q-mr-sm
          q-btn(round flat dense color="green" icon="check" @click="sphereAdd(sphere)")
    .col.scroll
      div(
        v-if="node.spheres.length > 0"
        ).row.no-wrap.q-mr-xl
        q-btn(
          @click="sphereDelete(s.name)"
          v-for="(s,si) in node.spheres" :key="si"
          flat dense color="grey-6" no-caps
          :style=`{
            whiteSpace: 'nowrap'
          }`
          ).q-mr-sm.b-50 {{ s.name }}
      span(
        v-else
        ).text-grey-6 Сферы сути
    q-btn(
      @click="sphereAdding = true"
      round flat dense color="green" icon="add"
      ).q-ma-xs
</template>

<script>
export default {
  name: 'spheresEditorOnline',
  props: ['node'],
  data () {
    return {
      sphereAdding: false,
      sphere: ''
    }
  },
  methods: {
    sphereAdd (sphere) {
      this.$log('sphereAdd', sphere)
      const sphereFind = this.node.spheres.find(s => s.name === sphere)
      if (sphereFind) return
      this.node.spheres.push({name: sphere})
      this.sphere = ''
      this.sphereAdding = false
    },
    sphereDelete (sphere) {
      this.$log('sphereDelete', sphere)
      this.node.spheres = this.node.spheres.filter(s => s.name !== sphere)
    }
  }
}
</script>
