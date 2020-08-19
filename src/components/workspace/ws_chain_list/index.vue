<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- chain add
  q-btn(
    @click="chainAdd()"
    round push color="green" icon="add"
    :size="$q.screen.xs ? 'md' : 'lg'"
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: 70+'px',
      left: '50%', marginRight: '-50%', transform: 'translate(-50%, 0)',
      borderRadius: '50%'
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
  div(:style=`{}`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-center.content-center.justify-between
      .row.full-width.items-center.q-px-md.q-pb-sm.q-pt-md
        span(:style=`{fontSize: '19px'}`).text-white.text-bold {{$t('wsChainList_title', 'Цепочки')}}
    //- search
    .row.full-width.q-pa-sm
      q-input(
        v-model="searchString"
        filled dense dark color="white"
        :label="$t('wsChainList_searchPlaceholder', 'Найти цепочку')"
        ).full-width
        template(v-slot:append)
          q-btn(
            v-if="searchString.length > 0"
            flat dense color="white" icon="clear" @click="searchString = ''")
          q-btn(
            flat dense color="white" icon="filter_list")
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-sm
      div(
        v-for="c in 3" :key="c"
        @click="chainClick(c)"
        :style=`{height: '100px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
        ).row.full-width.b-50.q-mb-sm
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
    chainClick (chain) {
      this.$log('chainClick', chain)
    },
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
