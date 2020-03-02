<template lang="pug">
.row.full-width.window-height.justify-center.items-start.content.start.q-pa-sm
  div(:style=`{maxWidth: '600px'}`).column.fit
    //- div(:style=`{height: '60'}`)
    div(:style=`{position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`).col.full-width
      q-btn(round flat color="green" size="lg" icon="keyboard_arrow_left"
        :style=`{position: 'absolute', zIndex: 500, left: '16px', top: 'calc(50% - 20px)'}`)
      q-btn(round flat color="green" size="lg" icon="keyboard_arrow_right"
        :style=`{position: 'absolute', zIndex: 500, right: '16px', top: 'calc(50% - 20px)'}`)
      composition(:composition="nodeFull.compositions[0]" :fullHeight="true").full-height
    div(:style=`{height: '70px'}`).row.full-width.q-my-sm
      div(:style=`{position: 'relative', borderRadius: '10px', oveflow: 'hidden'}`
        ).row.fit.items-center.content-center.justify-center.bg-white
        span.text-bold {{ node.name }}
    div(:style=`{position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`).col.full-width
      composition(:composition="nodeFull.compositions[1]" :fullHeight="true").full-height
    div(:style=`{height: '70px'}`).row.full-width.q-mt-sm
      div(:style=`{position: 'relative', borderRadius: '10px', oveflow: 'hidden'}`).row.fit.bg-white.bg
        span {{ node.name }}
</template>

<script>
export default {
  name: 'nodeLayoutRubick',
  props: ['node', 'nodeFull'],
  data () {
    return {
    }
  }
}
</script>
