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
.row.fit.justify-center
  div(
    :style=`{maxWidth: '400px'}`
    ).column.fit
    div(
      :style=`{height: '60px'}`
      ).row.full-width.items-center.content-center
      .col.full-height
        .row.fit.items-center.content-center.q-px-md
          span.text-bold.text-green Node editor
      div(
        :style=`{height: '60px', width: '60px'}`
        ).row.items-center.content-center.justify-center
        q-btn(round flat icon="refresh" color="green" :loading="refreshing" @click="refresh()")
    .col.full-width
    div(
      :style=`{minHeight: '200px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.bg-grey-10.q-pa-md
      span.text-red composition-editor
    div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-my-md
      input(
        v-if="node"
        v-model="node.name"
        placeholder="Whats the essence?").fit.bg-white.kinput
    div(
      :style=`{minHeight: '200px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.bg-grey-10.q-pa-md
      span.text-red composition-editor
    .col.full-width
    //- category, spheres
    div(:style=`{minHeight: '60px'}`).row.full-width.items-start
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
        span.text-bold.text-green Category & spheres
      .row.full-width
        span(
          v-if="node"
          v-for="(s,si) in node.spheres" :key="si"
          :class=`{}`
          :style=`{borderRadius: '10px'}`
        ).text-green.q-pa-sm.bg-grey-10.q-mb-sm.q-mr-sm {{ s.name }}
    //- footer: save, publish
    div(:style=`{height: '60px'}`
      ).row.full-width.items-center.q-px-sm
      q-btn(
        outline color="green" no-caps :loading="saving" @click="save()"
        :style=`{borderRadius: '10px'}`)
        span().text-bold.text-green Save
      .col.full-height
      q-btn(
        push color="green" no-caps :loading="publishing" @click="publish()"
        :style=`{borderRadius: '10px'}`)
        span().text-bold Publish
</template>

<script>
import { throttle } from 'quasar'
import compositionEditor from 'components/node/composition_editor'

export default {
  name: 'nodeEditor',
  components: {compositionEditor},
  props: ['value'],
  data () {
    return {
      name: '',
      saving: false,
      publishing: false,
      refreshing: false,
      node: null,
      nodeNew: {
        name: '',
        layout: 'PIP',
        category: 'FUN',
        spheres: [],
        compositions: [
          // {
          //   operation: { type: 'CONCAT', items: [], operations: null },
          //   layers: [{ content: content, figuresAbsolute: [] }]
          // }
        ]
      }
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('value CHANGED', to)
        if (to) {
          this.node = to
        } else {
          this.node = this.nodeNew
        }
      }
    },
    node: {
      deep: true,
      handler (to, from) {
        this.$log('node CHANGED', to)
        if (to) {
          this.nodeSave(to)
        }
      }
    }
  },
  methods: {
    async nodeSave (node) {
      try {
        this.$log('nodeSave start', node || this.node)
        this.nodeSaving = true
        let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(node || this.node)))
        this.$log('res', res)
        this.nodeSaving = false
        this.nodeSavingError = null
        // this.node = res.object
        this.node = res
        this.$log('nodeSave done')
      } catch (e) {
        this.$log('nodeSave error', e)
        this.nodeSaving = false
        this.nodeSavingError = e
      }
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        await this.$wait(2000)
        this.$log('publish done')
        this.publishing = false
      } catch (e) {
        this.$log('publish error', e)
        this.publishing = false
      }
    },
    async refresh () {
      try {
        this.$log('refresh start')
        this.refreshing = true
        await this.$wait(2000)
        this.$log('refresh done')
        this.refreshing = false
      } catch (e) {
        this.$log('refresh error', e)
        this.refreshing = false
      }
    }
  },
  created () {
    this.nodeSave = throttle(this.nodeSave, 2000)
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
