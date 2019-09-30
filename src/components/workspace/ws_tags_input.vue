<template lang="pug">
.row.full-width
  .row.full-width.q-px-md
    span Тэги
  .row.full-width.q-px-sm
    div(style=`position: relative; z-index: 300; borderRadius: 10px; overflow: hidden; zIndex: 100`).row.full-width.bg-grey-2
      q-input(v-model="name" filled placeholder="Тэг" style=`position: relative; z-index: 10` @keydown.enter="tagAdd").full-width
        template(v-slot:append)
          q-btn(v-if="name.length > 0" round flat dense icon="clear" color="grey-8" @click="name = ''")
    div(v-show="tagsLocal.length > 0"
      :style=`{position: 'relative', zIndex: 10, paddingTop: '30px', marginTop: '-20px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-pa-sm.bg-grey-2
      div(v-for="(t, ti) in tagsLocal" v-if="tagsWS[t]" :key="ti"
        :style=`{height: '34px', borderRadius: '10px', overflow: 'hidden'}`
          ).row.items-center.content-center.justify-between.q-pl-sm.q-py-xs.bg-primary.q-mb-sm.q-mr-sm
        span(:style=`{whiteSpace: 'nowrap'}`).text-white.q-mb-xs {{ `#${tagsWS[t].name}` }}
        q-btn(round flat dense color="grey-4" icon="clear" @click="tagDelete(t, ti)")
  div(v-if="false").row.full-width.q-pa-sm
    small {{ tagsWS }}
</template>

<script>
export default {
  name: 'workspace__tagsInput',
  props: ['tags'],
  data () {
    return {
      name: '',
      tagsLocal: []
    }
  },
  computed: {
    tagsWS () {
      return this.$store.getters['workspace/tags']
    }
  },
  watch: {
    tagsLocal: {
      handler (to, from) {
        this.$log('tagsLocal CHANGED', to)
        this.$emit('tags', to)
      }
    }
  },
  methods: {
    async tagAdd () {
      // this.$log('tagAdd')
      let tag = {
        name: this.name,
        color: '#7d389e',
        icon: ''
      }
      let tagFind = this.$store.state.workspace.workspace.tags.find(t => (t.name === tag.name))
      if (tagFind) tag.uid = tagFind.uid
      else tag = await this.$store.dispatch('workspace/addWSTag', tag)
      this.$log('tag', tag)
      this.$set(this.tagsLocal, this.tagsLocal.length, tag.uid)
      this.$set(this, 'name', '')
    },
    tagDelete (t, ti) {
      this.$log('tagDelete')
      this.tagsLocal = this.tagsLocal.filter(tag => (tag !== t))
    }
  },
  mounted () {
    this.$log('mounted')
    this.tagsLocal = this.tags || []
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
