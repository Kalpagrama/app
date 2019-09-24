<template lang="pug">
.column.fit.bg-white
  div(v-if="false").row.full-width
    small.full-width selected:
    small.full-width {{ selected }}
  //- header
  slot(name="header")
  //- div(v-if="!$scopedSlots.header" :style=`{height: '70px'}`).row.full-width.items-center.q-px-md
  //-   span Workspace, type, tag, name, sort
  .row.full-width.items-center.q-py-sm
    div().row.full-height.items-center
      slot(name="presearch")
    .col
      .row.full-width.q-px-sm
        div(style=`borderRadius: 10px; overflow: hidden`).row.full-width
          q-input(v-model="search" filled placeholder="Поиск по мастерской").full-width
            template(v-slot:append)
              q-btn(v-if="search.length > 0" round flat dense icon="clear" @click="searchClear()")
              q-btn(round flat icon="filter_list" @click="toggleFilters()")
  //- types
  div(v-if="false" :style=`{height: '50px'}`).row.full-width.items-center.content-center.scroll.q-px-sm
    .row.full-width.no-wrap.bg
      div(
        v-if="reactive > 0"
        v-for="(t, tkey) in types" :key="tkey" @click="contentTypeClick(t, tkey)"
        :style=`{width: '40px', minWidth: '40px', height: '40px'}`).row.items-center.justify-center.bp
          q-btn(round dense
            :style=`contentStyle(t, tkey)`)
            q-icon(color="white" :name="t.icon" size="18px")
  //- tags
  div(v-if="false" :style=`{height: '70px'}`).row.full-width.scroll.q-px-sm
    span #tag1, #tag2, #tag3, #tag4
  //- sort
  div(v-if="false" :style=`{height: '70px'}`).row.full-width.justify-between.q-px-md
    span field to sort
    span asc desc
  //- body
  div(body-scroll-lock-ignore).col.scroll
    .row.full-width.items-start.content-start.q-px-sm
      div(
        v-for="(i, ii) in videos" :key="ii" @click="contentClick(i, ii)"
        :style=`{height: '70px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-grey-2.q-mb-md
        //- preview
        div(:style=`{borderRadius: '10px', width: '124.25px', overflow: 'hidden'}`).row.full-height.bg-black
          img(:src="i.content.thumbUrl[0]" :style=`{height: '100%', width: '100%', objectFit: 'cover'}`)
        .col.full-height
          .row.fit.items-start.q-pa-sm
            //- name
            small.text-bold {{ i.content.name || i.name || i.uid }}
            //- span {{ i }}
</template>

<script>
export default {
  name: 'workspace',
  props: ['source'],
  data () {
    return {
      reactive: 1,
      selected: {},
      search: ''
    }
  },
  computed: {
    types () {
      return this.$store.state.workspace.contentTypes
    },
    nodes () {
      return this.$store.state.workspace.workspace.nodes
    },
    videos () {
      return this.$store.state.workspace.workspace.contents.filter(c => {
        return c.content.type === 'VIDEO'
      })
    }
  },
  methods: {
    toggleFilters () {
      this.$log('toggleFilters')
    },
    contentClick (c, ci) {
      this.$log('contentClick', c, ci)
      let content = {oid: c.content.oid, ...c}
      this.$emit('contentClick', content)
    },
    contentStyle (t, tkey) {
      if (this.selected[tkey]) {
        return {
          background: t.color,
          color: 'white'
        }
      } else {
        return {
          background: 'grey',
          color: '#eee'
        }
      }
    },
    contentTypeClick (t, tkey) {
      this.$log('contentTypeClick', t, tkey)
      if (this.selected[tkey]) {
        this.$delete(this.selected, tkey)
      } else {
        this.$set(this.selected, tkey, tkey)
      }
    },
    searchClear () {
      this.$log('searchClear')
      this.$set(this, 'search', '')
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
