<template lang="pug">
div(
  :class=`{
    position: 'relative', overflow: 'hidden',
    'bg-grey-8': true
  }`
  :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.items-start.content-start.q-mb-sm
  //- content.name
  div(:style=`{minHeight: '40px'}`).row.full-width.items-center.content-center
    span(
      :class=`{
        'text-white': true
      }`
      ).q-ma-sm.cursor-pointer {{ item.name }}
  //- content INACTIVE tint
  div(
    v-if="true"
    :style=`{position: 'absolute', zIndex: 200}` @click="contentClick()").row.fit.cursor-pointer
  //- //- content active
  //- div(
  //-   v-if="contentActive && false"
  //-   :style=`{height: height+'px'}`).row.full-width.items-start.content-start
  //-   //- spheres
  //-   div(v-if="false" :style=`{maxHeight: '50px'}`).row.full-width.items-center.content-center.q-px-sm.scroll
  //-     .row.no-wrap
  //-       span(
  //-         v-for="(s, si) in 100" :key="si"
  //-         :style=`{whiteSpace: 'nowrap', borderRadius: '10px'}`
  //-         ).bg-grey-4.q-px-sm.q-py-xs.q-mr-sm.q-mb-sm.cursor-pointer sphere {{ si}}
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
  name: 'wsContentNotes',
  props: ['itemOid', 'item'],
  data () {
    return {
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    async contentClick () {
      this.$log('contentClick')
      let content = await this.$store.dispatch('objects/get', {oid: this.item.oid})
      this.$log('content', content)
      this.$emit('content', content)
    }
  },
  async mounted () {
  }
}
</script>
