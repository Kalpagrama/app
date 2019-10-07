<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  //- header
  //- body
  .col.scroll.full-width.bg-grey-3
    div().row.full-width.q-pa-sm
      node(
        :node="node" :nodeFullReady="nodeFull" :active="active" :visible="visible"
        :noActions="true" :noTimestamp="true" :noSpheres="true"
        :style=`{borderRadius: '10px', oveflow: 'hidden'}`).bg-white
    .row.full-width.q-my-sm.q-px-sm
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width
        q-input(v-model="name" type="textarea" filled placeholder="А в чем ты видишь суть?").full-width
  //- footer
  div(
    :style=`{position: 'absolute', bottom: '0px', height: '76px'}`
    ).row.full-width.items-center.q-px-sm
    q-btn(
      no-caps color="primary" :loading="answering" @click="handleAnswer()"
      style=`height: 60px; borderRadius: 10px`).full-width
      span.text-bold.text-white Ответить ядром
</template>

<script>

export default {
  name: 'nodeAnswer',
  components: {},
  props: ['node', 'nodeFull'],
  data () {
    return {
      active: false,
      visible: false,
      name: '',
      answering: false
    }
  },
  methods: {
    async handleAnswer () {
      try {
        this.$log('handleAnswer start')
        this.answering = true
        // let res = await this.$store.dispatch('node/nodeUnrate', this.node.oid)
        // await this.$wait(2000)
        let node = JSON.parse(JSON.stringify(this.nodeFull))
        node.parentNode = this.node.oid
        node.name = this.name
        let res = await this.$store.dispatch('node/nodeCreate', node)
        this.$log('handleAnswer done', res)
        this.answering = false
        await this.$wait(300)
        this.$emit('hide')
      } catch (error) {
        this.$log('handleAnswer error', error)
        this.answering = false
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    await this.$wait(2000)
    this.active = true
    this.visible = true
    // this.$refs.nameInput.focus()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
