<template lang="pug">
.column.fit
  q-dialog(ref="showDialogTags" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    findTags(v-if="showDialogTags" @tagAdd="tagAdd" @close="$refs.showDialogTags.hide()")
  .col
    fragment
  div(style="height: 57px").row.full-width
    q-input(v-model="node.name" input-style=`fontSize: 18px`
      :input-class="['text-center']" placeholder="В чем суть?").full-width
  .col
    fragment
  div(style=`borderTop: 1px solid #eee; height: 50px`).row.full-width.items-center
    .col.full-height
      div(v-if="node.tags.length === 0" @click="tagsFind").row.fit.items-center.hr.cursor-pointer
        span.text-grey-9.q-ml-sm Добавь сферы сути
      div(v-else).row.fit.q-px-sm
        div(style=`maxWidth: 100%`).row.fit.items-center.bg-white.no-wrap.scroll
          div(v-for="(t, ti) in node.tags" :key="ti" style=`height: 30px; borderRadius: 5px`).q-pa-xs.q-mr-sm.bg-grey-2
            span #
            span {{ t.name }}
            //- div(style=`height: 30px; width: 30px`)
            q-btn(icon="clear" @click="tagDelete(t, ti)" dense flat round size="xs" color="black")
    q-btn(v-if="node.tags.length < 4" flat round dense icon="add" color="primary" size="md" @click="tagsFind").q-mx-sm
</template>

<script>
import fragment from './fragment'
import findTags from './find_tags'
export default {
  name: 'editorNode',
  components: {fragment, findTags},
  data () {
    return {
      node: {
        name: '',
        tags: [
          {oid: 't1', name: 'смерть'},
          {name: 'сталин'},
          {name: 'справедливость'},
          {oid: 't4', name: 'неприкосновенность'}
        ],
        fragments: []
      },
      showDialogTags: false
    }
  },
  methods: {
    tagsFind () {
      this.$log('tagsFind')
      this.showDialogTags = true
      this.$refs.showDialogTags.show()
    },
    tagAdd (t) {
      this.$log('tagAdd')
      // TODO: add tag? if this tag is unique? or valid?
      if (!this.node.tags.find(tag => tag.name === t.anme)) {
        this.node.tags.push(t)
      } else {
        this.$log('the SAME tag')
      }
    },
    tagDelete (t, ti) {
      this.$log('tagDelete')
      this.node.tags = this.node.tags.filter(tag => tag.name !== t.name)
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
