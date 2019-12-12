<style lang="stylus">
</style>

<template lang="pug">
k-colls(ref="wsItemsColls" :coll="coll" @coll="coll = $event" :colls="collsFiltered" :tabs="true" :style=`{height: '100%'}`)
  template(v-slot:notes)
    .column.fit
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
        span {{$t('Total')}}: {{ notes.length }}
        .col
        q-btn(round flat icon="search")
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-px-sm
          div(
            v-for="(n, ni) in notes" :key="ni" @click="itemClick('note', n)"
            :style=`{height: '60px', borderRadius: '10px'}`
            ).row.full-width.items-center.q-px-sm.bg-white.q-mb-sm
            span {{ $t(n.name) }}
  template(v-slot:fragments)
    .column.fit
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
        span {{$t('Total')}}: {{ fragments.length }}
        .col
        q-btn(round flat icon="search")
      .col.full-width.scroll.kscroll
        .row.full-width.items-start.content-start.q-px-sm
          div(
            v-for="(f, fi) in fragments" :key="fi" @click="itemClick('fragment', f)"
            :style=`{position: 'relative', minHeight: '200px', borderRadius: '10px'}`
            ).row.full-width.items-center.bg-white.q-mb-md
            img(
              :src="f.content.thumbUrl" draggable="false"
              :style=`{
                width: '100%', height: '100%', maxHeight: '300px', objectFit: 'contain',
                borderRadius: '10px'}`)
            div(
              v-if="f.cuts"
              :style=`{position: 'absolute', top: '8px', left: '8px'}`
              ).row.full-width
              div(v-for="(c, ci) in f.cuts" :key="ci"
                ).q-mr-xs
                div(:style=`{background: c.color, borderRadius: '4px'}`).q-px-sm
                  //- small.text-white {{ c }}
                  small.text-white {{ $time(c.points[0].x)}}-{{$time(c.points[1].x) }}
            span(
              v-if="f.name"
              :style=`{position: 'absolute', zIndex: 100, bottom: '50px', left: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)'}`
              ).q-pa-sm.text-white {{ f.name }}
            small(:style=`{position: 'absolute', zIndex: 100, bottom: '8px', left: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)'}`
              ).q-pa-sm.text-white {{ f.content.name | cut(50) }}
  template(v-slot:contents)
    .column.fit
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
        span {{$t('Total')}}: {{ contents.length }}
        .col
        q-btn(round flat icon="search")
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-px-sm
          div(
            v-for="(c, ckey) in contents" :key="ckey" @click="itemClick('content', c)"
            :style=`{position: 'relative', minHeight: '100px', borderRadius: '10px', oveflow: 'hidden'}`
            ).row.full-width.items-center.bg-black.q-mb-md
            small {{ckey}}
            img(
              :src="c.item.thumbUrl" draggable="false"
              :style=`{
                width: '100%', height: '100%', maxHeight: '300px', objectFit: 'contain',
                borderRadius: '10px'}`)
            small(:style=`{position: 'absolute', zIndex: 100, top: '8px', left: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)'}`
              ).q-pa-sm.text-white.text-bold Nodes: {{c.nodes }}
            small(:style=`{position: 'absolute', zIndex: 100, bottom: '8px', left: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)'}`
              ).q-pa-sm.text-white {{ c.item.name | cut(40) }}
  template(v-slot:nodes)
    .column.fit
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
        span {{$t('Total')}}: {{ nodes.length }}
        .col
        q-btn(round flat icon="search")
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-px-sm
          div(
            v-for="(n, ni) in nodes" :key="n.oid" @click="itemClick('node', n)"
            :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.justify-center.bg-white.q-mb-sm
            span {{ $t(n.name) }}
</template>

<script>
export default {
  name: 'wsItems',
  props: ['types'],
  data () {
    return {
      coll: 'fragments',
      colls: [
        {id: 'notes', name: 'Notes'},
        {id: 'fragments', name: 'Fragments'},
        {id: 'contents', name: 'Contents'},
        {id: 'nodes', name: 'Nodes'}
      ]
    }
  },
  computed: {
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
      return this.$store.state.workspace.workspace.nodes.filter((n, i) => {
        return n.fragments.length === 0
      })
    },
    fragments () {
      return this.$store.state.workspace.workspace.nodes.reduce((acc, val) => {
        val.fragments.map(f => {
          acc.push(f)
          // f.cuts.map((c, ci) => {
          //   if (c.name) {
          //     acc.push({name: c.name, scale: f.content.duration, content: f.content, cuts: [{name: '', thumbUrl: '', color: '', points: c.points}]})
          //   }
          // })
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
      return this.$store.state.workspace.workspace.nodes.filter((n, i) => {
        return n.fragments.length > 0
      })
    }
  },
  methods: {
    itemClick (type, item) {
      this.$log('itemClick', type, item)
      this.$emit('itemClick', [type, JSON.parse(JSON.stringify(item))])
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
