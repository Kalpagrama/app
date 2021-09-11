<template lang="pug">
.row.full-width
  div(
    :class=`{
      //- 'bg-green-10': itemActive,
    }`
    :style=`{
      position: 'relative',
      background: itemActive ? 'rgb(33,33,33)' : 'none',
      //- background: itemActive ? 'rgba(76,175,80,0.1)' : 'none',
      borderRadius: itemIndependent ? '10px 10px 0px 0px' : '0px 0px 10px 10px',
    }`
    ).row.full-width.items-start.content-start.q-px-sm
    slot
    //- frame
    //- transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="itemActive && !itemIndependent"
        :style=`{
          position: 'absolute', top: '0px', left: '0px', zIndex: 100,
          //- maxWidth: 'calc(100% - 16px)',
          pointerEvents: 'none',
          background: itemActive ? 'rgb(33,33,33)' : 'none',
          borderRadius: itemIndependent ? '10px 10px 0px 0px' : '0px 0px 10px 10px',
          //- borderLeft: '1px solid rgb(76,175,80)',
          //- borderBottom: '1px solid rgb(76,175,80)',
          //- borderRight: '1px solid rgb(76,175,80)',
          //- borderRadius: '0px 0px 10px 10px',
        }`
        ).row.fit
    //- ===
    //- vertices
    div(
      v-if="joint && rowActive"
      :style=`{height: '35px'}`
      ).row.full-width
      transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        div(
          v-if="itemActiveLocal"
          :style=`{
            position: 'relative',
          }`
          ).row.fit
          //- indicator line
          //- div(
            :style=`{
              position: 'absolute', zIndex: 1, top: '4px', left: '22px',
              width: '2px',
              borderRadius: '1px',
              height: 'calc(100% - 8px)',
            }`
            ).row.bg-green
          //- essence
          div(
            v-if="joint.vertices[0] === 'ESSENCE'"
            :style=`{
              zIndex: 100,
              textAlign: 'center',
            }`
            ).row.fit.items-center.contnet-center.justify-center
            span.text-white.text-bold {{ joint.name }}
          //- associative
          div(
            v-if="joint.vertices[0] === 'ASSOCIATIVE'"
            :style=`{
              zIndex: 100,
              textAlign: 'center',
            }`
            ).row.fit.items-center.contnet-center.justify-center
            span.text-white.text-bold {{$t('Association')}}
          //- all the other vertex types
          div(
            v-else
            :style=`{
              zIndex: 100,
            }`
            ).row.fit.items-center.content-center.justify-center
            .row.full-width.justify-center
              span.text-white.text-bold {{ $nodeItemType(joint.vertices[itemIndex === 0 ? 1 : 0]).name }}
            .row.full-width.justify-center
              span.text-white.text-bold {{ $nodeItemType(joint.vertices[itemIndex]).name }}
    //- ===
    //- node
    item-feed(
      v-if="item.type === 'NODE'"
      :itemFull="item"
      :isActive="itemActive"
      :isVisible="itemActive"
      :showActions="false"
      :showHeader="false"
      :style=`{
        zIndex: 200,
      }`)
    //- ===
    //- composition
    div(
      v-else-if="item.__typename === 'Composition'"
      :style=`{
        position: 'relative',
      }`
      ).row.full-width
      composition(
        :composition="item"
        :isActive="itemActive"
        :isVisible="itemActive"
        :isMini="false"
        :styles=`{}`
        :options=`{
          loop: true,
          //- nodeOid: node.oid,
          footerOverlay: true,
          showBar: false,
          showHeader: true,
          showFooter: true,
          mode: 'feed',
        }`
        :style=`{
          minHeight: 200+'px',
        }`)
    //- TODO: sphere
    //- TODO: user
    //- ===
    //- content
    div(
      v-else-if="['VIDEO', 'IMAGE', 'BOOK'].includes(item.type)"
      :style=`{
        position: 'relative',
        zIndex: 200,
      }`
      ).row.full-width
      div(
        :style=`{
          position: 'absolute', zIndex: 200,
          bottom: '0px',
          overflow: 'hidden',
        }`
        ).row.full-width.items-center.content-center
        //- slot(name="context")
        div(
          :style=`{
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.q-px-md.q-py-xs
          slot(name="context")
          router-link(
            :to="'/content/'+item.oid"
            ).row.full-width.items-center.content-center
            q-icon(name="select_all" color="white" size="18px").q-mr-xs
            .col
              span.text-white.text-bold {{ $t('Context') }}
      img(
        draggable="false"
        :src="url"
        :style=`{
          borderRadius: '10px',
          //- maxHeight: '500px',
          objectFit: 'contain',
        }`
        ).full-width
    //- ===
    //- fallback preview
    div(
      v-else
      :style=`{
        zIndex: 200,
      }`
      ).row.full-width.items-start.content-start
      img(
        draggable="false"
        :src="item.thumbUrl"
        :style=`{
          borderRadius: '10px',
          maxHeight: '500px',
        }`
        ).full-width
    //- ===
    //- actions
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="joint && itemActive"
        :style=`{
          position: 'relative',
          zIndex: 200,
        }`
        ).row.full-width
        item-feed(
          :itemFull="joint"
          :isActive="false"
          :isVisible="false"
          :showName="false"
          :showItems="false"
          :showHeader="false"
          :style=`{
            zIndex: 100,
          }`).q-pb-xs
  //- ===
  //- next items
  div(
    v-if="itemActive && jointsRes && !itemIndependent"
    ).row.full-width.q-py-md.q-mb-xl
    //- got joints
    div(
      v-if="true || jointsRes.totalCount > 1"
      :style=`{
        borderRadius: '10px',
        background: 'rgb(35,35,35)',
      }`
      ).row.full-width
      router-link(
        :to="'/cube/'+item.oid"
        ).row.full-width.items-center.content-center.q-pa-md
        q-icon(name="fas fa-link" color="white" size="24px").q-mr-md
        span(:style=`{fontSize: '16px'}`).text-white.text-bold {{$t('Links')}} {{ jointsRes.totalCount }}
      div(
        v-if="jointsRes && jointsRes.items.length > 0"
        ).row.full-width.scroll.q-px-sm.q-pb-sm
        .row.no-wrap
          router-link(
            v-for="(i,ii) in jointsRes.items" :key="i.oid"
            :to="'/cube/'+item.oid+'?oid='+i.oid"
            ).row.q-pr-sm
            img(
              draggable="false"
              :src="i.populatedObject.items.find(j => j.oid !== item.oid).thumbUrl"
              :style=`{
                height: '50px',
                borderRadius: '10px',
              }`)
    //- no joints
    //- div(
      v-if="jointsRes.totalCount"
      :style=`{
        borderRadius: '10px',
        background: 'rgb(35,35,35)',
      }`
      ).row.full-width
      q-btn(
        :to="'/cube/'+item.oid"
        flat color="white" no-caps
        ).full-width У этого элемента пока нет связей, будьте первыми!
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ContentApi } from 'src/api/content'

export default {
  name: 'jointItemsRow_item',
  props: ['joint', 'item', 'itemIndex', 'itemActive', 'itemIndependent', 'rowActive'],
  data () {
    return {
      itemActiveLocal: false,
      jointsRes: null,
    }
  },
  computed: {
    url () { return ContentApi.urlSelect(this.item) },
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.item.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    },
  },
  watch: {
    itemActive: {
      async handler (to, from) {
        this.$log('itemActive', to)
        if (to) {
          this.$wait(200).then(() => {
            this.itemActiveLocal = true
          })
          this.jointsRes = await this.$rxdb.find(this.query)
        }
        else {
          this.itemActiveLocal = false
        }
      }
    }
  }
}
</script>
