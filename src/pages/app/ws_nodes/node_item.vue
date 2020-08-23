<style lang="sass" scoped>
.node
  cursor: pointer
  &:hover
    background: rgb(60,60,60)
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px', overflow: 'hidden',
  }`
  ).row.full-width.items-start.content-start
  //- default state
  div(
    @click="onClick"
    :style=`{
      position: 'relative',
      height: '100px',
      borderRadius: '10px', overflow: 'hidden',
    }`
    ).row.full-width.items-start.content-start.node.b-50
    //- different previews for different stages?
    img(
      :src="preview" draggable="false"
      :style=`{
        height: '100px',
        borderRadius: '10px', overflow: 'hidden',
      }`
      )
    .col.full-height
      .row.full-width.q-pa-sm
        span.text-white {{ node.name || node.items }}
  //- opened
  div(
    v-if="opened"
    :style=`{
      height: '60px',
      marginTop: '-10px',
    }`
    ).row.full-width.items-center.content-center.bg-green.q-px-sm.q-pt-md.q-pb-sm
    //- draft
    div(v-if="node.stage === 'draft'").row.full-width
      q-btn(flat dense no-caps color="red" @click="$emit('remove')")
        span.text-bold Delete
      .col
      q-btn(flat no-caps color="white" @click="$emit('edit')").q-px-sm
        span.text-white.text-bold Edit
    //- published
    div(v-else-if="node.stage === 'published'").row.full-width
      q-btn(flat dense no-caps color="red" @click="$emit('upPublish')")
        span.text-bold Unpublish
      .col
      q-btn(flat no-caps color="white" @click="$router.push('/node/'+node.oid)").q-px-sm
        span.text-white.text-bold Explore
    //- saved
    div(v-else-if="node.stage === 'saved'").row.full-width
      q-btn(flat dense no-caps color="red" @click="$emit('upPublish')")
        span.text-bold Remove
      .col
      q-btn(flat no-caps color="white" @click="$router.push('/node/'+node.oid)").q-px-sm
        span.text-white.text-bold Explore
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodes__nodeItem',
  props: ['node', 'nodeIndex'],
  data () {
    return {
      opened: false,
      preview: '',
      nodeFull: null
    }
  },
  computed: {
  },
  watch: {
    node: {
      immediate: true,
      async handler (to, from) {
        if (to.stage !== 'draft') {
          this.nodeFull = await this.$rxdb.get(RxCollectionEnum.OBJ, to.oid)
          this.preview = this.nodeFull.meta.items[0].thumbUrl
        }
        else {
          this.preview = to.color
        }
      }
    }
  },
  methods: {
    onClick () {
      this.$log('onClick')
      this.opened = !this.opened
    },
  },
}
</script>
