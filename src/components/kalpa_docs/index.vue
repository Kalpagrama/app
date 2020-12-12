<style lang="sass">
.doc-item
  &:hover
    color: white !important
</style>

<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  //- header
  div(
    v-if="title"
    ).row.full-width.justify-center.q-py-sm
    small.text-grey-8 {{ title }}
  //- body
  .row.full-width.items-start.content-start
    router-link(
      v-for="(d,di) in docs" :key="di"
      :to="'/docs/'+d.id"
      :style=`{
        textAlign: 'center',
      }`
      ).row.full-width.justify-center.q-px-sm.q-pt-xs
      small.text-grey-8.doc-item {{ d.name }}
</template>

<script>
export default {
  name: 'kalpaDocs',
  props: ['title'],
  data () {
    return {
    }
  },
  computed: {
    docs () {
      return this.$store.state.ui.docs.filter(d => {
        // TODO: filter with lang...
        return true
      })
    }
  }
}
</script>
