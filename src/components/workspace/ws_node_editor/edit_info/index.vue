<template lang="pug">
.row.fit.items-start.content-start.justify-center
  div(:style=`{maxWidth: '600px'}`).column.fit.q-py-md
    .col.full-width.scroll.q-px-sm
      div(
        :style=`{
          borderRadius: $store.state.ui.borderRadius+'px',
          overflow: 'hidden'
        }`).row.full-width.items-start.content-start.q-pa-md.b-50
        .row.full-width.q-py-md
          .row.full-width.q-pa-sm.q-py-md
            span(:style=`{fontSize: '20px'}`).text-white.text-bold {{$t('Details')}}
          .row.full-width.q-px-sm
            span.text-white.text-bold.q-mr-sm {{$t('Stage')}}:
            span.text-white {{ node.stage }}
          .row.full-width.q-px-sm
            span.text-white.text-bold.q-mr-sm {{$t('Category')}}:
            span.text-white {{ node.category }}
          .row.full-width.q-px-sm
            span.text-white.text-bold.q-mr-sm {{$t('Items')}}:
            span.text-white {{ node.items.length }}
          .row.full-width.q-px-sm
            span.text-white.text-bold.q-mr-sm {{$t('Spheres')}}:
            span.text-white {{ node.spheres.length }}
        .row.full-width.q-py-md
          .row.full-width.q-pa-sm
            span.text-white.text-bold {{$t('Danger zone')}}
          .row.full-width.q-px-sm
            q-btn(
              @click="stateNodeEditor.nodeDelete()"
              color="red" no-caps
              :loading="stateNodeEditor.nodeDeleting"
              ) {{$t('Delete node')}}
</template>

<script>
export default {
  name: 'editInfo',
  props: ['node', 'stateNodeEditor'],
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>
