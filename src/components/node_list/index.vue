<template lang="pug">
.row.full-width.items-start.content-start.q-px-md
  //- node item
  div(v-for="(n, ni) in nodes" :key="n.oid"
    :style=`{height: '80px', borderRadius: '4px'}`
    @mouseover="nodeOver = n.oid"
    @mouseleave="nodeOver = undefined"
    ).row.full-width.items-center.content-center.q-mb-md.bg-grey-2.cursor-pointer.nodelist-item
    div(
      @click="nodeClick(n, ni)"
      :style=`{width: '60px', height: '70px'}`).row.items-between.content-between.q-ml-sm
      div(
        :style=`{width: '60px', height: '30px', overflow: 'hidden', ...getRadius}`).row.items-center.content-center
        img(:src="n.thumbUrl[0]" :style=`{maxWidth: '100%', maxHeight: '100%', objectFit: 'cover'}`).full-width
      div(
        :style=`{width: '60px', height: '30px', overflow: 'hidden', ...getRadius}`).row.items-center.content-center
        img(:src="n.thumbUrl[1]" :style=`{maxWidth: '100%', maxHeight: '100%', objectFit: 'cover'}`).full-width
    div(@click="nodeClick(n, ni)").col.full-height
      div(:style=`{position: 'relative'}`).row.fit.items-center.content-center
        small(:style=`{whiteSpace: 'nowrap'}`).q-ml-sm {{n.name}}
        slot(name="extra" :node="n" :nodeOver="nodeOver === n.oid")
        //- small(
        //-   v-if="n.oid === nodeOver"
        //-   :style=`{position: 'absolute', right: '17px', bottom: '6px'}`
        //-   ).text-grey-6 {{$date(n.createdAt, 'DD.MM.YYYY HH:mm')}}
        //- q-btn(
        //-   v-if="n.oid === nodeOver"
        //-   @click="moreClick(n, ni)"
        //-   flat dense icon="more_vert" color="grey-6"
        //-   :style=`{position: 'absolute', right: '4px', top: '4px'}`)
    div(
      v-if="n.oid === nodeOver" @click="$router.push(`/app/node/${n.oid}`)"
      :style=`{height: '60px', width: '60px'}`).row.items-center.justify-center.q-mr-sm
      q-btn(icon="link" color="grey-9" flat style=`width: 40px; height: 40px`)
</template>

<script>
export default {
  name: 'nodeList',
  props: ['nodes'],
  data () {
    return {
      nodeOver: undefined
    }
  },
  computed: {
    getRadius () {
      return {
        borderBottomLeftRadius: '100%12px',
        borderBottomRightRadius: '100%12px',
        borderTopLeftRadius: '100%12px',
        borderTopRightRadius: '100%12px'
      }
    }
  },
  methods: {
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      this.$emit('nodeClick', n, ni)
    },
    moreClick (n, ni) {
      this.$log('modeClick')
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

<style lang="stylus">
.nodelist-item:hover
  background: white !important
</style>
