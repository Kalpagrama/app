<template lang="pug">
q-layout(view="hHh Lpr lff").b-30
  kalpa-loader(
    :immediate="true"
    :query="jointsQuery" :limit="12"
    @items="jointsUpdated"
    v-slot=`{items, next, nexting}`)
  //- q-header.b-30
    .row.full-width.justify-center.q-px-sm.q-pt-sm
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
          height: '60px',
          borderRadius: '10px',
        }`).row.full-width.items-center.content-center.b-40.q-px-sm
        q-btn(
          @click="cancel()"
          round flat color="white" icon="west")
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Links
  q-header.b-30
    .row.full-width.justify-center
      q-resize-observer(@resize="headerOnResize" :debounce="300")
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-start.content-start
        node-feed(
          v-if="joint"
          :node="joint"
          :showHeader="joint.oid"
          :showActions="joint.oid"
          :showSpheresAlways="true")
          template(v-slot:items)
            node-editor(
              :node="joint"
              :showEditor="jointEditing"
              :itemsEditable="jointEditing ? [1] : []"
              :style=`{}`
              @node="jointEditCancel")
  q-page-container
    q-page(
      v-if="joint"
      ).row.full-width.justify-center.q-px-xs.q-pt-sm
      div(
        v-show="!jointEditing"
        :style=`{
          position: 'relative',
          maxWidth: $store.state.ui.pageWidth+'px',
          height: $q.screen.height-headerHeight-8+'px',
        }`
        ).row.full-width.items-start.content-start
        //- TINT top
        div(
          :style=`{
            position: 'absolute', top: '0px', zIndex: 100, transform: 'translate3d(0,0,0)',
            height: drumsLineMarginTop+'px',
            background: 'linear-gradient(0deg, rgba(30,30,30,0) 0%, rgba(30,30,30,1) 100%)',
            pointerEvents: 'none',
          }`).row.full-width
        //- TINT bottom
        div(
          :style=`{
            position: 'absolute', bottom: '0px', zIndex: 100, transform: 'translate3d(0,0,0)',
            height: drumsLineMarginTop*2+'px',
            background: 'linear-gradient(0deg, rgba(30,30,30,1) 0%, rgba(30,30,30,0) 100%)',
            pointerEvents: 'none',
          }`).row.full-width
        //- left item
        .col.full-height.q-pr-xs
          div(:style=`{position: 'relative',}`).row.fit.items-start.content-start
            q-btn(
              @click="jointPrev()"
              round flat icon="west" color="white"
              :style=`{
                position: 'absolute', zIndex: 200, left: '16px', bottom: '16px',
              }`)
            joint-item(
              :itemIndex="0"
              :joint="joint"
              :style=`{
                marginTop: drumsLineMarginTop+'px',
              }`).b-60
              q-btn(
                flat color="green" icon="link"
                :style=`{
                  position: 'absolute', zIndex: 200, right: '-24px',
                  width: '40px', height: '40px',
                  pointerEvents: 'none',
                }`)
        //- right item
        .col.full-height.q-pl-xs
          div(:style=`{position: 'relative'}`).column.fit
            //- EDIT
            q-btn(
              @click="jointEditStart()"
              color="green" icon="add"
              :style=`{
                position: 'absolute', bottom: '16px', zIndex: 200,
                right: '16px',
                borderRadius: '50%',
                width: '40px', height: '40px',
              }`)
            //- body
            div(
              ref="jointsScroll"
              :style=`{position: 'relative'}`).col.full-width.scroll
              div(
                :style=`{
                  marginTop: drumsLineMarginTop+'px',
                  marginBottom: $q.screen.height-headerHeight-drumsLineMarginTop-44-8+'px',
                }`).row.full-width.items-start.content-start
                div(
                  v-for="(j,ji) in joints" :key="j.oid"
                  :ref="'joint-'+j.oid"
                  ).row.full-width.justify-center.q-mb-xs
                  div(
                    @click="$router.push({query: {joint: j.oid}})"
                    :style=`{
                      maxWidth: j.oid === $route.query.joint ? '100%' : 'calc(100% - 16px)',
                    }`
                    ).col
                    joint-item(
                      :itemOid="joint.items[0].oid"
                      :joint="j"
                      :class=`{
                        'b-60': j.oid === $route.query.joint
                      }`)
                      q-btn(
                        @click="jointNext(joint,ii)"
                        v-if="j.oid === $route.query.joint"
                        flat color="white" icon="fast_forward"
                        :style=`{
                          position: 'absolute', zIndex: 300, top: '0px', right: '0px',
                          width: '40px', height: '40px',
                        }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_links',
  components: {
    nodeEditor: () => import('components/node_editor/index.vue'),
    jointItem: () => import('./joint_item.vue')
  },
  data () {
    return {
      joint: null,
      jointNew: {
        oid: null,
        items: [],
        name: '',
        vertices: [],
        spheres: [],
        category: 'FUN',
        layout: 'HORIZONTAL',
      },
      jointEditing: false,
      joints: [],
      // jointsLoaded: false,
      // jointActiveOid: null,
      headerWidth: 0,
      headerHeight: 0,
      // drums
      drumsLineMarginTop: 60,
    }
  },
  computed: {
    jointsQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.$route.params.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to && this.jointsLoaded) {
          this.$log('$route.params.oid TO', to)
          let item = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          let joint = JSON.parse(JSON.stringify(this.jointNew))
          joint.items[0] = item
          this.$set(this, 'joint', joint)
        }
      }
    },
    '$route.query.joint': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to && this.jointsLoaded) {
          this.$log('$route.query.joint TO', to)
          let joint = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          this.$log('$route.query.joint => jointSet')
          this.jointSet(joint)
        }
      }
    }
  },
  methods: {
    jointEditStart () {
      this.$log('nodeEditStart')
      this.$set(this.joint.items, 1, {type: 'ADD'})
      this.jointEditing = true
      // this.jointActiveOid = null
      let joint = JSON.parse(JSON.stringify(this.jointNew))
      joint.items = this.joint.items
      this.$set(this, 'joint', joint)
    },
    async jointEditCancel () {
      this.$log('nodeEditCancel')
      this.jointEditing = false
      // this.itemSetInitial()
    },
    jointPrev () {
      this.$log('jointPrev')
      this.$router.back()
    },
    jointNext (joint, ii) {
      this.$log('jointNext', joint, ii)
      let item = joint.items.find(i => i.oid !== this.$route.params.oid)
      this.$router.push({params: {oid: item.oid}, query: {joint: joint.oid}})
    },
    async jointSet (joint) {
      this.$log('jointSet', joint)
      if (this.joints.length > 0) {
        if (!joint) {
          joint = this.joints[2] || this.joints[1] || this.joints[0] || null
        }
        // need joint!
        if (!joint) return
        // this.jointActiveOid = joint.oid
        // find and set item from joint
        let item = joint.items.find(i => i.oid !== this.$route.params.oid)
        this.$set(this.joint.items, 1, item)
        // set joint fields
        for (const p in joint) {
          if (p !== 'items') {
            this.$set(this.joint, p, joint[p])
          }
        }
        await this.$wait(200)
        let jointIndex = this.joints.findIndex(j => j.oid === joint.oid)
        this.$log('jointIndex', jointIndex)
        let scrollTop = jointIndex * (40 + 4)
        this.$tween.to(this.$refs.jointsScroll, 0.8, {scrollTop: scrollTop})
        // this.$refs.jointsScroll.scrollTop = scrollTop
      }
      else {
        this.jointEditing = true
        // this.jointActiveOid = null
        // kill joint?
        this.$set(this.joint.items, 1, {type: 'ADD'})
      }
    },
    async jointsUpdated (joints) {
      this.$log('jointsUpdated', joints)
      if (joints) this.joints = joints
      await this.$wait(300)
      if (this.jointsLoaded) {
      }
      else {
        this.jointsLoaded = true
        let item = await this.$rxdb.get(RxCollectionEnum.OBJ, this.$route.params.oid)
        let joint = JSON.parse(JSON.stringify(this.jointNew))
        joint.items[0] = item
        this.$set(this, 'joint', joint)
        if (this.$route.query.joint) {
          let joint = await this.$rxdb.get(RxCollectionEnum.OBJ, this.$route.query.joint)
          this.$log('jointsUpdated => jointSet')
          this.jointSet(joint)
        }
        else {
          this.$router.push({query: {joint: this.joints[0].oid}})
        }
      }
    },
    headerOnResize (e) {
      this.$log('headerOnResize', e)
      this.headerWidth = e.width
      this.headerHeight = e.height
    }
  },
  mounted () {
    // this.$log('mounted')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
  }
}
</script>
