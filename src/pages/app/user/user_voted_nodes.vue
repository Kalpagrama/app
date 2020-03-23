<template lang="pug">
//- .row.full-width
//-   kalpa-loader(ref="nodeLoader" :variables="variables" type="sphereNodes")
//-     template(v-slot:items=`{items}`)
//-       node-list(:nodes="items" @nodeClick="nodeClick")
//-       div(v-if="items.length === 0" style=`border-radius: 10px`).row.full-width.justify-center.bg-white.q-pa-lg
//-         span {{$t('Пользователь не голосовал', 'User didnt rate')}}
.row.fit.items-start.content-start
  kalpa-loader(v-if="variables" ref="nodeLoader" :variables="variables" type="sphereNodes")
    template(v-slot:items=`{items}`)
      node-list(:nodes="items" @nodeClick="nodeClick")
        template(v-slot:header)
          slot(name="header")
    //- div(v-if="items.length === 0" style=`border-radius: 10px`).row.full-width.justify-center.bg-white.q-pa-lg
    //-   span {{$t('Пользователь не голосовал', 'User didnt rate')}}
</template>
<script>
import node from './node'

export default {
  name: 'userVotedNodes',
  props: {
    zIndex: {type: Number, default () { return 100 }},
    node: {type: Object},
    opened: {
      type: Boolean,
      default () {
        return false
      }
    },
    filter: {type: Object}
  },
  components: {node},
  data () {
    return {
      headerShow: true,
      // sphereOid: undefined,
      nodePinned: true,
      nodeOid: undefined,
      nodeRect: null,
      nodeStyles: {
        position: 'absolute',
        height: 0,
        width: 0,
        top: 0
      },
      nodeGoTimeout: 0.4,
      tintOpacity: 0,
      scrollTop: 0,
      nodesVisible: []
    }
  },
  computed: {
    nodeZIndex () {
      return this.zIndex + 200
    },
    sphereOid () {
      // return this.$store.getters.currentUser.oid
      return this.$route.params.oid
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 100 },
        sortStrategy: 'AGE',
        // filter: { types: ['NODE'], fastFilters: ['VOTED_BY_USER']}
        filter: this.filter
      }
    },
    categories () {
      return this.$store.state.node.categories
    },
    colls () {
      return this.$store.state.node.categories.map((c, ci) => {
        c.id = c.sphere.oid
        return c
      })
    }
  },
  methods: {
    nameClick ([node, rect]) {
      this.$logD('nameClick', node, rect)
      this.nodeRect = rect
      this.nodeStyles.height = rect.height + 'px'
      this.nodeStyles.width = rect.width + 'px'
      this.nodeStyles.top = rect.top - 50 + 'px'
      this.nodeOid = node.oid
      this.$tween.to(this.nodeStyles, this.nodeGoTimeout, {
        top: 0 + 'px',
        onComplete: () => {
          this.nodePinned = true
        }
      })
      this.$tween.to(this, this.nodeGoTimeout, {tintOpacity: 1})
    },
    nodeAction (action) {
      this.$logD('nodeAction', action)
      switch (action) {
        case 'fragment': {
          break
        }
      }
    },
    nodeBack () {
      this.$logD('nodeBack')
      this.nodePinned = false
      this.$tween.to(this.nodeStyles, this.nodeGoTimeout, {
        top: this.nodeRect.top + 'px',
        onComplete: () => {
          this.nodeOid = undefined
          this.nodeRect = null
        }
      })
      this.$tween.to(this, this.nodeGoTimeout, {tintOpacity: 0})
    },
    nodeVisible (isVisible, entry) {
      if (isVisible) {
        this.$logD('nodeVisible', isVisible, entry.target.lang)
        this.nodesVisible.unshift(entry.target.lang)
      } else {
        this.$logD('nodeVisible', isVisible, entry.target.lang)
        this.nodesVisible = this.nodesVisible.filter(n => (n.oid !== entry.target.lang))
      }
    },
    onScroll (e) {
      // this.$logD('onScroll', e)
      let scrollTop = this.$refs.nodePinScroll.scrollTop
      if (this.scrollTop > scrollTop) this.headerShow = true
      else this.headerShow = false
      this.scrollTop = scrollTop
    }
  },
  created () {
    this.sphereOid = this.colls[0].id
  },
  mounted () {
    this.$logD('mounted', this.zIndex)
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
