<style lang="stylus">
.kinput {
  border: none;
  height: 100%;
  padding: 10px;
  &:focus {
    outline: none;
  }
}
</style>
<template lang="pug">
.row.full-width.justify-center.items-center.content-center
  //- dialog names
  q-dialog(v-model="dialogOpened")
    div(:style=`{position: 'relative', maxWidth: '400px'}`).column.fit.bg-white
      div(:style=`{minHeight: '60px', borderBottom: '1px solid #eee'}`).row.full-width.q-pa-sm
        input(
          v-model="name" placeholder="Suggest your name"
          @keyup.enter="namePublish()"
          :style=`{height: '60px'}`).kinput.full-width
        div(
          v-if="name.length > 0"
          ).row.full-width
          q-btn(
            color="red" outline @click="name = ''"
            :style=`{borderRadius: '10px'}`).q-mr-sm Cancel
          q-btn(
            color="green" push no-caps @click="namePublish()"
            :style=`{borderRadius: '10px'}`).col Publish
      .col.full-width.scroll
        div(
          v-for="(n,ni) in nodes" :key="ni" @click="nameClick(n,ni)"
          :style=`{minHeight: '60px'}`
          ).row.full-width.items-center.content-center.justify-center.cursor-pointer
          span.text-bold {{ n.name }}
      //- q-btn(
      //-   round push color="green" icon="add" @click="nameAddStart()"
      //-   :style=`{position: 'absolute', zIndex: 200, right: '10px', bottom: '10px'}`)
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
  props: ['node', 'nodes', 'nodePublish'],
  data () {
    return {
      dialogOpened: false,
      name: ''
    }
  },
  computed: {
  },
  methods: {
    nameClick (n, ni) {
      this.$log('nameClick', n, ni)
      this.$router.push('/node/' + n.oid)
    },
    nameMore () {
      this.$log('nameMore')
      this.dialogOpened = true
    },
    nameAddStart () {
      this.$log('nameAddStart')
    },
    namePublish () {
      this.$log('namePublish')
      let nodeNew = JSON.parse(JSON.stringify(this.node))
      nodeNew.name = this.name
      this.nodePublish(nodeNew)
      this.name = ''
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
