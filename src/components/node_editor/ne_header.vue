<template lang="pug">
div(
  :style=`{
    position: 'relative',
    zIndex: 2000,
    borderRadius: $q.screen.width > 600 ? '10px' : '0 0 10px 10px'
  }`
  ).row.full-width.items-center.content-center.q-px-sm.b-50
  //- main navigation
  div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
    q-btn(round flat color="grey-2" icon="keyboard_arrow_left" @click="$emit('cancel')")
    .col.full-height
      .row.fit.items-center.content-center.q-px-sm
        span(:style=`{fontSize: '20px'}`).text-white.text-bold Node editor
    q-btn(
      v-if="false"
      flat color="green" no-caps @click="nodePublish()"
      :style=`{height: '42px'}`).q-px-sm.b-120.br
      span.text-bold Publish
  //- essence
  div(
    :style=`{
      zIndex: 100
    }`
    ).row.full-width
    .col
      q-input(
        v-model="node.name"
        filled color="white" dark
        label="Whats the essence?"
        autofocus autogrow
        :style=`{
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).full-width.b-70
  //- pages
  .row.full-width.items-center.content-center
    div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      kalpa-buttons(:value="pages" :id="pageId" idKey="id" @id="$emit('pageId', $event)")
</template>

<script>
export default {
  name: 'nodeEditor-header',
  props: ['node', 'pages', 'pageId'],
  data () {
    return {
      nodePublishing: false,
      nodePublishingError: null
    }
  },
  methods: {
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        let nodeInput = JSON.parse(JSON.stringify(this.node))
        switch (this.mode) {
          case 'edit': {
            break
          }
          case 'extend': {
            nodeInput.name = this.essence
            break
          }
        }
        this.$log('nodeInput', nodeInput)
        let res = await this.$store.dispatch('node/nodeCreate', nodeInput)
        this.$log('nodePublish res', res)
        this.$log('nodePublish done')
        this.nodePublishing = false
        // this.$emit('cancel')
        this.$emit('publish', res.oid)
      }
      catch (e) {
        this.$log('nodePublish error', e)
        this.nodePublishing = false
      }
    }
  }
}
</script>
