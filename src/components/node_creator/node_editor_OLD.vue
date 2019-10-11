<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  //- header
  div(
    v-if="true"
    :style=`{minHeight: '70px'}`).row.full-width.q-pa-sm
    //- name
    div(:style=`{height: '40px'}`).row.full-width.items-center.q-px-sm
      span.text-bold В чем суть?
    //- name in out
    .row.full-width
        div(:style=`{borderRadius: '10px', overflow: 'hidden !important', zIndex: 900}`).row.full-width
          q-input(ref="kinput" :value="node.name" filled type="textarea" autogrow :maxlength="130" @input="nameInput").full-width
  //- body
  div(:style=`{padding: '0 0 80px 0'}`).col.scroll.full-width
    //- category header
    node-category(:input="node.categories" @input="$emit('categories', $event)")
    //- layout header
    div(:style=`{height: '40px'}`).row.full-width.items-center.q-px-md
      span.text-bold Шаблон
    //- layout input
    .row.full-width.q-px-sm
      div(:style=`{height: '56px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.q-px-sm.bg-grey-3
        //- span Выберите шаблон
        span Картинка в картинке
        .col
        q-icon(name="keyboard_arrow_down" size="30px" color="grey-7").q-mr-sm
    //- spheres header
    div(:style=`{height: '40px'}`).row.full-width.items-center.q-px-md
      span.text-bold Сферы
    //- spheres list
    div(v-if="true" :class=`{'q-mb-lg': node.spheres.length > 0}`).row.full-width.q-px-sm
      div(v-show="node.spheres.length > 0" :style=`{background: '#f2f2f2', zIndex: 10, marginBottom: '-30px', borderRadius: '10px 10px 0 0'}`).row.full-width.q-pa-sm
        div(v-for="(s, si) in node.spheres" :key="si"
          :style=`{height: '40px', minWidth: '60px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.justify-between.content-center.items-center.q-pl-sm.q-mr-sm.q-mb-sm.bg-primary
          span(style=`white-space: nowrap`).text-white {{ `#${s.name}` }}
          q-btn(round flat dense color="white" icon="clear" @click="sphereDelete(s, si)").q-mx-xs
    //- spheres input
    div(:style=`{position: 'relative', width: '300px'}`).full-width
      .row.full-width.q-px-sm
        div(:style=`{borderRadius: '10px', overflow: 'hidden !important', zIndex: 900}`).row.full-width
          q-input(ref="kinput" v-model="sphereRaw" filled :style=`{background: '#f2f2f2', zIndex: 900}`
            placeholder="add some sphere"
            :maxlength="40" @input="spheresInput" @keyup.enter="sphereCreate").full-width
            template(v-slot:prepend)
              span #
    .row.full-width.bg-red
      //- small.text-black {{ node }}
  //- footer
  div(:style=`{position: 'absolute', bottom: '0px', zIndex: 1000, height: '70px', background: 'rgba(255, 255, 255, 0.5)'}`).row.full-width.items-start.q-px-sm
    q-btn(
      color="primary" no-caps @click="$emit('hide')"
      style=`height: 60px; borderRadius: 10px; overflow: hidden`).full-width
      span.text-white.text-bold Сохранить
</template>

<script>
import nodeCategory from './node_category'

export default {
  name: 'nodeCreator__nodeEditor',
  components: {nodeCategory},
  props: ['node'],
  data () {
    return {
      name: '',
      spheres: [],
      sphereRaw: ''
    }
  },
  methods: {
    nameInput (e) {
      // this.$log('nameInput', e)
      this.$emit('name', e)
    },
    spheresInput (e) {
      this.$log('handleInput', e)
    },
    sphereDelete (s, si) {
      this.$log('sphereDelete', s, si)
      this.$delete(this.spheres, si)
    },
    sphereCreate () {
      this.$log('sphereCreate', this.sphereRaw)
      if (this.node.spheres.length >= 10) {
        this.$q.notify({message: '10 spheres max!', color: 'red', textColor: 'white'})
        return
      }
      if (this.sphereRaw.length === 0) {
        this.$q.notify({message: 'Cant create empty sphere!', color: 'red', textColor: 'white'})
        return
      }
      // check duplicate
      let sphereFind = this.node.spheres.find(s => (s.name === this.sphereRaw))
      if (sphereFind) {
        this.$q.notify({message: `Duplicate: ${this.sphereRaw}!`, color: 'red', textColor: 'white'})
      } else {
        this.$set(this.spheres, this.spheres.length, {name: this.sphereRaw})
        this.$emit('spheres', this.spheres)
      }
      // clear input
      this.$set(this, 'sphereRaw', '')
    }
  },
  mounted () {
    this.$log('mounted')
    this.spheres = this.node.spheres
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>

<style lang="stylus">
</style>
