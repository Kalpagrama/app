<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated fadeOut")
  //- byte, gallery, list chains in col
  .col.full-width
    component(:is="`chain-${mode}`" v-if="height > 300" :node="node" :chains="chains")
  //- dialogs
  chain-add(
    v-show="chainAddDialogShow"
    @hide="chainAddDialogToggle()"
    :node="node"
    :style=`{
      position: 'absolute', zIndex: 3000, top: '0px', left: chainAddDialogRight+'%',
      borderRadius: '10px 10px 0 0', overflow: 'hidden'}`)
  //- actions
  div(
    v-if="height >= 120"
    :style=`{position: 'absolute', zIndex: 200, bottom: '60px', height: '50px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`
      ).row.full-width.bg-grey-8
    .col.full-height
      .row.fit.items-center.content-center.q-px-xs
        q-btn(round flat :color="mode === 'byte' ? 'green' : 'grey-5'" icon="branding_watermark" @click="mode = 'byte'")
        q-btn(round flat :color="mode === 'gallery' ? 'green' : 'grey-5'" @click="mode = 'gallery'")
          q-icon(name="subtitles" size="26px")
        q-btn(round flat :color="mode === 'list' ? 'green'  : 'grey-5'" icon="featured_play_list" @click="mode = 'list'")
    div(:style=`{height: '50px', width: '50px'}`).row.items-center.content-center.justify-center
      q-btn(round push dense color="green" icon="add" @click="chainAddDialogToggle()"
        :style=`{borderRadius: '50%'}`)
  //- footer
  div(:style=`{height: '60px'}`).row.full-width.bg-grey-8
    kalpa-buttons(:value="tabs" :id="tab" @id="$emit('tab', $event)")
</template>

<script>
import chainAdd from './chain_add'
import chainList from './chain_list'
import chainGallery from './chain_gallery'
import chainByte from './chain_byte'

export default {
  name: 'nodeExplorer_extraExplore',
  components: {chainAdd, chainList, chainGallery, chainByte},
  props: ['node', 'tabs', 'tab', 'height', 'heightKey'],
  data () {
    return {
      mode: 'list',
      chains: [],
      chainAddDialogShow: false,
      chainAddDialogRight: 100,
    }
  },
  watch: {
    // chainAddDialogShow: {
    //   handler (to, from) {
    //     this.$log('chainAddDialogShow', to)
    //     this.$tween.to(this, 0.3, {chainAddDialogRight: to ? 500 : 0})
    //   }
    // }
  },
  methods: {
    chainAddDialogToggle () {
      this.$log('chainAddDialogToggle')
      if (this.chainAddDialogShow) {
        this.$tween.to(this, 0.3, {
          chainAddDialogRight: 100,
          onComplete: () => {
            this.chainAddDialogShow = false
          }
        })
      }
      else {
        this.chainAddDialogShow = true
        this.$tween.to(this, 0.3, {chainAddDialogRight: 0})
      }
    },
    async chainsLoad () {
      try {
        this.$log('chainsLoad start')
        let {chainList, setCurrentIndx} = await this.$store.dispatch('lists/nodeChains', {nodeOid: this.node.oid})
        this.$log('chainsLoad done', chainList)
        this.chains = chainList
      }
      catch (e) {
        this.$log('chainsLoad error', e)
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.chainsLoad()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
