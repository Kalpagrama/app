<template lang="pug">
.row.full-width.items-start.content-start.q-px-sm
  .row.full-width
    slot(name="top")
  .row
    slot(name="left")
  .col.scroll
    .row.full-width.items-center.content-center.q-py-xs.no-wrap
      //- slot(name="left")
      q-btn(
        v-for="(s,si) in node.spheres" :key="si"
        flat no-caps dense color="white"
        :style=`{
          whiteSpace: 'nowrap',
        }`
        @click="sphereDelete(s)"
      ).q-px-xs {{ '#'+s.name }}
  .row
    slot(name="right")
  .row.full-width
    .col
      q-input(
        v-model="sphere"
        borderless dark dense
        :placeholder="$t('Add sphere of essence')"
        :input-style=`{
          //- textAlign: 'center',
          paddingLeft: '16px',
        }`
        @blur="sphereAdd()"
        @keydown.enter="sphereAdd()"
        ).full-width
    //- .row
    slot(name="spheres-right")
  .row.full-width
    slot(name="bottom")
</template>

<script>
export default {
  name: 'nodeEditor__editSpheres',
  props: ['node'],
  data () {
    return {
      sphere: ''
    }
  },
  methods: {
    sphereAdd () {
      this.$log('sphereAdd')
      // checks
      if (this.sphere.length === 0) return
      if (this.node.name === this.sphere) {
        this.$q.notify({type: 'negative', position: 'top', message: this.$t('Add another')})
        this.sphere = ''
        return
      }
      if (this.node.spheres.find(s => s.name === this.sphere)) {
        this.$q.notify({type: 'negative', position: 'top', message: this.$t('Already added!')})
        this.sphere = ''
        return
      }
      if (this.node.spheres.length >= 5) {
        this.$q.notify({type: 'negative', position: 'top', message: this.$t('Maximum 5 spheres!')})
        return
      }
      // do stuff
      this.node.spheres.push({name: this.sphere})
      this.sphere = ''
    },
    sphereDelete (s) {
      this.$log('sphereDelete', s)
      this.node.spheres = this.node.spheres.filter(i => i.name !== s.name)
    },
  }
}
</script>
