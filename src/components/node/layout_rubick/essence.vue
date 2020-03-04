<template lang="pug">
.row.full-width.justify-center.items-center.content-center
  q-dialog(v-model="dialogOpened")
    div(:style=`{maxWidth: '400px'}`).column.fit.bg-white
      .col.full-width.scroll
        div(
          v-for="(n,ni) in nodes" :key="ni" @click="nameClick(n,ni)"
          :style=`{minHeight: '60px'}`
          ).row.full-width.items-center.content-center.justify-center.cursor-pointer
          span.text-bold {{ n.name }}
  div(
    :style=`{
      position: 'relative', maxWidth: 600+'px', minHeight: '80px', borderRadius: '0px', overflow: 'hidden',
      marginTop: '-10px', marginBottom: '-10px',
      paddingTop: '20px', paddingBottom: '20px',
      paddingLeft: '50px', paddingRight: '50px'}`
    ).row.full-width.items-center.justify-center.cursor-pointer.bg-grey-2
    span.text-bold.text-center.cursor-pointer {{ node.name }}
    q-btn(
      round flat color="green" icon="list" @click="nameMore()"
      :style=`{position: 'absolute', zIndex: 200, right: '10px', top: 'calc(50% - 20px)'}`)
</template>

<script>
export default {
  name: 'layoutRubick_essence',
  props: ['node', 'nodes'],
  data () {
    return {
      dialogOpened: false
    }
  },
  computed: {
    // nodes () {
    //   return []
    // }
  },
  methods: {
    nameClick (n, ni) {
      this.$log('nameClick', n, ni)
      this.$router.push('/node/' + n.oid)
    },
    nameMore () {
      this.$log('nameMore')
      this.dialogOpened = true
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
