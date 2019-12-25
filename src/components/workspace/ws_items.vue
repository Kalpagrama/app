<style lang="stylus">
</style>

<template lang="pug">
k-colls(ref="wsItemsColls" :coll="coll" @coll="coll = $event" :colls="collsFiltered" :tabs="true" :style=`{height: height || '100%'}`)
  template(v-slot:notes)
    .column.fit
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
        span {{$t('Total')}}: {{ notes.length }}
        .col
        q-btn(round flat icon="search")
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-px-sm
          div(
            v-for="(n, ni) in notes" :key="ni" @click="itemClick(n)"
            :style=`{height: '60px', borderRadius: '10px'}`
            ).row.full-width.items-center.q-px-sm.bg-white.q-mb-sm
            span {{ $t(n.item.name) }}
  template(v-slot:fragments)
    .column.fit
      k-dialog-bottom(ref="itemActionDialog" :options="itemActionOptions" @action="itemAction")
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
        span {{$t('Total')}}: {{ fragments.length }}
        .col
        q-btn(round flat icon="search")
      .col.full-width.scroll.kscroll
        .row.full-width.items-start.content-start.q-px-sm
          //- v-if="fragmentToDelete !== ii"
          ws-item-fragment(
            v-for="(i, ii) in fragments" :key="i.node.oid"
            :index="ii" :item="i" @action="item = i, itemIndex = ii, $refs.itemActionDialog.show()"
            :class=`{'q-pl-xs': ii % 2 !== 0, 'q-pr-xs': ii % 2 === 0}`
            ).col-6.q-mb-sm
  template(v-slot:contents)
    .column.fit
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
        span {{$t('Total')}}: {{ contents.length }}
        .col
        q-btn(round flat icon="search")
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-px-sm
          div(
            v-for="(c, ckey, ci) in contents" :key="ckey" @click="itemClick(c)"
            :style=`{position: 'relative', minHeight: '100px'}`
            :class=`{'q-pl-xs': ci % 2 !== 0, 'q-pr-xs': ci % 2 === 0}`
            ).col-6.q-mb-sm
            div(:style=`{borderRadius: '10px', oveflow: 'hidden'}`).row.full-width.items-center.bg-black.cursor-pointer
              img(
                :src="c.item.thumbUrl" draggable="false"
                :style=`{
                  width: '100%', height: '100%', maxHeight: '300px', objectFit: 'contain',
                  borderRadius: '10px'}`)
              small(:style=`{position: 'absolute', zIndex: 100, top: '6px', left: '6px', borderRadius: '10px', background: 'rgba(0,0,0,0.8)'}`
                ).q-px-sm.q-py-xs.text-white.text-bold Nodes: {{c.nodes }}
              small(:style=`{position: 'absolute', zIndex: 100, bottom: '6px', left: '6px', borderRadius: '10px', background: 'rgba(0,0,0,0.8)'}`
                ).q-px-sm.q-py-xs.text-white {{ c.item.name | cut(20) }}
  template(v-slot:nodes)
    .column.fit
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
        span {{$t('Total')}}: {{ nodes.length }}
        .col
        q-btn(round flat icon="search")
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-px-sm
          div(
            v-for="(n, ni) in nodes" :key="n.oid" @click="itemClick(n)"
            :style=`{minHeight: '60px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.justify-center.bg-white.q-mb-sm.q-pa-sm
            div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-black
              div(v-for="(f, fi) in n.item.fragments" :key="fi").col
                div(:style=`{borderRadius: '10px'}`).row.full-width
                  img(
                    :src="f.thumbUrl || f.content.thumbUrl" draggable="false"
                    :style=`{width: '100%', height: '100%', maxHeight: '200px', objectFit: 'contain'}`)
                .row.full-width
                  small.full-width {{f.name}}
                  small.full-width {{f.content.name}}
                  small(v-for="(c,ci) in f.cuts" :key="ci")
                    small(v-for="(p,pi) in c.points" :key="pi") {{$time(p.x)}}/
            div(:style=`{minHeight: '60px'}`).row.full-width.items-center.justify-center
              span.text-bold {{ n.item.name }}
</template>

<script>
import wsItemFragment from './ws_item_fragment'

export default {
  name: 'wsItems',
  components: {wsItemFragment},
  props: ['types', 'height'],
  data () {
    return {
      coll: 'fragments',
      colls: [
        {id: 'notes', name: 'Notes'},
        {id: 'fragments', name: 'Fragments'},
        {id: 'contents', name: 'Contents'},
        {id: 'nodes', name: 'Nodes'}
      ],
      item: null,
      itemIndex: -1,
      fragmentToDelete: -1
    }
  },
  computed: {
    itemActionOptions () {
      return {
        header: this.item ? true : false,
        headerName: this.item ? this.item.item.name : '',
        confirm: true,
        confirmName: 'Edit',
        actions: {
          preview: {name: 'Preiview'},
          delete: {name: 'Delete', color: 'red'}
        }
      }
    },
    collsFiltered () {
      if (this.types) {
        return this.colls.filter((c, ci) => {
          return this.types.includes(c.id)
        })
      } else {
        return this.colls
      }
    },
    notes () {
      return this.$store.state.workspace.workspace.nodes.reduce((acc, val) => {
        if (val.fragments.length === 0) {
          acc.push({
            type: 'note',
            item: val,
            node: val
          })
        }
        return acc
      }, [])
    },
    fragments () {
      return this.$store.state.workspace.workspace.nodes.reduce((acc, val) => {
        val.fragments.map((f, fi) => {
          if (f.cuts.length > 0) {
            acc.push({
              type: 'fragment',
              fragmentIndex: fi,
              item: f,
              node: val
            })
            f.cuts.map((c, ci) => {
              if (c.name) {
                acc.push({
                  type: 'cut',
                  fragmentIndex: fi,
                  cutIndex: ci,
                  item: {
                    name: c.name,
                    scale: f.content.duration,
                    content: f.content,
                    cuts: [{name: '', thumbUrl: '', color: '', points: c.points}]
                  },
                  node: val
                })
              }
            })
          }
        })
        return acc
      }, [])
    },
    contents () {
      return this.$store.state.workspace.workspace.nodes.reduce((acc, val) => {
        val.fragments.map(f => {
          if (!acc[f.content.oid]) {
            acc[f.content.oid] = {
              type: 'content',
              item: f.content,
              node: val,
              nodes: 1
            }
          } else {
            acc[f.content.oid].nodes += 1
          }
        })
        return acc
      }, {})
    },
    nodes () {
      return this.$store.state.workspace.workspace.nodes.reduce((acc, val) => {
        if (val.fragments.length === 2) {
          acc.push({
            type: 'node',
            item: val
          })
        }
        return acc
      }, [])
    }
  },
  methods: {
    itemAction (action) {
      this.$log('itemAction', this.item.type, action)
      switch (this.item.type) {
        case 'fragment': {
          switch (action) {
            case 'confirm': {
              this.$emit('itemClick', this.item)
              break
            }
            case 'preview': {
              this.$q.notify('PREVIEW')
              break
            }
            case 'delete': {
              this.fragmentDelete(this.item)
              break
            }
          }
          break
        }
      }
    },
    async fragmentDelete (item) {
      this.$log('fragmentDelete', item)
      let node = item.node
      node.fragments[item.fragmentIndex] = null
      // this.fragmentToDelete = this.itemIndex
      let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(node)))
      // this.fragmentToDelete = -1
      this.$log('res', res)
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
