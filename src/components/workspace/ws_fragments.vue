<template lang="pug">
div(:style=`{position: 'relative'}`
  ).column.full-width
  //- header
  //- div(:style=`{height: '74px', borderBottom: '1px solid #eee'}`
  //-   ).row.full-width.items-center
    //- q-btn(flat no-caps @click="mode = 'list'") List
    //- q-btn(flat no-caps @click="mode = 'gallery'") Gallery
    //- q-btn(flat no-caps @click="mode = 'feed'") Feed
  //- body
  k-dialog-bottom(ref="fragmentActionDialog" :options="fragmentActionDialogOptions" @action="fragmentAction")
  .col.full-width.scroll
    div(v-if="mode === 'list'").row.full-width.items-start.content-start.q-pt-md.q-px-sm
      div(
        v-for="(f, fi) in fragments" :key="fi" @click="fragmentIndex = fi, $refs.fragmentActionDialog.show()"
        :style=`{
          height: '100px', borderRadius: '10px', overflow: 'hidden',
          border: fragmentIndex === fi ? '3px solid #4caf50' : '3px solid #eee'}`
        ).row.full-width.row.full-width.items-center.bg-grey-4.q-mb-sm.cursor-pointer
          div(
            :style=`{height: '100px', width: '150px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.bg-black
            img(
              :src="f.item.content.thumbUrl" draggable="false"
              :style=`{width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none'}`)
          .col.full-height
            .row.fit.items-center.q-px-md
              span(:style=`{userSelect: 'none', maxWidth: '100%', overflow: 'hidden'}`) {{ f.item.name || f.item.content.name }}
    div(v-if="mode === 'gallery'").row.full-width.items-start.content-start
      div(
        v-for="(i,ii) in fragments" :key="ii"
        :style=`{position: 'relative'}`
        ).col-6.q-pa-sm
        div(v-if="fragmentPlaying !== ii" @click="fragmentIndex = ii, $refs.fragmentActionDialog.show()").row.fit
          img(
            :src="i.item.content.thumbUrl" draggable="false"
            :style=`{width: '100%', objectFit: 'contain', userSelect: 'none', borderRadius: '10px', overflow: 'hidden'}`)
        //- node-fragment(
        //-   v-if="ii === fragmentPlaying"
        //-   ctx="inEditor"
        //-   :fragment='i.item')
</template>

<script>
import nodeFragment from 'components/node/fragment'

export default {
  name: 'wsFragments',
  components: {nodeFragment},
  data () {
    return {
      mode: 'gallery',
      modes: ['list', 'gallery', 'feed'],
      fragmentPlaying: false,
      fragmentIndex: -1,
      fragmentActionDialogOptions: {
        header: false,
        confirm: true,
        confirmName: 'Edit',
        actions: {
          delete: {name: 'Delete', color: 'red'}
        }
      }
    }
  },
  computed: {
    fragments () {
      return this.$store.state.workspace.workspace.nodes.reduce((acc, val) => {
        if (val.fragments.length === 1) {
          val.fragments.map((f, fi) => {
            acc.push({
              type: 'fragment',
              fragmentIndex: fi,
              item: f,
              node: val
            })
          })
        }
        return acc
      }, [])
    },
  },
  methods: {
    async fragmentAction (action) {
      this.$log('fragmentAction', action)
      this.$refs.fragmentActionDialog.hide()
      await this.$wait(600)
      switch (action) {
        case 'confirm': {
          this.fragmentClick(this.fragments[this.fragmentIndex], this.fragmentIndex)
          break
        }
        case 'delete': {
          this.fragmentDelete(this.fragments[this.fragmentIndex])
          break
        }
      }
      this.fragmentIndex = -1
    },
    async fragmentClick (i, ii) {
      this.$log('fragmentClick', i, ii)
      this.$store.commit('workspace/stateSet', ['wsItem', {type: 'fragment', item: i.item}])
      await this.$wait(300)
      this.$router.push('/create')
    },
    async fragmentDelete (item) {
      this.$log('fragmentDelete', item)
      let node = item.node
      node.fragments[item.fragmentIndex] = null
      let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(node)))
      this.$log('res', res)
    },
    async cutDelete (item) {
      this.$log('cutDelete', item)
      let node = item.node
      node.fragments[item.fragmentIndex].cuts.splice([item.cutIndex], 1)
      let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(node)))
      this.$log('res', res)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
