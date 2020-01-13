<template lang="pug">
div(:style=`{position: 'relative'}`
  ).column.fit
  //- header
  //- div(:style=`{height: '74px', borderBottom: '1px solid #eee'}`
  //-   ).row.full-width.items-center
    //- q-btn(flat no-caps @click="mode = 'list'") List
    //- q-btn(flat no-caps @click="mode = 'gallery'") Gallery
    //- q-btn(flat no-caps @click="mode = 'feed'") Feed
  //- body
  k-dialog-bottom(ref="fragmentActionDialog" :options="fragmentActionDialogOptions" @action="fragmentAction")
  .col.full-width.scroll
    //- list
    div(v-if="mode === 'list'").row.full-width.items-start.content-start.q-pt-md.q-px-sm
      div(
        v-for="(f, fi) in fragments" :key="fi" @click="fragmentClick(f, fi)"
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
    //- gallery
    div(v-if="mode === 'gallery'").row.full-width.items-start.content-start
      div(
        v-for="(i, ii) in fragments" :key="ii"
        :style=`{position: 'relative'}`
        ).col-6.q-pa-sm
        div(v-if="fragmentPlaying !== ii" @click="fragmentClick(i ,ii)").row.fit.items-start.content-start.cursor-pointer
          img(
            :src="i.item.content.thumbUrl" draggable="false"
            :style=`{width: '100%', objectFit: 'contain', userSelect: 'none', borderRadius: '10px', overflow: 'hidden'}`)
          span(
            :style=`{
              position: 'absolute', bottom: '16px', left: '16px',
              maxWidth: '80%', overflow: 'hidden', pointerEvents: 'none',
              borderRadius: '10px', background: 'rgba(0,0,0,0.8)'}`
            ).text-white.q-px-sm.q-py-xs {{ i.item.name.length === 0 ? i.node.name : i.item.name | cut(20) }}
          //- span(
          //-   :style=`{
          //-     position: 'absolute', bottom: '16px', left: '16px',
          //-     maxWidth: '80%', overflow: 'hidden', pointerEvents: 'none',
          //-     borderRadius: '10px', background: 'rgba(0,0,0,0.8)'}`
          //-   ).text-white.q-px-sm.q-py-xs {{ i.item.content.name | cut(20) }}
        //- node-fragment(
        //-   v-if="ii === fragmentPlaying"
        //-   ctx="inEditor"
        //-   :fragment='i.item')
</template>

<script>
import nodeFragment from 'components/node/fragment'

export default {
  name: 'wsFragments',
  props: ['ctx'],
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
      return this.$store.getters.currentUser.workspace.nodes.reduce((acc, val) => {
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
          this.fragmentUse(this.fragments[this.fragmentIndex], this.fragmentIndex)
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
      this.fragmentIndex = ii
      if (this.ctx === 'inEditor') {
        this.$emit('item', i)
      } else {
        this.fragmentIndex = ii
        this.$refs.fragmentActionDialog.show()
      }
    },
    async fragmentUse (i, ii) {
      this.$log('fragmentUse', i, ii)
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
