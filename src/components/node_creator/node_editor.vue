<template lang="pug">
div(:style=`{position: 'relative', maxWidth: '100%', borderRadius: '30px 30px 0 0'}`).row.full-width.bg-white
  //- header
  div(:style=`{height: '20px'}`).row.full-width
  //- name
  div(:style=`{height: '40px'}`).row.full-width.items-center.q-px-md
    span.text-bold В чем суть?
  //- name inout
  .row.full-width.q-px-sm
      div(:style=`{borderRadius: '10px', overflow: 'hidden !important', zIndex: 900}`).row.full-width
        q-input(ref="kinput" v-model="node.name" filled type="textarea" autogrow :maxlength="130" @input="nameInput").full-width
  //- spheres header
  div(:style=`{height: '40px'}`).row.full-width.items-center.q-px-md
    span.text-bold Spheres
  //- spheres list
  div(v-if="true").row.full-width.q-px-sm.q-mb-lg
    div(v-show="node.spheres.length > 0" :style=`{background: '#f2f2f2', zIndex: 10, marginBottom: '-30px', borderRadius: '10px 10px 0 0'}`).row.full-width.q-pa-sm
      div(v-for="(s, si) in node.spheres" :key="si"
        :style=`{height: '40px', minWidth: '60px', borderRadius: '10px', overflow: 'hidden'}`
          ).row.justify-between.content-center.items-center.q-pl-sm.q-mr-sm.q-mb-sm.bg-primary
        span(style=`white-space: nowrap`).text-white {{ `#${s.name}` }}
        q-btn(round flat dense color="white" icon="clear" @click="sphereDelete(s, si)").q-mx-xs
  //- spheres input
  div(:style=`{position: 'relative', width: '300px'}`).full-width
    //- div(
    //-   :style=`{position: 'absolute', zIndex: 1000, top: -spheresHeight+'px', height: spheresHeight+'px', maxHeight: '400px', overflow: 'hidden'}`).row.full-width
    //-   div(:style=`{borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).column.fit.bg-white
    //-     .col.scroll
    //-       div(v-for="(s, si) in 100" :key="si" @click="sphereClick(s, si)"
    //-         :style=`{height: '40px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.q-px-sm.cursor-pointer
    //-         span sphere {{ si }}
    .row.full-width.q-px-sm
      div(:style=`{borderRadius: '10px', overflow: 'hidden !important', zIndex: 900}`).row.full-width
        q-input(ref="kinput" v-model="sphereRaw" filled :style=`{background: '#f2f2f2', zIndex: 900}`
          placeholder="add some sphere"
          :maxlength="40" @input="spheresInput" @keyup.enter="sphereCreate").full-width
          template(v-slot:prepend)
            span #
  div(:style=`{height: '70px'}`).row.full-width.q-px-sm.q-mt-md
    q-btn(color="primary" style=`height: 60px; borderRadius: 10px` no-caps :loading="saving" @click="save()").full-width
      span.text-white.text-bold Сохранить
</template>

<script>
export default {
  name: 'nodeEditor',
  props: ['node'],
  data () {
    return {
      sphereRaw: '',
      spheresHeight: 0,
      saving: false
    }
  },
  methods: {
    nameInput (e) {
      this.$log('nameInput', e)
      this.$emit('name', e)
    },
    spheresInput (e) {
      this.$log('handleInput', e)
      // let h = e.length * 10
      // if (h <= 400) this.$tween.to(this, 0.5, {spheresHeight: e.length * 10})
      // this.$emit('name', e)
    },
    sphereDelete (s, si) {
      this.$log('sphereDelete', s, si)
      this.$delete(this.node.spheres, si)
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
        this.$set(this.node.spheres, this.node.spheres.length, {name: this.sphereRaw})
      }
      // clear input
      this.$set(this, 'sphereRaw', '')
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      this.sphereRaw = ''
      this.$set(this.node.spheres, this.node.spheres.length, s)
      document.activeElement.blur()
      // this.$tween.to(this, 0.5, {spheresHeight: 0})
    },
    swipeDown () {
      this.$log('swipeDown')
      this.$q.notify('swipe down!')
      document.activeElement.blur()
    },
    async save () {
      this.$log('save')
      this.saving = true
      await this.$wait(400)
      this.saving = false
      // TODO: need this step?
      this.$emit('close')
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

<style lang="stylus">
.q-menu
  border-radus: 10px
  overflow: hidden
</style>
