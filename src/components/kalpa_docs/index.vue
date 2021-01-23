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
    small.text-grey-9 {{ title }}
  //- body
  div(
    :style=`{
      ...styles,
    }`
    ).row.full-width.items-start.content-start.justify-center.q-px-sm
    router-link(
      v-for="(d,di) in docs" :key="di"
      :to="'/docs/'+d.id"
      :style=`{
      }`
      ).row.full-width.justify-start
      small.text-grey-9.doc-item {{ d.name }}
</template>

<script>
export default {
  name: 'kalpaDocs',
  props: {
    title: {
      type: String
    },
    styles: {type: Object, default: {}}
  },
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
