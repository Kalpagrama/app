<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden'
  }`).column.fit.b-70
  //- header
  div(
    :style=`{borderRadius: '10px', overflow: 'hidden'}`
    ).row.full-width.q-pa-sm.b-100
    //- header
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
      span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-mx-sm Layer editor
      .col
      q-btn(round flat color="white" icon="check" @click="$emit('cancel')")
    //- name
    .row.full-width
      q-input(
        v-model="nameString"
        filled color="white" dark autofocus
        label="Set layer name"
        @keyup.enter="nameStringEnter()"
        ).full-width.b-120
    //- spheres
    .row.full-width
      .row.full-width.q-pa-sm
        span.text-white Add layer spheres
      .row.full-width
        q-input(
          v-model="sphereString"
          filled color="white" dark
          label="Find or create sphere"
          @keyup.enter="sphereStringEnter()"
          ).full-width.b-110
          template(v-slot:append)
            q-btn(
              v-if="sphereString.length > 0"
              round flat dense icon="clear" @click="sphereString = ''")
  //- body
  .col.full-width.scroll
    div(v-if="sphereString.length === 0").row.full-width.items-start.content-start.q-pa-sm
      div(
        v-for="(s,si) in layer.spheres" :key="s.id" @click="sphereClick(s,si)"
        v-if="si !== 0"
        :style=`{borderRadius: '10px', overflow: 'hidden'}`
        ).row.items-center.content-center.justify-center.q-px-sm.q-py-xs.q-mr-sm.q-mb-sm.b-90
        span.text-white {{ s.name }}
    div(v-else).row.full-width.items-start.content-start.q-pa-sm
      kalpa-loader(
        type="WS_SPHERE"
        :variables="variables"
        @itemsLength="spheresLengthChanged")
        template(v-slot=`{items}`)
          div(
            v-for="(s,si) in items" :key="s.id" @click="sphereChoose(s,si)"
            :style=`{height: '35px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.content-center.q-px-md.b-90.br
            span.text-white {{ s.name }}
      //- create sphere from sphere string
      div(
        v-if="sphereStringCreateShow"
        ).row.full-width.items-center.content-center.q-pa-sm
        small.text-white.q-mr-sm Create sphere
        q-btn(color="green" no-caps @click="sphereStringCreate()") {{ sphereString }}
</template>

<script>
export default {
  name: 'layerItem-layerNameEditor',
  props: ['layer'],
  data () {
    return {
      nameString: '',
      sphereString: '',
      sphereStringCreateShow: false
    }
  },
  computed: {
    variables () {
      let res = {selector: {}}
      if (this.sphereString.length > 0) {
        let nameRegExp = new RegExp(this.sphereString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    }
  },
  methods: {
    nameStringEnter () {
      this.$log('nameStringEnter')
      if (this.nameString.length === 0) return
      this.$set(this.layer.spheres, 0, {name: this.nameString})
      // this.nameString = ''
      // this.$emit('cancel')
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      if (!confirm('Delete sphere?')) return
      this.$delete(this.layer.spheres, si)
    },
    sphereChoose (s, si) {
      this.$log('sphereChoose', s, si)
      this.$set(this.layer.spheres, this.layer.spheres.length, {name: s.name})
      this.sphereString = ''
    },
    spheresLengthChanged (val) {
      this.$log('spheresLengthChanged', val)
      if (val === 0) {
        this.sphereStringCreateShow = true
      }
      else {
        this.sphereStringCreateShow = false
      }
    },
    async sphereStringCreate () {
      this.$log('sphereStringCreate')
      let sphereInput = {
        wsItemType: 'WS_SPHERE',
        name: this.sphereString
      }
      let rxDoc = await this.$rxdb.upsertItem(sphereInput)
      this.sphereChoose(rxDoc)
      this.sphereString = ''
    },
    sphereStringEnter () {
      this.$log('sphereStringEnter')
      if (this.sphereString.length === 0) return
      this.$set(this.layer.spheres, this.layer.spheres.length, {name: this.sphereString})
      this.sphereString = ''
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.layer && this.layer.spheres.length > 0) {
      this.nameString = this.layer.spheres[0].name
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.nameStringEnter()
  }
}
</script>
