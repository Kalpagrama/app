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
      //- div(:style=`{minHeight: '60px', borderBottom: '1px solid #eee'}`).row.full-width.q-pa-sm
      //-   input(
      //-     v-model="name" placeholder="Suggest your name"
      //-     @keyup.enter="namePublish()"
      //-     :style=`{height: '60px'}`).kinput.full-width
      //-   div(
      //-     v-if="name.length > 0"
      //-     ).row.full-width
      //-     q-btn(
      //-       color="red" outline @click="name = ''"
      //-       :style=`{borderRadius: '10px'}`).q-mr-sm Cancel
      //-     q-btn(
      //-       color="green" push no-caps @click="namePublish()"
      //-       :style=`{borderRadius: '10px'}`).col Publish
      .col.full-width.scroll
        div(
          v-for="(n,ni) in nodes" :key="ni" @click="nameClick(n,ni)"
          :style=`{minHeight: '60px'}`
          ).row.full-width.items-center.content-center.justify-center.cursor-pointer
          span.text-bold {{ n.name }}
  div(
    :style=`{
      position: 'relative', maxWidth: 600+'px', minHeight: '90px', borderRadius: '0px', overflow: 'hidden',
      marginTop: '-10px', marginBottom: '-10px',
      paddingTop: '20px', paddingBottom: '20px',
      paddingLeft: '50px', paddingRight: '50px'}`
    ).row.full-width.items-center.justify-center.bg-grey-2
    q-btn(
      v-if="!nameEditing"
      round flat color="green" icon="edit" @click="nameEditStart()"
      :style=`{position: 'absolute', zIndex: 200, left: '10px', top: 'calc(50% - 20px)'}`)
    input(
      v-if="nameEditing"
      v-model="name" @keyup.enter="nameEditDone()"
      autofocus placeholder="Suggest your essence"
      :style=`{minHeight: '60px', background: 'none'}`).kinput.fit.text-bold.text-center
    span(
      v-if="!nameEditing"
      ).text-bold.text-center {{ node.name }}
    q-btn(
      v-if="!nameEditing"
      round flat color="green" icon="list" @click="nameMore()"
      :style=`{position: 'absolute', zIndex: 200, right: '10px', top: 'calc(50% - 20px)'}`)
    q-btn(
      v-if="nameEditing"
      round flat color="green" icon="check" @click="nameEditDone()"
      :loading="nameEditLoading"
      :style=`{position: 'absolute', zIndex: 200, right: '10px', top: 'calc(50% - 20px)'}`)
</template>

<script>
export default {
  name: 'layoutRubick_essence',
  props: ['node', 'nodes', 'nodePublish'],
  data () {
    return {
      dialogOpened: false,
      name: '',
      nameEditing: false,
      nameEditLoading: false
    }
  },
  computed: {
  },
  watch: {
    '$store.state.events.progressCreateNode': {
      handler (to, from) {
        this.$log('progressCreateNode CHANGED', to)
        if (to && to.progress === 100 && to.action === 'CREATE_NODE' && to.oid) {
          this.$router.push({params: {oid: to.oid}}).catch(e => e)
        }
      }
    }
  },
  methods: {
    nameEditStart () {
      this.$log('nameEditStart')
      this.nameEditing = true
    },
    async nameEditDone () {
      this.$log('nameEditDone')
      this.nameEditLoading = true
      await this.$wait(600)
      await this.namePublish()
      this.nameEditLoading = false
      this.nameEditing = false
    },
    nameClick (n, ni) {
      this.$log('nameClick', n, ni)
      this.$router.push('/node/' + n.oid).catch(e => e)
    },
    nameMore () {
      this.$log('nameMore')
      this.dialogOpened = true
    },
    nameAddStart () {
      this.$log('nameAddStart')
    },
    async namePublish () {
      this.$log('namePublish')
      if (this.name.length === 0) return
      let nodeNew = JSON.parse(JSON.stringify(this.node))
      nodeNew.name = this.name
      await this.nodePublish(nodeNew)
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
