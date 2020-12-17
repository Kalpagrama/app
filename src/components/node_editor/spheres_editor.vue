<template lang="pug">
.row.full-width.justify-center
  //- spheres list
  div(v-if="node.spheres.length > 0").row.full-width.justify-center.scroll.q-pa-sm
    .row.no-wrap.q-pr-sm
      q-btn(
        v-for="(s,si) in node.spheres" :key="si"
        @click="sphereClick(s, si)"
        flat no-caps color="grey-4" dense
        ).b-40.q-mr-sm
        .row.items-center.content-center.no-wrap
          q-icon(name="blur_on" size="18px" color="grey-4").q-mr-sm
          span(:style=`{whiteSpace: 'nowrap'}`) {{ s.name }}
  //- spheres, links, names
  div(:style=`{paddingLeft: '60px', paddingRight: '60px',}`).row.full-width.justify-center.q-py-sm
    //- innputs
    div(:style=`{maxWidth: '400px',}`).row.full-width.justify-center
      .col
        q-input(
          v-if="true"
          v-model="sphere"
          borderless dense
          dark
          :disable="node.spheres.length > 2"
          :placeholder="node.spheres.length > 2 ? '3 сферы максимум' : 'Добавить сферу'"
          :input-style=`{
            textAlign: 'center',
            borderRadius: '10px',
            whiteSpace: 'nowrap',
          }`
          :style=`{
            borderRadius: '10px',
          }`
          @keyup.enter="sphereAdd"
          ).b-40
</template>

<script>
export default {
  name: 'nodeEditor_spheresEditor',
  props: ['node'],
  data () {
    return {
      sphere: '',
      sphereAdding: false,
    }
  },
  methods: {
    sphereAdd () {
      this.$log('sphereAdd')
      if (this.sphere.length === 0) return
      if (this.node.spheres.find(s => s.name === this.sphere)) return
      this.node.spheres.push({name: this.sphere})
      this.sphere = ''
    },
    sphereClick (sphere, si) {
      this.$log('sphereClick', sphere, si)
      this.node.spheres = this.node.spheres.filter(s => s.name !== sphere.name)
    },
  }
}
</script>
