<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.bg-white
  .col.full-width.scroll
    //- div(
    //-   v-for="(i,ii) in 100" :key="ii"
    //-   :style=`{height: '100px'}`).row.full-width item {{ ii }}
    nc-fragment(
      v-if="true" :ctx="'inEditor'" :index="0"
      :thumbUrl="false" :fragment="item ? item.item : null" :mini="false" :visible="true" :stageFirst="1"
      )
      //- @edit="fragmentEdit"
      //- @content="$event => fragmentCreate(0, $event)"
      //- @fragment="$event => fragmentSet(0, $event)"
      //- @delete="fragmentDelete(0)"
  div(:style=`{height: '60px'}`
    ).row.full-width.items-center.content-center.justify-end.q-px-md
    q-btn(
      flat color="grey" no-caps @click="$refs.fragmentEditorDialog.hide()"
      :style=`{}`)
      span.text-bold {{$t('Cancel')}}
    q-btn(
      push color="green" no-caps @click=""
      :style=`{borderRadius: '10px'}`)
      span.text-bold {{ $t('Save') }}
</template>

<script>
import ncFragment from 'components/node_composer/nc_fragment'

export default {
  name: 'ws_wsItems_FragmentEditor',
  props: ['item'],
  components: {ncFragment},
  data () {
    return {
    }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
