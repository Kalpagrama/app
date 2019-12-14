<template lang="pug">
div(
  :style=`{borderRadius: '10px', oveflow: 'hidden'}`).row.full-width.bg-white
  //- spheres
  div(:style=`{minHeight: '60px', padding: '10px'}`).row.full-width
    div(:style=`{height: '60px'}`).row.full-width.items-center
      span.text-bold {{ $t('Spheres') }}
      .col
        .row.fit.justify-end.q-pl-xl
          div(
            v-if="sphereCreating"
            :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).full-width
            q-input(v-model="sphere" ref="sphereInput" autofocus filled @blur="sphereCreate()" @keyup.enter="sphereCreate()").full-width
          q-btn(v-else="!sphereCreating" round flat icon="add" color="green" @click="sphereCreateStart()")
    .row.full-width.items-start.content-start.justify-start
      div(
        v-for="(s,si) in node.spheres" :key="si" @click="sphereDelete(s, si)"
        :style=`{borderRadius: '4px'}`).bg-grey-2.q-px-sm.q-mr-sm.q-mb-sm.cursor-pointer
        small(:style=`{whiteSpace: 'nowrap', userSelect: 'none'}`) {{ s.name }}
  //- categories
  div(:style=`{minHeight: '60px', padding: '10px'}`).row.full-width
    div(:style=`{height: '60px'}`).row.full-width.items-center
      span.text-bold {{ $t('Categories') }}
      .col
      q-btn(round flat icon="add" color="green")
    .row.full-width.items-start.content-start
      div(
        v-for="(c, ci) in node.categories" :key="si"
        :style=`{borderRadius: '4px'}`).bg-grey-2.q-px-sm.q-mr-sm.q-mb-sm
        small {{ c }}
</template>

<script>
export default {
  name: 'ncSpheres',
  props: ['node'],
  data () {
    return {
      sphere: '',
      sphereCreating: false
    }
  },
  methods: {
    sphereCreateStart () {
      this.$log('sphereCreateStart')
      this.sphereCreating = true
      this.$nextTick(() => {
        this.$refs.sphereInput.focus()
      })
    },
    sphereCreate () {
      this.$log('sphereCreate', this.sphere)
      if (this.sphere.length === 0) return
      this.node.spheres.push({name: this.sphere})
      this.sphereCreating = false
      this.sphere = ''
    },
    sphereDelete (s, si) {
      this.$log('sphereDelete', s, si)
      this.$delete(this.node.spheres, si)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
