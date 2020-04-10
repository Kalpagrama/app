<template lang="pug">
div(
  :class=`{
    position: 'relative', overflow: 'hidden',
    'bg-grey-8': !contentActive,
    'bg-white': contentActive
  }`
  :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.items-start.content-start.q-mb-sm
  //- content.name
  div(:style=`{minHeight: '40px'}`).row.full-width.items-center.content-center
    span(
      :class=`{
        'text-white': !contentActive,
        'text-green': contentActive,
        'text-bold': contentActive}`
      ).q-ma-sm.cursor-pointer {{ contentName }}
  //- content INACTIVE tint
  div(
    v-if="true"
    :style=`{position: 'absolute', zIndex: 200}` @click="$emit('contentEdit', nodeFull)").row.fit.cursor-pointer
  //- content active
  div(
    v-if="contentActive && false"
    :style=`{height: height+'px'}`).row.full-width.items-start.content-start
    //- spheres
    div(v-if="false" :style=`{maxHeight: '50px'}`).row.full-width.items-center.content-center.q-px-sm.scroll
      .row.no-wrap
        span(
          v-for="(s, si) in 100" :key="si"
          :style=`{whiteSpace: 'nowrap', borderRadius: '10px'}`
          ).bg-grey-4.q-px-sm.q-py-xs.q-mr-sm.q-mb-sm.cursor-pointer sphere {{ si}}
    //- actions
    //- div(:style=`{height: '50px'}`).row.full-width.items-center.content-center.q-px-sm
    //-   q-btn(round flat dense color="red" icon="delete_outline" @click="$emit('contentDelete', node.oid)")
    //-   .col
    //-   q-btn(
    //-     push no-caps color="green" @click="$emit('contentEdit', nodeFull)"
    //-     :style=`{borderRadius: '10px'}`)
    //-     span.text-bold Edit content
</template>

<script>
export default {
  name: 'wsContent',
  props: ['node', 'index', 'contentOid', 'contentIndex'],
  data () {
    return {
      nodeFull: null,
      showFull: false,
      height: 40
    }
  },
  computed: {
    contentActive () {
      // return this.index === this.contentIndex
      return this.node.oid === this.contentOid
    },
    contentName () {
      return this.nodeFull ? this.nodeFull.compositions[0].layers[0].content.name : this.node.name
    }
  },
  watch: {
    contentActive: {
      async handler (to, from) {
        this.$log('contentActive CHANGED', to)
        if (to) {
          await this.$wait(200)
          this.$tween.to(this, 0.2, {height: 50})
        } else {
          this.$tween.to(this, 0.2, {height: 0})
        }
      }
    }
  },
  methods: {
  },
  async mounted () {
    this.nodeFull = await this.$store.dispatch('workspace/get', {oid: this.node.oid})
  }
}
</script>
