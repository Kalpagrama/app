<template lang="pug">
div(
  :style=`{position: 'relative'}`).row.full-width
  //- wrapper
  div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white
    //- //- author
    //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    //-   div(
    //-     v-if="opened"
    //-     :style=`{height: '46px'}`).row.full-width.items-center.q-px-sm
    //-     div(:style=`{height: '36px', width: '36px', borderRadius: '50%'}`).row.bg-red
    //-     .col.full-height
    //-       .row.fit.items-center.q-px-sm
    //-         span Ivanov Ivan
    //- preview
    div(:style=`{maxHeight: $q.screen.width+'px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      video(
        v-if="index === 1"
        :src="url"
        :style=`{width: '100%', height: '100%', objectFit: 'contain'}`
        autoplay loop playsinline)
      img(
        v-else
        :src="node.meta.fragments[0].thumbUrl" :style=`{objectFit: 'contain'}`).fit
    //- name
    div(:style=`{minHeight: '60px'}`).row.full-width.items-center.justify-center.bg-white
      span(@click="nodeNameClick()").text-center.text-bold {{ node.name }}
    //- //- f1
    //- div(:style=`{maxHeight: f1maxHeight+'px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width
    //-   img(:src="node.meta.fragments[1].thumbUrl" :style=`{objectFit: 'contain'}`).fit
    //- //- actions
    //- div(:style=`{maxHeight: f1maxHeight+'px', height: '60px', overflow: 'hidden'}`).row.full-width.items-center.bg-white.q-px-sm
    //-   q-btn(round color="accent" icon="blur_on")
</template>

<script>

export default {
  name: 'tnode',
  props: ['index', 'node', 'opened'],
  data () {
    return {
      f1maxHeight: 0,
      url: 'https://test.kalpagramma.com/local_object_storage/fragments/54/e7/154692406606864399/568.38:0-10_640.mp4'
    }
  },
  watch: {
    opened: {
      handler (to, from) {
        this.$logD('opened CHANGED', to)
        if (to) {
          this.$tween.to(this, 0.7, {f1maxHeight: this.$q.screen.width})
        } else {
          this.$tween.to(this, 0.7, {f1maxHeight: 0})
        }
      }
    }
  },
  methods: {
    nodeNameClick () {
      this.$logD('nodeNameClick')
      if (this.opened) {
      } else {
        let {'0': r} = this.$el.getClientRects()
        let rect = {bottom: r.bottom, width: r.width, height: r.height, left: r.left, right: r.right, top: r.top, x: r.x, y: r.y}
        this.$emit('nodeNameClick', this.node, rect)
      }
    },
    nodeHello () {
      this.$logD('nodeHello')
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
