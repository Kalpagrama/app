<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  //- header
  div(
    v-if="false"
    :style=`{height: '70px'}`).row.full-width.items-center.justify-center.q-px-md.bg-grey-3
    span.text-bold {{$t('Ответить ядром')}}
  //- body
  .col.scroll.full-width.bg-grey-3
    .row.full-width.q-pa-sm
      node(
        v-if="node"
        :node="node" :nodeFullReady="nodeFull" :active="active" :visible="visible"
        :noActions="true" :noTimestamp="true" :noSpheres="true"
        :style=`{borderRadius: '10px', oveflow: 'hidden'}`).bg-white.q-mt-md
    .row.full-width.q-my-sm.q-px-sm
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width
        q-input(ref="inputAnswer" v-model="name" type="textarea" filled placeholder="А в чем ты видишь суть?").full-width
  //- actions
  //- rate
  transition(
    appear
    enter-active-class="animated slideInUp"
    leave-active-class="animated slideOutDown")
    q-btn(
      v-if="!loading && name.length > 0"
      no-caps color="primary" :loading="answering" @click="handleAnswer()"
      :style=`{position: 'absolute', zIndex: 1000, bottom: '10px', left: '10px', width: 'calc(100% - 20px)', height: '60px', borderRadius: '10px'}`)
      span.text-bold.text-white {{$t('Ответить ядром')}}
</template>

<script>

export default {
  name: 'nodeAnswer',
  data () {
    return {
      loading: true,
      active: false,
      visible: false,
      name: '',
      answering: false,
      node: null,
      nodeFull: null
    }
  },
  methods: {
    async handleAnswer () {
      try {
        this.$logD('handleAnswer start')
        this.answering = true
        let node = JSON.parse(JSON.stringify(this.nodeFull))
        node.parentNode = this.node.oid
        node.name = this.name
        let res = await this.$store.dispatch('node/nodeCreate', node)
        this.$logD('handleAnswer done', res)
        this.answering = false
        await this.$wait(300)
        this.$emit('hide')
      } catch (error) {
        this.$logD('handleAnswer error', error)
        this.answering = false
      }
    }
  },
  async mounted () {
    this.$logD('mounted')
    await this.$wait(300)
    // load node
    this.node = this.$store.state.node.node
    this.nodeFull = this.$store.state.node.nodeFull
    this.active = true
    this.visible = true
    this.loading = false
    this.$refs.inputAnswer.focus()
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
    this.$store.commit('node/stateSet', ['node', null])
    this.$store.commit('node/stateSet', ['nodeFull', null])
    this.$store.commit('node/stateSet', ['answer', false])
  }
}
</script>
