<template lang="pug">
.row.full-width
  k-dialog(ref="metaDialog")
    .column.fit.bg-white
      div(:style=`{height: '70px'}`).row.full-width.items-center.q-px-md
        span.text-bold {{$t('Выбрать шаблон')}}
      .col.scroll.full-width
        div(
          v-for="(l, li) in layouts" :key="li" @click="layoutClick(l, li)"
          :style=`{height: '100px'}`
          ).row.full-width.items-center.q-px-md
          span {{ $t(l.name) }}
  //- label
  div(:style=`{height: '40px'}`).row.full-width.items-end.q-px-sm
    span.text-bold {{$t('Шаблон')}}
  //- input
  div(
    :style=`{height: '56px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-center.q-pa-sm.bg-grey-4
    .col.full-height
      div(@click="$refs.metaDialog.show()").row.fit.items-center.content-center
        span {{$t('Картинка в картинке')}}
    q-icon(name="keyboard_arrow_down" size="30px" color="grey-7" @click="$refs.metaDialog.show()").q-mr-sm
  //- span node meta input
</template>

<script>
export default {
  name: 'nodeEditor__meta',
  props: ['value'],
  data () {
    return {
      valued: false,
      meta: {
        layout: ''
      }
    }
  },
  computed: {
    layouts () {
      return this.$store.state.node.layouts
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (to, from) {
        this.$logD('value CHANGED', to)
        this.meta = to
      }
    }
  },
  methods: {
    layoutClick (l, li) {
      this.$logD('layoutClick', l, li)
      // this.meta.layout = l.type
      this.$emit('input', this.meta)
      this.$refs.metaDialog.hide()
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
