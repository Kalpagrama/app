<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.bg-white
  //- dialogs
  k-dialog-bottom(ref="wsItemDialog" mode="actions" :options="wsItemDialogOptions" @action="wsItemDialogAction")
  q-dialog(ref="sourceWsDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    div(@click.self="$refs.sourceWsDialog.hide()").row.fit.items-start.justify-center.q-pt-xl.q-px-sm
      div(:style=`{maxWidth: '500px'}`).column.fit.bg-white
        div(v-if="item").col.scroll
          span {{ item.name }}
  //- header
  div(:style=`{height: '60px'}`).row.full-width
    .col.full-height
      .row.fit.items-center.q-px-md
        //- span.text-bold Take from workspace
        span.text-bold {{ type }}
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="clear" @click="$emit('hide')")
  //- body
  .col.full-width.scroll
    div(:style=`{paddingBottom: '70px'}`).row.full-width.items-start.content.start.q-px-md.q-pt-md
      div(
        v-for="(i, ii) in items" :key="ii" @click="itemClick(i, ii)"
        :style=`{height: '60px', borderRadius: '10px'}`
        ).row.full-width.items-center.bg-grey-2.q-pa-sm.q-mb-sm
        //- preview
        div(:style=`{height: '40px', width: '40px', borderRadius: '10px', overflow: 'hidden'}`).row.bg-black
          img(:src="i.thumbUrl" :style=`{width: '100%', height: '100%', objectFit: 'contain'}`)
        //- body
        .col.full-height
          .row.fit.items-start.q-pa-sm
            span {{ i.name }}
</template>

<script>
// TODO: add preview of the fragment to choose, and make a component of fragment preview...
export default {
  name: 'fragmentFinder__sourceWs',
  props: ['type'],
  data () {
    return {
      item: null
    }
  },
  computed: {
    items () {
      return this.$store.state.workspace.workspace[this.type]
    },
    wsItemDialogOptions () {
      return {
        header: false,
        headerName: '',
        actions: {
          preview: {name: 'Preview'},
          delete: {name: 'Удалить', color: 'red'}
        },
        confirm: true,
        confirmName: 'Выбрать'
      }
    }
  },
  methods: {
    itemClick (i, ii) {
      this.$logD('itemClick', i, ii)
      this.item = i
      // this.$refs.sourceWsDialog.show()
      this.$refs.wsItemDialog.show()
    },
    wsItemDialogAction (action) {
      this.$logD('wsItemDialogAction', action)
      switch (action) {
        case 'preview': {
          this.$logD('PREVIEW')
          break
        }
        case 'delete': {
          this.$emit('hide')
          break
        }
        case 'confirm': {
          this.$emit('item', this.item)
          this.$emit('hide')
          break
        }
      }
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
