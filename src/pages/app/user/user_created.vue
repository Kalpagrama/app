<template lang="pug">
//- q-page(:style=`{paddingTop: '8px', minHeight: '100vh'}`).row.full-width.justify-center
  kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery" :sliceSize="1000" v-slot=`{items,next}`)
    dynamic-scroller(
      :items="items"
      :min-item-size="60"
      key-field="oid"
      :style=`{height: $q.screen.height-110+'px',}`).full-width.br
      template(v-slot="{ item, index, active }")
        dynamic-scroller-item(
          :item="item"
          :active="active"
          :size-dependencies=`[
            item.name,
          ]`
          :data-index="index")
          .row.full-width.justify-center.br
            node-lite(
              :node="item" :isActive="indexMiddle === index" :isVisible="true"
              :accessKey="index"
              v-observe-visibility=`{
                callback: indexMiddleHandler,
                intersection: {
                  rootMargin: '-50% 0px'
                }
              }`
              :style=`{
                maxWidth: '800px',
                marginBottom: '70px',
              }`
              )
q-page(:style=`{paddingTop: '8px', paddingBottom: '200px', minHeight: '100vh'}`).row.full-width.justify-center
  div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
    kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
      template(v-slot=`{items,next}`)
        list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
          q-infinite-scroll(@load="next" :offset="250")
          template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
            node-lite(:node="item" :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_user_userCreated',
  props: {
  },
  data () {
    return {
      indexMiddle: 0
    }
  },
  computed: {
    sphereOid () {
      return this.$route.params.oid
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          populateObjects: true,
          oidSphere: this.sphereOid,
          oidAuthor: {$eq: this.sphereOid},
          sortStrategy: 'AGE',
        }
      }
    }
  },
  methods: {
    indexMiddleHandler (isVisible, entry) {
      let index = parseInt(entry.target.accessKey)
      if (isVisible) {
        this.indexMiddle = index
      }
      else {
        if (index === this.indexMiddle) {
          this.indexMiddle = -1
        }
      }
    }
  }
}
</script>
