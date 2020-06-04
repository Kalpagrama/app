<template lang="pug">
div(
  :style=`{
    position: 'relative'
  }`
  ).column.fit
  //- chain add
  q-btn(
    @click="chainAdd()"
    round push color="green" icon="add"
    :size="$q.screen.xs ? 'md' : 'lg'"
    :style=`{
      position: 'absolute', zIndex: 2000,
      bottom: '10px',
      right: '10px',
      borderRadius: '50%',
    }`)
  //- chain editor
  q-dialog(
    v-model="chainEditorOpened" persistent position="bottom"
    @show="$store.commit('ui/stateSet', ['wsShowMenu', false])"
    @hide="$store.commit('ui/stateSet', ['wsShowMenu', true])")
    ws-chain-editor(
      :value="chain"
      @close="chainEditorOpened = false"
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
      }`)
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px',
      overflow: 'hidden',
    }`
    ).row.full-width.items-start.content-start.b-50.q-pb-sm.q-px-sm
    slot(name="header")
    //- navigation
    div(v-if="$slot ? !$slot.header : true").row.full-width.items-center.content-center.q-py-md
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold Chains
    //- search
    div(v-if="true").row.full-width
      q-input(
        v-model="searchString"
        filled dense dark color="white"
        label="Search..."
        ).full-width
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-md.q-px-sm
      div(
        v-for="c in 3" :key="c"
        :style=`{height: '100px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.b-50.q-mb-md
  //- footer
  div.row.full-width
</template>

<script>
import wsChainEditor from '../ws_chain_editor'

export default {
  name: 'wsChainList',
  components: {wsChainEditor},
  data () {
    return {
      searchString: '',
      chain: null,
      chainEditorOpened: false,
    }
  },
  methods: {
    chainAdd () {
      this.$log('chainAdd')
      let chainId = Date.now().toString()
      let chainInput = {
        id: chainId,
        name: '',
        left: null,
        right: null
      }
      this.chain = chainInput
      this.chainEditorOpened = true
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
