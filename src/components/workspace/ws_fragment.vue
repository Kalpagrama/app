<template lang="pug">
.column.fit.bg-white
  //- action
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    q-btn(
      v-if="fragment"
      color="accent" no-caps push :loading="creating" @click="fragmentCreate()"
      :style=`{position: 'absolute', bottom: '8px', left: '8px', width: 'calc(100% - 16px)', height: '60px', borderRadius: '10px'}`)
      span.text-bold Создать
  //- header
  div(:style=`{height: '60px'}`).row.full-width
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold Новый фрагмент
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="clear" @click="$emit('hide')")
  //- body
  .col.full-width.scroll
    div(v-if="fragment").row.full-width.items-start.content-start
      .row.full-width
        span {{ fragment.name }}
      .row.full-width
      .row.full-width
        span Add spheres
      small {{ fragment }}
    div(v-else).row.fit.items-center.justify-center
      q-spinner(color="accent" size="50px" :thickness="3")
</template>

<script>
export default {
  name: 'wsFragment',
  data () {
    return {
      mode: 'create',
      modes: {
        create: {},
        update: {}
      },
      fragment: null,
      creating: false
    }
  },
  methods: {
    async fragmentCreate () {
      try {
        this.$log('fragmentCreate start')
        this.creating = true
        let res = await this.$store.dispatch('workspace/addWSFragment', this.fragment)
        this.$log('fragmentCreate done', res)
        this.creating = false
        this.$emit('hide')
      } catch (e) {
        this.$log('fragmentCreate error', e)
        this.creating = false
      }
    }
  },
  async mounted () {
    this.$log('mounted', this.$store.state.ui.fragment)
    this.$log('node', this.$store.state.ui.node)
    await this.$wait(500)
    this.fragment = JSON.parse(JSON.stringify(this.$store.state.ui.fragment))
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.fragment = null
    this.$store.commit('ui/stateSet', ['fragment', null])
    this.$store.commit('ui/stateSet', ['node', null])
  }
}
</script>
