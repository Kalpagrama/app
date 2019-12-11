<template lang="pug">
div().column.full-width.q-px-sm.q-pt-sm
  div(:style=`{position: 'relative', borderRadius: '10px',
    border: active ? '0px solid black' : '0px solid #eee'}`).row.full-width.bg-white
    //- action
    q-btn(round flat dense icon="more_vert" color="white" @click="$emit('action')"
      :style=`{position: 'absolute', zIndex: zIndex+2, top: '8px', right: '8px'}`).shadow-1
    //- f0 preview
    div(:style=`{position: 'relative', maxHeight: $q.screen.width-60+'px', borderRadius: '10px'}`
      ).row.full-width.items-start.content-start.bg-black
      img(
        :src="node.meta.fragments[1].thumbUrl" draggable="false"
        :style=`{objectFit: 'contain', borderRadius: '10px', overflow: 'hidden'}`).fit
      video(
        v-if="nodeFull && pinned" autoplay
        :src="nodeFull.fragments[1].url" type="video/mp4"
        :style=`{position: 'absolute', zIndex: 10, top: 0, objectFit: 'contain'}`
        ).fit
      img(
        :src="node.meta.fragments[0].thumbUrl" draggable="false"
        :style=`{
          position: 'absolute', right: '10px', bottom: 60+'px', zIndex: zIndex+1,
          objectFit: 'contain', borderRadius: '10px', width: '100px', opacity: 0.8}`)
    //- name
    div(
      @click="nameClick"
      :style=`{minHeight: '50px'}`).row.full-width.justify-center.items-center
      span.text-bold.text-center.cursor-pointer {{ $t(node.name) }}
  //- div(v-if="pinned").col.full-width.bg-green
  //-   node-pin(:zIndex="zIndex+100" :opened="pinned")
</template>

<script>
export default {
  name: 'nodePin__node',
  props: ['node', 'zIndex', 'index', 'active', 'pinned', 'opened', 'visible'],
  data () {
    return {
      f1Bottom: 10,
      f1maxWidth: '30%',
      nodeFull: null
    }
  },
  watch: {
    active: {
      handler (to, from) {
        this.$logD('active CHANGED', to, this.node.name)
      }
    },
    pinned: {
      handler (to, from) {
        this.$logD('pinned CHAGNED', to)
      }
    },
    opened: {
      handler (to, from) {
        this.$logD('opened CHANGED', to)
        if (to) {
          this.$tween.to(this, 0.7, {
            f1Bottom: -150,
            f1maxWidth: '90%'
          })
        } else {
          this.$tween.to(this, 0.7, {
            f1Bottom: 10,
            f1maxWidth: '30%'
          })
        }
      }
    }
  },
  methods: {
    nameClick () {
      this.$logD('nameClick', this.pinned)
      if (this.pinned) {
      } else {
        let {0: r} = this.$el.getClientRects()
        let rect = {bottom: r.bottom, width: r.width, height: r.height, left: r.left, right: r.right, top: r.top, x: r.x, y: r.y}
        this.$emit('nameClick', [this.node, rect])
      }
    },
    play () {
    },
    pause () {
    },
    async nodeLoad (oid) {
      this.$logD('nodeLoad start', this.index, this.node.oid)
      let node = null
      try {
        node = await this.$store.dispatch('objects/get', { oid, fragmentName: 'nodeFragment', priority: 0 })
      } catch (err){
        // this.$logD('nodeLoad error', err, this.index, this.node.oid)
        this.logE('node', 'nodeLoad error', err)
        node = null
      }
      this.$logD('nodeLoad done', this.index, this.node.oid)
      return node
    }
  },
  async mounted () {
    this.nodeFull = await this.nodeLoad(this.node.oid)
  },
  beforeDestroy () {
  }
}
</script>
